import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

type VideoRow = {
  video_id: string
  title: string | null
  source_channel_name: string | null
  thumbnail_url: string | null
  youtube_url: string | null
  view_count: number | null
  published_at: string | null
}

type SnapshotRow = {
  video_id: string
  view_count: number
  captured_at: string
}

function getKSTDayStartISOString() {
  const now = new Date()
  const kstMs = now.getTime() + 9 * 60 * 60 * 1000
  const kst = new Date(kstMs)

  const year = kst.getUTCFullYear()
  const month = kst.getUTCMonth()
  const date = kst.getUTCDate()

  return new Date(Date.UTC(year, month, date, -9, 0, 0, 0)).toISOString()
}

function numberOrZero(value: unknown) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function getStatus(lastHourViews: number, spikeRatio: number) {
  if (lastHourViews >= 1000 || spikeRatio >= 1.8) return '급상승'
  if (lastHourViews >= 300 || spikeRatio >= 1.2) return '상승'
  return '보통'
}

export async function GET() {
  try {
    const sevenDaysAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    ).toISOString()

    const { data: videos, error: videosError } = await supabaseAdmin
      .from('videos')
      .select(
        'video_id, title, source_channel_name, thumbnail_url, youtube_url, view_count, published_at'
      )
      .gte('published_at', sevenDaysAgo)
      .order('published_at', { ascending: false })
      .limit(60)

    if (videosError) {
      throw videosError
    }

    const videoRows = (videos || []) as VideoRow[]
    const videoIds = [...new Set(videoRows.map((v) => v.video_id).filter(Boolean))]

    if (videoIds.length === 0) {
      return NextResponse.json({ items: [] })
    }

    const kstDayStart = getKSTDayStartISOString()
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
    const snapshotSince = kstDayStart < twoDaysAgo ? kstDayStart : twoDaysAgo

    const { data: snapshots, error: snapshotsError } = await supabaseAdmin
      .from('video_view_snapshots')
      .select('video_id, view_count, captured_at')
      .in('video_id', videoIds)
      .gte('captured_at', snapshotSince)
      .order('captured_at', { ascending: true })

    if (snapshotsError) {
      throw snapshotsError
    }

    const snapshotMap = new Map<string, SnapshotRow[]>()

    for (const snap of (snapshots || []) as SnapshotRow[]) {
      if (!snapshotMap.has(snap.video_id)) {
        snapshotMap.set(snap.video_id, [])
      }
      snapshotMap.get(snap.video_id)!.push(snap)
    }

    const items = videoRows.map((video) => {
      const snaps = snapshotMap.get(video.video_id) || []
      const latest = snaps[snaps.length - 1]
      const prev = snaps.length >= 2 ? snaps[snaps.length - 2] : null

      const currentViewCount = latest
        ? numberOrZero(latest.view_count)
        : numberOrZero(video.view_count)

      const lastHourViews =
        latest && prev
          ? Math.max(0, numberOrZero(latest.view_count) - numberOrZero(prev.view_count))
          : 0

      const todayBase =
        snaps.find((s) => new Date(s.captured_at).getTime() >= new Date(kstDayStart).getTime()) ||
        snaps[0] ||
        null

      const todayViews =
        latest && todayBase
          ? Math.max(0, numberOrZero(latest.view_count) - numberOrZero(todayBase.view_count))
          : 0

      const observedHours =
        latest && todayBase
          ? Math.max(
              1,
              (new Date(latest.captured_at).getTime() -
                new Date(todayBase.captured_at).getTime()) /
                (1000 * 60 * 60)
            )
          : 1

      const hourlyAvgViews = todayViews / observedHours
      const spikeRatio = lastHourViews / Math.max(hourlyAvgViews, 1)
      const status = getStatus(lastHourViews, spikeRatio)

      return {
        video_id: video.video_id,
        title: video.title || '(제목 없음)',
        source_channel_name: video.source_channel_name || '(채널명 없음)',
        thumbnail_url: video.thumbnail_url,
        youtube_url: video.youtube_url,
        published_at: video.published_at,
        current_view_count: currentViewCount,
        last_hour_views: Math.round(lastHourViews),
        today_views: Math.round(todayViews),
        hourly_avg_views: Math.round(hourlyAvgViews),
        spike_ratio: Number(spikeRatio.toFixed(2)),
        status,
        observed_hours: Math.round(observedHours * 10) / 10,
      }
    })

    items.sort((a, b) => {
      if (b.last_hour_views !== a.last_hour_views) {
        return b.last_hour_views - a.last_hour_views
      }
      if (b.today_views !== a.today_views) {
        return b.today_views - a.today_views
      }
      return b.current_view_count - a.current_view_count
    })

    return NextResponse.json({
      items: items.slice(0, 8),
      meta: {
        day_start_kst: kstDayStart,
        total_candidates: items.length,
      },
    })
  } catch (error) {
    console.error('[surge-videos]', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Unknown server error',
      },
      { status: 500 }
    )
  }
}
