import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { resolveStaticFile, contentTypeFor } from './static-server.mjs';

// 构造一个假的 Astro directory-format dist 目录，测试独立于真实构建产物。
let distDir;

beforeAll(() => {
  distDir = fs.mkdtempSync(path.join(os.tmpdir(), 'static-server-'));
  fs.mkdirSync(path.join(distDir, 'about'), { recursive: true });
  fs.mkdirSync(path.join(distDir, 'tags', 'CSS'), { recursive: true });
  fs.mkdirSync(path.join(distDir, '_astro'), { recursive: true });
  fs.mkdirSync(path.join(distDir, 'pagefind'), { recursive: true });
  fs.writeFileSync(path.join(distDir, 'index.html'), '<html></html>');
  fs.writeFileSync(path.join(distDir, 'about', 'index.html'), 'about');
  fs.writeFileSync(path.join(distDir, 'tags', 'CSS', 'index.html'), 'css');
  fs.writeFileSync(path.join(distDir, 'favicon.svg'), '<svg/>');
  fs.writeFileSync(path.join(distDir, '_astro', 'app.js'), 'console.log(1)');
  fs.writeFileSync(path.join(distDir, 'pagefind', 'pagefind.wasm'), 'wasm');
});

afterAll(() => {
  fs.rmSync(distDir, { recursive: true, force: true });
});

describe('resolveStaticFile', () => {
  it('根路径返回 index.html', () => {
    expect(resolveStaticFile('/', distDir)).toBe(path.join(distDir, 'index.html'));
  });

  it('无尾斜杠的目录路径解析到 index.html', () => {
    expect(resolveStaticFile('/about', distDir)).toBe(path.join(distDir, 'about', 'index.html'));
  });

  it('带尾斜杠的目录路径解析到 index.html', () => {
    expect(resolveStaticFile('/about/', distDir)).toBe(path.join(distDir, 'about', 'index.html'));
  });

  it('嵌套目录且含大写段', () => {
    expect(resolveStaticFile('/tags/CSS/', distDir)).toBe(path.join(distDir, 'tags', 'CSS', 'index.html'));
  });

  it('直接文件路径', () => {
    expect(resolveStaticFile('/favicon.svg', distDir)).toBe(path.join(distDir, 'favicon.svg'));
  });

  it('_astro 哈希资源', () => {
    expect(resolveStaticFile('/_astro/app.js', distDir)).toBe(path.join(distDir, '_astro', 'app.js'));
  });

  it('不存在的路径返回 null', () => {
    expect(resolveStaticFile('/nope', distDir)).toBeNull();
  });

  it('路径穿越被拦截', () => {
    expect(resolveStaticFile('/../../etc/passwd', distDir)).toBeNull();
  });

  it('URL 编码的路径穿越被拦截', () => {
    expect(resolveStaticFile('/%2e%2e/%2e%2e/etc/passwd', distDir)).toBeNull();
  });
});

describe('contentTypeFor', () => {
  it('html', () => {
    expect(contentTypeFor('index.html')).toBe('text/html; charset=utf-8');
  });

  it('js', () => {
    expect(contentTypeFor('app.js')).toBe('text/javascript; charset=utf-8');
  });

  it('wasm', () => {
    expect(contentTypeFor('pagefind.wasm')).toBe('application/wasm');
  });

  it('css', () => {
    expect(contentTypeFor('a.css')).toBe('text/css; charset=utf-8');
  });

  it('svg', () => {
    expect(contentTypeFor('a.svg')).toBe('image/svg+xml');
  });

  it('xml', () => {
    expect(contentTypeFor('rss.xml')).toBe('application/xml; charset=utf-8');
  });

  it('json', () => {
    expect(contentTypeFor('a.json')).toBe('application/json; charset=utf-8');
  });

  it('png', () => {
    expect(contentTypeFor('a.png')).toBe('image/png');
  });

  it('扩展名大小写不敏感', () => {
    expect(contentTypeFor('a.JS')).toBe('text/javascript; charset=utf-8');
  });

  it('未知类型回退 octet-stream', () => {
    expect(contentTypeFor('a.xyz')).toBe('application/octet-stream');
  });
});
