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

function formatDate(value: string | null) {
  if (!value) return '-'
  return new Date(value).toLocaleString('ko-KR')
}

function formatViews(value: number) {
  return new Intl.NumberFormat('ko-KR').format(value || 0)
}

export default function VideoTable({ videos }: { videos: VideoItem[] }) {
  if (!videos || videos.length === 0) {
    return (
      <div style={emptyWrapStyle}>
        <div style={emptyTitleStyle}>아직 수집된 영상이 없습니다</div>
        <p style={emptyTextStyle}>
          채널을 등록하고 스캔을 실행하면 최신 영상이 여기에 표시됩니다.
        </p>
      </div>
    )
  }

  return (
    <div style={wrapStyle}>
      <div style={tableHeaderStyle}>
        <div>
          <div style={eyebrowStyle}>VIDEO MONITORING</div>
          <h3 style={titleStyle}>최근 수집 영상 목록</h3>
        </div>

        <div style={countBadgeStyle}>{videos.length}개 영상</div>
      </div>

      <div style={tableWrapStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>영상</th>
              <th style={thStyle}>채널</th>
              <th style={thStyle}>조회수</th>
              <th style={thStyle}>게시일</th>
              <th style={thStyle}>바로가기</th>
            </tr>
          </thead>

          <tbody>
            {videos.map((video) => (
              <tr key={video.video_id} style={rowStyle}>
                <td style={tdStyle}>
                  <div style={videoCellStyle}>
                    <div style={thumbWrapStyle}>
                      {video.thumbnail_url ? (
                        <img
                          src={video.thumbnail_url}
                          alt={video.title}
                          style={thumbStyle}
                        />
                      ) : (
                        <div style={thumbPlaceholderStyle}>No Image</div>
                      )}
                    </div>

                    <div style={videoMetaStyle}>
                      <div style={videoTitleStyle}>{video.title}</div>
                      <div style={videoIdStyle}>{video.video_id}</div>
                    </div>
                  </div>
                </td>

                <td style={tdStyle}>
                  <span style={channelBadgeStyle}>
                    {video.source_channel_name || '채널명 없음'}
                  </span>
                </td>

                <td style={tdStyle}>
                  <strong style={viewsStyle}>{formatViews(video.view_count)}</strong>
                </td>

                <td style={tdStyle}>
                  <span style={dateStyle}>{formatDate(video.published_at)}</span>
                </td>

                <td style={tdStyle}>
                  <a
                    href={video.youtube_url}
                    target="_blank"
                    rel="noreferrer"
                    style={linkButtonStyle}
                  >
                    열기
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const wrapStyle: CSSProperties = {
  background: '#ffffff',
  border: '1px solid #ececec',
  borderRadius: 24,
  padding: 22,
  boxShadow: '0 8px 24px rgba(15,23,42,0.04)',
}

const tableHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 12,
  flexWrap: 'wrap',
  marginBottom: 18,
}

const eyebrowStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: '0.12em',
  color: '#9ca3af',
  marginBottom: 8,
}

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: 22,
  fontWeight: 800,
  color: '#111827',
}

const countBadgeStyle: CSSProperties = {
  background: '#f3f4f6',
  color: '#111827',
  borderRadius: 999,
  padding: '8px 12px',
  fontSize: 12,
  fontWeight: 700,
}

const tableWrapStyle: CSSProperties = {
  overflowX: 'auto',
}

const tableStyle: CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
}

const thStyle: CSSProperties = {
  textAlign: 'left',
  padding: '14px 12px',
  borderBottom: '1px solid #e5e7eb',
  background: '#fafafa',
  color: '#6b7280',
  fontSize: 13,
  whiteSpace: 'nowrap',
}

const tdStyle: CSSProperties = {
  padding: '16px 12px',
  borderBottom: '1px solid #f1f5f9',
  verticalAlign: 'top',
  fontSize: 14,
}

const rowStyle: CSSProperties = {
  background: '#ffffff',
}

const videoCellStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 14,
  minWidth: 320,
}

const thumbWrapStyle: CSSProperties = {
  width: 120,
  height: 68,
  borderRadius: 12,
  overflow: 'hidden',
  background: '#f3f4f6',
  flexShrink: 0,
  border: '1px solid #ececec',
}

const thumbStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
}

const thumbPlaceholderStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 12,
  color: '#9ca3af',
  background: '#f9fafb',
}

const videoMetaStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  minWidth: 0,
}

const videoTitleStyle: CSSProperties = {
  fontWeight: 700,
  color: '#111827',
  lineHeight: 1.45,
  wordBreak: 'break-word',
}

const videoIdStyle: CSSProperties = {
  fontSize: 12,
  color: '#9ca3af',
  wordBreak: 'break-all',
}

const channelBadgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '6px 10px',
  borderRadius: 999,
  background: '#fef2f2',
  color: '#b91c1c',
  fontSize: 12,
  fontWeight: 700,
}

const viewsStyle: CSSProperties = {
  color: '#111827',
  fontSize: 15,
}

const dateStyle: CSSProperties = {
  color: '#4b5563',
  lineHeight: 1.5,
}

const linkButtonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '10px 14px',
  borderRadius: 12,
  background: '#111827',
  color: '#ffffff',
  textDecoration: 'none',
  fontSize: 13,
  fontWeight: 700,
  whiteSpace: 'nowrap',
}

const emptyWrapStyle: CSSProperties = {
  background: '#ffffff',
  border: '1px solid #ececec',
  borderRadius: 24,
  padding: 32,
  boxShadow: '0 8px 24px rgba(15,23,42,0.04)',
  textAlign: 'center',
}

const emptyTitleStyle: CSSProperties = {
  fontSize: 18,
  fontWeight: 800,
  color: '#111827',
  marginBottom: 10,
}

const emptyTextStyle: CSSProperties = {
  margin: 0,
  color: '#6b7280',
  lineHeight: 1.6,
}
