import fs from 'node:fs';
import path from 'node:path';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.wasm': 'application/wasm',
};

export function contentTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME[ext] || 'application/octet-stream';
}

// 将 URL pathname 解析为 dist 内的文件绝对路径；命中目录时落到其 index.html
// （Astro directory 格式）。返回 null 表示 404。含路径穿越防护。
export function resolveStaticFile(pathname, distDir) {
  let rel;
  try {
    rel = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  // 去掉前导 /，避免 path.resolve 把 rel 当成绝对路径
  rel = rel.replace(/^\/+/, '');

  const root = path.resolve(distDir);
  const abs = path.resolve(root, rel);

  // 最终防线：解析结果必须落在 distDir 内
  if (abs !== root && !abs.startsWith(root + path.sep)) {
    return null;
  }

  if (isFile(abs)) return abs;

  const index = path.join(abs, 'index.html');
  if (isFile(index)) return index;

  return null;
}

function isFile(p) {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
}
