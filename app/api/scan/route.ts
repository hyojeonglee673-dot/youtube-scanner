import { scanAllChannels } from '@/lib/scanner'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const result = await scanAllChannels()

    return NextResponse.json({
      ok: true,
      result,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '전체 스캔 실패',
      },
      { status: 500 }
    )
  }
}