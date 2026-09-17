// Cấu hình Metro Bundler (Trình đóng gói mặc định của React Native/Expo)
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

// Lấy cấu hình mặc định của Expo cho thư mục hiện tại
const config = getDefaultConfig(__dirname);

// Thêm cấu hình Header bảo mật để hỗ trợ SharedArrayBuffer cho expo-sqlite trên Web (Trình duyệt Chrome/Edge)
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
      return middleware(req, res, next);
    };
  }
};

// Cho phép Metro nhận diện file WebAssembly (.wasm) của SQLite
if (!config.resolver.assetExts.includes('wasm')) {
  config.resolver.assetExts.push('wasm');
}

// Tích hợp NativeWind vào Metro, chỉ định file global.css làm đầu vào CSS chính
module.exports = withNativeWind(config, { input: "./global.css" });
