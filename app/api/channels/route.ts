import { registerChannel } from '@/lib/scanner'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const input = body?.input?.trim()

    if (!input) {
      return NextResponse.json(
        { error: '채널 URL, @핸들, 채널 ID를 입력하세요.' },
        { status: 400 }
      )
    }

    const channel = await registerChannel(input)

    return NextResponse.json({
      ok: true,
      channel,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '채널 등록 실패',
      },
      { status: 500 }
    )
  }
}