import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { AGENTS_HEADINGS, ALLOWED_PLACEHOLDERS } from './lib/render-rule-pack.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '..');
const REFERENCES_DIR = path.join(REPO_ROOT, 'skills', 'spec-generator', 'references');

test('assembly.md 的顶层标题与占位符表与渲染器一致', () => {
  const doc = fs.readFileSync(path.join(REFERENCES_DIR, 'assembly.md'), 'utf8');

  const markerIndex = doc.indexOf('恰好以下七个顶层标题');
  assert.ok(markerIndex !== -1, 'assembly.md 缺少顶层标题说明');
  const headingBlock = doc.slice(markerIndex).split('```')[1] ?? '';
  const docHeadings = headingBlock
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith('## '));
  assert.deepEqual(docHeadings, AGENTS_HEADINGS, 'assembly.md 的顶层标题与渲染器不一致');

  const docPlaceholders = new Set(
    [...doc.matchAll(/^\|\s*`([A-Z0-9_]+)`\s*\|/gm)].map((match) => match[1]),
  );
  assert.deepEqual(
    [...docPlaceholders].sort(),
    [...ALLOWED_PLACEHOLDERS].sort(),
    'assembly.md 的占位符表与渲染器不一致',
  );
});

test('SKILL.md 设置为仅用户主动唤起', () => {
  const content = fs.readFileSync(
    path.join(REPO_ROOT, 'skills', 'spec-generator', 'SKILL.md'),
    'utf8',
  );
  const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  assert.ok(frontmatter, 'SKILL.md 缺少 YAML frontmatter');
  assert.match(
    frontmatter[1],
    /^disable-model-invocation:\s*true\s*$/m,
    'SKILL.md 必须设置 disable-model-invocation: true',
  );
});

test('路由表中的模板文件都存在', () => {
  const routing = fs.readFileSync(path.join(REFERENCES_DIR, 'stack-routing.md'), 'utf8');
  const templatePaths = [...routing.matchAll(/^\|[^|]+\|\s*`([^`]+)`\s*\|/gm)].map(
    (match) => match[1],
  );
  assert.ok(templatePaths.length >= 6, '路由表解析到的模板行过少');

  for (const relativePath of templatePaths) {
    const templateFile = path.join(REFERENCES_DIR, relativePath);
    assert.ok(fs.existsSync(templateFile), `路由表引用的模板不存在：${relativePath}`);
    if (relativePath.startsWith('templates/')) {
      assert.match(
        fs.readFileSync(templateFile, 'utf8'),
        /<!--\s*模板名[：:]/,
        `${relativePath} 缺少模板名注释`,
      );
    }
  }
});
