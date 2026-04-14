import { scanAllChannels } from '../../../../lib/scanner'
import { NextRequest, NextResponse } from 'next/server'

function isAuthorized(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const expected = `Bearer ${process.env.CRON_SECRET}`
  return authHeader === expected
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await scanAllChannels()

    return NextResponse.json({
      ok: true,
      result,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '크론 스캔 실패',
      },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await scanAllChannels()

    return NextResponse.json({
      ok: true,
      result,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '크론 스캔 실패',
      },
      { status: 500 }
    )
  }
}