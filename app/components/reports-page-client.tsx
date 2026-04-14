'use client'

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react'
import Sidebar from './sidebar'

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
}: {
  label: string
  value: string
  helper: string
}) {
  return (
    <div style={metricCardStyle}>
      <div style={metricLabelStyle}>{label}</div>
      <div style={metricValueStyle}>{value}</div>
      <div style={metricHelperStyle}>{helper}</div>
    </div>
  )
}

export default function ReportsPageClient() {
  const [channels, setChannels] = useState<ChannelItem[]>([])
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  const recentVideos = useMemo(() => {
    return [...videos]
      .sort((a, b) => {
        const aTime = a.published_at ? new Date(a.published_at).getTime() : 0
        const bTime = b.published_at ? new Date(b.published_at).getTime() : 0
        return bTime - aTime
      })
      .slice(0, 5)
  }, [videos])

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
          />
          <MetricCard
            label="스캔 완료 채널"
            value={loading ? '...' : String(stats.scannedChannels)}
            helper="최근 스캔 이력이 있는 채널"
          />
          <MetricCard
            label="수집 영상 수"
            value={loading ? '...' : String(stats.totalVideos)}
            helper="현재 저장된 전체 영상"
          />
          <MetricCard
            label="누적 조회수"
            value={loading ? '...' : formatNumber(stats.totalViews)}
            helper="수집된 영상 기준 합계"
          />
        </section>

        <section style={contentGridStyle}>
          <div style={cardStyle}>
            <div style={sectionEyebrowStyle}>SUMMARY REPORT</div>
            <h2 style={sectionTitleStyle}>운영 요약</h2>

            <div style={summaryListStyle}>
              <div style={summaryRowStyle}>
                <span style={summaryLabelStyle}>최근 스캔 시각</span>
                <strong style={summaryValueStyle}>{loading ? '...' : stats.latestScan}</strong>
              </div>

              <div style={summaryRowStyle}>
                <span style={summaryLabelStyle}>가장 활발한 채널</span>
                <strong style={summaryValueStyle}>{loading ? '...' : stats.topChannel}</strong>
              </div>

              <div style={summaryRowStyle}>
                <span style={summaryLabelStyle}>채널 커버리지</span>
                <strong style={summaryValueStyle}>
                  {loading ? '...' : `${stats.scannedChannels} / ${stats.totalChannels}`}
                </strong>
              </div>

              <div style={summaryRowStyle}>
                <span style={summaryLabelStyle}>운영 상태</span>
                <strong style={{ ...summaryValueStyle, color: '#dc2626' }}>
                  {loading ? '확인 중...' : '정상 운영'}
                </strong>
              </div>
            </div>

            <div style={noteBoxStyle}>
              <div style={noteTitleStyle}>리포트 메모</div>
              <p style={noteTextStyle}>
                이 화면은 현재 저장된 데이터 기준 요약 리포트입니다. 이후에는 주간 리포트,
                채널별 PDF 내보내기, 자동 보고서 형태로 확장하기 좋습니다.
              </p>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={sectionEyebrowStyle}>LATEST ACTIVITY</div>
            <h2 style={sectionTitleStyle}>최근 수집 영상</h2>

            <div style={activityListStyle}>
              {loading ? (
                <div style={emptyStateStyle}>불러오는 중...</div>
              ) : recentVideos.length === 0 ? (
                <div style={emptyStateStyle}>표시할 영상이 없습니다.</div>
              ) : (
                recentVideos.map((video) => (
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

        <section style={cardStyle}>
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
  marginBottom: 20,
}

const eyebrowStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: '0.14em',
  color: '#ef4444',
  marginBottom: 8,
}

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: 36,
  lineHeight: 1.1,
  fontWeight: 800,
  color: '#111827',
}

const subtitleStyle: CSSProperties = {
  margin: '10px 0 0',
  fontSize: 14,
  lineHeight: 1.7,
  color: '#6b7280',
}

const refreshButtonStyle: CSSProperties = {
  border: 'none',
  background: '#ef4444',
  color: '#fff',
  borderRadius: 12,
  padding: '12px 16px',
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer',
  boxShadow: '0 8px 20px rgba(239, 68, 68, 0.22)',
}

const errorBoxStyle: CSSProperties = {
  marginBottom: 16,
  background: '#fff1f2',
  border: '1px solid #fecdd3',
  color: '#be123c',
  padding: '14px 16px',
  borderRadius: 14,
}

const statsGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: 16,
  marginBottom: 16,
}

const metricCardStyle: CSSProperties = {
  background: '#ffffff',
  borderRadius: 18,
  padding: 20,
  border: '1px solid #eceef3',
  boxShadow: '0 12px 30px rgba(15, 23, 42, 0.05)',
}

const metricLabelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: '#9ca3af',
  marginBottom: 10,
}

