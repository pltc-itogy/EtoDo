/** @type {import('tailwindcss').Config} */
// Cấu hình TailwindCSS cho dự án
module.exports = {
  // content: Khai báo các thư mục chứa mã nguồn để Tailwind quét và tạo CSS tương ứng
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  // presets: Nạp cấu hình mặc định của NativeWind để tương thích với React Native
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Bảng màu tối (Notion Dark Mode)
        notion: {
          bg: '#191919',     // Nền chính
          card: '#202020',   // Nền thẻ, sidebar
          border: '#2E2E2E', // Màu viền
          text: '#EBEBEB',   // Chữ chính
          muted: '#9B9B9B',  // Chữ phụ, mờ
        }
      },
      fontFamily: {
        // Đặt tên class font
        'mono': ['JetBrainsMono_400Regular'],
        'mono-bold': ['JetBrainsMono_700Bold'],
      }
    },
  },
  plugins: [],
}
