import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

// Database ảo (Mock) để ngăn expo-sqlite WASM crash trên Web (SharedArrayBuffer)
const mockDb = {
  execSync: () => {},
  runSync: () => ({ changes: 0, lastInsertRowId: 0 }),
  getFirstSync: () => null,
  getAllSync: () => [],
};

// Mở kết nối đến file database nội bộ
export const db = (isWeb ? mockDb : SQLite.openDatabaseSync('etodo.db')) as SQLite.SQLiteDatabase;

export function getLocalTable<T>(tableName: string): T[] {
  if (!isWeb) return [];
  try {
    return JSON.parse(localStorage.getItem(tableName) || '[]');
  } catch {
    return [];
  }
}

export function saveLocalTable<T>(tableName: string, data: T[]) {
  if (!isWeb) return;
  localStorage.setItem(tableName, JSON.stringify(data));
}

export function clearAllData() {
  if (isWeb) {
    try {
      localStorage.clear();
    } catch (e) {}
  } else {
    try {
      db.execSync(`
        DELETE FROM activities;
        DELETE FROM journals;
        DELETE FROM categories;
        DELETE FROM habits;
        DELETE FROM habit_logs;
        DELETE FROM english_notes;
      `);
    } catch (e) {
      console.error('Lỗi khi xóa SQLite:', e);
    }
  }
}

export { isWeb };
