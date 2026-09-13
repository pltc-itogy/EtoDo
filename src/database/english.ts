import { db } from './connection';

export interface EnglishNote {
  id: string;
  user_id: string;
  type: string; // 'tip' | 'flashcard'
  title_or_word: string;
  content_or_meaning?: string;
  example_sentence?: string;
  next_review_date?: string; // Khuyến nghị dùng ISO format
  easiness_factor: number;
  interval: number;
  repetitions: number;
  created_at: string;
}

export interface AddEnglishData {
  userId: string;
  type: 'tip' | 'flashcard';
  titleOrWord: string;
  contentOrMeaning?: string;
  exampleSentence?: string;
}

// 1. Khởi tạo bảng english_notes
export function initEnglishTable() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS english_notes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title_or_word TEXT NOT NULL,
      content_or_meaning TEXT,
      example_sentence TEXT,
      next_review_date TEXT,
      easiness_factor REAL DEFAULT 2.5,
      interval INTEGER DEFAULT 0,
      repetitions INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

// 2. Thêm mới ghi chú / từ vựng
export function addEnglishNote(data: AddEnglishData) {
  const id = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  const now = new Date().toISOString();
  
  // Mặc định cho flashcard mới là sẽ ôn ngay lập tức (ngày hôm nay)
  const nextReviewDate = data.type === 'flashcard' ? now : null;

  db.runSync(
    `INSERT INTO english_notes 
      (id, user_id, type, title_or_word, content_or_meaning, example_sentence, next_review_date, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.userId,
      data.type,
      data.titleOrWord,
      data.contentOrMeaning || null,
      data.exampleSentence || null,
      nextReviewDate,
      now
    ]
  );
}

// 3. Lấy danh sách Tips
export function getEnglishTips(): EnglishNote[] {
  return db.getAllSync<EnglishNote>(
    "SELECT * FROM english_notes WHERE type = 'tip' ORDER BY created_at DESC"
  );
}

// Lấy danh sách toàn bộ Flashcard
export function getAllFlashcards(): EnglishNote[] {
  return db.getAllSync<EnglishNote>(
    "SELECT * FROM english_notes WHERE type = 'flashcard' ORDER BY created_at DESC"
  );
}

// 4. Lấy một Note theo ID
export function getEnglishNoteById(id: string): EnglishNote | null {
  return db.getFirstSync<EnglishNote>("SELECT * FROM english_notes WHERE id = ?", [id]);
}

// 5. Cập nhật một Note
export function updateEnglishNote(id: string, data: AddEnglishData) {
  db.runSync(
    `UPDATE english_notes SET 
      title_or_word = ?, 
      content_or_meaning = ?, 
      example_sentence = ?
     WHERE id = ?`,
    [data.titleOrWord, data.contentOrMeaning || null, data.exampleSentence || null, id]
  );
}

// 6. Xóa Note
export function deleteEnglishNote(id: string) {
  db.runSync("DELETE FROM english_notes WHERE id = ?", [id]);
}

// ==========================================
// SPACED REPETITION (SM-2) LOGIC
// ==========================================

// Lấy số lượng thẻ cần ôn tập hôm nay
export function getDueFlashcardsCount(): number {
  const todayStr = new Date().toISOString();
  const row = db.getFirstSync<{count: number}>(
    "SELECT COUNT(*) as count FROM english_notes WHERE type = 'flashcard' AND next_review_date <= ?",
    [todayStr]
  );
  return row?.count || 0;
}

// Lấy danh sách N thẻ flashcard ngẫu nhiên cần ôn tập
export function getDueFlashcards(limit: number): EnglishNote[] {
  const todayStr = new Date().toISOString();
  // SQL RANDOM() trong SQLite trả về thẻ ngẫu nhiên
  return db.getAllSync<EnglishNote>(
    "SELECT * FROM english_notes WHERE type = 'flashcard' AND next_review_date <= ? ORDER BY RANDOM() LIMIT ?",
    [todayStr, limit]
  );
}

// Đánh giá và cập nhật thẻ sau khi học
// Điểm (quality): 0-3 (0: Lại/Quên hẳn, 3: Khó nhớ, 4: Dễ (nhưng mình sẽ quy chuẩn thành Lại=0, Khó=3, Dễ=5 theo SM2 rút gọn)
export function reviewFlashcard(id: string, quality: number) {
  const note = getEnglishNoteById(id);
  if (!note || note.type !== 'flashcard') return;

  let { easiness_factor, interval, repetitions } = note;

  // Tính SM-2
  if (quality < 3) {
    // Nếu đánh giá thấp (Quên/Khó) -> Reset về ngày 0
    repetitions = 0;
    interval = 1;
  } else {
    // Nếu đánh giá Tốt/Dễ
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easiness_factor);
    }
    repetitions++;
  }

  // Cập nhật hệ số EF
  easiness_factor = easiness_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easiness_factor < 1.3) easiness_factor = 1.3;

  // Tính ngày review kế tiếp
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);

  db.runSync(
    `UPDATE english_notes SET 
      easiness_factor = ?, 
      interval = ?, 
      repetitions = ?, 
      next_review_date = ?
     WHERE id = ?`,
    [easiness_factor, interval, repetitions, nextDate.toISOString(), id]
  );
}

// Dùng cho hàm Sync
export function getAllEnglishNotes(): EnglishNote[] {
  return db.getAllSync<EnglishNote>("SELECT * FROM english_notes");
}

export function upsertEnglishNoteLocal(note: EnglishNote) {
  db.runSync(
    `INSERT OR REPLACE INTO english_notes 
      (id, user_id, type, title_or_word, content_or_meaning, example_sentence, next_review_date, easiness_factor, interval, repetitions, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      note.id, note.user_id, note.type, note.title_or_word, note.content_or_meaning || null,
      note.example_sentence || null, note.next_review_date || null, note.easiness_factor,
      note.interval, note.repetitions, note.created_at
    ]
  );
}
