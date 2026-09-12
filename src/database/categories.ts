import { db } from './connection';

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color?: string;
  created_at: string;
}

export interface AddCategoryData {
  userId: string;
  name: string;
  color?: string;
}

// 1. Khởi tạo bảng categories
export function initCategoriesTable() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      color TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

// 2. Lấy danh sách category của 1 user
export function getCategories(userId: string): Category[] {
  return db.getAllSync<Category>(
    'SELECT * FROM categories WHERE user_id = ? ORDER BY created_at ASC',
    [userId]
  );
}

// 3. Thêm mới category
export function addCategory(data: AddCategoryData): Category {
  // Sinh id ngẫu nhiên (hoặc uuid)
  const id = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  const now = new Date().toISOString();
  
  db.runSync(
    'INSERT INTO categories (id, user_id, name, color, created_at) VALUES (?, ?, ?, ?, ?)',
    [id, data.userId, data.name, data.color || null, now]
  );
  
  return {
    id,
    user_id: data.userId,
    name: data.name,
    color: data.color,
    created_at: now
  };
}

// 4. Xóa category
export function deleteCategory(id: string) {
  db.runSync('DELETE FROM categories WHERE id = ?', [id]);
}

// 5. Thêm/Cập nhật category từ Supabase (dành cho sync)
export function upsertCategoryLocal(cat: Category) {
  db.runSync(
    `INSERT OR REPLACE INTO categories (id, user_id, name, color, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [cat.id, cat.user_id, cat.name, cat.color || null, cat.created_at]
  );
}
