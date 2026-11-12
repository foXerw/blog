#!/usr/bin/env node
/*
 * 预渲染 Markdown 里的 ```d2 代码块。
 *
 * Astro 构建期间不做外部命令调用，所以图在 `astro build` 之前生成：
 *   扫描 src/content/posts 下的所有 .md → @d2lang/d2（WASM）
 *   → public/d2/<hash>.{light,dark}.svg
 * remark 插件用同样的哈希规则引用图片。
 *
 * 只补缺失的图；--force 全部重渲染，--prune 删除没有文章引用的图。
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  D2_DARK_THEME_ID,
  D2_MIN_HORIZONTAL_SCALE,
  D2_RENDER_OPTIONS,
  displayScale,
  extractD2Blocks,
  hasTopLevelDirection,
  hashD2,
  svgDimensions,
} from '../src/lib/d2.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT_DIR = join(ROOT, 'src', 'content', 'posts');
const OUT_DIR = join(ROOT, 'public', 'd2');

const force = process.argv.includes('--force');
const prune = process.argv.includes('--prune');

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return walk(path);
    return entry.name.endsWith('.md') ? [path] : [];
  });
}

let d2 = null;

async function renderOne(source, themeID) {
  if (!d2) {
    const { D2 } = await import('@d2lang/d2');
    d2 = new D2();
  }
  const result = await d2.compile(source.trim() + '\n', { ...D2_RENDER_OPTIONS, themeID });
  return (await d2.render(result.diagram, result.renderOptions)) + '\n';
}

// 没有显式 direction 时优先横向；横向放进 608px 正文列后字太小，才考虑纵向。
async function pickBest(source) {
  if (hasTopLevelDirection(source)) {
    return { source, light: await renderOne(source, D2_RENDER_OPTIONS.themeID) };
  }

  const horizontal = `direction: right\n${source}`;
  const hLight = await renderOne(horizontal, D2_RENDER_OPTIONS.themeID);
  const hDims = svgDimensions(hLight);
  if (!hDims) return { source: horizontal, light: hLight };
  const hScale = displayScale(hDims.width, hDims.height);
  if (hScale >= D2_MIN_HORIZONTAL_SCALE) {
    return { source: horizontal, light: hLight };
  }

  const vertical = `direction: down\n${source}`;
  const vLight = await renderOne(vertical, D2_RENDER_OPTIONS.themeID);
  const vDims = svgDimensions(vLight);
  const vScale = vDims ? displayScale(vDims.width, vDims.height) : 0;
  return vScale > hScale
    ? { source: vertical, light: vLight }
    : { source: horizontal, light: hLight };
}

const wanted = new Map();
for (const file of walk(CONTENT_DIR)) {
  for (const source of extractD2Blocks(readFileSync(file, 'utf8'))) {
    const key = hashD2(source);
    if (!wanted.has(key)) wanted.set(key, { source, file: relative(ROOT, file) });
  }
}

mkdirSync(OUT_DIR, { recursive: true });
const pending = [...wanted].filter(([key]) => {
  if (force) return true;
  return (
    !existsSync(join(OUT_DIR, `${key}.light.svg`)) ||
    !existsSync(join(OUT_DIR, `${key}.dark.svg`))
  );
});

let failed = 0;
for (const [key, { source, file }] of pending) {
  try {
    const chosen = await pickBest(source);
    const dark = await renderOne(chosen.source, D2_DARK_THEME_ID);
    writeFileSync(join(OUT_DIR, `${key}.light.svg`), chosen.light);
    writeFileSync(join(OUT_DIR, `${key}.dark.svg`), dark);
    console.log(`render-d2: ${file} → public/d2/${key}.{light,dark}.svg`);
  } catch (error) {
    failed += 1;
    console.error(`render-d2: ${file} 渲染失败\n${error.message || error}`);
  }
}

if (prune) {
  for (const name of readdirSync(OUT_DIR)) {
    const match = /^([0-9a-f]{32})\.(light|dark)\.svg$/.exec(name);
    if (match && !wanted.has(match[1])) {
      rmSync(join(OUT_DIR, name));
      console.log(`render-d2: 删除未引用的 public/d2/${name}`);
    }
  }
}

await d2?.dispose();

console.log(`render-d2: 共 ${wanted.size} 张图，本次渲染 ${pending.length - failed} 张`);
if (failed) process.exit(1);
