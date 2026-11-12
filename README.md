# foxerw 的个人博客

基于 Astro 的静态博客，支持部署到 GitHub Pages 或 Microverse（详见 `如何部署到microverse.md`）。文章用 Markdown 编写，构建期预渲染为静态 HTML。

## 本地开发

```bash
npm install
npm run dev      # http://localhost:4321/
```

## 常用命令

| 命令 | 作用 |
|---|---|
| `npm run dev` | 本地开发（启动前自动补齐缺失的 D2 图） |
| `npm run build` | 构建静态站点到 dist/（D2 预渲染 + Pagefind 索引） |
| `npm run d2` | 只渲染缺失/新增的 D2 图 |
| `npm run d2:force` | 全部重新渲染 D2 图（改渲染参数后用） |
| `npm run d2:prune` | 删除已无文章引用的 D2 图 |
| `npm start` | 生产环境静态服务器（Microverse 部署用，读 PORT） |
| `npm run preview` | 预览构建产物 |
| `npm run check` | TypeScript 类型检查（会先补齐缺失的 D2 图） |
| `npm run test` | 运行 Vitest 单测 |

## 发布文章

在 `src/content/posts/` 新建 `.md`，`git push` 即自动部署。详见 `如何发布文章.md`。

## 部署

`site` / `base` 由构建时的环境变量注入（见 `astro.config.mjs`）：

| 变量 | 作用 | 默认值 |
|---|---|---|
| `SITE_URL` | 站点绝对地址（RSS / sitemap / robots 的 canonical） | `http://localhost:4321` |
| `BASE_PATH` | 部署子路径前缀 | `/` |

### GitHub Pages

推送 `main` 分支 → GitHub Actions 自动构建并发布到 Pages（workflow 已注入 `BASE_PATH=/personal-blog/`、`SITE_URL=https://foxerw.github.io`）。PR 会跑 check/test/build，但不会部署。
首次需在仓库 Settings → Pages → Source 选 "GitHub Actions"。

> 在 Windows Git Bash 中手动模拟子路径构建时，需加 `MSYS_NO_PATHCONV=1`，
> 否则 `/personal-blog/` 会被 MSYS 转换成 `C:/Program Files/Git/personal-blog/`：
> `MSYS_NO_PATHCONV=1 BASE_PATH=/personal-blog/ npm run build`

### Microverse

创建 **npm** 类型应用 → 上传源码 → 设 `SITE_URL` → Start。详见 `如何部署到microverse.md`。

## 技术栈

Astro 5 · Tailwind 4 · React 18（岛屿）· Pagefind · Giscus · D2（构建期 SVG）· Vitest
