import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

export const DEFAULT_REPO_ROOT = path.resolve(HERE, '..', '..');

const ALLOWED_PLACEHOLDERS = new Set([
  'PROJECT_NAME',
  'PROJECT_SUMMARY',
  'STACK',
  'STACK_VERSIONS',
  'BUILD_TOOL',
  'PACKAGE_MANAGER',
  'TEST_FRAMEWORK',
  'TEST_COMMAND',
  'BUILD_COMMAND',
  'LINT_COMMAND',
  'DATABASE',
  'AUTH',
  'COMMENT_LANGUAGE',
  'KEY_DEPS',
  'TARGET_DIRS',
  'DEPLOY_TARGET',
  'DATE',
  'TEMPLATE_LABEL',
  'GLOSSARY_TERMS',
]);

export const AGENTS_HEADINGS = [
  '## 1. 技术栈锁定',
  '## 2. 架构与目录约束',
  '## 3. 代码风格',
  '## 4. 测试要求',
  '## 5. 安全红线',
  '## 6. AI 自查清单',
  '## 7. 验证命令',
];

const PLACEHOLDER_PATTERN = /\{\{([A-Z0-9_]+)\}\}/g;
const TEMPLATE_NAME_COMMENT = /<!--\s*模板名\s*[：:]\s*([^>]*?)\s*-->/;

function isFallbackRow(row) {
  return (
    path.basename(row.templatePath) === 'generic-engine.md' ||
    row.keywords.some((keyword) => keyword.includes('其他'))
  );
}

function templateIdOf(templatePath) {
  const stem = path.basename(templatePath).replace(/\.md$/i, '');
  return stem === 'generic-engine' ? 'generic' : stem;
}

function parseRoutingTable(refDir) {
  const routingPath = path.join(refDir, 'stack-routing.md');
  const rows = [];

  for (const rawLine of fs.readFileSync(routingPath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line.startsWith('|') || !line.endsWith('|')) continue;

    const cells = line
      .slice(1, -1)
      .split('|')
      .map((cell) => cell.trim());
    if (cells.length < 2) continue;

    const [keywordCell, templateCell] = cells;
    if (keywordCell === '技术栈关键词') continue;
    if (/^:?-{3,}:?$/.test(keywordCell)) continue;
    if (!templateCell) continue;

    const templatePath = templateCell.replace(/`/g, '').trim();
    if (!templatePath) continue;

    rows.push({
      keywords: keywordCell
        .split(/[,，]/)
        .map((keyword) => keyword.trim())
        .filter(Boolean),
      templatePath,
    });
  }

  if (rows.length === 0) {
    throw new Error(`${routingPath} 未解析到任何路由行`);
  }
  return rows;
}

function resolveTemplate(stack, rows) {
  const normalizedStack = String(stack).toLowerCase();
  let fallback = null;

  for (const row of rows) {
    if (isFallbackRow(row)) {
      fallback ??= row;
      continue;
    }
    const matched = row.keywords.some((keyword) =>
      normalizedStack.includes(keyword.toLowerCase()),
    );
    if (matched) {
      return { templatePath: row.templatePath, templateId: templateIdOf(row.templatePath) };
    }
  }

  if (!fallback) {
    throw new Error('stack-routing.md 缺少「其他任意技术栈」兜底行');
  }
  return { templatePath: fallback.templatePath, templateId: templateIdOf(fallback.templatePath) };
}

function stripTemplateNameComment(content) {
  return content.replace(new RegExp(`${TEMPLATE_NAME_COMMENT.source}\\r?\\n?`, 'g'), '');
}

export function readTemplateDisplayName(templateId, repoRoot = DEFAULT_REPO_ROOT) {
  if (templateId === 'generic') return '通用引擎';
  const refDir = path.join(repoRoot, 'skills', 'spec-generator', 'references');
  const templateFile = path.join(refDir, 'templates', `${templateId}.md`);
  if (!fs.existsSync(templateFile)) return templateId;
  const content = fs.readFileSync(templateFile, 'utf8');
  const match = content.match(TEMPLATE_NAME_COMMENT);
  return match ? match[1].trim() : templateId;
}

export function resolveTemplateForStack(stack, repoRoot = DEFAULT_REPO_ROOT) {
  const refDir = path.join(repoRoot, 'skills', 'spec-generator', 'references');
  return resolveTemplate(stack, parseRoutingTable(refDir));
}

function computeTemplateLabel(templateId, rawTemplate) {
  if (templateId === 'generic') return '通用引擎';
  const match = rawTemplate.match(TEMPLATE_NAME_COMMENT);
  const displayName = match ? match[1].trim() : templateId;
  return `精调模板（${displayName}）`;
}

function substitutePlaceholders(content, values, sourceName) {
  const missing = new Set();

  const rendered = content.replace(PLACEHOLDER_PATTERN, (placeholder, key) => {
    if (!ALLOWED_PLACEHOLDERS.has(key)) {
      throw new Error(`${sourceName} 使用了未支持的占位符 {{${key}}}`);
    }
    const value = values[key];
    if (value === undefined || value === null) {
      missing.add(key);
      return placeholder;
    }
    return String(value);
  });

  if (missing.size > 0) {
    throw new Error(`${sourceName} 缺少采访答案：${[...missing].join('、')}`);
  }
  if (rendered.includes('{{')) {
    throw new Error(`${sourceName} 渲染后仍残留未替换的占位符`);
  }
  return rendered;
}

/**
 * 渲染规则包。
 *
 * @param {object} caseData 固定采访回答（见 tests/cases/*.json）
 * @param {string} [repoRoot] 仓库根目录，默认从本文件位置推导
 * @returns {{ templateId: string, agentsMarkdown: string, glossaryMarkdown: string }}
 */
export function renderRulePack(caseData, repoRoot = DEFAULT_REPO_ROOT) {
  if (!caseData || typeof caseData !== 'object') {
    throw new TypeError('renderRulePack 需要一个用例对象');
  }

  const answers = caseData.answers ?? {};
  const stack = caseData.stack ?? answers.STACK ?? '';
  const refDir = path.join(repoRoot, 'skills', 'spec-generator', 'references');

  const rows = parseRoutingTable(refDir);
  const { templatePath, templateId } = resolveTemplate(stack, rows);
  const templateFile = path.join(refDir, templatePath);
  if (!fs.existsSync(templateFile)) {
    throw new Error(`命中的模板文件不存在：${templateFile}`);
  }

  const rawTemplate = fs.readFileSync(templateFile, 'utf8');
  const templateBody = stripTemplateNameComment(rawTemplate);
  const values = {
    ...answers,
    TEMPLATE_LABEL: computeTemplateLabel(templateId, rawTemplate),
  };

  const agentsMarkdown = substitutePlaceholders(templateBody, values, templatePath);
  for (const heading of AGENTS_HEADINGS) {
    if (!agentsMarkdown.includes(heading)) {
      throw new Error(`${templatePath} 生成的 AGENTS.md 缺少顶层标题「${heading}」`);
    }
  }

  const glossaryRaw = fs.readFileSync(path.join(refDir, 'glossary-template.md'), 'utf8');
  const glossaryTerms = (caseData.glossary ?? [])
    .map((entry) => `- **${entry.term}**：${entry.definition}`)
    .join('\n');
  const glossaryMarkdown = substitutePlaceholders(
    glossaryRaw,
    { ...values, GLOSSARY_TERMS: glossaryTerms },
    'glossary-template.md',
  );

  return { templateId, agentsMarkdown, glossaryMarkdown };
}
