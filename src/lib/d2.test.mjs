import { describe, it, expect } from 'vitest';
import {
  hashD2,
  extractD2Blocks,
  svgDimensions,
  displayScale,
  hasTopLevelDirection,
  figureMarkup,
  fallbackMarkup,
} from './d2.mjs';

describe('hashD2', () => {
  it('忽略首尾空白', () => {
    expect(hashD2('  a -> b\n')).toBe(hashD2('a -> b'));
  });

  it('内容变化时哈希变化', () => {
    expect(hashD2('a -> b')).not.toBe(hashD2('a -> c'));
  });

  it('输出 32 位十六进制 md5', () => {
    expect(hashD2('a -> b')).toMatch(/^[0-9a-f]{32}$/);
  });
});

describe('extractD2Blocks', () => {
  it('提取 d2 代码块', () => {
    expect(extractD2Blocks('```d2\na -> b\n```')).toEqual(['a -> b\n']);
  });

  it('支持 ~ 围栏', () => {
    expect(extractD2Blocks('~~~d2\na -> b\n~~~')).toEqual(['a -> b\n']);
  });

  it('忽略其他语言', () => {
    expect(extractD2Blocks('```js\nconst a = 1;\n```')).toEqual([]);
  });

  it('忽略前缀相似的语言', () => {
    expect(extractD2Blocks('```d2-extra\na -> b\n```')).toEqual([]);
  });

  it('支持带 info 的 d2 代码块', () => {
    expect(extractD2Blocks('```d2 title="架构图"\na -> b\n```')).toEqual(['a -> b\n']);
  });

  it('提取引用块里的 d2 代码块', () => {
    expect(extractD2Blocks('> ```d2\n> a -> b\n> ```')).toEqual(['a -> b\n']);
  });
});

describe('svgDimensions', () => {
  it('读取 viewBox 尺寸', () => {
    expect(svgDimensions('<svg viewBox="-17 -57 2500 1402"></svg>')).toEqual({
      width: 2500,
      height: 1402,
    });
  });

  it('没有 viewBox 时返回 null', () => {
    expect(svgDimensions('<svg></svg>')).toBeNull();
  });
});

describe('displayScale', () => {
  it('小图不放大', () => {
    expect(displayScale(200, 200)).toBe(1);
  });

  it('超宽图按列宽缩放', () => {
    expect(displayScale(2500, 500)).toBeCloseTo(608 / 2500);
  });

  it('超高的图按高度上限缩放', () => {
    expect(displayScale(500, 1800)).toBeCloseTo(900 / 1800);
  });
});

describe('hasTopLevelDirection', () => {
  it('识别顶层 direction', () => {
    expect(hasTopLevelDirection('direction: right\na -> b')).toBe(true);
  });

  it('忽略容器内部的 direction', () => {
    expect(hasTopLevelDirection('container: {\n  direction: right\n}')).toBe(false);
  });
});

describe('figureMarkup', () => {
  const base = { key: 'abc', alt: '架构图', width: 800, height: 400 };

  it('输出带 base 的明暗两套地址', () => {
    const html = figureMarkup({ ...base, base: '/blog/' });
    expect(html).toContain('src="/blog/d2/abc.light.svg"');
    expect(html).toContain('data-light="/blog/d2/abc.light.svg"');
    expect(html).toContain('data-dark="/blog/d2/abc.dark.svg"');
  });

  it('根路径部署不产生双斜杠', () => {
    const html = figureMarkup({ ...base, base: '/' });
    expect(html).toContain('src="/d2/abc.light.svg"');
  });

  it('写入宽高并识别超宽图', () => {
    const html = figureMarkup({ ...base, width: 901, base: '/' });
    expect(html).toContain('width="901"');
    expect(html).toContain('height="400"');
    expect(html).toContain('is-wide');
  });

  it('普通宽度不加 is-wide', () => {
    expect(figureMarkup({ ...base, width: 600, base: '/' })).not.toContain('is-wide');
  });

  it('转义 caption 与 alt', () => {
    const html = figureMarkup({ ...base, alt: '<script>x</script>', base: '/' });
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('没有说明时不输出 figcaption', () => {
    const html = figureMarkup({ key: 'abc', width: 100, height: 50, base: '/' });
    expect(html).not.toContain('figcaption');
    expect(html).toContain('alt="D2 示意图"');
  });
});

describe('fallbackMarkup', () => {
  it('保留源码并转义', () => {
    const html = fallbackMarkup('a -> b <x>');
    expect(html).toContain('d2-missing');
    expect(html).toContain('a -&gt; b &lt;x&gt;');
  });
});
