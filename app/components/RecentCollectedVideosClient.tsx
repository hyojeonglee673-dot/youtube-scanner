'use client'

import { useEffect, useMemo, useState } from 'react'

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

const PAGE_SIZE = 10

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
    date: item.collected_at ?? item.created_at ?? item.published_at ?? null,
  }
}

export default function RecentCollectedVideosClient({ items }: Props) {
  const [minViews, setMinViews] = useState(0)
  const [sortBy, setSortBy] = useState<SortOption>('latest')
  const [page, setPage] = useState(1)

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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  useEffect(() => {
    setPage(1)
  }, [minViews, sortBy, items])

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const pagedItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, page])

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e9edf5',
        borderRadius: 20,
        padding: 20,
        boxShadow: '0 12px 30px rgba(15, 23, 42, 0.05)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: 12,
          flexWrap: 'wrap',
          marginBottom: 16,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '0.14em',
              color: '#94a3b8',
              marginBottom: 8,
            }}
          >
            LATEST VIDEOS
          </div>
          <h3
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 800,
              color: '#0f172a',
            }}
          >
            최근 수집 영상
          </h3>
          <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: 13 }}>
            게시판 형식으로 최근 수집 영상을 확인합니다. 한 페이지에 10개씩 표시됩니다.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <select
            value={minViews}
            onChange={(e) => setMinViews(Number(e.target.value))}
            style={{
              background: '#fff',
              color: '#0f172a',
              border: '1px solid #dbe3ee',
              borderRadius: 10,
              padding: '10px 12px',
              fontSize: 13,
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
              background: '#fff',
              color: '#0f172a',
              border: '1px solid #dbe3ee',
              borderRadius: 10,
              padding: '10px 12px',
              fontSize: 13,
            }}
          >
            <option value="latest">최신순</option>
            <option value="views_desc">조회수 높은순</option>
            <option value="views_asc">조회수 낮은순</option>
          </select>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            fontSize: 13,
            color: '#64748b',
            fontWeight: 600,
          }}
        >
          전체 {filtered.length}개 중 {(page - 1) * PAGE_SIZE + 1}-
          {Math.min(page * PAGE_SIZE, filtered.length)}개 표시
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
            style={{
              border: '1px solid #dbe3ee',
              background: page === 1 ? '#f8fafc' : '#ffffff',
              color: page === 1 ? '#94a3b8' : '#0f172a',
              borderRadius: 10,
              padding: '8px 12px',
              cursor: page === 1 ? 'default' : 'pointer',
              fontWeight: 700,
            }}
          >
            이전
          </button>

          <div style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
            {page} / {totalPages}
          </div>

          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages}
            style={{
              border: '1px solid #dbe3ee',
              background: page === totalPages ? '#f8fafc' : '#ffffff',
              color: page === totalPages ? '#94a3b8' : '#0f172a',
              borderRadius: 10,
              padding: '8px 12px',
              cursor: page === totalPages ? 'default' : 'pointer',
              fontWeight: 700,
            }}
          >
            다음
          </button>
        </div>
      </div>

      <div
        style={{
          overflowX: 'auto',
          border: '1px solid #edf1f7',
          borderRadius: 16,
          background: '#fff',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: 860,
          }}
        >
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={thStyle}>번호</th>
              <th style={thStyle}>채널명</th>
              <th style={thStyle}>제목</th>
              <th style={thStyle}>조회수</th>
              <th style={thStyle}>수집 시각</th>
              <th style={thStyle}>링크</th>
            </tr>
          </thead>

          <tbody>
            {pagedItems.length === 0 ? (
              <tr>
                <td colSpan={6} style={emptyCellStyle}>
                  조건에 맞는 영상이 없습니다.
                </td>
              </tr>
            ) : (
              pagedItems.map((item, index) => (
                <tr key={item.videoId || `${item.title}-${index}`} style={rowStyle}>
                  <td style={tdStyle}>{(page - 1) * PAGE_SIZE + index + 1}</td>
                  <td style={tdStyle}>
                    <div
                      style={{
                        maxWidth: 180,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontWeight: 700,
                        color: '#334155',
                      }}
                      title={item.channelName}
                    >
                      {item.channelName || '-'}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div
                      style={{
                        maxWidth: 380,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: '#0f172a',
                        fontWeight: 600,
                      }}
                      title={item.title}
                    >
                      {item.title || '-'}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '6px 10px',
                        borderRadius: 999,
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        fontWeight: 800,
                        fontSize: 13,
                      }}
                    >
                      {formatNumber(item.viewCount)}
                    </span>
                  </td>
                  <td style={tdStyle}>{formatDateTime(item.date)}</td>
                  <td style={tdStyle}>
                    <a
                      href={item.youtubeUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '8px 12px',
                        borderRadius: 10,
                        background: '#0f172a',
                        color: '#fff',
                        textDecoration: 'none',
                        fontWeight: 700,
                        fontSize: 13,
                      }}
                    >
                      열기
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '14px 16px',
  fontSize: 12,
  fontWeight: 800,
  color: '#64748b',
  borderBottom: '1px solid #edf1f7',
  whiteSpace: 'nowrap',
}

const tdStyle: React.CSSProperties = {
  padding: '14px 16px',
  fontSize: 14,
  color: '#334155',
  borderBottom: '1px solid #f1f5f9',
  verticalAlign: 'middle',
}

const rowStyle: React.CSSProperties = {
  background: '#ffffff',
}

const emptyCellStyle: React.CSSProperties = {
  padding: '32px 16px',
  textAlign: 'center',
  color: '#94a3b8',
  fontSize: 14,
}
