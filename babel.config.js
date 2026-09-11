// Cấu hình Babel (Trình biên dịch mã JS/TS)
module.exports = function (api) {
  // Caching giúp việc build nhanh hơn trong các lần tiếp theo
  api.cache(true);
  return {
    presets: [
      // Sử dụng preset của Expo, có tích hợp sẵn cấu hình JSX cho NativeWind (TailwindCSS)
      ["babel-preset-expo", { jsxImportSource: "nativewind" }]
    ],
    plugins: [
      // Plugin bắt buộc cho thư viện Reanimated (hiệu ứng chuyển động)
      'react-native-reanimated/plugin',
    ],
  };
};
