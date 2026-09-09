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
    extend: {},
  },
  plugins: [],
}
