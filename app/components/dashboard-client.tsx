'use client'

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react'
import Sidebar from './sidebar'
import ScannerControls from './scanner-controls'
import VideoTable from './video-table'
import SurgeVideosPanel from './surge-videos-panel'

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

type UserSettings = {
  videoLimit: number
  highlightCards: boolean
  recentFirst: boolean
}

const SETTINGS_KEY = 'yt-scanner-settings-v1'

const defaultSettings: UserSettings = {
  videoLimit: 10,
  highlightCards: true,
  recentFirst: true,
}

function getStoredSettings(): UserSettings {
  if (typeof window === 'undefined') return defaultSettings

  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY)
    if (!raw) return defaultSettings

    const parsed = JSON.parse(raw)

    return {
      videoLimit:
        typeof parsed.videoLimit === 'number' && parsed.videoLimit > 0
          ? parsed.videoLimit
          : defaultSettings.videoLimit,
      highlightCards:
        typeof parsed.highlightCards === 'boolean'
          ? parsed.highlightCards
          : defaultSettings.highlightCards,
      recentFirst:
        typeof parsed.recentFirst === 'boolean'
          ? parsed.recentFirst
          : defaultSettings.recentFirst,
    }
  } catch {
    return defaultSettings
  }
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString('ko-KR') : '-'
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('ko-KR').format(value || 0)
}

function getLatestScan(channels: ChannelItem[]) {
  const times = channels
    .map((channel) => channel.last_scanned_at)
    .filter(Boolean)
    .map((value) => new Date(value as string).getTime())
    .filter((value) => !Number.isNaN(value))

  return times.length === 0 ? '-' : new Date(Math.max(...times)).toLocaleString('ko-KR')
}

function StatCard({
  label,
  value,
  helper,
  highlighted,
}: {
  label: string
  value: string
  helper: string
  highlighted: boolean
}) {
  return (
    <div style={{ ...statCardStyle, ...(highlighted ? statCardStrongStyle : {}) }}>
      <div style={statLabelStyle}>{label}</div>
      <div style={statValueStyle}>{value}</div>
      <div style={statHelperStyle}>{helper}</div>
    </div>
  )
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={statusRowStyle}>
      <span style={statusLabelStyle}>{label}</span>
      <strong style={statusValueStyle}>{value}</strong>
    </div>
  )
}

