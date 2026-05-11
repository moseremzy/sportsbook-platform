// const base_url = process.env.VUE_APP_API_BASE_URL
// const { defineConfig } = require("@vue/cli-service");
// module.exports = defineConfig({
//   transpileDependencies: true,
//   lintOnSave: true,
//   devServer: {
//     proxy: `${base_url}`,
//   },
// });

// vue.config.js
module.exports = {
  transpileDependencies: true,
  lintOnSave: true,
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:9000', // your Express dev server
        changeOrigin: true,
        secure: false,
      },
    },
  },
};
