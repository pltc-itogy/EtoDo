import { db } from '../database';
import { supabase } from './supabase';
import { getActivities } from '../database/activities';
import { getCategories, upsertCategoryLocal } from '../database/categories';
import { getHabits, getAllHabitLogs, upsertHabitLocal, upsertHabitLogLocal } from '../database/habits';
import { getJournals, upsertJournalLocal } from '../database/journals';
import { getAllEnglishNotes, upsertEnglishNoteLocal } from '../database/english';
import { Alert } from 'react-native';

// Hàm đồng bộ dữ liệu giữa SQLite cục bộ và Supabase
export async function sync() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Kéo dữ liệu từ Cloud về máy
    const { data: cloudActivities, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw new Error(error.message);

    // Cập nhật vào DB cục bộ (Sử dụng INSERT OR REPLACE) bao gồm toàn bộ các trường
    if (cloudActivities) {
      db.execSync('BEGIN TRANSACTION;');
      for (const act of cloudActivities) {
        db.runSync(
          `INSERT OR REPLACE INTO activities (id, user_id, title, start_date, deadline, category, priority, status, location, notes, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [act.id, act.user_id, act.title, act.start_date, act.deadline, act.category, act.priority, act.status, act.location, act.notes, act.created_at]
        );
      }
      db.execSync('COMMIT;');
    }

    // 2. Đẩy dữ liệu từ máy lên Cloud (Upsert: Cập nhật nếu đã có, Thêm mới nếu chưa)
    const localActivities = getActivities();
    if (localActivities.length > 0) {
      const { error: pushError } = await supabase.from('activities').upsert(
        localActivities.map(a => ({
          id: a.id,
          user_id: a.user_id,
          title: a.title,
          start_date: a.start_date,
          deadline: a.deadline,
          category: a.category,
          priority: a.priority,
          status: a.status,
          location: a.location,
          notes: a.notes,
          created_at: a.created_at,
        }))
      );
      if (pushError) throw new Error(pushError.message);
    }

    // Đồng bộ các bảng khác
    await syncCategories();
    await syncJournals();
    await syncHabits(); // Gọi đồng bộ Thói quen
    await syncEnglishNotes(); // Gọi đồng bộ Tiếng Anh

    Alert.alert('Thành công', 'Đã đồng bộ dữ liệu xong!');
  } catch (error) {
    console.error('Lỗi đồng bộ:', error);
    Alert.alert('Đồng bộ thất bại', 'Vui lòng kiểm tra lại kết nối mạng');
  }
}

// Hàm đồng bộ Danh mục (Categories)
export async function syncCategories() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Kéo dữ liệu từ Cloud về
    const { data: cloudCats, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw new Error(error.message);

    if (cloudCats) {
      db.execSync('BEGIN TRANSACTION;');
      for (const cat of cloudCats) {
        upsertCategoryLocal(cat);
      }
      db.execSync('COMMIT;');
    }

    // 2. Đẩy dữ liệu từ Local lên Cloud
    const localCats = getCategories(user.id);
    if (localCats.length > 0) {
      const { error: pushError } = await supabase.from('categories').upsert(
        localCats.map(c => ({
          id: c.id,
          user_id: c.user_id,
          name: c.name,
          color: c.color,
          created_at: c.created_at,
        }))
      );
      if (pushError) throw new Error(pushError.message);
    }
  } catch (error) {
    console.error('Lỗi đồng bộ categories:', error);
  }
}

// ----------------------------------------------------
// Hàm đồng bộ Nhật ký (Journals) và Upload ảnh
// ----------------------------------------------------
export async function syncJournals() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Kéo dữ liệu Nhật ký từ Cloud về Local
    const { data: cloudJournals, error } = await supabase
      .from('journals')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw new Error(error.message);

    if (cloudJournals) {
      db.execSync('BEGIN TRANSACTION;');
      for (const j of cloudJournals) {
        upsertJournalLocal(j); // Lưu vào SQLite
      }
      db.execSync('COMMIT;');
    }

    // 2. Đẩy dữ liệu Nhật ký từ Local lên Cloud
    const localJournals = getJournals();
    
    for (const journal of localJournals) {
      // images lưu dưới dạng chuỗi JSON: '["file://..."]'
      let imagesArr: string[] = JSON.parse(journal.images || '[]');
      let updatedImagesArr: string[] = [];

      for (const uri of imagesArr) {
        // Nếu ảnh là link nội bộ (chưa upload)
        if (uri.startsWith('file://')) {
          const fileName = `${user.id}/${Date.now()}.jpg`; // Tạo tên file duy nhất theo user_id
          
          try {
            // Đọc file ảnh cục bộ chuyển thành ArrayBuffer để Supabase dễ hiểu
            const response = await fetch(uri);
            const arrayBuffer = await response.arrayBuffer();
            
            // Upload lên Supabase Storage (bucket 'journals')
            const { error: uploadError } = await supabase.storage
              .from('journals')
              .upload(fileName, arrayBuffer, {
                contentType: 'image/jpeg',
                upsert: false // Không ghi đè nếu trùng
              });

            if (uploadError) throw uploadError;

            // Lấy link ảnh Public sau khi upload xong
            const { data: publicUrlData } = supabase.storage
              .from('journals')
              .getPublicUrl(fileName);
              
            updatedImagesArr.push(publicUrlData.publicUrl);
          } catch (uploadEx) {
            console.error('Lỗi upload ảnh:', uploadEx);
            updatedImagesArr.push(uri); // Nếu lỗi thì giữ nguyên link cũ để lần sau thử lại
          }
        } else {
          // Nếu ảnh đã là link http (đã upload từ trước) thì giữ nguyên
          updatedImagesArr.push(uri);
        }
      }

      // Đẩy (Upsert) toàn bộ text và link ảnh mới lên Database Supabase
      const { error: pushError } = await supabase.from('journals').upsert({
        id: journal.id,
        user_id: journal.user_id,
        entry_date: journal.entry_date,
        day_sequence: journal.day_sequence,
        content: journal.content,
        mood: journal.mood,
        images: JSON.stringify(updatedImagesArr), // Lưu thành chuỗi JSON trên DB
        created_at: journal.created_at,
      });

      if (pushError) throw new Error(pushError.message);

      // Cập nhật lại SQLite với link ảnh mới (để giải phóng bộ nhớ & tránh upload trùng lần sau)
      if (JSON.stringify(imagesArr) !== JSON.stringify(updatedImagesArr)) {
        journal.images = JSON.stringify(updatedImagesArr);
        upsertJournalLocal(journal);
      }
    }
  } catch (error) {
    console.error('Lỗi đồng bộ journals:', error);
  }
}

// ----------------------------------------------------
// Hàm đồng bộ Thói quen (Habits) & Lịch sử (Habit_Logs)
// ----------------------------------------------------
export async function syncHabits() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // --- ĐỒNG BỘ HABITS ---
    // 1. Kéo dữ liệu Habits
    const { data: cloudHabits, error: habitError } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id);

    if (habitError) throw habitError;

    if (cloudHabits) {
      db.execSync('BEGIN TRANSACTION;');
      for (const h of cloudHabits) upsertHabitLocal(h);
      db.execSync('COMMIT;');
    }

    // 2. Đẩy dữ liệu Habits
    const localHabits = getHabits();
    for (const h of localHabits) {
      const { error: pushError } = await supabase.from('habits').upsert({
        id: h.id,
        user_id: h.user_id,
        name: h.name,
        icon: h.icon,
        color: h.color,
        created_at: h.created_at,
      });
      if (pushError) console.error('Lỗi đẩy habit:', pushError);
    }

    // --- ĐỒNG BỘ HABIT_LOGS ---
    // Vì Logs liên kết với Habits, ta sẽ lấy toàn bộ logs của các habits thuộc về user này
    const habitIds = cloudHabits?.map(h => h.id) || [];
    if (habitIds.length > 0) {
      const { data: cloudLogs, error: logError } = await supabase
        .from('habit_logs')
        .select('*')
        .in('habit_id', habitIds);

      if (logError) throw logError;

      if (cloudLogs) {
        db.execSync('BEGIN TRANSACTION;');
        for (const l of cloudLogs) upsertHabitLogLocal(l);
        db.execSync('COMMIT;');
      }
    }

    const localLogs = getAllHabitLogs();
    for (const l of localLogs) {
      const { error: pushLogError } = await supabase.from('habit_logs').upsert({
        id: l.id,
        habit_id: l.habit_id,
        log_date: l.log_date,
        is_completed: l.is_completed,
      });
      if (pushLogError) console.error('Lỗi đẩy habit log:', pushLogError);
    }

  } catch (error) {
    console.error('Lỗi đồng bộ habits:', error);
  }
}

// ----------------------------------------------------
// Hàm đồng bộ Tiếng Anh (English Notes)
// ----------------------------------------------------
export async function syncEnglishNotes() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Kéo dữ liệu từ Cloud về
    const { data: cloudNotes, error } = await supabase
      .from('english_notes')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw new Error(error.message);

    if (cloudNotes) {
      db.execSync('BEGIN TRANSACTION;');
      for (const note of cloudNotes) {
        upsertEnglishNoteLocal(note);
      }
      db.execSync('COMMIT;');
    }

    // 2. Đẩy dữ liệu từ Local lên Cloud
    const localNotes = getAllEnglishNotes();
    if (localNotes.length > 0) {
      const { error: pushError } = await supabase.from('english_notes').upsert(
        localNotes.map(n => ({
          id: n.id,
          user_id: n.user_id,
          type: n.type,
          title_or_word: n.title_or_word,
          content_or_meaning: n.content_or_meaning,
          example_sentence: n.example_sentence,
          next_review_date: n.next_review_date,
          easiness_factor: n.easiness_factor,
          interval: n.interval,
          repetitions: n.repetitions,
          created_at: n.created_at,
        }))
      );
      if (pushError) throw new Error(pushError.message);
    }
  } catch (error) {
    console.error('Lỗi đồng bộ english notes:', error);
  }
}
