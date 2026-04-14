'use client'

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react'
import ScannerControls from './scanner-controls'
import Sidebar from './sidebar'
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

function getLatestScan(channels: ChannelItem[]) {
  const times = channels
    .map((c) => c.last_scanned_at)
    .filter(Boolean)
    .map((v) => new Date(v as string).getTime())
    .filter((v) => !Number.isNaN(v))

  if (times.length === 0) return '-'
  return new Date(Math.max(...times)).toLocaleString('ko-KR')
}

function StatCard({
  label,
  value,
  helper,
}: {
  label: string
  value: string
  helper: string
}) {
  return (
    <div style={statCardStyle}>
      <div style={statLabelStyle}>{label}</div>
      <div style={statValueStyle}>{value}</div>
      <div style={statHelperStyle}>{helper}</div>
    </div>
  )
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={statusRowStyle}>
      <span style={mutedStyle}>{label}</span>
      <strong>{value}</strong>
    </div>
  )
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
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshDashboard()
  }, [refreshDashboard])

  const stats = useMemo(() => {
    const scannedChannels = channels.filter((c) => c.last_scanned_at).length

    return {
      totalChannels: channels.length,
      scannedChannels,
      totalVideos: videos.length,
      latestScan: getLatestScan(channels),
    }
  }, [channels, videos])

  return (
    <div style={shellStyle}>
      <Sidebar />

      <main style={pageStyle}>
        <section style={heroStyle}>
          <div>
            <div style={eyebrowStyle}>OVERVIEW DASHBOARD</div>
            <h1 style={titleStyle}>YouTube Scanner Control Center</h1>
            <p style={subtitleStyle}>
              등록된 채널, 최근 스캔 시각, 수집된 영상을 한눈에 보는 운영 대시보드입니다.
            </p>
          </div>

          <button type="button" onClick={refreshDashboard} style={refreshButtonStyle}>
            새로고침
          </button>
        </section>

        {error ? <div style={errorBoxStyle}>{error}</div> : null}

        <section style={statsGridStyle}>
          <StatCard
            label="등록 채널"
            value={loading ? '...' : String(stats.totalChannels)}
            helper="현재 추적 중인 채널 수"
          />
          <StatCard
            label="스캔 완료 채널"
            value={loading ? '...' : String(stats.scannedChannels)}
            helper="최근 스캔 기록이 있는 채널"
          />
          <StatCard
            label="수집된 영상"
            value={loading ? '...' : String(stats.totalVideos)}
            helper="현재 화면에 표시되는 영상 수"
          />
          <StatCard
            label="최근 스캔 시각"
            value={loading ? '...' : stats.latestScan}
            helper="가장 마지막으로 스캔된 시간"
          />
        </section>

        <section style={topGridStyle}>
          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <div>
                <div style={cardEyebrowStyle}>SYSTEM STATUS</div>
                <h2 style={cardTitleStyle}>운영 상태</h2>
              </div>
              <span style={liveBadgeStyle}>LIVE</span>
            </div>

            <div style={statusChartStyle}>
              {[35, 55, 45, 80, 65, 50, 90, 60].map((h, i) => (
                <div
                  key={i}
                  style={{
                    ...barStyle,
                    height: `${h}%`,
                    opacity: i === 3 || i === 6 ? 1 : 0.55,
                  }}
                />
              ))}
            </div>

            <div style={statusListStyle}>
              <StatusRow label="현재 상태" value={loading ? '확인 중' : '정상 운영'} />
              <StatusRow label="최근 스캔" value={loading ? '...' : stats.latestScan} />
              <StatusRow
                label="채널 커버리지"
                value={loading ? '...' : `${stats.scannedChannels}/${stats.totalChannels}`}
              />
            </div>
          </div>

          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <div>
                <div style={cardEyebrowStyle}>QUICK ACTIONS</div>
                <h2 style={cardTitleStyle}>빠른 실행</h2>
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <ScannerControls onDone={refreshDashboard} />
            </div>

            <div style={darkNoteStyle}>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>운영 메모</div>
              <ul style={noteListStyle}>
                <li>자동 스캔 동작은 최근 스캔 시각으로 확인</li>
                <li>새 영상 반영 여부는 아래 영상 목록에서 확인</li>
                <li>문제가 있으면 먼저 새로고침으로 재조회</li>
              </ul>
            </div>
          </div>
        </section>

        <section style={cardStyle}>
          <div style={cardHeaderStyle}>
            <div>
              <div style={cardEyebrowStyle}>CHANNEL LIST</div>
              <h2 style={cardTitleStyle}>등록 채널</h2>
            </div>
            <span style={countBadgeStyle}>
              {loading ? '...' : `${channels.length}개 채널`}
            </span>
          </div>

          <div style={{ overflowX: 'auto', marginTop: 16 }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>채널명</th>
                  <th style={thStyle}>채널 ID</th>
                  <th style={thStyle}>상태</th>
                  <th style={thStyle}>마지막 스캔</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} style={emptyCellStyle}>
                      불러오는 중...
                    </td>
                  </tr>
                ) : channels.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={emptyCellStyle}>
                      아직 등록된 채널이 없습니다.
                    </td>
                  </tr>
                ) : (
                  channels.map((channel) => (
                    <tr key={channel.channel_id}>
                      <td style={tdStyle}>
                        <a
                          href={channel.channel_url}
                          target="_blank"
                          rel="noreferrer"
                          style={linkStyle}
                        >
                          {channel.channel_name || '(이름 없음)'}
                        </a>
                      </td>
                      <td style={tdStyle}>{channel.channel_id}</td>
                      <td style={tdStyle}>
                        <span
                          style={channel.last_scanned_at ? activeBadgeStyle : waitingBadgeStyle}
                        >
                          {channel.last_scanned_at ? '활성' : '대기'}
                        </span>
                      </td>
                      <td style={tdStyle}>{formatDate(channel.last_scanned_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ marginTop: 24 }}>
          <div style={cardHeaderStyle}>
            <div>
              <div style={cardEyebrowStyle}>LATEST VIDEOS</div>
              <h2 style={cardTitleStyle}>최근 수집 영상</h2>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <VideoTable videos={videos} />
          </div>
        </section>
      </main>
    </div>
  )
}

const shellStyle: CSSProperties = {
  display: 'flex',
  gap: 20,
  alignItems: 'flex-start',
  padding: 20,
  background: '#f7f7f8',
  minHeight: '100vh',
  boxSizing: 'border-box',
}

const pageStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  color: '#111827',
}

const heroStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 16,
  flexWrap: 'wrap',
  marginBottom: 24,
}

const eyebrowStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: '0.12em',
  color: '#dc2626',
  marginBottom: 10,
}

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: 36,
  lineHeight: 1.1,
  fontWeight: 800,
}

const subtitleStyle: CSSProperties = {
  marginTop: 12,
  color: '#6b7280',
  fontSize: 15,
  lineHeight: 1.6,
  maxWidth: 760,
}

const refreshButtonStyle: CSSProperties = {
  border: 'none',
  background: '#dc2626',
  color: '#fff',
  borderRadius: 12,
  padding: '12px 18px',
  fontWeight: 700,
  cursor: 'pointer',
}

const errorBoxStyle: CSSProperties = {
  marginBottom: 20,
  padding: 14,
  borderRadius: 12,
  border: '1px solid #fecaca',
  background: '#fef2f2',
  color: '#991b1b',
}

const statsGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 16,
  marginBottom: 24,
}

const statCardStyle: CSSProperties = {
  background: '#fff',
  border: '1px solid #ececec',
  borderRadius: 20,
  padding: 20,
  boxShadow: '0 8px 24px rgba(15,23,42,0.04)',
}

const statLabelStyle: CSSProperties = {
  fontSize: 13,
  color: '#6b7280',
  marginBottom: 10,
}

const statValueStyle: CSSProperties = {
  fontSize: 28,
  fontWeight: 800,
  lineHeight: 1.2,
  marginBottom: 8,
}

const statHelperStyle: CSSProperties = {
  fontSize: 13,
  color: '#9ca3af',
}

const topGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1.4fr 1fr',
  gap: 16,
  marginBottom: 24,
}

const cardStyle: CSSProperties = {
  background: '#fff',
  border: '1px solid #ececec',
  borderRadius: 22,
  padding: 22,
  boxShadow: '0 8px 24px rgba(15,23,42,0.04)',
}

const cardHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 12,
  flexWrap: 'wrap',
}

const cardEyebrowStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: '0.12em',
  color: '#9ca3af',
  marginBottom: 8,
}

const cardTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 22,
  fontWeight: 800,
}

const liveBadgeStyle: CSSProperties = {
  background: '#111827',
  color: '#fff',
  borderRadius: 999,
  padding: '8px 12px',
  fontSize: 12,
  fontWeight: 700,
}

const countBadgeStyle: CSSProperties = {
  background: '#f3f4f6',
  color: '#111827',
  borderRadius: 999,
  padding: '8px 12px',
  fontSize: 12,
  fontWeight: 700,
}

const statusChartStyle: CSSProperties = {
  height: 180,
  display: 'flex',
  alignItems: 'flex-end',
  gap: 10,
  marginTop: 18,
  marginBottom: 18,
  padding: 16,
  borderRadius: 18,
  background: '#fafafa',
  border: '1px solid #efefef',
}

const barStyle: CSSProperties = {
  flex: 1,
  minHeight: 24,
  borderRadius: 999,
  background: 'linear-gradient(180deg, #ef4444 0%, #fca5a5 100%)',
}

const statusListStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
}

const statusRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 16,
  padding: '14px 16px',
  border: '1px solid #efefef',
  borderRadius: 14,
  background: '#fafafa',
}

const mutedStyle: CSSProperties = {
  color: '#6b7280',
  fontSize: 13,
}

const darkNoteStyle: CSSProperties = {
  marginTop: 18,
  background: '#111827',
  color: '#fff',
  borderRadius: 18,
  padding: 18,
}

const noteListStyle: CSSProperties = {
  margin: 0,
  paddingLeft: 18,
  color: '#d1d5db',
  lineHeight: 1.7,
  fontSize: 13,
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
}

const tdStyle: CSSProperties = {
  padding: '16px 12px',
  borderBottom: '1px solid #f1f5f9',
  fontSize: 14,
  verticalAlign: 'top',
}

const emptyCellStyle: CSSProperties = {
  padding: 24,
  textAlign: 'center',
  color: '#6b7280',
}

const linkStyle: CSSProperties = {
  color: '#111827',
  textDecoration: 'none',
  fontWeight: 700,
}

const activeBadgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: 999,
  padding: '6px 10px',
  background: '#ecfdf5',
  color: '#047857',
  fontSize: 12,
  fontWeight: 700,
}

const waitingBadgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: 999,
  padding: '6px 10px',
  background: '#f3f4f6',
  color: '#4b5563',
  fontSize: 12,
  fontWeight: 700,
}
