import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase-admin'

export const dynamic = 'force-dynamic'

type YoutubeVideoStatsResponse = {
  items?: Array<{
    id: string
    statistics?: {
      viewCount?: string
    }
  }>
}

function chunk<T>(arr: T[], size: number) {
  const result: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
}

function getCapturedHourISOString() {
  const d = new Date()
  d.setMinutes(0, 0, 0)
  return d.toISOString()
}

function isAuthorized(request: Request) {
  const expectedSecret = process.env.CRON_SECRET

  if (!expectedSecret) {
    return true
  }

  const url = new URL(request.url)
  const secretFromQuery = url.searchParams.get('secret')
  const authHeader = request.headers.get('authorization')

  return (
    secretFromQuery === expectedSecret ||
    authHeader === `Bearer ${expectedSecret}`
  )
}

async function runHourlySnapshots() {
  try {
    const youtubeApiKey = process.env.YOUTUBE_API_KEY

    if (!youtubeApiKey) {
      return NextResponse.json(
        { error: 'Missing YOUTUBE_API_KEY' },
        { status: 500 }
      )
    }

    const sevenDaysAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    ).toISOString()

    const { data: recentVideos, error: videosError } = await supabaseAdmin
      .from('videos')
      .select('video_id, published_at')
      .not('video_id', 'is', null)
      .gte('published_at', sevenDaysAgo)
      .order('published_at', { ascending: false })
      .limit(50)

    if (videosError) {
      throw videosError
    }

    const videoIds = [
      ...new Set(
        (recentVideos || [])
          .map((video) => video.video_id)
          .filter(Boolean)
      ),
    ] as string[]

    if (videoIds.length === 0) {
      return NextResponse.json({
        ok: true,
        inserted: 0,
        reason: 'No recent videos found',
      })
    }

    const capturedHour = getCapturedHourISOString()
    const rows: Array<{
      video_id: string
      view_count: number
      captured_at: string
      captured_hour: string
    }> = []

    for (const ids of chunk(videoIds, 50)) {
      const youtubeUrl = new URL('https://www.googleapis.com/youtube/v3/videos')
      youtubeUrl.searchParams.set('part', 'statistics')
      youtubeUrl.searchParams.set('id', ids.join(','))
      youtubeUrl.searchParams.set('key', youtubeApiKey)

      const res = await fetch(youtubeUrl.toString(), {
        cache: 'no-store',
      })

      const json = (await res.json()) as YoutubeVideoStatsResponse & {
        error?: { message?: string }
      }

      if (!res.ok) {
        throw new Error(json?.error?.message || 'YouTube API request failed')
      }

      for (const item of json.items || []) {
        rows.push({
          video_id: item.id,
          view_count: Number(item.statistics?.viewCount || 0),
          captured_at: new Date().toISOString(),
          captured_hour: capturedHour,
        })
      }
    }

    if (rows.length === 0) {
      return NextResponse.json({
        ok: true,
        inserted: 0,
        reason: 'No rows to insert',
      })
    }

    const { error: upsertError } = await supabaseAdmin
      .from('video_view_snapshots')
      .upsert(rows, {
        onConflict: 'video_id,captured_hour',
      })

    if (upsertError) {
      throw upsertError
    }

    return NextResponse.json({
      ok: true,
      inserted: rows.length,
      capturedHour,
      trackedVideos: videoIds.length,
    })
  } catch (error) {
    console.error('[hourly-video-snapshots]', error)

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Unknown server error',
      },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return runHourlySnapshots()
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return runHourlySnapshots()
}
