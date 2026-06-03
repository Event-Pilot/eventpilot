#!/usr/bin/env -S npx tsx
// ---------------------------------------------------------------------------
// EventPilot — PostgreSQL redeem code generator
//
// Usage:
//   pnpm generate-codes
//   pnpm generate-codes --count 20
//   pnpm generate-codes --count 100 --output codes.txt
//
// Connection:
//   DATABASE_URL=postgres://eventpilot:eventpilot@localhost:5432/eventpilot
//   or SPRING_DATASOURCE_URL + SPRING_DATASOURCE_USERNAME/PASSWORD
// ---------------------------------------------------------------------------

import { randomBytes } from 'node:crypto'
import { writeFileSync } from 'node:fs'
import pg from 'pg'

const { Client } = pg

const CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

function generateCode(): string {
  const bytes = randomBytes(8)
  const chars: string[] = []

  for (let i = 0; i < 8; i++) {
    chars.push(CHARSET[bytes[i] % CHARSET.length])
  }

  return `EP-${chars.slice(0, 4).join('')}-${chars.slice(4, 8).join('')}`
}

function parseArgs(): { count: number; outputFile: string | null } {
  const args = process.argv.slice(2)
  let count = 10
  let outputFile: string | null = null

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--count' && args[i + 1]) {
      const n = parseInt(args[i + 1], 10)
      if (!Number.isNaN(n) && n > 0) {
        count = Math.min(n, 10_000)
      }
      i++
    } else if (args[i] === '--output' && args[i + 1]) {
      outputFile = args[i + 1]
      i++
    }
  }

  return { count, outputFile }
}

function connectionConfig() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (connectionString) {
    return { connectionString }
  }

  const jdbcUrl =
    process.env.SPRING_DATASOURCE_URL ||
    'jdbc:postgresql://localhost:5432/eventpilot'
  const match = jdbcUrl.match(/^jdbc:postgresql:\/\/([^:/]+)(?::(\d+))?\/([^?]+)/)

  return {
    host: match?.[1] || 'localhost',
    port: Number(match?.[2] || 5432),
    database: match?.[3] || 'eventpilot',
    user: process.env.SPRING_DATASOURCE_USERNAME || 'eventpilot',
    password: process.env.SPRING_DATASOURCE_PASSWORD || 'eventpilot',
  }
}

async function insertCodes(codes: string[]): Promise<number> {
  const client = new Client(connectionConfig())
  await client.connect()

  try {
    let inserted = 0

    for (const code of codes) {
      const result = await client.query(
        `INSERT INTO redeem_codes (code, created_at)
         VALUES ($1, now())
         ON CONFLICT (code) DO NOTHING
         RETURNING code`,
        [code],
      )

      inserted += result.rowCount ?? 0
    }

    return inserted
  } finally {
    await client.end()
  }
}

async function main() {
  const { count, outputFile } = parseArgs()

  console.log(`正在生成 ${count} 个兑换码...`)

  const codes: string[] = []
  const seen = new Set<string>()

  while (codes.length < count) {
    const code = generateCode()
    if (!seen.has(code)) {
      seen.add(code)
      codes.push(code)
    }
  }

  const inserted = await insertCodes(codes)
  console.log(`已写入 PostgreSQL：${inserted} 个`)

  if (inserted < codes.length) {
    console.log(`${codes.length - inserted} 个兑换码因重复未写入（已跳过）`)
  }

  console.log('')
  for (const code of codes) {
    console.log(code)
  }

  if (outputFile) {
    writeFileSync(outputFile, codes.join('\n') + '\n', 'utf-8')
    console.log(`\n已写入文件：${outputFile}`)
  }

  console.log('\n生成完成。可使用这些兑换码通过 POST /api/tasks/:id/redeem 解锁任务。')
}

main().catch((error) => {
  console.error('生成兑换码失败：', error)
  process.exit(1)
})
