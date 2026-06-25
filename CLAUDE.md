# zhuangxiu-helper — Claude Memory
> Last analyzed: 2026-06-25 (updated)
> Re-analysis needed: NO — read .claude/rules/ files instead of source files

## What this project is
装修小白学习助手 — 系统化学习装修流程、材料知识、施工工艺、验收标准

## Quick reference
- **Stack**: JavaScript + Vue.js + Vitest + Vite + ESLint + Prettier
- **Dev**: `vite`
- **Test**: `vitest run`
- **Build**: `vite build`

## Memory files (read these, not source files)
- @.claude/rules/architecture.md — folder map, entry points, data flow
- @.claude/rules/stack.md — tech stack, versions, all commands
- @.claude/rules/modules.md — every module and what it does
- @.claude/rules/models.md — DB schemas and data types
- @.claude/rules/api.md — all routes and endpoints
- @.claude/rules/conventions.md — naming, patterns, testing approach
- @.claude/rules/gotchas.md — quirks, workarounds, do-not-touch
- @.claude/rules/changelog.md — what changed and when

## Instruction
You have full codebase knowledge from the files above.
Do NOT re-read source files to understand structure — use memory files.
If something seems outdated, flag it rather than re-analyzing.
