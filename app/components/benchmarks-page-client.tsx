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

type ChannelBenchmark = {
  name: string
  videos: number
  totalViews: number
  latestPublishedAt: string | null
}

function formatDate(value: string | null) {
  if (!value) return '-'
  return new Date(value).toLocaleString('ko-KR')
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('ko-KR').format(value || 0)
}

export default function BenchmarksPageClient() {
  const [channels, setChannels] = useState<ChannelItem[]>([])
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refreshData = useCallback(async () => {
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
    refreshData()
  }, [refreshData])

  const benchmarks = useMemo<ChannelBenchmark[]>(() => {
    const grouped = new Map<string, ChannelBenchmark>()

    for (const video of videos) {
      const key = video.source_channel_name || '채널명 없음'
      const current = grouped.get(key)

      if (!current) {
        grouped.set(key, {
          name: key,
          videos: 1,
          totalViews: video.view_count || 0,
          latestPublishedAt: video.published_at || null,
        })
      } else {
        current.videos += 1
        current.totalViews += video.view_count || 0

        if (
          video.published_at &&
          (!current.latestPublishedAt ||
            new Date(video.published_at).getTime() > new Date(current.latestPublishedAt).getTime())
        ) {
          current.latestPublishedAt = video.published_at
        }
      }
    }

    return Array.from(grouped.values()).sort((a, b) => b.totalViews - a.totalViews)
  }, [videos])

  const topFive = benchmarks.slice(0, 5)
  const maxViews = topFive.length > 0 ? Math.max(...topFive.map((item) => item.totalViews)) : 1
  const totalViews = benchmarks.reduce((sum, item) => sum + item.totalViews, 0)

  return (
    <div style={shellStyle}>
      <Sidebar />

      <main style={pageStyle}>
        <section style={heroStyle}>
          <div>
            <div style={eyebrowStyle}>BENCHMARKS</div>
            <h1 style={titleStyle}>Performance Comparison</h1>
            <p style={subtitleStyle}>
              수집된 영상 데이터를 기준으로 채널별 영상 수와 누적 조회수를 비교하는 페이지입니다.
            </p>
          </div>

          <button type="button" onClick={refreshData} style={refreshButtonStyle}>
            새로고침
          </button>
        </section>

        {error ? <div style={errorBoxStyle}>{error}</div> : null}

        <section style={statsGridStyle}>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>비교 채널 수</div>
            <div style={statValueStyle}>{loading ? '...' : benchmarks.length}</div>
            <div style={statHelperStyle}>영상 데이터가 있는 채널 기준</div>
          </div>

          <div style={statCardStyle}>
            <div style={statLabelStyle}>전체 영상 수</div>
            <div style={statValueStyle}>{loading ? '...' : videos.length}</div>
            <div style={statHelperStyle}>현재 비교에 포함된 영상 수</div>
          </div>

          <div style={statCardStyle}>
            <div style={statLabelStyle}>누적 조회수</div>
            <div style={statValueStyle}>{loading ? '...' : formatNumber(totalViews)}</div>
            <div style={statHelperStyle}>수집 영상 기준 합계</div>
          </div>
        </section>

        <section style={topGridStyle}>
          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <div>
                <div style={cardEyebrowStyle}>TOP CHANNELS</div>
                <h2 style={cardTitleStyle}>조회수 비교</h2>
              </div>
            </div>

            <div style={chartWrapStyle}>
              {loading ? (
                <div style={emptyBoxStyle}>불러오는 중...</div>
              ) : topFive.length === 0 ? (
                <div style={emptyBoxStyle}>비교할 영상 데이터가 없습니다.</div>
              ) : (
                topFive.map((item) => (
                  <div key={item.name} style={barRowStyle}>
                    <div style={barLabelWrapStyle}>
                      <div style={barLabelStyle}>{item.name}</div>
                      <div style={barValueStyle}>{formatNumber(item.totalViews)}</div>
                    </div>

                    <div style={barTrackStyle}>
                      <div
                        style={{
                          ...barFillStyle,
                          width: `${Math.max((item.totalViews / maxViews) * 100, 8)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <div>
                <div style={cardEyebrowStyle}>INSIGHTS</div>
                <h2 style={cardTitleStyle}>요약 인사이트</h2>
              </div>
            </div>

            <div style={insightListStyle}>
              <div style={insightCardStyle}>
                <div style={insightLabelStyle}>가장 높은 조회수 채널</div>
                <div style={insightValueStyle}>
                  {loading ? '...' : topFive[0]?.name || '-'}
                </div>
              </div>

              <div style={insightCardStyle}>
                <div style={insightLabelStyle}>가장 많은 영상 수</div>
                <div style={insightValueStyle}>
                  {loading
                    ? '...'
                    : benchmarks.length > 0
                    ? `${Math.max(...benchmarks.map((item) => item.videos))}개`
                    : '-'}
                </div>
              </div>

              <div style={darkInsightStyle}>
                <div style={darkInsightTitleStyle}>분석 메모</div>
                <p style={darkInsightTextStyle}>
                  현재는 수집된 영상 데이터를 기준으로 단순 비교하고 있어요.
                  <br />
                  다음 단계에서는 기간 필터, 성장률, 평균 조회수 같은 지표도 추가할 수 있어요.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section style={cardStyle}>
          <div style={cardHeaderStyle}>
            <div>
              <div style={cardEyebrowStyle}>BENCHMARK TABLE</div>
              <h2 style={cardTitleStyle}>채널별 비교표</h2>
            </div>
            <span style={countBadgeStyle}>
              {loading ? '...' : `${benchmarks.length}개 채널`}
            </span>
          </div>

          <div style={{ overflowX: 'auto', marginTop: 16 }}>
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
                    <tr key={item.name}>
                      <td style={tdStyle}>
                        <strong>{item.name}</strong>
                      </td>
                      <td style={tdStyle}>{item.videos}개</td>
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
  gridTemplateColumns: '1.2fr 0.8fr',
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

const countBadgeStyle: CSSProperties = {
  background: '#f3f4f6',
  color: '#111827',
  borderRadius: 999,
  padding: '8px 12px',
  fontSize: 12,
  fontWeight: 700,
}

const chartWrapStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  marginTop: 18,
}

const barRowStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
}

const barLabelWrapStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  alignItems: 'center',
}

const barLabelStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: '#111827',
}

const barValueStyle: CSSProperties = {
  fontSize: 13,
  color: '#6b7280',
  fontWeight: 700,
}

const barTrackStyle: CSSProperties = {
  height: 14,
  borderRadius: 999,
  background: '#f3f4f6',
  overflow: 'hidden',
}

const barFillStyle: CSSProperties = {
  height: '100%',
  borderRadius: 999,
  background: 'linear-gradient(90deg, #fca5a5 0%, #ef4444 100%)',
}

const insightListStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
  marginTop: 18,
}

const insightCardStyle: CSSProperties = {
  border: '1px solid #ececec',
  borderRadius: 16,
  padding: 16,
  background: '#fafafa',
}

const insightLabelStyle: CSSProperties = {
  fontSize: 12,
  color: '#9ca3af',
  marginBottom: 8,
  fontWeight: 700,
}

const insightValueStyle: CSSProperties = {
  fontSize: 18,
  fontWeight: 800,
  color: '#111827',
}

const darkInsightStyle: CSSProperties = {
  borderRadius: 18,
  background: '#111827',
  color: '#fff',
  padding: 18,
}

const darkInsightTitleStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 800,
  marginBottom: 8,
}

const darkInsightTextStyle: CSSProperties = {
  margin: 0,
  color: '#d1d5db',
  lineHeight: 1.7,
  fontSize: 13,
}

const emptyBoxStyle: CSSProperties = {
  border: '1px dashed #d1d5db',
  borderRadius: 16,
  padding: 24,
  textAlign: 'center',
  color: '#6b7280',
  background: '#fafafa',
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