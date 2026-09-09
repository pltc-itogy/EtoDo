import { appSchema, tableSchema } from '@nozbe/watermelondb';

// Khởi tạo Lược đồ Cơ sở dữ liệu nội bộ (Local Database Schema)
// Mọi thay đổi về cấu trúc bảng sau này đều phải cập nhật version
export const schema = appSchema({
  version: 1, 
  tables: [
    // Bảng Activities: Dùng chung cho cả Lịch trình (Events) có ngày giờ và Công việc (Tasks) không ngày giờ
    tableSchema({
      name: 'activities',
      columns: [
        { name: 'user_id', type: 'string' },
        { name: 'title', type: 'string' },
        { name: 'start_date', type: 'number', isOptional: true }, // Ngày diễn ra (NULL nếu là Task)
        { name: 'deadline', type: 'number', isOptional: true },   // Hạn chót
        { name: 'category', type: 'string', isOptional: true },   // Phân loại (học tập, làm việc...)
        { name: 'priority', type: 'string' },                     // Mức độ ưu tiên
        { name: 'status', type: 'string' },                       // Trạng thái (chưa bắt đầu, hoàn thành...)
        { name: 'location', type: 'string', isOptional: true },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
      ]
    }),
    // Bảng Habits: Danh sách các thói quen cần theo dõi (ví dụ: Đọc sách, Chạy bộ)
    tableSchema({
      name: 'habits',
      columns: [
        { name: 'user_id', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'icon', type: 'string', isOptional: true },
        { name: 'color', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
      ]
    }),
    // Bảng Habit_Logs: Lịch sử điểm danh thói quen theo từng ngày (Giúp tính chuỗi streak)
    tableSchema({
      name: 'habit_logs',
      columns: [
        { name: 'habit_id', type: 'string' },
        { name: 'log_date', type: 'string' }, // Định dạng: YYYY-MM-DD
        { name: 'is_completed', type: 'boolean' },
      ]
    }),
    // Bảng Journals: Ghi chép nhật ký hàng ngày
    tableSchema({
      name: 'journals',
      columns: [
        { name: 'user_id', type: 'string' },
        { name: 'entry_date', type: 'string' }, // Ngày viết nhật ký (YYYY-MM-DD)
        { name: 'day_sequence', type: 'string', isOptional: true }, // Vd: Ngày thứ 110
        { name: 'content', type: 'string', isOptional: true }, // Nội dung hỗ trợ Markdown
        { name: 'mood', type: 'string', isOptional: true },
        { name: 'images', type: 'string', isOptional: true }, // Mảng JSON lưu đường dẫn ảnh
        { name: 'created_at', type: 'number' },
      ]
    }),
    // Bảng English_Notes: Ghi chú Tiếng Anh & Flashcard học từ vựng
    tableSchema({
      name: 'english_notes',
      columns: [
        { name: 'user_id', type: 'string' },
        { name: 'type', type: 'string' }, // Phân loại: 'tip' (ghi chú) hoặc 'flashcard' (từ vựng)
        { name: 'title_or_word', type: 'string' },
        { name: 'content_or_meaning', type: 'string', isOptional: true },
        { name: 'next_review_date', type: 'number', isOptional: true }, // Ngày ôn tập tiếp theo (dùng cho Spaced Repetition)
        { name: 'easiness_factor', type: 'number' }, // Hệ số độ khó (SM-2 Algorithm)
        { name: 'interval', type: 'number' },        // Số ngày chờ đến lần lặp lại tiếp theo
        { name: 'repetitions', type: 'number' },     // Số lần đã học thành công liên tiếp
        { name: 'created_at', type: 'number' },
      ]
    })
  ]
});
