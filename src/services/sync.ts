import { db } from '../database';
import { supabase } from './supabase';
import { getActivities } from '../database/activities';
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

    Alert.alert('Thành công', 'Đã đồng bộ dữ liệu xong!');
  } catch (error) {
    console.error('Lỗi đồng bộ:', error);
    Alert.alert('Đồng bộ thất bại', 'Vui lòng kiểm tra lại kết nối mạng');
  }
}
