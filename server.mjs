// 生产环境静态服务器：把 `astro build` 的产物 dist/ 作为一个长期进程服务。
// Microverse 的 npm 部署流程会 `npm run build` 后 `npm start`，并注入 PORT。
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveStaticFile, contentTypeFor } from './src/lib/static-server.mjs';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(dirname, 'dist');
const port = Number(process.env.PORT) || 4321;
const host = process.env.HOST || '0.0.0.0';

const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const file = resolveStaticFile(pathname, distDir);

  if (!file) {
    // 用 Astro 生成的 404 页面兜底，没有则退回纯文本
    const notFound = resolveStaticFile('/404.html', distDir);
    if (notFound) {
      res.writeHead(404, { 'Content-Type': contentTypeFor(notFound) });
      fs.createReadStream(notFound).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
    }
    return;
  }

  res.writeHead(200, { 'Content-Type': contentTypeFor(file) });
  fs.createReadStream(file).pipe(res);
});

server.listen(port, host, () => {
  console.log(`Serving dist/ on http://${host}:${port}`);
});
