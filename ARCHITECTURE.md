# Kiến trúc Hệ thống Dự án EtoDo

Tài liệu này mô tả chi tiết về mặt kỹ thuật, cấu trúc thư mục, luồng dữ liệu (Data Flow) và thiết kế Cơ sở dữ liệu (Database Schema) cho ứng dụng EtoDo.

## 1. Tổng quan Kiến trúc (Tech Stack)

*   **Frontend Mobile & Web:** React Native (Framework), Expo (Toolchain/Build system).
*   **Styling:** NativeWind (Sử dụng utility classes của Tailwind CSS).
*   **State Management:** Zustand (Quản lý Global state nhẹ, nhanh, không boilerplate).
*   **Local Database (Offline-first):** expo-sqlite (Database quan hệ nội bộ tiêu chuẩn của Expo, hoạt động trơn tru trên Expo Go).
*   **Backend as a Service (BaaS):** Supabase (PostgreSQL, Authentication, Storage).
*   **Routing/Navigation:** Expo Router (File-based routing, giúp quản lý chuyển trang giống hệt Next.js).

## 2. Cấu trúc Thư mục (Folder Structure)

Sử dụng cấu trúc hướng tính năng (Feature-based) kết hợp với mô hình chuẩn của Expo Router:

```text
EtoDo/
├── assets/                 # Chứa hình ảnh, fonts, icons tĩnh
├── src/                    # Chứa toàn bộ source code chính
│   ├── components/         # Các UI component dùng chung (Button, Card, Input)
│   ├── features/           # Chia theo từng module tính năng
│   │   ├── activities/     # (Tasks, Events) - Components, logic riêng
│   │   ├── habits/         # (Habits)
│   │   ├── journal/        # (Journals)
│   └── database/           # Chứa schema và queries của expo-sqlite
│   ├── services/           # Chứa logic gọi API (Supabase Client), hàm Sync data
│   ├── store/              # Global state (Zustand - quản lý user auth, theme)
│   ├── utils/              # Các hàm helper dùng chung (format ngày tháng, thuật toán SM-2)
│   └── constants/          # Khai báo hằng số (Colors, Configs)
├── app/                    # Thư mục xử lý Routing (Của Expo Router)
│   ├── (tabs)/             # Các màn hình nằm trong Bottom Tab
│   │   ├── index.tsx       # Màn Dashboard (Activities)
│   │   ├── habits.tsx      # Màn Habits
│   │   ├── journal.tsx     # Màn Nhật ký
│   │   └── english.tsx     # Màn Tiếng Anh
│   └── _layout.tsx         # Khung layout chung của app
├── .env                    # Biến môi trường (Supabase URL, Anon Key)
├── tailwind.config.js      # Cấu hình NativeWind (Tailwind CSS)
└── app.json                # Cấu hình chung của Expo (Tên app, icon, permissions)
```

## 3. Thiết kế Cơ sở dữ liệu (Database Schema)

Hệ thống sử dụng cơ sở dữ liệu quan hệ (PostgreSQL trên Supabase). expo-sqlite ở Local cũng sẽ map 1-1 với cấu trúc này.

