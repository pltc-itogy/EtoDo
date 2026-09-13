import { db } from './connection';

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
  return db.getAllSync<Activity>('SELECT * FROM activities ORDER BY created_at DESC');
}

// 2. Thêm mới công việc với đầy đủ thông tin
export function addActivity(data: AddActivityData) {
  const id = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  const priority = data.priority || 'trung bình';
  
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
  return db.getFirstSync<Activity>('SELECT * FROM activities WHERE id = ?', [id]);
}

// Cập nhật công việc
export function updateActivity(id: string, data: AddActivityData) {
  const priority = data.priority || 'trung bình';
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
  db.runSync(
    'UPDATE activities SET status = ? WHERE id = ?',
    [newStatus, id]
  );
}

// 4. Xóa công việc
export function deleteActivity(id: string) {
  db.runSync('DELETE FROM activities WHERE id = ?', [id]);
}
