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

type ChannelBenchmark = {
  channelName: string
  videoCount: number
  totalViews: number
  latestPublishedAt: string | null
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

export default function BenchmarksPage() {
  const [channels, setChannels] = useState<ChannelItem[]>([])
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)

  const refreshBenchmarks = useCallback(async () => {
    try {
      setError('')

      const res = await fetch(`/api/dashboard?t=${Date.now()}`, {
        cache: 'no-store',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || '벤치마크 데이터를 불러오지 못했습니다.')
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
    refreshBenchmarks()
  }, [refreshBenchmarks])

  const scopedVideos = useMemo(() => {
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

  const benchmarks = useMemo(() => {
    const grouped = scopedVideos.reduce<Record<string, ChannelBenchmark>>((acc, video) => {
      const key = video.source_channel_name || '이름 없음'

      if (!acc[key]) {
        acc[key] = {
          channelName: key,
          videoCount: 0,
          totalViews: 0,
          latestPublishedAt: null,
        }
      }

      acc[key].videoCount += 1
      acc[key].totalViews += video.view_count || 0

      if (!acc[key].latestPublishedAt) {
        acc[key].latestPublishedAt = video.published_at
      } else {
        const prev = new Date(acc[key].latestPublishedAt as string).getTime()
        const next = video.published_at ? new Date(video.published_at).getTime() : 0
        if (next > prev) acc[key].latestPublishedAt = video.published_at
      }

      return acc
    }, {})

    return Object.values(grouped).sort((a, b) => b.totalViews - a.totalViews)
  }, [scopedVideos])

  const topFive = useMemo(() => benchmarks.slice(0, 5), [benchmarks])

  const totalViews = useMemo(
    () => scopedVideos.reduce((sum, video) => sum + (video.view_count || 0), 0),
    [scopedVideos]
  )

  const topChannel = benchmarks[0]?.channelName || '-'
  const maxViews = topFive[0]?.totalViews || 0

  return (
    <div style={shellStyle}>
      <Sidebar />

      <main style={pageStyle}>
        <section style={heroStyle}>
          <div>
            <div style={eyebrowStyle}>BENCHMARKS</div>
            <h1 style={titleStyle}>Performance Comparison</h1>
            <p style={subtitleStyle}>
              설정에서 지정한 조건 기준으로 최근 영상 데이터를 비교해 채널별 성과를 확인합니다.
            </p>

            <div style={heroChipRowStyle}>
              <span style={heroChipStyle}>최근 영상 {settings.videoLimit}개 기준</span>
              <span style={heroChipStyle}>
                {settings.recentFirst ? '최신순 집계' : '조회수순 집계'}
              </span>
              <span style={heroChipStyle}>
                카드 강조 {settings.highlightCards ? 'ON' : 'OFF'}
              </span>
            </div>
          </div>

          <button type="button" onClick={refreshBenchmarks} style={refreshButtonStyle}>
            새로고침
          </button>
        </section>

        {error ? <div style={errorBoxStyle}>{error}</div> : null}

        <section style={statsGridStyle}>
          <StatCard
            label="비교 채널 수"
            value={loading ? '...' : String(benchmarks.length)}
            helper="현재 집계 조건에 포함된 채널 수"
            highlighted={settings.highlightCards}
          />
          <StatCard
            label="집계 영상 수"
            value={loading ? '...' : String(scopedVideos.length)}
            helper="설정 기준으로 선택된 영상 수"
            highlighted={settings.highlightCards}
          />
          <StatCard
            label="누적 조회수"
            value={loading ? '...' : formatNumber(totalViews)}
            helper="선택된 영상 기준 조회수 합계"
            highlighted={settings.highlightCards}
          />
          <StatCard
            label="최고 성과 채널"
            value={loading ? '...' : topChannel}
            helper="현재 기준 총 조회수 1위 채널"
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
            <div style={sectionHeaderStyle}>
              <div>
                <div style={sectionEyebrowStyle}>TOP CHANNELS</div>
                <h2 style={sectionTitleStyle}>조회수 비교</h2>
              </div>
            </div>

            <div style={barListStyle}>
              {loading ? (
                <div style={emptyStateStyle}>불러오는 중...</div>
              ) : topFive.length === 0 ? (
                <div style={emptyStateStyle}>비교할 데이터가 없습니다.</div>
              ) : (
                topFive.map((item) => {
                  const width = maxViews > 0 ? Math.max((item.totalViews / maxViews) * 100, 8) : 8

                  return (
                    <div key={item.channelName} style={barRowStyle}>
                      <div style={barLabelRowStyle}>
                        <span style={barChannelStyle}>{item.channelName}</span>
                        <span style={barValueStyle}>{formatNumber(item.totalViews)}</span>
                      </div>

                      <div style={barTrackStyle}>
                        <div style={{ ...barFillStyle, width: `${width}%` }} />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <div
            style={{
              ...cardStyle,
              ...(settings.highlightCards ? cardStrongStyle : {}),
            }}
          >
            <div style={sectionEyebrowStyle}>INSIGHTS</div>
            <h2 style={sectionTitleStyle}>요약 인사이트</h2>

            <div style={insightListStyle}>
              <div style={insightRowStyle}>
                <span style={insightLabelStyle}>기준 영상 수</span>
                <strong style={insightValueStyle}>{loading ? '...' : `${scopedVideos.length}개`}</strong>
              </div>

              <div style={insightRowStyle}>
                <span style={insightLabelStyle}>현재 최고 채널</span>
                <strong style={insightValueStyle}>{loading ? '...' : topChannel}</strong>
              </div>

              <div style={insightRowStyle}>
                <span style={insightLabelStyle}>전체 등록 채널</span>
                <strong style={insightValueStyle}>{loading ? '...' : `${channels.length}개`}</strong>
              </div>

              <div style={insightRowStyle}>
                <span style={insightLabelStyle}>집계 기준</span>
                <strong style={insightValueStyle}>
                  {settings.recentFirst ? '최신 영상 우선' : '조회수 높은 영상 우선'}
                </strong>
              </div>
            </div>

            <div style={noteBoxStyle}>
              <div style={noteTitleStyle}>벤치마크 메모</div>
              <p style={noteTextStyle}>
                이 페이지는 전체 영상이 아니라 Settings에서 정한 개수와 정렬 기준으로 잘라낸
                영상들만 기준으로 비교합니다.
              </p>
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
              <div style={sectionEyebrowStyle}>BENCHMARK TABLE</div>
              <h2 style={sectionTitleStyle}>채널별 비교표</h2>
            </div>

            <span style={badgeStyle}>{loading ? '...' : `${benchmarks.length}개 채널`}</span>
          </div>

          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>채널명</th>
                  <th style={thStyle}>영상 수</th>
                  <th style={thStyle}>누적 조회수</th>
                  <th style={thStyle}>최근 게시일</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} style={emptyCellStyle}>
                      불러오는 중...
                    </td>
                  </tr>
                ) : benchmarks.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={emptyCellStyle}>
                      비교할 데이터가 없습니다.
                    </td>
                  </tr>
                ) : (
                  benchmarks.map((item) => (
                    <tr key={item.channelName} style={rowStyle}>
                      <td style={tdStyle}>{item.channelName}</td>
                      <td style={tdStyle}>{formatNumber(item.videoCount)}</td>
                      <td style={tdStyle}>{formatNumber(item.totalViews)}</td>
                      <td style={tdStyle}>{formatDate(item.latestPublishedAt)}</td>
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

const contentGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1.15fr 0.85fr',
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

const barListStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
  marginTop: 18,
}

const barRowStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
}

const barLabelRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 10,
}

const barChannelStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 800,
  color: '#0f172a',
}

const barValueStyle: CSSProperties = {
  fontSize: 12,
  color: '#64748b',
  fontWeight: 700,
}

const barTrackStyle: CSSProperties = {
  width: '100%',
  height: 14,
  borderRadius: 999,
  background: '#f3f4f6',
  overflow: 'hidden',
}

const barFillStyle: CSSProperties = {
  height: '100%',
  borderRadius: 999,
  background: 'linear-gradient(135deg, #ff8a8a 0%, #ff4d4f 100%)',
}

const insightListStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  marginTop: 18,
}

const insightRowStyle: CSSProperties = {
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

const insightLabelStyle: CSSProperties = {
  fontSize: 13,
  color: '#64748b',
  fontWeight: 600,
}

const insightValueStyle: CSSProperties = {
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

const emptyStateStyle: CSSProperties = {
  padding: '18px 16px',
  borderRadius: 16,
  background: '#ffffff',
  border: '1px solid #edf1f7',
  color: '#64748b',
  fontSize: 14,
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
