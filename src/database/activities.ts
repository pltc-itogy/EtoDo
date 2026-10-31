import { db, isWeb, getLocalTable, saveLocalTable } from './connection';
import { generateUUID } from '../utils/uuid';

// Định nghĩa kiểu dữ liệu của một Activity với đầy đủ các trường
export interface Activity {
  id: string;
  user_id: string;
  title: string;
  start_date?: string;
  deadline?: string;
  category?: string;
  priority: string;
  status: string;
  location?: string;
  notes?: string;
  created_at: string;
}

// Kiểu dữ liệu khi thêm mới
export interface AddActivityData {
  title: string;
  userId: string;
  startDate?: string;
  deadline?: string;
  category?: string;
  priority?: string;
  location?: string;
  notes?: string;
}

// 1. Đọc danh sách công việc
export function getActivities(): Activity[] {
  if (isWeb) {
    return getLocalTable<Activity>('activities')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
  return db.getAllSync<Activity>('SELECT * FROM activities ORDER BY created_at DESC');
}

// 2. Thêm mới công việc với đầy đủ thông tin
export function addActivity(data: AddActivityData) {
  const id = generateUUID();
  const priority = data.priority || 'trung bình';
  
  if (isWeb) {
    const table = getLocalTable<Activity>('activities');
    const newAct: Activity = {
      id,
      user_id: data.userId,
      title: data.title,
      start_date: data.startDate || undefined,
      deadline: data.deadline || undefined,
      category: data.category || undefined,
      priority,
      status: 'chưa bắt đầu',
      location: data.location || undefined,
      notes: data.notes || undefined,
      created_at: new Date().toISOString()
    };
    table.push(newAct);
    saveLocalTable('activities', table);
    return;
  }

  db.runSync(
    `INSERT INTO activities (id, user_id, title, start_date, deadline, category, priority, location, notes) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, 
      data.userId, 
      data.title, 
      data.startDate || null, 
      data.deadline || null, 
      data.category || null, 
      priority, 
      data.location || null, 
      data.notes || null
    ]
  );
}

// Lấy 1 công việc theo ID
export function getActivityById(id: string): Activity | null {
  if (isWeb) {
    const table = getLocalTable<Activity>('activities');
    return table.find(x => x.id === id) || null;
  }
  return db.getFirstSync<Activity>('SELECT * FROM activities WHERE id = ?', [id]);
}

// Cập nhật công việc
export function updateActivity(id: string, data: AddActivityData) {
  const priority = data.priority || 'trung bình';
  
  if (isWeb) {
    const table = getLocalTable<Activity>('activities');
    const idx = table.findIndex(x => x.id === id);
    if (idx >= 0) {
      table[idx].title = data.title;
      table[idx].start_date = data.startDate || undefined;
      table[idx].deadline = data.deadline || undefined;
      table[idx].category = data.category || undefined;
      table[idx].priority = priority;
      table[idx].location = data.location || undefined;
      table[idx].notes = data.notes || undefined;
      saveLocalTable('activities', table);
    }
    return;
  }

  db.runSync(
    `UPDATE activities SET 
      title = ?, 
      start_date = ?, 
      deadline = ?, 
      category = ?, 
      priority = ?, 
      location = ?, 
      notes = ? 
    WHERE id = ?`,
    [
      data.title, 
      data.startDate || null, 
      data.deadline || null, 
      data.category || null, 
      priority, 
      data.location || null, 
      data.notes || null,
      id
    ]
  );
}

// 3. Đánh dấu hoàn thành / chưa hoàn thành
export function toggleActivityStatus(id: string, currentStatus: string) {
  const newStatus = currentStatus === 'hoàn thành' ? 'chưa bắt đầu' : 'hoàn thành';
  
  if (isWeb) {
    const table = getLocalTable<Activity>('activities');
    const idx = table.findIndex(x => x.id === id);
    if (idx >= 0) {
      table[idx].status = newStatus;
      saveLocalTable('activities', table);
    }
    return;
  }

  db.runSync(
    'UPDATE activities SET status = ? WHERE id = ?',
    [newStatus, id]
  );
}

// 4. Xóa công việc
export function deleteActivity(id: string) {
  if (isWeb) {
    let table = getLocalTable<Activity>('activities');
    table = table.filter(x => x.id !== id);
    saveLocalTable('activities', table);
    return;
  }
  db.runSync('DELETE FROM activities WHERE id = ?', [id]);
}

// 5. Automation: Tự động đánh dấu hoàn thành các sự kiện đã qua (dựa trên start_date)
export function autoCompletePastActivities(todayStr: string) {
  if (isWeb) {
    const table = getLocalTable<Activity>('activities');
    let changed = false;
    table.forEach(act => {
      if (act.start_date && act.start_date < todayStr && act.status !== 'hoàn thành') {
        act.status = 'hoàn thành';
        changed = true;
      }
    });
    if (changed) saveLocalTable('activities', table);
    return;
  }

  // Lấy các sự kiện có start_date < today (bỏ qua những cái chưa có start_date)
  db.runSync(
    `UPDATE activities 
     SET status = 'hoàn thành' 
     WHERE start_date IS NOT NULL 
       AND start_date < ? 
       AND status != 'hoàn thành'`,
    [todayStr]
  );
}

export function upsertActivityLocal(act: Activity) {
  if (isWeb) {
    const table = getLocalTable<Activity>('activities');
    const idx = table.findIndex(x => x.id === act.id);
    if (idx >= 0) table[idx] = act;
    else table.push(act);
    saveLocalTable('activities', table);
    return;
  }

  db.runSync(
    `INSERT OR REPLACE INTO activities (id, user_id, title, start_date, deadline, category, priority, status, location, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      act.id, 
      act.user_id, 
      act.title, 
      act.start_date || null, 
      act.deadline || null, 
      act.category || null, 
      act.priority, 
      act.status, 
      act.location || null, 
      act.notes || null, 
      act.created_at
    ]
  );
}
