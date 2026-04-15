'use client'

import { useMemo, useState } from 'react'

type RawVideoItem = {
  video_id?: string
  id?: string
  source_channel_name?: string
  channel_name?: string
  title?: string
  youtube_url?: string
  thumbnail_url?: string | null
  view_count?: number
  published_at?: string | null
  collected_at?: string | null
  created_at?: string | null
}

type Props = {
  items: RawVideoItem[]
}

type SortOption = 'latest' | 'views_desc' | 'views_asc'

function formatNumber(value: number) {
  return new Intl.NumberFormat('ko-KR').format(value || 0)
}

function formatDateTime(value?: string | null) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleString('ko-KR', {
    hour12: false,
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function normalizeVideo(item: RawVideoItem) {
  return {
    videoId: item.video_id ?? item.id ?? '',
    channelName: item.source_channel_name ?? item.channel_name ?? '',
    title: item.title ?? '',
    youtubeUrl:
      item.youtube_url ??
      (item.video_id ? `https://www.youtube.com/watch?v=${item.video_id}` : '#'),
    thumbnailUrl: item.thumbnail_url ?? null,
    viewCount: Number(item.view_count ?? 0),
    date:
      item.collected_at ??
      item.created_at ??
      item.published_at ??
      null,
  }
}

export default function RecentCollectedVideosClient({ items }: Props) {
  const [minViews, setMinViews] = useState(0)
  const [sortBy, setSortBy] = useState<SortOption>('latest')

  const normalized = useMemo(() => items.map(normalizeVideo), [items])

  const filtered = useMemo(() => {
    const list = normalized.filter((item) => item.viewCount >= minViews)

    list.sort((a, b) => {
      if (sortBy === 'views_desc') return b.viewCount - a.viewCount
      if (sortBy === 'views_asc') return a.viewCount - b.viewCount

      const aTime = a.date ? new Date(a.date).getTime() : 0
      const bTime = b.date ? new Date(b.date).getTime() : 0
      return bTime - aTime
    })

    return list
  }, [normalized, minViews, sortBy])

  return (
    <div
      style={{
        background: '#111827',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20,
        padding: 20,
        color: '#fff',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          marginBottom: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 12, color: '#93c5fd', marginBottom: 6 }}>
            RECENT VIDEOS
          </div>
          <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>
            최근 수집 영상
          </h3>
          <p style={{ margin: '6px 0 0', color: '#9ca3af', fontSize: 13 }}>
            조회수 기준 필터와 정렬을 적용해 볼 수 있습니다.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <select
            value={minViews}
            onChange={(e) => setMinViews(Number(e.target.value))}
            style={{
              background: '#1f2937',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 10,
              padding: '10px 12px',
            }}
          >
            <option value={0}>전체 조회수</option>
            <option value={100}>100+</option>
            <option value={1000}>1,000+</option>
            <option value={10000}>10,000+</option>
            <option value={100000}>100,000+</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            style={{
              background: '#1f2937',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 10,
              padding: '10px 12px',
            }}
          >
            <option value="latest">최신순</option>
            <option value="views_desc">조회수 높은순</option>
            <option value="views_asc">조회수 낮은순</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {filtered.length === 0 ? (
          <div style={{ color: '#9ca3af', padding: '24px 0' }}>
            조건에 맞는 영상이 없습니다.
          </div>
        ) : (
          filtered.map((item, index) => (
            <a
              key={item.videoId || `${item.title}-${index}`}
              href={item.youtubeUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr auto',
                gap: 14,
                alignItems: 'center',
                textDecoration: 'none',
                color: 'inherit',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 14,
                padding: 12,
              }}
            >
              <div
                style={{
                  width: 120,
                  height: 68,
                  borderRadius: 10,
                  overflow: 'hidden',
                  background: '#1f2937',
                }}
              >
                {item.thumbnailUrl ? (
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : null}
              </div>

              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    color: '#93c5fd',
                    fontSize: 12,
                    fontWeight: 700,
                    marginBottom: 4,
                  }}
                >
                  {item.channelName}
                </div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    lineHeight: 1.45,
                    marginBottom: 6,
                  }}
                >
                  {item.title}
                </div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>
                  수집 시각: {formatDateTime(item.date)}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>
                  조회수
                </div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>
                  {formatNumber(item.viewCount)}
                </div>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  )
}
