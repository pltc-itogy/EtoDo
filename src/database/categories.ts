import { db, isWeb, getLocalTable, saveLocalTable } from './connection';
import { generateUUID } from '../utils/uuid';

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
  if (isWeb) {
    return getLocalTable<Category>('categories')
      .filter(c => c.user_id === userId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }
  return db.getAllSync<Category>(
    'SELECT * FROM categories WHERE user_id = ? ORDER BY created_at ASC',
    [userId]
  );
}

// 3. Thêm mới category
export function addCategory(data: { userId: string; name: string; color?: string }): Category {
  const id = generateUUID();
  const now = new Date().toISOString();
  
  const newCat: Category = {
    id,
    user_id: data.userId,
    name: data.name,
    color: data.color,
    created_at: now
  };

  if (isWeb) {
    const table = getLocalTable<Category>('categories');
    table.push(newCat);
    saveLocalTable('categories', table);
    return newCat;
  }

  db.runSync(
    'INSERT INTO categories (id, user_id, name, color, created_at) VALUES (?, ?, ?, ?, ?)',
    [id, data.userId, data.name, data.color || null, now]
  );
  
  return newCat;
}

// 4. Xóa category
export function deleteCategory(id: string) {
  if (isWeb) {
    let table = getLocalTable<Category>('categories');
    table = table.filter(x => x.id !== id);
    saveLocalTable('categories', table);
    return;
  }
  db.runSync('DELETE FROM categories WHERE id = ?', [id]);
}

// 5. Thêm/Cập nhật category từ Supabase (dành cho sync)
export function upsertCategoryLocal(cat: Category) {
  if (isWeb) {
    const table = getLocalTable<Category>('categories');
    const idx = table.findIndex(x => x.id === cat.id);
    if (idx >= 0) table[idx] = cat;
    else table.push(cat);
    saveLocalTable('categories', table);
    return;
  }

  db.runSync(
    `INSERT OR REPLACE INTO categories (id, user_id, name, color, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [cat.id, cat.user_id, cat.name, cat.color || null, cat.created_at]
  );
}