export default function DashboardClient() {
  const [channels, setChannels] = useState<ChannelItem[]>([])
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)

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
    setSettings(getStoredSettings())
    refreshDashboard()
  }, [refreshDashboard])

  const stats = useMemo(() => {
    const scannedChannels = channels.filter((channel) => channel.last_scanned_at).length
    const totalViews = videos.reduce((sum, video) => sum + (video.view_count || 0), 0)

    return {
      totalChannels: channels.length,
      scannedChannels,
      totalVideos: videos.length,
      totalViews,
      latestScan: getLatestScan(channels),
    }
  }, [channels, videos])

  const displayVideos = useMemo(() => {
    const sorted = [...videos].sort((a, b) => {
      if (settings.recentFirst) {
        const aTime = a.published_at ? new Date(a.published_at).getTime() : 0
        const bTime = b.published_at ? new Date(b.published_at).getTime() : 0
        return bTime - aTime
      }

      return (b.view_count || 0) - (a.view_count || 0)
    })

    return sorted.slice(0, settings.videoLimit)
  }, [videos, settings])

  return (
    <div style={shellStyle}>
      <Sidebar />

      <main style={pageStyle}>
        <section style={heroStyle}>
          <div>
            <div style={eyebrowStyle}>OVERVIEW DASHBOARD</div>
            <h1 style={titleStyle}>YouTube Scanner Control Center</h1>
            <p style={subtitleStyle}>
              등록된 채널, 최근 스캔 시각, 수집된 영상 흐름을 한눈에 보는 운영 대시보드입니다.
            </p>

            <div style={heroChipRowStyle}>
              <span style={heroChipStyle}>최근 영상 {settings.videoLimit}개 표시</span>
              <span style={heroChipStyle}>
                {settings.recentFirst ? '최신순 정렬' : '조회수순 정렬'}
              </span>
              <span style={heroChipStyle}>
                카드 강조 {settings.highlightCards ? 'ON' : 'OFF'}
              </span>
            </div>
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
            highlighted={settings.highlightCards}
          />
          <StatCard
            label="스캔 완료 채널"
            value={loading ? '...' : String(stats.scannedChannels)}
            helper="최근 스캔 기록이 있는 채널"
            highlighted={settings.highlightCards}
          />
          <StatCard
            label="수집된 영상"
            value={loading ? '...' : String(stats.totalVideos)}
            helper="현재 저장된 전체 영상 수"
            highlighted={settings.highlightCards}
          />
          <StatCard
            label="누적 조회수"
            value={loading ? '...' : formatNumber(stats.totalViews)}
            helper="수집된 영상 기준 조회수 합계"
            highlighted={settings.highlightCards}
          />
        </section>

        <section style={topGridStyle}>
          <div
            style={{
              ...cardStyle,
              ...(settings.highlightCards ? cardStrongStyle : {}),
            }}
          >
            <div style={sectionHeaderStyle}>
              <div>
                <div style={sectionEyebrowStyle}>SYSTEM STATUS</div>
                <h2 style={sectionTitleStyle}>운영 상태</h2>
              </div>

              <span style={liveBadgeStyle}>LIVE</span>
            </div>

            <div style={statusPanelStyle}>
              <div style={bubbleChartWrapStyle}>
                {[36, 62, 48, 84, 56, 44, 72, 58].map((size, index) => (
                  <div
                    key={index}
                    style={{
                      ...bubbleStyle,
                      width: size,
                      height: size,
                      opacity: index === 3 || index === 6 ? 1 : 0.58,
                    }}
                  />
                ))}
              </div>

              <div style={statusListStyle}>
                <StatusRow label="현재 상태" value={loading ? '확인 중...' : '정상 운영'} />
                <StatusRow label="최근 스캔" value={loading ? '...' : stats.latestScan} />
                <StatusRow
                  label="채널 커버리지"
                  value={loading ? '...' : `${stats.scannedChannels}/${stats.totalChannels}`}
                />
              </div>
            </div>
          </div>

          <div
            style={{
              ...cardStyle,
              ...(settings.highlightCards ? cardStrongStyle : {}),
            }}
          >
            <div style={sectionHeaderStyle}>
              <div>
                <div style={sectionEyebrowStyle}>QUICK ACTIONS</div>
                <h2 style={sectionTitleStyle}>빠른 실행</h2>
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <ScannerControls onDone={refreshDashboard} />
              <SurgeVideosPanel />
            </div>
          </div>
        </section>

        <section
          style={{
            ...cardStyle,
            ...(settings.highlightCards ? cardStrongStyle : {}),
            marginTop: 16,
          }}
        >
          <div style={sectionHeaderStyle}>
            <div>
              <div style={sectionEyebrowStyle}>CHANNEL LIST</div>
              <h2 style={sectionTitleStyle}>등록 채널</h2>
            </div>

            <span style={countBadgeStyle}>{loading ? '...' : `${channels.length}개 채널`}</span>
          </div>

          <div style={tableWrapStyle}>
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
                      등록된 채널이 없습니다.
                    </td>
                  </tr>
                ) : (
                  channels.map((channel) => (
                    <tr key={channel.channel_id} style={rowStyle}>
                      <td style={tdStyle}>
                        <a
                          href={channel.channel_url}
                          target="_blank"
                          rel="noreferrer"
                          style={channelLinkStyle}
                        >
                          {channel.channel_name || '(이름 없음)'}
                        </a>
                      </td>
                      <td style={tdStyle}>{channel.channel_id}</td>
                      <td style={tdStyle}>
                        <span
                          style={
                            channel.last_scanned_at ? statusActiveBadgeStyle : statusIdleBadgeStyle
                          }
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

        <section style={{ marginTop: 16 }}>
          <div style={sectionHeaderStyle}>
            <div>
              <div style={sectionEyebrowStyle}>LATEST VIDEOS</div>
              <h2 style={sectionTitleStyle}>최근 수집 영상</h2>
            </div>

            <span style={countBadgeStyle}>{`${displayVideos.length}개 표시 중`}</span>
          </div>

          <div style={{ marginTop: 16 }}>
            <VideoTable videos={displayVideos} />
          </div>
        </section>
      </main>
    </div>
  )
}

const shellStyle: CSSProperties = {
  display: 'flex',
  gap: 16,
  alignItems: 'flex-start',
  minHeight: '100vh',
  padding: '16px',
  background: '#f5f7fb',
}

const pageStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  padding: 0,
}

const heroStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 16,
  marginBottom: 18,
}

const eyebrowStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: '0.16em',
  color: '#ef4444',
  marginBottom: 10,
}

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: 40,
  lineHeight: 1.08,
  fontWeight: 800,
  color: '#0f172a',
}

const subtitleStyle: CSSProperties = {
  margin: '12px 0 0',
  fontSize: 15,
  lineHeight: 1.8,
  color: '#64748b',
}

const heroChipRowStyle: CSSProperties = {
  display: 'flex',
  gap: 10,
  flexWrap: 'wrap',
  marginTop: 16,
}

const heroChipStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '8px 12px',
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 800,
  color: '#334155',
  background: '#ffffff',
  border: '1px solid #e7ebf3',
  boxShadow: '0 8px 20px rgba(15, 23, 42, 0.03)',
}

const refreshButtonStyle: CSSProperties = {
  border: 'none',
  background: 'linear-gradient(135deg, #ef4444 0%, #fb7185 100%)',
  color: '#fff',
  borderRadius: 14,
  padding: '13px 18px',
  fontSize: 14,
  fontWeight: 800,
  cursor: 'pointer',
  boxShadow: '0 14px 28px rgba(239, 68, 68, 0.22)',
}

