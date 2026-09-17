import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

// Database ảo (Mock) cho môi trường Web/Desktop để không bị crash do lỗi SharedArrayBuffer
const mockDb = {
  execSync: () => {},
  runSync: () => ({ changes: 0, lastInsertRowId: 0 }),
  getFirstSync: () => null,
  getAllSync: () => [],
};

// Mở kết nối đến file database nội bộ (Chỉ chạy thật trên Mobile)
export const db = isWeb ? mockDb as any : SQLite.openDatabaseSync('etodo.db');
