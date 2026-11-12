import fs from 'node:fs';
import path from 'node:path';
import {
  figureMarkup,
  fallbackMarkup,
  hashD2,
  svgDimensions,
} from './d2.mjs';

// 把 ```d2 代码块替换成预渲染好的 SVG <figure>。
// SVG 由 scripts/render-d2.mjs 在构建前生成到 public/d2/。
export default function remarkD2(options = {}) {
  const base = options.base ?? '/';
  const svgDir = options.svgDir ?? path.resolve('public/d2');

  return (tree, file) => {
    walk(tree, file);
  };

  function walk(node, file) {
    if (node.type === 'code' && node.lang === 'd2') {
      const key = hashD2(node.value);
      const lightFile = path.join(svgDir, `${key}.light.svg`);
      const darkFile = path.join(svgDir, `${key}.dark.svg`);

      if (!fs.existsSync(lightFile) || !fs.existsSync(darkFile)) {
        console.warn(
          `remark-d2: ${file?.path ?? 'Markdown'} 缺少 D2 图 ${key}，请运行 npm run d2`,
        );
        node.type = 'html';
        node.value = fallbackMarkup(node.value);
        delete node.lang;
        delete node.meta;
        return;
      }

      const dimensions = svgDimensions(fs.readFileSync(lightFile, 'utf8'));
      node.type = 'html';
      node.value = figureMarkup({
        key,
        alt: altFromMeta(node.meta),
        width: dimensions?.width ?? 0,
        height: dimensions?.height ?? 0,
        base,
      });
      delete node.lang;
      delete node.meta;
      return;
    }

    if (node.children) {
      for (const child of node.children) walk(child, file);
    }
  }
}

// 围栏 info 既支持裸文本（```d2 架构图），也支持 title="架构图"。
function altFromMeta(meta) {
  const value = (meta ?? '').trim();
  if (!value) return '';
  const match = /^title=(?:"([^"]*)"|'([^']*)'|(\S+))$/.exec(value);
  return match ? (match[1] ?? match[2] ?? match[3]) : value;
}
