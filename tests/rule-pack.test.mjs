import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  renderRulePack,
  AGENTS_HEADINGS,
  readTemplateDisplayName,
  resolveTemplateForStack,
} from './lib/render-rule-pack.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '..');
const CASES_DIR = path.join(HERE, 'cases');
const SKILL_DIR = path.join(REPO_ROOT, 'skills', 'spec-generator');

function sectionBody(markdown, heading) {
  const lines = markdown.split(/\r?\n/);
  const start = lines.indexOf(heading);
  if (start === -1) return null;
  let end = start + 1;
  while (end < lines.length && !lines[end].startsWith('## ')) end += 1;
  return lines.slice(start + 1, end).join('\n').trim();
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

      // 1. 恰好包含 7 个顶层标题，且顺序固定
      const topLevelHeadings = agents
        .split(/\r?\n/)
        .filter((line) => line.startsWith('## '));
      assert.deepEqual(topLevelHeadings, AGENTS_HEADINGS);

      // 2. 五个规则模块内容非空（≥ 50 字符）
      for (let number = 1; number <= 5; number += 1) {
        const body = sectionBody(agents, AGENTS_HEADINGS[number - 1]);
        assert.ok(body, `第 ${number} 节缺少正文`);
        assert.ok(
          body.length >= 50,
          `第 ${number} 节正文只有 ${body.length} 字符，少于 50`,
        );
      }

      // 3. AI 自查清单至少有 5 个复选框
      const checklist = sectionBody(agents, AGENTS_HEADINGS[5]);
      const checkboxCount = (checklist.match(/^- \[ \]/gm) ?? []).length;
      assert.ok(checkboxCount >= 5, `AI 自查清单只有 ${checkboxCount} 个复选框`);

      // 4. 溯源块
      assert.ok(agents.includes('本规则包由规范生成器生成'), '缺少溯源说明');
      assert.ok(
        agents.includes(`技术栈：${caseData.answers.STACK}`),
        '溯源块中的技术栈不正确',
      );
      assert.ok(
        agents.includes(`生成日期：${caseData.answers.DATE}`),
        '溯源块中的生成日期不正确',
      );
      assert.ok(!agents.includes('<!-- 模板名'), 'AGENTS.md 残留了模板名注释');
      const expectedLabel =
        caseData.expect.template === 'generic'
          ? readTemplateDisplayName('generic', REPO_ROOT)
          : `精调模板（${readTemplateDisplayName(caseData.expect.template, REPO_ROOT)}）`;
      assert.ok(
        agents.includes(`模板：${expectedLabel}`),
        `模板标签不正确，应为「模板：${expectedLabel}」`,
      );

      // 5. 不得残留占位符
      assert.ok(!agents.includes('{{'), 'AGENTS.md 残留了未替换的占位符');
      assert.ok(!glossary.includes('{{'), 'GLOSSARY.md 残留了未替换的占位符');

      // 6. 各模块必须出现的标记
      for (const [number, markers] of Object.entries(caseData.expect.moduleMarkers)) {
        const body = sectionBody(agents, AGENTS_HEADINGS[Number(number) - 1]);
        assert.ok(body, `第 ${number} 节缺少正文`);
        for (const marker of markers) {
          assert.ok(body.includes(marker), `第 ${number} 节缺少标记「${marker}」`);
        }
      }

      // 7. 验证命令必须出现在第 7 节
      const validationSection = sectionBody(agents, AGENTS_HEADINGS[6]);
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

test('路由表命中正确的模板', () => {
  const mapping = [
    ['uni-app + Vue 3', 'uniapp'],
    ['Vue 3', 'vue3'],
    ['Vue 2', 'generic'],
    ['Spring Cloud', 'generic'],
    ['微信小程序', 'generic'],
  ];
  for (const [stack, templateId] of mapping) {
    assert.equal(
      resolveTemplateForStack(stack, REPO_ROOT).templateId,
      templateId,
      `技术栈「${stack}」命中了错误的模板`,
    );
  }
});
