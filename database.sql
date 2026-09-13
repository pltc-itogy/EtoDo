-- ==========================================
-- SCRIPT TẠO CƠ SỞ DỮ LIỆU DÀNH CHO SUPABASE
-- Dành cho dự án EtoDo (Mã nguồn mở)
-- ==========================================

-- 1. BẢNG ACTIVITIES (Lịch trình & Công việc)
CREATE TABLE activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE, -- NULL nếu là Task
    deadline TIMESTAMP WITH TIME ZONE,
    category TEXT,
    priority TEXT DEFAULT 'trung bình',
    status TEXT DEFAULT 'chưa bắt đầu',
    location TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. BẢNG HABITS (Thói quen gốc)
CREATE TABLE habits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. BẢNG HABIT_LOGS (Lịch sử điểm danh thói quen)
CREATE TABLE habit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    UNIQUE(habit_id, log_date) -- Đảm bảo 1 thói quen chỉ có 1 log cho 1 ngày
);

-- 4. BẢNG JOURNALS (Nhật ký)
CREATE TABLE journals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    day_sequence TEXT, -- Ví dụ: "Ngày 110"
    content TEXT,
    mood TEXT,
    images JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. BẢNG ENGLISH_NOTES (Từ vựng & Tips)
CREATE TABLE english_notes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'tip' hoặc 'flashcard'
    title_or_word TEXT NOT NULL,
    content_or_meaning TEXT,
    example_sentence TEXT,
    next_review_date TIMESTAMP WITH TIME ZONE,
    easiness_factor NUMERIC DEFAULT 2.5,
    interval INTEGER DEFAULT 0,
    repetitions INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. BẢNG CATEGORIES (Danh mục tự tạo)
CREATE TABLE categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- BẬT ROW LEVEL SECURITY (BẢO MẬT DỮ LIỆU NGƯỜI DÙNG)
-- Mỗi người dùng chỉ thấy được dữ liệu của chính mình
-- ==========================================
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE english_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Tạo chính sách (Policies) tự động lọc data theo user_id
CREATE POLICY "Users can manage their own activities" ON activities FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own habits" ON habits FOR ALL USING (auth.uid() = user_id);
-- (Với Habit_Logs, quyền được liên kết thông qua Habits)
CREATE POLICY "Users can manage their habit logs" ON habit_logs FOR ALL USING (
  EXISTS (SELECT 1 FROM habits WHERE habits.id = habit_logs.habit_id AND habits.user_id = auth.uid())
);
CREATE POLICY "Users can manage their journals" ON journals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their english notes" ON english_notes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their categories" ON categories FOR ALL USING (auth.uid() = user_id);
