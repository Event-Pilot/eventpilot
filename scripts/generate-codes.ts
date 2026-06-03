#!/usr/bin/env -S npx tsx
// ---------------------------------------------------------------------------
// EventPilot v0.1 — Redeem code generator
//
// Usage:
//   pnpm generate-sqlite-codes                    # generate 10 codes
//   pnpm generate-sqlite-codes --count 20         # generate 20 codes
//   pnpm generate-sqlite-codes --count 100 --output codes.txt  # write to file
//
// Code format: EP-XXXX-XXXX
// Character set excludes ambiguous chars: 0, O, 1, I, L
// Uses crypto.randomBytes for secure randomness.
// ---------------------------------------------------------------------------

import { randomBytes } from 'node:crypto'
import { writeFileSync } from 'node:fs'
import { createRedeemCodes } from '../db/redeem-codes'

// ---------------------------------------------------------------------------
// Character set — 28 unambiguous uppercase chars
// ---------------------------------------------------------------------------

const CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789' // no 0 O 1 I L

function generateCode(): string {
  const bytes = randomBytes(8)
  const chars: string[] = []

  for (let i = 0; i < 8; i++) {
    chars.push(CHARSET[bytes[i] % CHARSET.length])
  }

  // Insert the dash: EP-XXXX-XXXX
  return `EP-${chars.slice(0, 4).join('')}-${chars.slice(4, 8).join('')}`
}

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------

function parseArgs(): { count: number; outputFile: string | null } {
  const args = process.argv.slice(2)
  let count = 10
  let outputFile: string | null = null

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--count' && args[i + 1]) {
      const n = parseInt(args[i + 1], 10)
      if (!isNaN(n) && n > 0) {
        count = Math.min(n, 10_000) // hard cap
      }
      i++
    } else if (args[i] === '--output' && args[i + 1]) {
      outputFile = args[i + 1]
      i++
    }
  }

  return { count, outputFile }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const { count, outputFile } = parseArgs()

  console.log(`正在生成 ${count} 个兑换码…`)

  // Generate unique codes
  const codes: string[] = []
  const seen = new Set<string>()

  while (codes.length < count) {
    const code = generateCode()
    if (!seen.has(code)) {
      seen.add(code)
      codes.push(code)
    }
  }

  // Insert into database
  const inserted = await createRedeemCodes(codes)
  console.log(`✓ 已写入数据库：${inserted} 个`)

  if (inserted < codes.length) {
    console.log(
      `⚠ ${codes.length - inserted} 个兑换码因重复未写入（已跳过）`,
    )
  }

  // Output to stdout
  console.log('')
  for (const code of codes) {
    console.log(code)
  }

  // Write to file if requested
  if (outputFile) {
    writeFileSync(outputFile, codes.join('\n') + '\n', 'utf-8')
    console.log(`\n✓ 已写入文件：${outputFile}`)
  }

  console.log(`\n生成完成。可使用这些兑换码通过 POST /api/tasks/:id/redeem 解锁任务。`)
}

main().catch((e) => {
  console.error('生成兑换码失败：', e)
  process.exit(1)
})
