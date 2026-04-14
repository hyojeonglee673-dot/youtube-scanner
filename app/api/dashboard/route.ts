import { getDashboardData } from '../../../lib/scanner'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const data = await getDashboardData()

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '대시보드 데이터 조회 실패',
      },
      { status: 500 }
    )
  }
}
