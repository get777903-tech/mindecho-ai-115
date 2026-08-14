---
name: targeted-code-editing
description: Rule and skill to re-check full codebase but restrict modifications ONLY to the exact parts explicitly requested by the user.
---

# Targeted Code Editing & Full Verification Skill

## Purpose
Ensures that the AI agent thoroughly inspects and re-checks the entire codebase for context, but strictly limits code modifications ONLY to the specific components, lines, or logic requested in the user's current instruction.

## Rules & Directives:
1. **Full Code Inspection**: Always review the full file and related dependencies to ensure complete context before editing.
2. **Strict Edit Isolation**: Modify ONLY the exact lines, buttons, or functions specified in the user prompt. Never refactor, reformat, or alter unrelated code.
3. **Preserve Unrelated Features**: All non-targeted functionality, event handlers, styles, and translations MUST remain 100% untouched and functional.
4. **Post-Edit Verification**: Verify that the targeted modification works as intended without breaking surrounding code.