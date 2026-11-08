import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { renderRulePack } from './lib/render-rule-pack.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '..');
const CASES_DIR = path.join(HERE, 'cases');
const SKILL_DIR = path.join(REPO_ROOT, 'skills', 'spec-generator');
const REFERENCES_DIR = path.join(SKILL_DIR, 'references');

const HEADINGS = [
  '## 1. 技术栈锁定',
  '## 2. 架构与目录约束',
  '## 3. 代码风格',
  '## 4. 测试要求',
  '## 5. 安全红线',
  '## 6. AI 自查清单',
  '## 7. 验证命令',
];

function sectionBody(markdown, heading) {
  const lines = markdown.split(/\r?\n/);
  const start = lines.indexOf(heading);
  if (start === -1) return null;
  let end = start + 1;
  while (end < lines.length && !lines[end].startsWith('## ')) end += 1;
  return lines.slice(start + 1, end).join('\n').trim();
}

function templateDisplayName(templateId) {
  const file = path.join(REFERENCES_DIR, 'templates', `${templateId}.md`);
  if (!fs.existsSync(file)) return templateId;
  const match = fs.readFileSync(file, 'utf8').match(/<!--\s*模板名[：:]\s*(.+?)\s*-->/);
  return match ? match[1] : templateId;
}

function listFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? listFiles(fullPath) : [fullPath];
  });
}

const caseFiles = fs
  .readdirSync(CASES_DIR)
  .filter((name) => name.endsWith('.json'))
  .sort();

for (const caseFile of caseFiles) {
  const caseData = JSON.parse(fs.readFileSync(path.join(CASES_DIR, caseFile), 'utf8'));

  test(`用例：${caseData.id}`, () => {
    const rendered = renderRulePack(caseData, REPO_ROOT);

    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'spec-generator-'));
    const agentsPath = path.join(tempDir, 'AGENTS.md');
    const glossaryPath = path.join(tempDir, 'GLOSSARY.md');
    fs.writeFileSync(agentsPath, rendered.agentsMarkdown, 'utf8');
    fs.writeFileSync(glossaryPath, rendered.glossaryMarkdown, 'utf8');

    try {
      const agents = fs.readFileSync(agentsPath, 'utf8');
      const glossary = fs.readFileSync(glossaryPath, 'utf8');

      // 1. 恰好包含 7 个顶层章节标题，且顺序固定
      const topLevelHeadings = agents
        .split(/\r?\n/)
        .filter((line) => line.startsWith('## '));
      assert.deepEqual(topLevelHeadings, HEADINGS);

      // 2. 五个规则模块内容非空（≥ 50 字符）
      for (let number = 1; number <= 5; number += 1) {
        const body = sectionBody(agents, HEADINGS[number - 1]);
        assert.ok(body, `第 ${number} 节缺少正文`);
        assert.ok(
          body.length >= 50,
          `第 ${number} 节正文只有 ${body.length} 字符，少于 50`,
        );
      }

      // 3. AI 自查清单至少有 5 个复选框
      const checklist = sectionBody(agents, HEADINGS[5]);
      const checkboxCount = (checklist.match(/^- \[ \]/gm) ?? []).length;
      assert.ok(checkboxCount >= 5, `AI 自查清单只有 ${checkboxCount} 个复选框`);

      // 4. 溯源块
      assert.ok(agents.includes('本规则包由规范生成器生成'), '缺少溯源说明');
      assert.ok(
        agents.includes(`技术栈：${caseData.answers.STACK}`),
        '溯源块中的技术栈不正确',
      );
      if (caseData.expect.template === 'generic') {
        assert.ok(agents.includes('模板：通用引擎'), '通用引擎的模板标签不正确');
      } else {
        const displayName = templateDisplayName(caseData.expect.template);
        assert.ok(agents.includes('模板：精调模板（'), '精调模板的模板标签前缀不正确');
        assert.ok(
          agents.includes(`模板：精调模板（${displayName}）`),
          `精调模板的模板标签未包含显示名 ${displayName}`,
        );
      }

      // 5. 不得残留占位符
      assert.ok(!agents.includes('{{'), 'AGENTS.md 残留了未替换的占位符');
      assert.ok(!glossary.includes('{{'), 'GLOSSARY.md 残留了未替换的占位符');

      // 6. 各模块必须出现的标记
      for (const [number, markers] of Object.entries(caseData.expect.moduleMarkers)) {
        const body = sectionBody(agents, HEADINGS[Number(number) - 1]);
        assert.ok(body, `第 ${number} 节缺少正文`);
        for (const marker of markers) {
          assert.ok(body.includes(marker), `第 ${number} 节缺少标记「${marker}」`);
        }
      }

      // 7. 验证命令必须出现在第 7 节
      const validationSection = sectionBody(agents, HEADINGS[6]);
      assert.ok(validationSection, '第 7 节缺少正文');
      for (const command of caseData.expect.validationCommands) {
        assert.ok(
          validationSection.includes(command),
          `第 7 节缺少验证命令「${command}」`,
        );
      }

      // 8. 业务术语表
      for (const entry of caseData.glossary) {
        assert.ok(glossary.includes(entry.term), `术语表缺少术语「${entry.term}」`);
        assert.ok(
          glossary.includes(entry.definition),
          `术语表缺少「${entry.term}」的定义`,
        );
      }
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
}

test('技能目录不包含编码代理专有配置', () => {
  const forbidden = [
    '.cursor',
    '.trae',
    path.join('.github', 'copilot-instructions.md'),
  ];
  for (const relativePath of forbidden) {
    assert.equal(
      fs.existsSync(path.join(SKILL_DIR, relativePath)),
      false,
      `技能目录不应包含 ${relativePath}`,
    );
  }
});

test('SKILL.md frontmatter 声明技能名与触发场景', () => {
  const content = fs.readFileSync(path.join(SKILL_DIR, 'SKILL.md'), 'utf8');
  const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  assert.ok(frontmatter, 'SKILL.md 缺少 YAML frontmatter');
  assert.match(frontmatter[1], /^name:\s*spec-generator\s*$/m);

  const description = frontmatter[1]
    .split(/\r?\n/)
    .find((line) => line.startsWith('description:'));
  assert.ok(description, 'SKILL.md frontmatter 缺少 description');
  assert.ok(description.includes('我要用'), 'description 未包含唤起句式');
  assert.ok(description.includes('AGENTS.md'), 'description 未包含 AGENTS.md 触发场景');
});

test('必备参考文件存在且技能目录只包含 Markdown', () => {
  const required = [
    'SKILL.md',
    path.join('references', 'interview.md'),
    path.join('references', 'stack-routing.md'),
    path.join('references', 'assembly.md'),
    path.join('references', 'generic-engine.md'),
    path.join('references', 'glossary-template.md'),
  ];
  for (const relativePath of required) {
    assert.ok(
      fs.existsSync(path.join(SKILL_DIR, relativePath)),
      `缺少必备文件 ${relativePath}`,
    );
  }
  for (const file of listFiles(SKILL_DIR)) {
    assert.ok(file.endsWith('.md'), `技能目录不应包含非 Markdown 文件 ${file}`);
  }
});
