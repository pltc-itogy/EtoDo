import { db } from './connection';
import { initCategoriesTable, getCategories, addCategory } from './categories';
import { initJournalsTable } from './journals';
import { initHabitsTable } from './habits';
import { initEnglishTable } from './english';
import { useUserStore } from '../store';

export { db };

// Hàm tạo cấu trúc bảng (Chạy 1 lần khi mở app)
export function initDatabase() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      start_date TEXT,
      deadline TEXT,
      category TEXT,
      priority TEXT DEFAULT 'trung bình',
      status TEXT DEFAULT 'chưa bắt đầu',
      location TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  initCategoriesTable();
  initJournalsTable();
  initHabitsTable();
  initEnglishTable();
}

export function seedDefaultCategory() {
  const user = useUserStore.getState().user;
  if (!user) return;
  
  const categories = getCategories(user.id);
  const hasWorkCategory = categories.some(c => c.name.toLowerCase() === 'công việc');
  
  if (!hasWorkCategory) {
    addCategory({ userId: user.id, name: 'Công việc', color: '#3B82F6' }); // Màu xanh dương mặc định
  }
}