```mermaid
erDiagram
    USERS ||--o{ ACTIVITIES : manages
    USERS ||--o{ HABITS : manages
    USERS ||--o{ JOURNALS : writes
    USERS ||--o{ ENGLISH_NOTES : learns
    HABITS ||--o{ HABIT_LOGS : tracks

    USERS {
        uuid id PK
        string email
        string display_name
        timestamp created_at
    }

    ACTIVITIES {
        uuid id PK
        uuid user_id FK
        string title "Tên hoạt động"
        timestamp start_date "Ngày diễn ra (NULL nếu là task)"
        timestamp deadline "Hạn chót"
        string category "Phân loại: lịch học, đi chơi, công việc, lịch thi, sự kiện"
        string priority "Mức độ: thấp, trung bình, cao"
        string status "Trạng thái: chưa bắt đầu, đang thực hiện, hoàn thành"
        string location "Địa điểm"
        text notes "Ghi chú"
        timestamp created_at
    }

    HABITS {
        uuid id PK
        uuid user_id FK
        string name
        string icon
        string color
        timestamp created_at
    }

    HABIT_LOGS {
        uuid id PK
        uuid habit_id FK
        date log_date "Ngày check-in (vd: 1/9/2026)"
        boolean is_completed "Đã hoàn thành hay chưa"
        %% Note: Bảng này dùng để lưu lịch sử đánh dấu thói quen từng ngày, giúp tính Streak và vẽ biểu đồ Heatmap.
    }

    JOURNALS {
        uuid id PK
        uuid user_id FK
        date entry_date "Ngày của nhật ký (khác với ngày tạo)"
        string day_sequence "Ngày thứ mấy (Tự điền, vd: 'Ngày 110')"
        text content "Markdown text"
        string mood "Tâm trạng"
        jsonb images "Mảng URL ảnh"
        timestamp created_at
    }

    ENGLISH_NOTES {
        uuid id PK
        uuid user_id FK
        string type "tip hoặc flashcard"
        string title_or_word
        text content_or_meaning
        timestamp next_review_date "Dùng cho Spaced Repetition"
        float easiness_factor "Hệ số SM-2"
        int interval "Số ngày tới lần lặp tiếp theo"
        int repetitions "Số lần đã học"
        timestamp created_at
    }
```

## 4. Luồng Dữ liệu Đồng bộ (Offline-first Data Flow)

Ứng dụng ưu tiên đọc và ghi vào Local DB (expo-sqlite) để đảm bảo tốc độ phản hồi ngay lập tức (0 độ trễ).

```mermaid
sequenceDiagram
    participant U as User (App)
    participant L as Local DB (expo-sqlite)
    participant W as Worker (Background Task)
    participant S as Cloud DB (Supabase)

    Note over U, L: 1. Thao tác Offline (Tạo Task)
    U->>L: Create Task (Lưu ngay lập tức)
    L-->>U: Trả về UI ngay lập tức
    L->>L: Đánh dấu bản ghi là 'created_locally'

    Note over W, S: 2. Đồng bộ ngầm (Khi có mạng)
    W->>L: Hàm Sync tự động gom các bản ghi thay đổi
    W->>S: Push data lên Supabase (API Call)
    S-->>W: Xác nhận thành công
    W->>L: Xóa cờ 'locally_modified', cập nhật trạng thái đã sync

    Note over S, L: 3. Kéo dữ liệu mới (Khi khởi động/Pull to refresh)
    L->>S: Fetch các bản ghi bị thay đổi từ timestamp lần cuối sync
    S-->>L: Trả về JSON Data mới
    L->>L: Update expo-sqlite

    Note over L, W: 4. Dọn dẹp bộ nhớ (Tiết kiệm dung lượng)
    W->>L: Quét các dữ liệu ĐÃ SYNC thành công (Đặc biệt là Hình ảnh lớn)
    W->>L: Xóa khỏi Local DB ngay lập tức (hoặc sau 3 ngày) để giải phóng RAM/ROM
```

## 5. Kiến trúc Tự động hóa (Automation & Background Logic)

*   **Thời điểm kích hoạt:** Trigger mỗi khi người dùng mở App (App is foregrounded) hoặc thiết lập Expo Background Fetch.
*   **Logic xử lý (Local Utils):**
    1.  Lấy ngày hiện tại `Today`.
    2.  Kiểm tra ngày mở app gần nhất (`Last_Opened_Date` lưu trong AsyncStorage).
    3.  Nếu `Today` > `Last_Opened_Date`:
        *   Quét bảng `Activities`: Tìm các record có `deadline < Today` & `status != hoàn thành` $\rightarrow$ Đổi `status = hoàn thành` (áp dụng cho các hoạt động tự động hoàn thành).
        *   Quét bảng `Habits`: Đảm bảo `HabitLogs` cho ngày `Today` được tạo mặc định là `false`.
    4.  Cập nhật lại `Last_Opened_Date = Today`.
    5.  Sau khi áp dụng logic ở Local DB, một hàm sync tùy chỉnh sẽ đẩy những thay đổi này lên Supabase.
