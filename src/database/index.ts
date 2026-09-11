import * as SQLite from 'expo-sqlite';

// Mở kết nối đến file database nội bộ (Tự động tạo nếu chưa có)
export const db = SQLite.openDatabaseSync('etodo.db');

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
}
