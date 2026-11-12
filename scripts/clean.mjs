#!/usr/bin/env node
// 清理构建产物和 Astro 内容缓存。
// 删除文章后如果本地构建仍出现旧页面，通常是 node_modules/.astro/data-store.json 残留。
import { rmSync } from 'node:fs';

const targets = ['dist', '.astro', 'node_modules/.astro'];
for (const target of targets) {
  rmSync(target, { recursive: true, force: true });
}
console.log(`clean: removed ${targets.join(', ')}`);
