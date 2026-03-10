#!/usr/bin/env node
/**
 * Second pass splitting - further break down files still over 300 lines
 */
import { readFileSync, writeFileSync, mkdirSync, unlinkSync } from 'fs';
import { dirname, join } from 'path';

const ROOT = process.cwd();

function readF(relPath) {
  return readFileSync(join(ROOT, relPath), 'utf-8');
}

function writeF(relPath, content) {
  const fullPath = join(ROOT, relPath);
  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, content);
  const lineCount = content.split('\n').length;
  const status = lineCount > 300 ? 'STILL OVER' : 'OK';
  console.log(`  [${status}] ${relPath} (${lineCount} lines)`);
}

/**
 * Generic: split a TS file that contains a single exported array of objects.
 * Splits the array items roughly in half (at object boundaries).
 */
function splitArrayFile(filePath, constName, type, importLine, part1Name, part2Name, part1Label, part2Label) {
  const src = readF(filePath);
  const lines = src.split('\n');

  // Find array start
  const arrayStartIdx = lines.findIndex(l => l.includes(`${constName}:`));
  if (arrayStartIdx === -1) {
    console.warn(`  Could not find ${constName} in ${filePath}`);
    return false;
  }

  // Find array end
  let bracketDepth = 0;
  let arrayEndIdx = arrayStartIdx;
  for (let i = arrayStartIdx; i < lines.length; i++) {
    for (const ch of lines[i]) {
      if (ch === '[') bracketDepth++;
      if (ch === ']') bracketDepth--;
    }
    if (bracketDepth === 0) {
      arrayEndIdx = i;
      break;
    }
  }

  // Get the array body (without brackets)
  const bodyLines = lines.slice(arrayStartIdx + 1, arrayEndIdx);

  // Find good split points (between top-level objects)
  // Top-level objects start with `  {` at indent level 2
  const objectStarts = [];
  for (let i = 0; i < bodyLines.length; i++) {
    if (bodyLines[i].match(/^\s{2}\{$/)) {
      objectStarts.push(i);
    }
  }

  // Also look for section comment markers to split at
  const sectionMarkers = [];
  for (let i = 0; i < bodyLines.length; i++) {
    if (bodyLines[i].match(/^\s+\/\/\s*[=]{10,}/) || bodyLines[i].match(/^\s+\/\/\s*[-]{10,}/)) {
      sectionMarkers.push(i);
    }
  }

  // Split roughly in half
  const midObject = Math.floor(objectStarts.length / 2);
  const splitIdx = objectStarts[midObject] || Math.floor(bodyLines.length / 2);

  // Find nearest section marker for cleaner split
  let bestSplit = splitIdx;
  for (const marker of sectionMarkers) {
    if (Math.abs(marker - splitIdx) < Math.abs(bestSplit - splitIdx)) {
      bestSplit = marker - 1; // Split before the marker
    }
  }
  // Use the section marker if it's close enough
  if (Math.abs(bestSplit - splitIdx) < bodyLines.length * 0.15) {
    // Good enough, use it
  } else {
    bestSplit = splitIdx;
  }

  const part1Body = bodyLines.slice(0, bestSplit).join('\n').replace(/,\s*$/, '');
  const part2Body = bodyLines.slice(bestSplit).join('\n').replace(/,\s*$/, '');

  const dir = dirname(filePath);
  const constPrefix1 = part1Name.toUpperCase();
  const constPrefix2 = part2Name.toUpperCase();

  writeF(`${dir}/${part1Name}.ts`, `/**
 * ${part1Label}
 */

${importLine}

export const ${constPrefix1}: ${type}[] = [
${part1Body}
];
`);

  writeF(`${dir}/${part2Name}.ts`, `/**
 * ${part2Label}
 */

${importLine}

export const ${constPrefix2}: ${type}[] = [
${part2Body}
];
`);

  return { constPrefix1, constPrefix2, part1Name, part2Name };
}

/**
 * Split quest template submodules further
 */
function splitQuestFurther() {
  console.log('\n=== Quest Templates - Further Split ===');
  const imp = `import type { QuestTemplate } from '../../../schemas/generation.ts';`;
  const dir = 'src/game/data/generation/templates/questTemplates';

  // combat.ts (611 lines) -> split into combat_bounty + combat_other
  const combat = readF(`${dir}/combat.ts`);
  const combatLines = combat.split('\n');
  // Find the CLEAR AREA section
  const clearIdx = combatLines.findIndex(l => l.includes('CLEAR AREA') || l.includes("id: 'clear_"));
  // Estimate: bounty templates end around line 210, so split there
  const bountyEnd = combatLines.findIndex((l, i) => i > 100 && l.includes("id: 'clear_"));
  if (bountyEnd > 0) {
    // Find the preceding section comment
    let splitAt = bountyEnd;
    for (let i = bountyEnd - 1; i >= 0; i--) {
      if (combatLines[i].match(/^\s+\/\/\s*[=]{10,}/)) {
        splitAt = i - 1;
        break;
      }
    }
    const arrayStart = combatLines.findIndex(l => l.includes('COMBAT_QUEST_TEMPLATES'));
    const part1 = combatLines.slice(arrayStart + 1, splitAt).join('\n').replace(/,\s*$/, '');
    const arrayEnd = combatLines.findIndex((l, i) => i > arrayStart && l === '];');
    const part2 = combatLines.slice(splitAt, arrayEnd).join('\n').replace(/,\s*$/, '');

    writeF(`${dir}/combat_bounty.ts`, `/**
 * Combat Quest Templates - Bounty Hunt
 */

${imp}

export const COMBAT_BOUNTY_TEMPLATES: QuestTemplate[] = [
${part1}
];
`);

    writeF(`${dir}/combat_other.ts`, `/**
 * Combat Quest Templates - Clear Area, Escort, Ambush
 */

${imp}

export const COMBAT_OTHER_TEMPLATES: QuestTemplate[] = [
${part2}
];
`);

    // Rewrite combat.ts as re-export
    writeF(`${dir}/combat.ts`, `/**
 * Combat Quest Templates
 */

import type { QuestTemplate } from '../../../schemas/generation.ts';
import { COMBAT_BOUNTY_TEMPLATES } from './combat_bounty.ts';
import { COMBAT_OTHER_TEMPLATES } from './combat_other.ts';

export const COMBAT_QUEST_TEMPLATES: QuestTemplate[] = [
  ...COMBAT_BOUNTY_TEMPLATES,
  ...COMBAT_OTHER_TEMPLATES,
];
`);
  }

  // retrieval.ts (585 lines) -> split into retrieval_fetch + retrieval_other
  const retrieval = readF(`${dir}/retrieval.ts`);
  const retLines = retrieval.split('\n');
  const stealIdx = retLines.findIndex(l => l.includes("id: 'steal_"));
  if (stealIdx > 0) {
    let splitAt = stealIdx;
    for (let i = stealIdx - 1; i >= 0; i--) {
      if (retLines[i].match(/^\s+\/\/\s*[=]{10,}/)) {
        splitAt = i - 1;
        break;
      }
    }
    const arrayStart = retLines.findIndex(l => l.includes('RETRIEVAL_QUEST_TEMPLATES'));
    const part1 = retLines.slice(arrayStart + 1, splitAt).join('\n').replace(/,\s*$/, '');
    const arrayEnd = retLines.findIndex((l, i) => i > arrayStart && l === '];');
    const part2 = retLines.slice(splitAt, arrayEnd).join('\n').replace(/,\s*$/, '');

    writeF(`${dir}/retrieval_fetch.ts`, `/**
 * Retrieval Quest Templates - Fetch Item
 */

${imp}

export const RETRIEVAL_FETCH_TEMPLATES: QuestTemplate[] = [
${part1}
];
`);

    writeF(`${dir}/retrieval_other.ts`, `/**
 * Retrieval Quest Templates - Steal, Recover, Gather
 */

${imp}

export const RETRIEVAL_OTHER_TEMPLATES: QuestTemplate[] = [
${part2}
];
`);

    writeF(`${dir}/retrieval.ts`, `/**
 * Retrieval Quest Templates
 */

import type { QuestTemplate } from '../../../schemas/generation.ts';
import { RETRIEVAL_FETCH_TEMPLATES } from './retrieval_fetch.ts';
import { RETRIEVAL_OTHER_TEMPLATES } from './retrieval_other.ts';

export const RETRIEVAL_QUEST_TEMPLATES: QuestTemplate[] = [
  ...RETRIEVAL_FETCH_TEMPLATES,
  ...RETRIEVAL_OTHER_TEMPLATES,
];
`);
  }

  // social.ts (779 lines) -> split into 3
  const social = readF(`${dir}/social.ts`);
  const socLines = social.split('\n');
  const arrayStart = socLines.findIndex(l => l.includes('SOCIAL_QUEST_TEMPLATES'));
  const arrayEnd = socLines.findIndex((l, i) => i > arrayStart && l === '];');

  // Find spy section
  const spyIdx = socLines.findIndex(l => l.includes("id: 'spy_"));
  // Find mediate section
  const mediateIdx = socLines.findIndex(l => l.includes("id: 'mediate_"));

  let splitAt1 = spyIdx, splitAt2 = mediateIdx;
  for (let i = spyIdx - 1; i >= 0; i--) {
    if (socLines[i].match(/^\s+\/\/\s*[=]{10,}/)) { splitAt1 = i - 1; break; }
  }
  for (let i = mediateIdx - 1; i >= 0; i--) {
    if (socLines[i].match(/^\s+\/\/\s*[=]{10,}/)) { splitAt2 = i - 1; break; }
  }

  const socPart1 = socLines.slice(arrayStart + 1, splitAt1).join('\n').replace(/,\s*$/, '');
  const socPart2 = socLines.slice(splitAt1, splitAt2).join('\n').replace(/,\s*$/, '');
  const socPart3 = socLines.slice(splitAt2, arrayEnd).join('\n').replace(/,\s*$/, '');

  writeF(`${dir}/social_find.ts`, `/**
 * Social Quest Templates - Find Person, Investigate
 */

${imp}

export const SOCIAL_FIND_TEMPLATES: QuestTemplate[] = [
${socPart1}
];
`);

  writeF(`${dir}/social_intrigue.ts`, `/**
 * Social Quest Templates - Spy, Convince, Intimidate
 */

${imp}

export const SOCIAL_INTRIGUE_TEMPLATES: QuestTemplate[] = [
${socPart2}
];
`);

  writeF(`${dir}/social_mediate.ts`, `/**
 * Social Quest Templates - Mediate
 */

${imp}

export const SOCIAL_MEDIATE_TEMPLATES: QuestTemplate[] = [
${socPart3}
];
`);

  writeF(`${dir}/social.ts`, `/**
 * Social Quest Templates
 */

import type { QuestTemplate } from '../../../schemas/generation.ts';
import { SOCIAL_FIND_TEMPLATES } from './social_find.ts';
import { SOCIAL_INTRIGUE_TEMPLATES } from './social_intrigue.ts';
import { SOCIAL_MEDIATE_TEMPLATES } from './social_mediate.ts';

export const SOCIAL_QUEST_TEMPLATES: QuestTemplate[] = [
  ...SOCIAL_FIND_TEMPLATES,
  ...SOCIAL_INTRIGUE_TEMPLATES,
  ...SOCIAL_MEDIATE_TEMPLATES,
];
`);

  // economic.ts (445 lines) -> split into economic_debt + economic_invest
  const economic = readF(`${dir}/economic.ts`);
  const ecoLines = economic.split('\n');
  const ecoArrayStart = ecoLines.findIndex(l => l.includes('ECONOMIC_QUEST_TEMPLATES'));
  const ecoArrayEnd = ecoLines.findIndex((l, i) => i > ecoArrayStart && l === '];');

  const investIdx = ecoLines.findIndex(l => l.includes("id: 'investment_"));
  let ecoSplitAt = investIdx;
  for (let i = investIdx - 1; i >= 0; i--) {
    if (ecoLines[i].match(/^\s+\/\/\s*[=]{10,}/)) { ecoSplitAt = i - 1; break; }
  }

  const ecoPart1 = ecoLines.slice(ecoArrayStart + 1, ecoSplitAt).join('\n').replace(/,\s*$/, '');
  const ecoPart2 = ecoLines.slice(ecoSplitAt, ecoArrayEnd).join('\n').replace(/,\s*$/, '');

  writeF(`${dir}/economic_debt.ts`, `/**
 * Economic Quest Templates - Debt Collection
 */

${imp}

export const ECONOMIC_DEBT_TEMPLATES: QuestTemplate[] = [
${ecoPart1}
];
`);

  writeF(`${dir}/economic_trade.ts`, `/**
 * Economic Quest Templates - Investment, Trade Route
 */

${imp}

export const ECONOMIC_TRADE_TEMPLATES: QuestTemplate[] = [
${ecoPart2}
];
`);

  writeF(`${dir}/economic.ts`, `/**
 * Economic Quest Templates
 */

import type { QuestTemplate } from '../../../schemas/generation.ts';
import { ECONOMIC_DEBT_TEMPLATES } from './economic_debt.ts';
import { ECONOMIC_TRADE_TEMPLATES } from './economic_trade.ts';

export const ECONOMIC_QUEST_TEMPLATES: QuestTemplate[] = [
  ...ECONOMIC_DEBT_TEMPLATES,
  ...ECONOMIC_TRADE_TEMPLATES,
];
`);

  // exploration.ts (394 lines) -> split into exploration_explore + exploration_map
  const exploration = readF(`${dir}/exploration.ts`);
  const expLines = exploration.split('\n');
  const expArrayStart = expLines.findIndex(l => l.includes('EXPLORATION_QUEST_TEMPLATES'));
  const expArrayEnd = expLines.findIndex((l, i) => i > expArrayStart && l === '];');

  const mapIdx = expLines.findIndex(l => l.includes("id: 'map_"));
  let expSplitAt = mapIdx;
  for (let i = mapIdx - 1; i >= 0; i--) {
    if (expLines[i].match(/^\s+\/\/\s*[=]{10,}/)) { expSplitAt = i - 1; break; }
  }

  const expPart1 = expLines.slice(expArrayStart + 1, expSplitAt).join('\n').replace(/,\s*$/, '');
  const expPart2 = expLines.slice(expSplitAt, expArrayEnd).join('\n').replace(/,\s*$/, '');

  writeF(`${dir}/exploration_explore.ts`, `/**
 * Exploration Quest Templates - Explore Location
 */

${imp}

export const EXPLORATION_EXPLORE_TEMPLATES: QuestTemplate[] = [
${expPart1}
];
`);

  writeF(`${dir}/exploration_map.ts`, `/**
 * Exploration Quest Templates - Map Area, Find Route
 */

${imp}

export const EXPLORATION_MAP_TEMPLATES: QuestTemplate[] = [
${expPart2}
];
`);

  writeF(`${dir}/exploration.ts`, `/**
 * Exploration Quest Templates
 */

import type { QuestTemplate } from '../../../schemas/generation.ts';
import { EXPLORATION_EXPLORE_TEMPLATES } from './exploration_explore.ts';
import { EXPLORATION_MAP_TEMPLATES } from './exploration_map.ts';

export const EXPLORATION_QUEST_TEMPLATES: QuestTemplate[] = [
  ...EXPLORATION_EXPLORE_TEMPLATES,
  ...EXPLORATION_MAP_TEMPLATES,
];
`);

  // delivery.ts (316 lines) -> split into delivery_message + delivery_package
  const delivery = readF(`${dir}/delivery.ts`);
  const delLines = delivery.split('\n');
  const delArrayStart = delLines.findIndex(l => l.includes('DELIVERY_QUEST_TEMPLATES'));
  const delArrayEnd = delLines.findIndex((l, i) => i > delArrayStart && l === '];');

  const smuggleIdx = delLines.findIndex(l => l.includes("id: 'smuggle_"));
  let delSplitAt = smuggleIdx;
  for (let i = smuggleIdx - 1; i >= 0; i--) {
    if (delLines[i].match(/^\s+\/\/\s*[=]{10,}/)) { delSplitAt = i - 1; break; }
  }

  const delPart1 = delLines.slice(delArrayStart + 1, delSplitAt).join('\n').replace(/,\s*$/, '');
  const delPart2 = delLines.slice(delSplitAt, delArrayEnd).join('\n').replace(/,\s*$/, '');

  writeF(`${dir}/delivery_messages.ts`, `/**
 * Delivery Quest Templates - Deliver Message, Deliver Package
 */

${imp}

export const DELIVERY_MESSAGE_TEMPLATES: QuestTemplate[] = [
${delPart1}
];
`);

  writeF(`${dir}/delivery_smuggle.ts`, `/**
 * Delivery Quest Templates - Smuggle
 */

${imp}

export const DELIVERY_SMUGGLE_TEMPLATES: QuestTemplate[] = [
${delPart2}
];
`);

  writeF(`${dir}/delivery.ts`, `/**
 * Delivery Quest Templates
 */

import type { QuestTemplate } from '../../../schemas/generation.ts';
import { DELIVERY_MESSAGE_TEMPLATES } from './delivery_messages.ts';
import { DELIVERY_SMUGGLE_TEMPLATES } from './delivery_smuggle.ts';

export const DELIVERY_QUEST_TEMPLATES: QuestTemplate[] = [
  ...DELIVERY_MESSAGE_TEMPLATES,
  ...DELIVERY_SMUGGLE_TEMPLATES,
];
`);
}

/**
 * Split dialogueSnippets submodules
 */
function splitDialogueSnippetsFurther() {
  console.log('\n=== Dialogue Snippets - Further Split ===');
  const dir = 'src/game/data/generation/pools/dialogueSnippets';
  const imp = `import type { DialogueSnippet } from '../../../schemas/generation.ts';`;

  // Generic function to split a snippet file in half
  function splitSnippetFile(fileName, const1Name, const2Name, label1, label2) {
    const src = readF(`${dir}/${fileName}.ts`);
    const lines = src.split('\n');

    // Find all exported const arrays
    const arrays = [];
    let current = null;
    let bracketDepth = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(/^export const (\w+): DialogueSnippet\[\] = \[/);
      if (match) {
        current = { name: match[1], startLine: i, endLine: -1 };
        bracketDepth = 1;
        continue;
      }
      if (current && bracketDepth > 0) {
        for (const ch of line) {
          if (ch === '[') bracketDepth++;
          if (ch === ']') bracketDepth--;
        }
        if (bracketDepth === 0) {
          current.endLine = i + 1;
          arrays.push(current);
          current = null;
        }
      }
    }

    if (arrays.length < 2) {
      // Single array - split elements in half
      const arr = arrays[0];
      if (!arr) return;
      const bodyLines = lines.slice(arr.startLine + 1, arr.endLine - 1);

      // Find object boundaries (lines starting with `  {`)
      const objStarts = [];
      for (let i = 0; i < bodyLines.length; i++) {
        if (bodyLines[i].match(/^\s{2}\{$/)) {
          objStarts.push(i);
        }
      }

      const midObj = Math.floor(objStarts.length / 2);
      const splitLine = objStarts[midObj] || Math.floor(bodyLines.length / 2);

      const p1 = bodyLines.slice(0, splitLine).join('\n').replace(/,\s*$/, '');
      const p2 = bodyLines.slice(splitLine).join('\n').replace(/,\s*$/, '');

      writeF(`${dir}/${const1Name}.ts`, `/**
 * ${label1}
 */

${imp}

export const ${const1Name.toUpperCase()}: DialogueSnippet[] = [
${p1}
];
`);

      writeF(`${dir}/${const2Name}.ts`, `/**
 * ${label2}
 */

${imp}

export const ${const2Name.toUpperCase()}: DialogueSnippet[] = [
${p2}
];
`);

      // Rewrite the original file as a barrel
      writeF(`${dir}/${fileName}.ts`, `/**
 * ${label1} + ${label2}
 */

import type { DialogueSnippet } from '../../../schemas/generation.ts';
import { ${const1Name.toUpperCase()} } from './${const1Name}.ts';
import { ${const2Name.toUpperCase()} } from './${const2Name}.ts';

export { ${const1Name.toUpperCase()} } from './${const1Name}.ts';
export { ${const2Name.toUpperCase()} } from './${const2Name}.ts';

// Re-export originals
${arrays.map(a => `export const ${a.name}: DialogueSnippet[] = [...${const1Name.toUpperCase()}, ...${const2Name.toUpperCase()}];`).join('\n')}
`);
      return;
    }

    // Multiple arrays - split into two files based on count
    const midIdx = Math.ceil(arrays.length / 2);
    const group1 = arrays.slice(0, midIdx);
    const group2 = arrays.slice(midIdx);

    let body1 = '';
    for (const arr of group1) {
      body1 += lines.slice(arr.startLine, arr.endLine).join('\n') + '\n\n';
    }

    let body2 = '';
    for (const arr of group2) {
      body2 += lines.slice(arr.startLine, arr.endLine).join('\n') + '\n\n';
    }

    const exports1 = group1.map(a => a.name);
    const exports2 = group2.map(a => a.name);

    writeF(`${dir}/${const1Name}.ts`, `/**
 * ${label1}
 */

${imp}

${body1.trim()}
`);

    writeF(`${dir}/${const2Name}.ts`, `/**
 * ${label2}
 */

${imp}

${body2.trim()}
`);

    // Rewrite original as barrel
    writeF(`${dir}/${fileName}.ts`, `/**
 * ${label1} + ${label2}
 */

export { ${exports1.join(', ')} } from './${const1Name}.ts';
export { ${exports2.join(', ')} } from './${const2Name}.ts';
`);
  }

  // conversation.ts (638) -> conversation_questions + conversation_rumors_talk
  splitSnippetFile('conversation', 'conversation_questions', 'conversation_rumors', 'Question Snippets', 'Rumor and Small Talk Snippets');

  // conflict.ts (562) -> conflict_threats + conflict_social
  splitSnippetFile('conflict', 'conflict_threats', 'conflict_social', 'Threat and Bribe Snippets', 'Compliment and Insult Snippets');

  // shop.ts (456) -> shop_welcome + shop_transactions
  splitSnippetFile('shop', 'shop_welcome', 'shop_transactions', 'Shop Welcome and Browse Snippets', 'Shop Transaction Snippets');

  // greetings.ts (392) -> greetings_friendly + greetings_role
  splitSnippetFile('greetings', 'greetings_friendly', 'greetings_role', 'Friendly and Neutral Greetings', 'Role-specific and Farewell Snippets');

  // quest.ts (384) -> quest_offer + quest_complete
  splitSnippetFile('quest', 'quest_offer', 'quest_complete', 'Quest Offer and Update Snippets', 'Quest Complete Snippets');

  // social.ts (380) -> social_thanks + social_refusal
  splitSnippetFile('social', 'social_thanks', 'social_agreement', 'Thanks and Refusal Snippets', 'Agreement Snippets');
}

/**
 * Split namePools submodules
 */
function splitNamePoolsFurther() {
  console.log('\n=== Name Pools - Further Split ===');
  const dir = 'src/game/data/generation/pools/namePools';
  const imp = `import type { NamePool } from '../../../schemas/generation.ts';`;

  // european_outlaw_mechanical.ts (678) -> split into 3 individual files
  const src = readF(`${dir}/european_outlaw_mechanical.ts`);
  const lines = src.split('\n');

  const pools = [];
  let current = null;
  let braceDepth = 0;
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^export const (\w+): NamePool = \{/);
    if (match) {
      // Include comments above
      let commentStart = i;
      while (commentStart > 0 && (lines[commentStart - 1].startsWith('//') || lines[commentStart - 1].trim() === '')) {
        commentStart--;
      }
      current = { name: match[1], startLine: commentStart, endLine: -1 };
      braceDepth = 1;
      continue;
    }
    if (current) {
      for (const ch of lines[i]) {
        if (ch === '{') braceDepth++;
        if (ch === '}') braceDepth--;
      }
      if (braceDepth === 0) {
        current.endLine = i + 1;
        pools.push(current);
        current = null;
      }
    }
  }

  for (const pool of pools) {
    const fileName = pool.name.toLowerCase();
    writeF(`${dir}/${fileName}.ts`, `/**
 * Name Pool - ${pool.name.replace(/_/g, ' ')}
 */

${imp}

${lines.slice(pool.startLine, pool.endLine).join('\n')}
`);
  }

  // Rewrite the original as barrel
  writeF(`${dir}/european_outlaw_mechanical.ts`, `/**
 * Name Pools - European, Outlaw, Mechanical
 */

export { FRONTIER_EUROPEAN_POOL } from './frontier_european_pool.ts';
export { OUTLAW_POOL } from './outlaw_pool.ts';
export { MECHANICAL_POOL } from './mechanical_pool.ts';
`);

  // anglo_hispanic.ts (413) -> split each pool to own file
  const angloSrc = readF(`${dir}/anglo_hispanic.ts`);
  const angloLines = angloSrc.split('\n');

  const angloPools = [];
  current = null;
  for (let i = 0; i < angloLines.length; i++) {
    const match = angloLines[i].match(/^export const (\w+): NamePool = \{/);
    if (match) {
      let commentStart = i;
      while (commentStart > 0 && (angloLines[commentStart - 1].startsWith('//') || angloLines[commentStart - 1].trim() === '')) {
        commentStart--;
      }
      current = { name: match[1], startLine: commentStart, endLine: -1 };
      braceDepth = 1;
      continue;
    }
    if (current) {
      for (const ch of angloLines[i]) {
        if (ch === '{') braceDepth++;
        if (ch === '}') braceDepth--;
      }
      if (braceDepth === 0) {
        current.endLine = i + 1;
        angloPools.push(current);
        current = null;
      }
    }
  }

  for (const pool of angloPools) {
    const fileName = pool.name.toLowerCase();
    writeF(`${dir}/${fileName}.ts`, `/**
 * Name Pool - ${pool.name.replace(/_/g, ' ')}
 */

${imp}

${angloLines.slice(pool.startLine, pool.endLine).join('\n')}
`);
  }

  writeF(`${dir}/anglo_hispanic.ts`, `/**
 * Name Pools - Anglo, Hispanic
 */

export { FRONTIER_ANGLO_POOL } from './frontier_anglo_pool.ts';
export { FRONTIER_HISPANIC_POOL } from './frontier_hispanic_pool.ts';
`);

  // native_chinese.ts (400) -> split each pool to own file
  const nativeSrc = readF(`${dir}/native_chinese.ts`);
  const nativeLines = nativeSrc.split('\n');

  const nativePools = [];
  current = null;
  for (let i = 0; i < nativeLines.length; i++) {
    const match = nativeLines[i].match(/^export const (\w+): NamePool = \{/);
    if (match) {
      let commentStart = i;
      while (commentStart > 0 && (nativeLines[commentStart - 1].startsWith('//') || nativeLines[commentStart - 1].trim() === '')) {
        commentStart--;
      }
      current = { name: match[1], startLine: commentStart, endLine: -1 };
      braceDepth = 1;
      continue;
    }
    if (current) {
      for (const ch of nativeLines[i]) {
        if (ch === '{') braceDepth++;
        if (ch === '}') braceDepth--;
      }
      if (braceDepth === 0) {
        current.endLine = i + 1;
        nativePools.push(current);
        current = null;
      }
    }
  }

  for (const pool of nativePools) {
    const fileName = pool.name.toLowerCase();
    writeF(`${dir}/${fileName}.ts`, `/**
 * Name Pool - ${pool.name.replace(/_/g, ' ')}
 */

${imp}

${nativeLines.slice(pool.startLine, pool.endLine).join('\n')}
`);
  }

  writeF(`${dir}/native_chinese.ts`, `/**
 * Name Pools - Native, Chinese
 */

export { FRONTIER_NATIVE_POOL } from './frontier_native_pool.ts';
export { FRONTIER_CHINESE_POOL } from './frontier_chinese_pool.ts';
`);
}

/**
 * Split placeNamePools submodules
 */
function splitPlaceNamePoolsFurther() {
  console.log('\n=== Place Name Pools - Further Split ===');
  const dir = 'src/game/data/generation/pools/placeNamePools';
  const imp = `import type { PlaceNamePool } from '../../../schemas/generation.ts';`;

  function splitPoolFile(fileName, pools) {
    const src = readF(`${dir}/${fileName}.ts`);
    const lines = src.split('\n');

    const found = [];
    let current = null;
    let braceDepth = 0;
    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(/^export const (\w+): PlaceNamePool = \{/);
      if (match) {
        let commentStart = i;
        while (commentStart > 0 && (lines[commentStart - 1].startsWith('//') || lines[commentStart - 1].trim() === '')) {
          commentStart--;
        }
        current = { name: match[1], startLine: commentStart, endLine: -1 };
        braceDepth = 1;
        continue;
      }
      if (current) {
        for (const ch of lines[i]) {
          if (ch === '{') braceDepth++;
          if (ch === '}') braceDepth--;
        }
        if (braceDepth === 0) {
          current.endLine = i + 1;
          found.push(current);
          current = null;
        }
      }
    }

    for (const pool of found) {
      const fn = pool.name.toLowerCase();
      writeF(`${dir}/${fn}.ts`, `/**
 * Place Name Pool - ${pool.name.replace(/_/g, ' ')}
 */

${imp}

${lines.slice(pool.startLine, pool.endLine).join('\n')}
`);
    }

    // Rewrite barrel
    const reexports = found.map(p =>
      `export { ${p.name} } from './${p.name.toLowerCase()}.ts';`
    ).join('\n');

    writeF(`${dir}/${fileName}.ts`, `/**
 * Place Name Pools - ${fileName}
 */

${reexports}
`);
  }

  splitPoolFile('settlements', ['TOWN_NAME_POOL', 'RANCH_NAME_POOL', 'OUTPOST_NAME_POOL']);
  splitPoolFile('features', ['MINE_NAME_POOL', 'LANDMARK_NAME_POOL', 'STATION_NAME_POOL']);
}

/**
 * Split other oversized template files
 */
function splitOtherTemplatesFurther() {
  console.log('\n=== Other Templates - Further Split ===');

  // factionTemplates/business.ts (393) -> split in half
  {
    const dir = 'src/game/data/generation/templates/factionTemplates';
    const imp = `import type { FactionReactionTemplate } from '../../../schemas/generation.ts';`;
    const src = readF(`${dir}/business.ts`);
    const lines = src.split('\n');

    // Find the consts
    const consts = [];
    let current = null;
    let braceDepth = 0;
    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(/^export const (\w+): FactionReactionTemplate = \{/);
      if (match) {
        let commentStart = i;
        while (commentStart > 0 && (lines[commentStart - 1].startsWith('//') || lines[commentStart - 1].startsWith('/**') || lines[commentStart - 1].startsWith(' *') || lines[commentStart - 1].trim() === '')) {
          commentStart--;
        }
        current = { name: match[1], startLine: commentStart, endLine: -1 };
        braceDepth = 1;
        continue;
      }
      if (current) {
        for (const ch of lines[i]) {
          if (ch === '{') braceDepth++;
          if (ch === '}') braceDepth--;
        }
        if (braceDepth === 0) {
          current.endLine = i + 1;
          consts.push(current);
          current = null;
        }
      }
    }

    const mid = Math.ceil(consts.length / 2);
    const group1 = consts.slice(0, mid);
    const group2 = consts.slice(mid);

    let body1 = '';
    for (const c of group1) body1 += lines.slice(c.startLine, c.endLine).join('\n') + '\n\n';
    let body2 = '';
    for (const c of group2) body2 += lines.slice(c.startLine, c.endLine).join('\n') + '\n\n';

    writeF(`${dir}/business_corporate.ts`, `/**
 * Faction Templates - Corporate (Railroad, Mining)
 */

${imp}

${body1.trim()}
`);

    writeF(`${dir}/business_trade.ts`, `/**
 * Faction Templates - Trade (Cattle Barons, Merchants)
 */

${imp}

${body2.trim()}
`);

    writeF(`${dir}/business.ts`, `/**
 * Faction Templates - Business
 */

export { railroadCompanyTemplate, miningConsortiumTemplate } from './business_corporate.ts';
export { cattleBaronsTemplate, merchantsGuildTemplate } from './business_trade.ts';
`);
  }

  // factionTemplates/other.ts (393) -> split in half
  {
    const dir = 'src/game/data/generation/templates/factionTemplates';
    const imp = `import type { FactionReactionTemplate } from '../../../schemas/generation.ts';`;
    const src = readF(`${dir}/other.ts`);
    const lines = src.split('\n');

    const consts = [];
    let current = null;
    let braceDepth = 0;
    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(/^export const (\w+): FactionReactionTemplate = \{/);
      if (match) {
        let commentStart = i;
        while (commentStart > 0 && (lines[commentStart - 1].startsWith('//') || lines[commentStart - 1].startsWith('/**') || lines[commentStart - 1].startsWith(' *') || lines[commentStart - 1].trim() === '')) {
          commentStart--;
        }
        current = { name: match[1], startLine: commentStart, endLine: -1 };
        braceDepth = 1;
        continue;
      }
      if (current) {
        for (const ch of lines[i]) {
          if (ch === '{') braceDepth++;
          if (ch === '}') braceDepth--;
        }
        if (braceDepth === 0) {
          current.endLine = i + 1;
          consts.push(current);
          current = null;
        }
      }
    }

    const mid = Math.ceil(consts.length / 2);
    const group1 = consts.slice(0, mid);
    const group2 = consts.slice(mid);

    let body1 = '';
    for (const c of group1) body1 += lines.slice(c.startLine, c.endLine).join('\n') + '\n\n';
    let body2 = '';
    for (const c of group2) body2 += lines.slice(c.startLine, c.endLine).join('\n') + '\n\n';

    writeF(`${dir}/other_independent.ts`, `/**
 * Faction Templates - Independent (Prospectors, Natives)
 */

${imp}

${body1.trim()}
`);

    writeF(`${dir}/other_misc.ts`, `/**
 * Faction Templates - Misc (Drifters, Automatons)
 */

${imp}

${body2.trim()}
`);

    writeF(`${dir}/other.ts`, `/**
 * Faction Templates - Other
 */

export { prospectorsUnionTemplate, nativeTribesTemplate } from './other_independent.ts';
export { driftersTemplate, automatonCollectiveTemplate } from './other_misc.ts';
`);
  }

  // npcTemplates/business.ts (342) -> split in half
  {
    const dir = 'src/game/data/generation/templates/npcTemplates';
    const imp = `import type { NPCTemplate } from '../../../schemas/generation.ts';`;
    const src = readF(`${dir}/business.ts`);
    const lines = src.split('\n');

    const consts = [];
    let current = null;
    let braceDepth = 0;
    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(/^export const (\w+): NPCTemplate = \{/);
      if (match) {
        current = { name: match[1], startLine: i, endLine: -1 };
        braceDepth = 1;
        continue;
      }
      if (current) {
        for (const ch of lines[i]) {
          if (ch === '{') braceDepth++;
          if (ch === '}') braceDepth--;
        }
        if (braceDepth === 0) {
          current.endLine = i + 1;
          consts.push(current);
          current = null;
        }
      }
    }

    const mid = Math.ceil(consts.length / 2);
    const group1 = consts.slice(0, mid);
    const group2 = consts.slice(mid);

    let body1 = '';
    for (const c of group1) body1 += lines.slice(c.startLine, c.endLine).join('\n') + '\n\n';
    let body2 = '';
    for (const c of group2) body2 += lines.slice(c.startLine, c.endLine).join('\n') + '\n\n';

    writeF(`${dir}/business_commerce.ts`, `/**
 * NPC Templates - Commerce (Saloon, Store, Gunsmith, Blacksmith)
 */

${imp}

${body1.trim()}
`);

    writeF(`${dir}/business_services.ts`, `/**
 * NPC Templates - Services (Doctor, Undertaker, Hotel, Stable)
 */

${imp}

${body2.trim()}
`);

    writeF(`${dir}/business.ts`, `/**
 * NPC Templates - Business Owners
 */

export { SaloonKeeperTemplate, GeneralStoreOwnerTemplate, GunsmithTemplate, BlacksmithTemplate } from './business_commerce.ts';
export { DoctorTemplate, UndertakerTemplate, HotelOwnerTemplate, StableMasterTemplate } from './business_services.ts';
`);
  }

  // scheduleTemplates/other.ts (331) -> split in half
  {
    const dir = 'src/game/data/generation/templates/scheduleTemplates';
    const imp = `import type { ScheduleTemplate } from '../../../schemas/generation.ts';`;
    const src = readF(`${dir}/other.ts`);
    const lines = src.split('\n');

    const consts = [];
    let current = null;
    let braceDepth = 0;
    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(/^export const (\w+): ScheduleTemplate = \{/);
      if (match) {
        let commentStart = i;
        while (commentStart > 0 && (lines[commentStart - 1].startsWith('//') || lines[commentStart - 1].startsWith('/**') || lines[commentStart - 1].startsWith(' *') || lines[commentStart - 1].trim() === '')) {
          commentStart--;
        }
        current = { name: match[1], startLine: commentStart, endLine: -1 };
        braceDepth = 1;
        continue;
      }
      if (current) {
        for (const ch of lines[i]) {
          if (ch === '{') braceDepth++;
          if (ch === '}') braceDepth--;
        }
        if (braceDepth === 0) {
          current.endLine = i + 1;
          consts.push(current);
          current = null;
        }
      }
    }

    const mid = Math.ceil(consts.length / 2);
    const group1 = consts.slice(0, mid);
    const group2 = consts.slice(mid);

    let body1 = '';
    for (const c of group1) body1 += lines.slice(c.startLine, c.endLine).join('\n') + '\n\n';
    let body2 = '';
    for (const c of group2) body2 += lines.slice(c.startLine, c.endLine).join('\n') + '\n\n';

    const names1 = group1.map(c => c.name);
    const names2 = group2.map(c => c.name);

    writeF(`${dir}/other_wanderers.ts`, `/**
 * Schedule Templates - Wanderers (Gambler, Drifter, Prospector, Homesteader, Outlaw)
 */

${imp}

${body1.trim()}
`);

    writeF(`${dir}/other_misc.ts`, `/**
 * Schedule Templates - Misc (Automaton, Hotel Guest, Elderly, Bounty Hunter)
 */

${imp}

${body2.trim()}
`);

    writeF(`${dir}/other.ts`, `/**
 * Schedule Templates - Other
 */

export { ${names1.join(', ')} } from './other_wanderers.ts';
export { ${names2.join(', ')} } from './other_misc.ts';
`);
  }

  // locationTemplates/locations.ts (465) -> split in half
  {
    const dir = 'src/game/data/generation/templates/locationTemplates';
    const imp = `import type { LocationTemplate } from '../../../schemas/generation.ts';`;
    const src = readF(`${dir}/locations.ts`);
    const lines = src.split('\n');

    // Find the array
    const arrayStart = lines.findIndex(l => l.includes('LOCATION_TEMPLATES'));
    const arrayEnd = lines.findIndex((l, i) => i > arrayStart && l === '];');
    const bodyLines = lines.slice(arrayStart + 1, arrayEnd);

    // Find object boundaries
    const objStarts = [];
    for (let i = 0; i < bodyLines.length; i++) {
      if (bodyLines[i].match(/^\s{2}\{$/)) {
        objStarts.push(i);
      }
    }

    const midObj = Math.floor(objStarts.length / 2);
    const splitLine = objStarts[midObj] || Math.floor(bodyLines.length / 2);

    const p1 = bodyLines.slice(0, splitLine).join('\n').replace(/,\s*$/, '');
    const p2 = bodyLines.slice(splitLine).join('\n').replace(/,\s*$/, '');

    writeF(`${dir}/locations_settlements.ts`, `/**
 * Location Templates - Settlements
 */

${imp}

export const SETTLEMENT_LOCATION_TEMPLATES: LocationTemplate[] = [
${p1}
];
`);

    writeF(`${dir}/locations_other.ts`, `/**
 * Location Templates - Other
 */

${imp}

export const OTHER_LOCATION_TEMPLATES: LocationTemplate[] = [
${p2}
];
`);

    writeF(`${dir}/locations.ts`, `/**
 * Location Templates - Settlement compositions
 */

import type { LocationTemplate } from '../../../schemas/generation.ts';
import { SETTLEMENT_LOCATION_TEMPLATES } from './locations_settlements.ts';
import { OTHER_LOCATION_TEMPLATES } from './locations_other.ts';

export const LOCATION_TEMPLATES: LocationTemplate[] = [
  ...SETTLEMENT_LOCATION_TEMPLATES,
  ...OTHER_LOCATION_TEMPLATES,
];
`);
  }

  // dialogueTreeTemplates/role_specific.ts (421) -> split in half
  {
    const dir = 'src/game/data/generation/templates/dialogueTreeTemplates';
    const imp = `import type { DialogueTreeTemplate } from '../../../schemas/generation.ts';`;
    const src = readF(`${dir}/role_specific.ts`);
    const lines = src.split('\n');

    // Find the Record
    const recordStart = lines.findIndex(l => l.includes('ROLE_SPECIFIC_DIALOGUE_TREES'));
    const recordEnd = lines.findIndex(l => l === '};');
    const bodyLines = lines.slice(recordStart + 1, recordEnd);

    // Find key boundaries (lines like `  key_name: {`)
    const keyStarts = [];
    for (let i = 0; i < bodyLines.length; i++) {
      if (bodyLines[i].match(/^\s{2}\w+:\s*\{$/)) {
        keyStarts.push(i);
      }
    }

    const midKey = Math.floor(keyStarts.length / 2);
    const splitLine = keyStarts[midKey] || Math.floor(bodyLines.length / 2);

    const p1 = bodyLines.slice(0, splitLine).join('\n').replace(/,\s*$/, '');
    const p2 = bodyLines.slice(splitLine).join('\n').replace(/,\s*$/, '');

    writeF(`${dir}/role_authority.ts`, `/**
 * Dialogue Trees - Authority (Sheriff, Bartender, Shopkeeper)
 */

${imp}

export const ROLE_AUTHORITY_DIALOGUE_TREES: Record<string, DialogueTreeTemplate> = {
${p1}
};
`);

    writeF(`${dir}/role_trade.ts`, `/**
 * Dialogue Trees - Trade and Service Roles
 */

${imp}

export const ROLE_TRADE_DIALOGUE_TREES: Record<string, DialogueTreeTemplate> = {
${p2}
};
`);

    writeF(`${dir}/role_specific.ts`, `/**
 * Dialogue Tree Templates - Role Specific
 */

import type { DialogueTreeTemplate } from '../../../schemas/generation.ts';
import { ROLE_AUTHORITY_DIALOGUE_TREES } from './role_authority.ts';
import { ROLE_TRADE_DIALOGUE_TREES } from './role_trade.ts';

export const ROLE_SPECIFIC_DIALOGUE_TREES: Record<string, DialogueTreeTemplate> = {
  ...ROLE_AUTHORITY_DIALOGUE_TREES,
  ...ROLE_TRADE_DIALOGUE_TREES,
};
`);
  }

  // rumorsAndLore/rumors_hooks.ts (417) -> split in half
  {
    const dir = 'src/game/data/generation/pools/rumorsAndLore';
    const imp = `import type { RumorTemplate } from '../../../schemas/generation.ts';`;
    const src = readF(`${dir}/rumors_hooks.ts`);
    const lines = src.split('\n');

    const arrayStart = lines.findIndex(l => l.includes('RUMOR_HOOK_TEMPLATES'));
    const arrayEnd = lines.findIndex((l, i) => i > arrayStart && l === '];');
    const bodyLines = lines.slice(arrayStart + 1, arrayEnd);

    const objStarts = [];
    for (let i = 0; i < bodyLines.length; i++) {
      if (bodyLines[i].match(/^\s{2}\{$/)) {
        objStarts.push(i);
      }
    }

    const midObj = Math.floor(objStarts.length / 2);
    const splitLine = objStarts[midObj] || Math.floor(bodyLines.length / 2);

    const p1 = bodyLines.slice(0, splitLine).join('\n').replace(/,\s*$/, '');
    const p2 = bodyLines.slice(splitLine).join('\n').replace(/,\s*$/, '');

    writeF(`${dir}/rumors_quest_hooks.ts`, `/**
 * Rumor Templates - Quest Hooks and Location Hints
 */

${imp}

export const RUMOR_QUEST_HOOK_TEMPLATES: RumorTemplate[] = [
${p1}
];
`);

    writeF(`${dir}/rumors_gossip.ts`, `/**
 * Rumor Templates - NPC Gossip, Faction News
 */

${imp}

export const RUMOR_GOSSIP_TEMPLATES: RumorTemplate[] = [
${p2}
];
`);

    writeF(`${dir}/rumors_hooks.ts`, `/**
 * Rumor Templates - Quest hooks, locations, gossip, factions
 */

import type { RumorTemplate } from '../../../schemas/generation.ts';
import { RUMOR_QUEST_HOOK_TEMPLATES } from './rumors_quest_hooks.ts';
import { RUMOR_GOSSIP_TEMPLATES } from './rumors_gossip.ts';

export const RUMOR_HOOK_TEMPLATES: RumorTemplate[] = [
  ...RUMOR_QUEST_HOOK_TEMPLATES,
  ...RUMOR_GOSSIP_TEMPLATES,
];
`);
  }

  // npcTemplates/other.ts (301) -> just barely over, split
  {
    const dir = 'src/game/data/generation/templates/npcTemplates';
    const imp = `import type { NPCTemplate } from '../../../schemas/generation.ts';`;
    const src = readF(`${dir}/other.ts`);
    const lines = src.split('\n');

    const consts = [];
    let current = null;
    let braceDepth = 0;
    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(/^export const (\w+): NPCTemplate = \{/);
      if (match) {
        current = { name: match[1], startLine: i, endLine: -1 };
        braceDepth = 1;
        continue;
      }
      if (current) {
        for (const ch of lines[i]) {
          if (ch === '{') braceDepth++;
          if (ch === '}') braceDepth--;
        }
        if (braceDepth === 0) {
          current.endLine = i + 1;
          consts.push(current);
          current = null;
        }
      }
    }

    const mid = Math.ceil(consts.length / 2);
    const group1 = consts.slice(0, mid);
    const group2 = consts.slice(mid);

    let body1 = '';
    for (const c of group1) body1 += lines.slice(c.startLine, c.endLine).join('\n') + '\n\n';
    let body2 = '';
    for (const c of group2) body2 += lines.slice(c.startLine, c.endLine).join('\n') + '\n\n';

    writeF(`${dir}/other_wanderers.ts`, `/**
 * NPC Templates - Wanderers (Preacher, Prospector, Bounty Hunter, Drifter)
 */

${imp}

${body1.trim()}
`);

    writeF(`${dir}/other_settlers.ts`, `/**
 * NPC Templates - Settlers (Homesteader, Widow, Widower)
 */

${imp}

${body2.trim()}
`);

    const names1 = group1.map(c => c.name);
    const names2 = group2.map(c => c.name);

    writeF(`${dir}/other.ts`, `/**
 * NPC Templates - Other
 */

export { ${names1.join(', ')} } from './other_wanderers.ts';
export { ${names2.join(', ')} } from './other_settlers.ts';
`);
  }
}

try {
  splitQuestFurther();
  splitDialogueSnippetsFurther();
  splitNamePoolsFurther();
  splitPlaceNamePoolsFurther();
  splitOtherTemplatesFurther();
  console.log('\n=== Pass 2 complete! ===');
} catch (e) {
  console.error('ERROR:', e.message);
  console.error(e.stack);
  process.exit(1);
}