const metricValueStyle: CSSProperties = {
  fontSize: 30,
  lineHeight: 1.1,
  fontWeight: 800,
  color: '#111827',
  marginBottom: 8,
}

const metricHelperStyle: CSSProperties = {
  fontSize: 12,
  color: '#94a3b8',
}

const contentGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1.1fr 1fr',
  gap: 16,
  marginBottom: 16,
}

const cardStyle: CSSProperties = {
  background: '#ffffff',
  borderRadius: 20,
  padding: 20,
  border: '1px solid #eceef3',
  boxShadow: '0 12px 30px rgba(15, 23, 42, 0.05)',
}

const sectionEyebrowStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: '0.14em',
  color: '#9ca3af',
  marginBottom: 8,
}

const sectionTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 24,
  fontWeight: 800,
  color: '#111827',
}

const summaryListStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  marginTop: 18,
}

const summaryRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 12,
  padding: '14px 16px',
  borderRadius: 14,
  background: '#f8fafc',
  border: '1px solid #eef2f7',
}

const summaryLabelStyle: CSSProperties = {
  fontSize: 13,
  color: '#6b7280',
  fontWeight: 600,
}

const summaryValueStyle: CSSProperties = {
  fontSize: 14,
  color: '#111827',
  fontWeight: 800,
}

const noteBoxStyle: CSSProperties = {
  marginTop: 16,
  padding: 16,
  borderRadius: 16,
  background: '#111827',
}

const noteTitleStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  color: '#fca5a5',
  marginBottom: 8,
}

const noteTextStyle: CSSProperties = {
  margin: 0,
  fontSize: 13,
  lineHeight: 1.7,
  color: '#e5e7eb',
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
  borderRadius: 14,
  border: '1px solid #eef2f7',
  background: '#ffffff',
}

const activityTextWrapStyle: CSSProperties = {
  minWidth: 0,
  flex: 1,
}

const activityTitleStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: '#111827',
  marginBottom: 6,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}

const activityMetaStyle: CSSProperties = {
  fontSize: 12,
  color: '#6b7280',
  lineHeight: 1.5,
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
  borderRadius: 14,
  background: '#f8fafc',
  border: '1px solid #eef2f7',
  color: '#6b7280',
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
  color: '#dc2626',
  background: '#fef2f2',
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
  borderBottom: '1px solid #e5e7eb',
}

const tdStyle: CSSProperties = {
  padding: '16px 12px',
  borderBottom: '1px solid #eef2f7',
  fontSize: 14,
  color: '#111827',
  verticalAlign: 'middle',
}

const rowStyle: CSSProperties = {
  background: '#ffffff',
}

const emptyCellStyle: CSSProperties = {
  padding: '24px 12px',
  textAlign: 'center',
  color: '#6b7280',
  fontSize: 14,
}

const channelLinkStyle: CSSProperties = {
  color: '#111827',
  textDecoration: 'none',
  fontWeight: 700,
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
