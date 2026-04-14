'use client'

import type { CSSProperties } from 'react'

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

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString('ko-KR') : '-'
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('ko-KR').format(value || 0)
}

export default function VideoTable({ videos }: Props) {
  if (!videos || videos.length === 0) {
    return <div style={emptyStyle}>아직 수집된 영상이 없습니다.</div>
  }

  return (
    <div style={listStyle}>
      {videos.slice(0, 10).map((video) => (
        <article key={video.video_id} style={itemStyle}>
          <div style={thumbWrapStyle}>
            {video.thumbnail_url ? (
              <img src={video.thumbnail_url} alt={video.title} style={thumbStyle} />
            ) : (
              <div style={thumbFallbackStyle}>NO IMAGE</div>
            )}
          </div>

          <div style={contentStyle}>
            <div style={channelStyle}>{video.source_channel_name || '채널명 없음'}</div>
            <h3 style={titleStyle}>{video.title}</h3>

            <div style={metaRowStyle}>
              <span style={metaPillStyle}>조회수 {formatNumber(video.view_count || 0)}</span>
              <span style={metaTextStyle}>{formatDate(video.published_at)}</span>
            </div>
          </div>

          <a href={video.youtube_url} target="_blank" rel="noreferrer" style={openButtonStyle}>
            Open
          </a>
        </article>
      ))}
    </div>
  )
}

const listStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
}

const itemStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '160px minmax(0, 1fr) auto',
  gap: 16,
  alignItems: 'center',
  padding: 16,
  borderRadius: 20,
  background: '#ffffff',
  border: '1px solid #eceef3',
  boxShadow: '0 12px 30px rgba(15, 23, 42, 0.05)',
}

const thumbWrapStyle: CSSProperties = {
  width: '100%',
  height: 94,
  borderRadius: 16,
  overflow: 'hidden',
  background: '#f8fafc',
}

const thumbStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
}

const thumbFallbackStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
  color: '#b91c1c',
  fontWeight: 800,
  fontSize: 12,
  letterSpacing: '0.08em',
}

const contentStyle: CSSProperties = {
  minWidth: 0,
}

const channelStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: '0.12em',
  color: '#ef4444',
  marginBottom: 8,
}

const titleStyle: CSSProperties = {
  margin: 0,
  color: '#0f172a',
  fontSize: 17,
  lineHeight: 1.45,
  fontWeight: 800,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
}

const metaRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  flexWrap: 'wrap',
  marginTop: 12,
}

const metaPillStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '7px 10px',
  borderRadius: 999,
  background: '#fef2f2',
  color: '#dc2626',
  fontSize: 12,
  fontWeight: 800,
}

const metaTextStyle: CSSProperties = {
  fontSize: 12,
  color: '#64748b',
  fontWeight: 600,
}

const openButtonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 78,
  height: 42,
  padding: '0 14px',
  borderRadius: 12,
  background: '#0f172a',
  color: '#ffffff',
  fontSize: 13,
  fontWeight: 800,
  textDecoration: 'none',
  boxShadow: '0 12px 24px rgba(15, 23, 42, 0.12)',
}

const emptyStyle: CSSProperties = {
  padding: 22,
  borderRadius: 18,
  background: '#ffffff',
  border: '1px solid #eceef3',
  boxShadow: '0 12px 30px rgba(15, 23, 42, 0.05)',
  color: '#64748b',
  fontSize: 14,
}