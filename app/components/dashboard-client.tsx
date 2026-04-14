'use client'

import { useCallback, useEffect, useState } from 'react'
import ScannerControls from './scanner-controls'
import VideoTable from './video-table'

type ChannelItem = {
  channel_id: string
  channel_name: string
  channel_url: string
  last_scanned_at: string | null
}

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

export default function DashboardClient() {
  const [channels, setChannels] = useState<ChannelItem[]>([])
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refreshDashboard = useCallback(async () => {
    try {
      setError('')

      const res = await fetch(`/api/dashboard?t=${Date.now()}`, {
        cache: 'no-store',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || '대시보드 데이터를 불러오지 못했습니다.')
      }

      setChannels(data.channels || [])
      setVideos(data.videos || [])
    } catch (error) {
      setError(error instanceof Error ? error.message : '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshDashboard()
  }, [refreshDashboard])

  return (
    <main
      style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '32px 20px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>유튜브 채널 스캐너</h1>
      <p style={{ color: '#4b5563', marginBottom: 24 }}>
        등록한 채널의 최신 영상 데이터를 저장하고 필터로 추려보는 버전입니다.
      </p>

      <ScannerControls onDone={refreshDashboard} />

      <section style={{ marginBottom: 36 }}>
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
          <h2 style={{ fontSize: 24, margin: 0 }}>등록된 채널</h2>

          <button
            type="button"
            onClick={refreshDashboard}
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid #111827',
              background: 'white',
              color: '#111827',
              cursor: 'pointer',
            }}
          >
            목록 새로고침
          </button>
        </div>

        {error ? (
          <div
            style={{
              marginBottom: 12,
              padding: 12,
              borderRadius: 8,
              background: '#fef2f2',
              color: '#991b1b',
              border: '1px solid #fecaca',
            }}
          >
            {error}
          </div>
        ) : null}

        <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: 12 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f9fafb' }}>
              <tr>
                <th style={thStyle}>채널명</th>
                <th style={thStyle}>채널 ID</th>
                <th style={thStyle}>마지막 스캔</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} style={emptyCellStyle}>
                    불러오는 중...
                  </td>
                </tr>
              ) : channels.length === 0 ? (
                <tr>
                  <td colSpan={3} style={emptyCellStyle}>
                    아직 등록된 채널이 없습니다.
                  </td>
                </tr>
              ) : (
                channels.map((channel) => (
                  <tr key={channel.channel_id}>
                    <td style={tdStyle}>
                      <a href={channel.channel_url} target="_blank" rel="noreferrer">
                        {channel.channel_name || '(이름 없음)'}
                      </a>
                    </td>
                    <td style={tdStyle}>{channel.channel_id}</td>
                    <td style={tdStyle}>{formatDate(channel.last_scanned_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <VideoTable videos={videos} />
    </main>
  )
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
