import { scanAllChannels } from '../../../../lib/scanner'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const result = await scanAllChannels()
    return NextResponse.json({ ok: true, result })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : '크론 스캔 실패' },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
    const result = await scanAllChannels()
    return NextResponse.json({ ok: true, result })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : '크론 스캔 실패' },
      { status: 500 }
    )
  }
}
git add .
git commit -m "temporarily disable cron auth for testing"
git push
