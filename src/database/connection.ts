import * as SQLite from 'expo-sqlite';

// Mở kết nối đến file database nội bộ (Tự động tạo nếu chưa có)
export const db = SQLite.openDatabaseSync('etodo.db');
