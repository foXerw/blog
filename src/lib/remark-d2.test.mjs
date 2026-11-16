import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import remarkD2 from './remark-d2.mjs';
import { hashD2 } from './d2.mjs';

let svgDir;
const source = 'a -> b\n';
const key = hashD2(source);
const svg = '<svg viewBox="0 0 120 80"></svg>';

beforeAll(() => {
  svgDir = fs.mkdtempSync(path.join(os.tmpdir(), 'remark-d2-'));
  fs.writeFileSync(path.join(svgDir, `${key}.light.svg`), svg);
  fs.writeFileSync(path.join(svgDir, `${key}.dark.svg`), svg);
});

afterAll(() => {
  fs.rmSync(svgDir, { recursive: true, force: true });
});

function tree(children) {
  return { type: 'root', children };
}

describe('remarkD2', () => {
  it('把 d2 code 节点替换为图片 HTML', () => {
    const t = tree([{ type: 'code', lang: 'd2', meta: '架构图', value: source }]);
    remarkD2({ base: '/blog/', svgDir })(t, { path: 'post.md' });
    expect(t.children[0].type).toBe('html');
    expect(t.children[0].value).toContain('/blog/d2/' + key + '.light.svg');
    expect(t.children[0].value).toContain('架构图');
    expect(t.children[0].value).toContain('width="120"');
    expect(t.children[0].value).toContain('height="80"');
  });

  it('不修改其他语言的 code 节点', () => {
    const t = tree([{ type: 'code', lang: 'js', value: 'const a = 1;' }]);
    remarkD2({ base: '/', svgDir })(t, { path: 'post.md' });
    expect(t.children[0].type).toBe('code');
  });

  it('递归处理引用块里的 d2 节点', () => {
    const t = tree([
      {
        type: 'blockquote',
        children: [{ type: 'code', lang: 'd2', value: source }],
      },
    ]);
    remarkD2({ base: '/', svgDir })(t, { path: 'post.md' });
    expect(t.children[0].children[0].type).toBe('html');
  });

  it('缺图时降级为源码并给出提示', () => {
    const missing = 'missing -> diagram\n';
    const t = tree([{ type: 'code', lang: 'd2', value: missing }]);
    remarkD2({ base: '/', svgDir })(t, { path: 'post.md' });
    expect(t.children[0].type).toBe('html');
    expect(t.children[0].value).toContain('d2-missing');
    expect(t.children[0].value).toContain('missing -&gt; diagram');
  });
});