const errorBoxStyle: CSSProperties = {
  marginBottom: 16,
  background: '#fff1f2',
  border: '1px solid #fecdd3',
  color: '#be123c',
  padding: '14px 16px',
  borderRadius: 16,
}

const statsGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: 16,
  marginBottom: 16,
}

const statCardStyle: CSSProperties = {
  background: 'rgba(255,255,255,0.92)',
  borderRadius: 24,
  padding: 22,
  border: '1px solid #e9edf5',
  boxShadow: '0 12px 30px rgba(15, 23, 42, 0.05)',
}

const statCardStrongStyle: CSSProperties = {
  boxShadow: '0 18px 38px rgba(15, 23, 42, 0.08)',
  background: 'linear-gradient(180deg, #ffffff 0%, #fbfcff 100%)',
}

const statLabelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  color: '#94a3b8',
  marginBottom: 12,
  letterSpacing: '0.08em',
}

const statValueStyle: CSSProperties = {
  fontSize: 34,
  lineHeight: 1.05,
  fontWeight: 800,
  color: '#0f172a',
  marginBottom: 8,
}

const statHelperStyle: CSSProperties = {
  fontSize: 12,
  lineHeight: 1.6,
  color: '#94a3b8',
}

const topGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1.2fr 0.8fr',
  gap: 16,
}

const cardStyle: CSSProperties = {
  background: 'rgba(255,255,255,0.92)',
  borderRadius: 26,
  padding: 22,
  border: '1px solid #e9edf5',
  boxShadow: '0 12px 30px rgba(15, 23, 42, 0.05)',
}

const cardStrongStyle: CSSProperties = {
  boxShadow: '0 18px 38px rgba(15, 23, 42, 0.08)',
  background: 'linear-gradient(180deg, #ffffff 0%, #fbfcff 100%)',
}

const sectionHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 12,
}

const sectionEyebrowStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: '0.14em',
  color: '#94a3b8',
  marginBottom: 8,
}

const sectionTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 22,
  fontWeight: 800,
  color: '#0f172a',
}

const liveBadgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 30,
  padding: '0 10px',
  borderRadius: 999,
  background: '#0f172a',
  color: '#ffffff',
  fontSize: 11,
  fontWeight: 800,
}

const statusPanelStyle: CSSProperties = {
  marginTop: 18,
  display: 'flex',
  flexDirection: 'column',
  gap: 18,
}

const bubbleChartWrapStyle: CSSProperties = {
  minHeight: 150,
  borderRadius: 22,
  border: '1px solid #edf1f7',
  background: '#fcfdff',
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  gap: 10,
  padding: '24px 18px 16px',
  overflow: 'hidden',
}

const bubbleStyle: CSSProperties = {
  borderRadius: 999,
  background: 'linear-gradient(180deg, #ff8a8a 0%, #ff4d4f 100%)',
  boxShadow: '0 10px 20px rgba(239, 68, 68, 0.12)',
  flexShrink: 0,
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
  gap: 12,
  minHeight: 48,
  padding: '0 16px',
  borderRadius: 16,
  background: '#ffffff',
  border: '1px solid #edf1f7',
}

const statusLabelStyle: CSSProperties = {
  fontSize: 13,
  color: '#64748b',
  fontWeight: 600,
}

const statusValueStyle: CSSProperties = {
  fontSize: 14,
  color: '#0f172a',
  fontWeight: 800,
}

const countBadgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '8px 12px',
  borderRadius: 999,
  background: '#ffffff',
  color: '#334155',
  fontSize: 12,
  fontWeight: 800,
  border: '1px solid #e7ebf3',
}

const tableWrapStyle: CSSProperties = {
  marginTop: 18,
  overflowX: 'auto',
}

const tableStyle: CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
}

const thStyle: CSSProperties = {
  textAlign: 'left',
  fontSize: 12,
  fontWeight: 800,
  color: '#94a3b8',
  padding: '14px 12px',
  borderBottom: '1px solid #e7ebf3',
}

const tdStyle: CSSProperties = {
  padding: '16px 12px',
  borderBottom: '1px solid #eef2f7',
  fontSize: 14,
  color: '#0f172a',
  verticalAlign: 'middle',
}

const rowStyle: CSSProperties = {
  background: 'transparent',
}

const emptyCellStyle: CSSProperties = {
  padding: '24px 12px',
  textAlign: 'center',
  color: '#64748b',
  fontSize: 14,
}

const channelLinkStyle: CSSProperties = {
  color: '#0f172a',
  textDecoration: 'none',
  fontWeight: 800,
}

const statusActiveBadgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 54,
  padding: '6px 10px',
  borderRadius: 999,
  background: '#ecfdf5',
  color: '#059669',
  fontSize: 12,
  fontWeight: 800,
}

const statusIdleBadgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 54,
  padding: '6px 10px',
  borderRadius: 999,
  background: '#f3f4f6',
  color: '#6b7280',
  fontSize: 12,
  fontWeight: 800,
}