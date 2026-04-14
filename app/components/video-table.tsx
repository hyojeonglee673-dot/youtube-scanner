'use client'

import { useMemo, useState } from 'react'

type VideoItem = {
  video_id: string
  source_channel_name: string
  title: string
  youtube_url: string
  thumbnail_url: string | null
  view_count: number
  published_at: string | null
}

type Props = {
  videos: VideoItem[]
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('ko-KR').format(value)
}

function formatDate(value: string | null) {
  if (!value) return '-'
  return new Date(value).toLocaleString('ko-KR')
}

function getViewsPerHour(viewCount: number, publishedAt: string | null) {
  if (!publishedAt) return 0

  const hours = Math.max(
    (Date.now() - new Date(publishedAt).getTime()) / (1000 * 60 * 60),
    1
  )

  return Math.round(viewCount / hours)
}

export default function VideoTable({ videos }: Props) {
  const [lookbackHours, setLookbackHours] = useState('48')
  const [minViews, setMinViews] = useState('1000')
  const [sortBy, setSortBy] = useState('viewsPerHour')

  const filteredVideos = useMemo(() => {
    let result = [...videos]

    if (lookbackHours !== 'all') {
      const cutoff = Date.now() - Number(lookbackHours) * 60 * 60 * 1000
      result = result.filter((video) => {
        if (!video.published_at) return false
        return new Date(video.published_at).getTime() >= cutoff
      })
    }

    const minViewsNumber = Number(minViews || 0)
    result = result.filter((video) => Number(video.view_count || 0) >= minViewsNumber)

    result.sort((a, b) => {
      if (sortBy === 'views') {
        return Number(b.view_count || 0) - Number(a.view_count || 0)
      }

      const aVph = getViewsPerHour(Number(a.view_count || 0), a.published_at)
      const bVph = getViewsPerHour(Number(b.view_count || 0), b.published_at)
      return bVph - aVph
    })

    return result
  }, [videos, lookbackHours, minViews, sortBy])

  return (
    <section>
      <h2 style={{ fontSize: 24, marginBottom: 12 }}>필터된 인기 영상</h2>

      <div
        style={{
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          marginBottom: 16,
          padding: 16,
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          background: '#fafafa',
        }}
      >
        <div>
          <label style={labelStyle}>업로드 기준</label>
          <select
            value={lookbackHours}
            onChange={(e) => setLookbackHours(e.target.value)}
            style={inputStyle}
          >
            <option value="all">전체</option>
            <option value="24">최근 24시간</option>
            <option value="48">최근 48시간</option>
            <option value="168">최근 7일</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>최소 조회수</label>
          <input
            type="number"
            value={minViews}
            onChange={(e) => setMinViews(e.target.value)}
            placeholder="예: 1000"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>정렬</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={inputStyle}
          >
            <option value="viewsPerHour">시간당 조회수순</option>
            <option value="views">총 조회수순</option>
          </select>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'end',
            fontSize: 14,
            color: '#374151',
            paddingBottom: 10,
          }}
        >
          결과 {formatNumber(filteredVideos.length)}개
        </div>
      </div>

      <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: 12 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f9fafb' }}>
            <tr>
              <th style={thStyle}>썸네일</th>
              <th style={thStyle}>제목</th>
              <th style={thStyle}>채널</th>
              <th style={thStyle}>조회수</th>
              <th style={thStyle}>시간당 조회수</th>
              <th style={thStyle}>업로드 시간</th>
            </tr>
          </thead>
          <tbody>
            {filteredVideos.length === 0 ? (
              <tr>
                <td colSpan={6} style={emptyCellStyle}>
                  조건에 맞는 영상이 없습니다.
                </td>
              </tr>
            ) : (
              filteredVideos.map((video) => (
                <tr key={video.video_id}>
                  <td style={tdStyle}>
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        width={120}
                        style={{ borderRadius: 8, height: 'auto' }}
                      />
                    ) : (
                      '-'
                    )}
                  </td>
                  <td style={tdStyle}>
                    <a href={video.youtube_url} target="_blank" rel="noreferrer">
                      {video.title}
                    </a>
                  </td>
                  <td style={tdStyle}>{video.source_channel_name}</td>
                  <td style={tdStyle}>{formatNumber(Number(video.view_count || 0))}</td>
                  <td style={tdStyle}>
                    {formatNumber(
                      getViewsPerHour(
                        Number(video.view_count || 0),
                        video.published_at
                      )
                    )}
                  </td>
                  <td style={tdStyle}>{formatDate(video.published_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: 6,
  fontSize: 13,
  color: '#374151',
}

const inputStyle: React.CSSProperties = {
  padding: '10px 12px',
  border: '1px solid #d1d5db',
  borderRadius: 8,
  minWidth: 160,
  fontSize: 14,
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: 12,
  borderBottom: '1px solid #e5e7eb',
  fontSize: 14,
}

const tdStyle: React.CSSProperties = {
  padding: 12,
  borderBottom: '1px solid #f1f5f9',
  verticalAlign: 'top',
  fontSize: 14,
}

const emptyCellStyle: React.CSSProperties = {
  padding: 20,
  textAlign: 'center',
  color: '#6b7280',
}
