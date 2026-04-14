'use client'

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react'
import Sidebar from '../components/sidebar'

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

function MetricCard({
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
    <div style={{ ...metricCardStyle, ...(highlighted ? metricCardStrongStyle : {}) }}>
      <div style={metricLabelStyle}>{label}</div>
      <div style={metricValueStyle}>{value}</div>
      <div style={metricHelperStyle}>{helper}</div>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={summaryRowStyle}>
      <span style={summaryLabelStyle}>{label}</span>
      <strong style={summaryValueStyle}>{value}</strong>
    </div>
  )
}

export default function ReportsPage() {
  const [channels, setChannels] = useState<ChannelItem[]>([])
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)

  const refreshReports = useCallback(async () => {
    try {
      setError('')

      const res = await fetch(`/api/dashboard?t=${Date.now()}`, {
        cache: 'no-store',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || '리포트 데이터를 불러오지 못했습니다.')
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
    refreshReports()
  }, [refreshReports])

  const stats = useMemo(() => {
    const scannedChannels = channels.filter((channel) => channel.last_scanned_at).length
    const latestScan = getLatestScan(channels)
    const totalViews = videos.reduce((sum, video) => sum + (video.view_count || 0), 0)

    const videoCountByChannel = videos.reduce<Record<string, number>>((acc, video) => {
      const key = video.source_channel_name || '이름 없음'
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})

    const topChannel =
      Object.entries(videoCountByChannel).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'

    return {
      totalChannels: channels.length,
      scannedChannels,
      totalVideos: videos.length,
      totalViews,
      latestScan,
      topChannel,
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

  const sortedChannels = useMemo(() => {
    return [...channels].sort((a, b) => {
      const aTime = a.last_scanned_at ? new Date(a.last_scanned_at).getTime() : 0
      const bTime = b.last_scanned_at ? new Date(b.last_scanned_at).getTime() : 0
      return bTime - aTime
    })
  }, [channels])

  return (
    <div style={shellStyle}>
      <Sidebar />

      <main style={pageStyle}>
        <section style={heroStyle}>
          <div>
            <div style={eyebrowStyle}>REPORTS</div>
            <h1 style={titleStyle}>Operations Report</h1>
            <p style={subtitleStyle}>
              채널 등록 현황, 최근 스캔 상태, 수집된 영상 흐름을 한눈에 보는 운영 리포트입니다.
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

          <button type="button" onClick={refreshReports} style={refreshButtonStyle}>
            새로고침
          </button>
        </section>

        {error ? <div style={errorBoxStyle}>{error}</div> : null}

        <section style={statsGridStyle}>
          <MetricCard
            label="등록 채널 수"
            value={loading ? '...' : String(stats.totalChannels)}
            helper="현재 추적 중인 전체 채널"
            highlighted={settings.highlightCards}
          />
          <MetricCard
            label="스캔 완료 채널"
            value={loading ? '...' : String(stats.scannedChannels)}
            helper="최근 스캔 이력이 있는 채널"
            highlighted={settings.highlightCards}
          />
          <MetricCard
            label="수집 영상 수"
            value={loading ? '...' : String(stats.totalVideos)}
            helper="현재 저장된 전체 영상"
            highlighted={settings.highlightCards}
          />
          <MetricCard
            label="누적 조회수"
            value={loading ? '...' : formatNumber(stats.totalViews)}
            helper="수집된 영상 기준 합계"
            highlighted={settings.highlightCards}
          />
        </section>

        <section style={contentGridStyle}>
          <div
            style={{
              ...cardStyle,
              ...(settings.highlightCards ? cardStrongStyle : {}),
            }}
          >
            <div style={sectionEyebrowStyle}>SUMMARY REPORT</div>
            <h2 style={sectionTitleStyle}>운영 요약</h2>

            <div style={summaryListStyle}>
              <SummaryRow
                label="최근 스캔 시각"
                value={loading ? '...' : stats.latestScan}
              />
              <SummaryRow
                label="가장 활발한 채널"
                value={loading ? '...' : stats.topChannel}
              />
              <SummaryRow
                label="채널 커버리지"
                value={loading ? '...' : `${stats.scannedChannels} / ${stats.totalChannels}`}
              />
              <SummaryRow
                label="운영 상태"
                value={loading ? '확인 중...' : '정상 운영'}
              />
            </div>

            <div style={noteBoxStyle}>
              <div style={noteTitleStyle}>리포트 메모</div>
              <p style={noteTextStyle}>
                Settings에서 저장한 표시 개수, 정렬 방식, 카드 강조 옵션이 이 페이지에도
                반영됩니다.
              </p>
            </div>
          </div>

          <div
            style={{
              ...cardStyle,
              ...(settings.highlightCards ? cardStrongStyle : {}),
            }}
          >
            <div style={sectionEyebrowStyle}>LATEST ACTIVITY</div>
            <h2 style={sectionTitleStyle}>최근 수집 영상</h2>

            <div style={activityListStyle}>
              {loading ? (
                <div style={emptyStateStyle}>불러오는 중...</div>
              ) : displayVideos.length === 0 ? (
                <div style={emptyStateStyle}>표시할 영상이 없습니다.</div>
              ) : (
                displayVideos.map((video) => (
                  <div key={video.video_id} style={activityItemStyle}>
                    <div style={activityTextWrapStyle}>
                      <div style={activityTitleStyle}>{video.title}</div>
                      <div style={activityMetaStyle}>
                        {video.source_channel_name || '채널명 없음'} · 조회수{' '}
                        {formatNumber(video.view_count || 0)} · {formatDate(video.published_at)}
                      </div>
                    </div>

                    <a
                      href={video.youtube_url}
                      target="_blank"
                      rel="noreferrer"
                      style={openButtonStyle}
                    >
                      열기
                    </a>
                  </div>
                ))
              )}
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
          <div style={tableHeaderStyle}>
            <div>
              <div style={sectionEyebrowStyle}>CHANNEL REPORT</div>
              <h2 style={sectionTitleStyle}>채널 상태 리포트</h2>
            </div>

            <div style={badgeStyle}>{loading ? '...' : `${channels.length}개 채널`}</div>
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
                ) : sortedChannels.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={emptyCellStyle}>
                      등록된 채널이 없습니다.
                    </td>
                  </tr>
                ) : (
                  sortedChannels.map((channel) => (
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

const metricCardStyle: CSSProperties = {
  background: 'rgba(255,255,255,0.92)',
  borderRadius: 24,
  padding: 22,
  border: '1px solid #e9edf5',
  boxShadow: '0 12px 30px rgba(15, 23, 42, 0.05)',
}

const metricCardStrongStyle: CSSProperties = {
  boxShadow: '0 18px 38px rgba(15, 23, 42, 0.08)',
  background: 'linear-gradient(180deg, #ffffff 0%, #fbfcff 100%)',
}

const metricLabelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  color: '#94a3b8',
  marginBottom: 12,
  letterSpacing: '0.08em',
}

const metricValueStyle: CSSProperties = {
  fontSize: 34,
  lineHeight: 1.05,
  fontWeight: 800,
  color: '#0f172a',
  marginBottom: 8,
}

const metricHelperStyle: CSSProperties = {
  fontSize: 12,
  lineHeight: 1.6,
  color: '#94a3b8',
}

const contentGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1.1fr 1fr',
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

const summaryListStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  marginTop: 18,
}

const summaryRowStyle: CSSProperties = {
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

const summaryLabelStyle: CSSProperties = {
  fontSize: 13,
  color: '#64748b',
  fontWeight: 600,
}

const summaryValueStyle: CSSProperties = {
  fontSize: 14,
  color: '#0f172a',
  fontWeight: 800,
}

const noteBoxStyle: CSSProperties = {
  marginTop: 18,
  padding: 16,
  borderRadius: 18,
  background: '#0f172a',
}

const noteTitleStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: '0.12em',
  color: '#fca5a5',
  marginBottom: 8,
}

const noteTextStyle: CSSProperties = {
  margin: 0,
  color: '#e2e8f0',
  fontSize: 13,
  lineHeight: 1.8,
}

const activityListStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  marginTop: 18,
}

const activityItemStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 12,
  padding: '14px 16px',
  borderRadius: 16,
  border: '1px solid #edf1f7',
  background: '#ffffff',
}

const activityTextWrapStyle: CSSProperties = {
  minWidth: 0,
  flex: 1,
}

const activityTitleStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 800,
  color: '#0f172a',
  marginBottom: 6,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}

const activityMetaStyle: CSSProperties = {
  fontSize: 12,
  color: '#64748b',
  lineHeight: 1.6,
}

const openButtonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '10px 14px',
  borderRadius: 12,
  background: '#fef2f2',
  color: '#dc2626',
  textDecoration: 'none',
  fontWeight: 800,
  fontSize: 13,
  whiteSpace: 'nowrap',
}

const emptyStateStyle: CSSProperties = {
  padding: '18px 16px',
  borderRadius: 16,
  background: '#ffffff',
  border: '1px solid #edf1f7',
  color: '#64748b',
  fontSize: 14,
}

const tableHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 12,
}

const badgeStyle: CSSProperties = {
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
