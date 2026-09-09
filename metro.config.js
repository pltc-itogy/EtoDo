// Cấu hình Metro Bundler (Trình đóng gói mặc định của React Native/Expo)
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

// Lấy cấu hình mặc định của Expo cho thư mục hiện tại
const config = getDefaultConfig(__dirname);

// Tích hợp NativeWind vào Metro, chỉ định file global.css làm đầu vào CSS chính
module.exports = withNativeWind(config, { input: "./global.css" });
