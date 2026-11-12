# 如何部署到 Microverse

Microverse 把本博客当 **npm 应用**运行，启动时依次执行：
`npm install --include=dev` → `npm run build`（D2 预渲染 + `astro build` + Pagefind）→ `npm start`（注入 `PORT`）。

## 步骤

1. 在 Microverse 新建应用，类型选 **npm**。
2. 上传**源码**（不是 `dist/`）：
   - 必需：`package.json`、`astro.config.mjs`、`server.mjs`、`tsconfig.json`、`src/`、`scripts/`、`public/`
   - 建议带上：`package-lock.json`
   - **务必排除**：`node_modules/`、`dist/`、`.git/`、`.astro/`、`.claude/`、`docs/`、`.superpowers/`、`.github/`
   - 打包成 ZIP 上传更方便（Microverse 会自动解压）；直接拖拽多个文件也可，但别超过平台的文件数 / 体积上限（默认 100 个文件 / 单文件 100MB）。
3. （可选但推荐）给应用加环境变量 `SITE_URL`，值为部署后的公开地址，如 `https://blog.yourdomain.com`。不设则 RSS / sitemap / robots 里的绝对链接会指向 `http://localhost:4321`。
   - 根域名部署无需设 `BASE_PATH`（默认 `/`）。
4. 点 **Start**：Microverse 自动分配端口、完成 install / build，`npm start` 由 `server.mjs` 在 `dist/` 上监听该端口。
5. 点端口链接访问；如需自定义域名，用 Microverse 的 `APP_PUBLIC_URL_TEMPLATE` 或反代配置。

## 原理

- `server.mjs` 是无依赖静态服务器，正确处理 Astro 的目录格式路由（`/about` → `about/index.html`）、Pagefind 的 `.wasm` MIME 与 404 兜底。
- `site` / `base` 走环境变量，所以同一份代码既能跑根域名，也能跑 GitHub Pages 子路径。
