'use client'

import { useCallback, useEffect, useState, type CSSProperties } from 'react'

type SurgeVideoItem = {
  video_id: string
  title: string
  source_channel_name: string
  thumbnail_url: string | null
  youtube_url: string | null
  published_at: string | null
  current_view_count: number
  last_hour_views: number
  today_views: number
  hourly_avg_views: number
  spike_ratio: number
  status: '급상승' | '상승' | '보통'
  observed_hours: number
}

type ApiResponse = {
  items: SurgeVideoItem[]
  error?: string
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('ko-KR').format(value)
}

function formatDate(value: string | null) {
  if (!value) return '-'
  return new Date(value).toLocaleString('ko-KR')
}

function getStatusStyle(status: SurgeVideoItem['status']): CSSProperties {
  if (status === '급상승') {
    return {
      background: '#fee2e2',
      color: '#b91c1c',
      border: '1px solid #fecaca',
    }
  }

  if (status === '상승') {
    return {
      background: '#fef3c7',
      color: '#92400e',
      border: '1px solid #fde68a',
    }
  }

  return {
    background: '#eef2ff',
    color: '#3730a3',
    border: '1px solid #c7d2fe',
  }
}

export default function SurgeVideosPanel() {
  const [items, setItems] = useState<SurgeVideoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const res = await fetch(`/api/surge-videos?t=${Date.now()}`, {
        cache: 'no-store',
      })
      const json = (await res.json()) as ApiResponse

      if (!res.ok) {
        throw new Error(json?.error || '급상승 영상을 불러오지 못했습니다.')
      }

      setItems(json.items || [])
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  return (
    <section style={sectionStyle}>
      <div style={headerStyle}>
        <div>
          <div style={eyebrowStyle}>SURGE WATCH</div>
          <h2 style={titleStyle}>당일 조회수 급상승 영상</h2>
          <p style={subtitleStyle}>
            최근 1시간 증가량, 오늘 증가량, 시간당 평균으로 빠르게 뜨는 영상을
            보여줍니다.
          </p>
        </div>
        <button type="button" onClick={fetchItems} style={refreshButtonStyle}>
          새로고침
        </button>
      </div>

      <div style={noteStyle}>
        처음 붙인 직후에는 스냅샷이 아직 적어서 최근 1시간 증가량이 0으로 보일 수
        있어요. 최소 2번 이상 시간별 저장이 쌓이면 제대로 보입니다.
      </div>

      {error ? <div style={errorStyle}>{error}</div> : null}

      {loading ? (
        <div style={emptyStyle}>불러오는 중...</div>
      ) : items.length === 0 ? (
        <div style={emptyStyle}>아직 관측 가능한 급상승 영상이 없습니다.</div>
      ) : (
        <div style={gridStyle}>
          {items.map((item) => (
            <article key={item.video_id} style={cardStyle}>
              <div style={thumbWrapStyle}>
                {item.thumbnail_url ? (
                  <img
                    src={item.thumbnail_url}
                    alt={item.title}
                    style={thumbStyle}
                  />
                ) : (
                  <div style={thumbFallbackStyle}>NO IMAGE</div>
                )}
              </div>

              <div style={contentStyle}>
                <div style={topRowStyle}>
                  <span style={{ ...badgeStyle, ...getStatusStyle(item.status) }}>
                    {item.status}
                  </span>
                  <span style={channelStyle}>{item.source_channel_name}</span>
                </div>

                <div style={titleClampStyle}>{item.title}</div>

                <div style={metricsGridStyle}>
                  <div style={metricBoxStyle}>
                    <div style={metricLabelStyle}>최근 1시간</div>
                    <div style={metricValueHotStyle}>
                      +{formatNumber(item.last_hour_views)}
                    </div>
                  </div>

                  <div style={metricBoxStyle}>
                    <div style={metricLabelStyle}>오늘 증가</div>
                    <div style={metricValueStyle}>
                      +{formatNumber(item.today_views)}
                    </div>
                  </div>

                  <div style={metricBoxStyle}>
                    <div style={metricLabelStyle}>시간당 평균</div>
                    <div style={metricValueStyle}>
                      {formatNumber(item.hourly_avg_views)}/h
                    </div>
                  </div>

                  <div style={metricBoxStyle}>
                    <div style={metricLabelStyle}>배수</div>
                    <div style={metricValueStyle}>{item.spike_ratio}x</div>
                  </div>
                </div>

                <div style={metaStyle}>
                  <span>현재 총조회수 {formatNumber(item.current_view_count)}</span>
                  <span>관측 {item.observed_hours}h</span>
                  <span>게시 {formatDate(item.published_at)}</span>
                </div>

                {item.youtube_url ? (
                  <a
                    href={item.youtube_url}
                    target="_blank"
                    rel="noreferrer"
                    style={linkStyle}
                  >
                    영상 열기
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

const sectionStyle: CSSProperties = {
  marginTop: 20,
  padding: 24,
  borderRadius: 24,
  background: '#ffffff',
  border: '1px solid #e9edf5',
  boxShadow: '0 18px 40px rgba(15,23,42,0.06)',
}

const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 16,
  marginBottom: 12,
}

const eyebrowStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: '0.12em',
  color: '#ef4444',
  marginBottom: 8,
}

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: 28,
  fontWeight: 800,
  color: '#111827',
}

const subtitleStyle: CSSProperties = {
  margin: '8px 0 0',
  color: '#6b7280',
  fontSize: 14,
  lineHeight: 1.7,
}

const refreshButtonStyle: CSSProperties = {
  height: 44,
  padding: '0 16px',
  borderRadius: 12,
  border: '1px solid #dbe2ea',
  background: '#ffffff',
  color: '#111827',
  fontWeight: 700,
  cursor: 'pointer',
}

const noteStyle: CSSProperties = {
  marginBottom: 16,
  padding: '12px 14px',
  borderRadius: 14,
  background: '#f8fafc',
  border: '1px solid #e5e7eb',
  color: '#475569',
  fontSize: 13,
  lineHeight: 1.7,
}

const errorStyle: CSSProperties = {
  marginBottom: 16,
  padding: '12px 14px',
  borderRadius: 14,
  background: '#fef2f2',
  border: '1px solid #fecaca',
  color: '#b91c1c',
  fontSize: 14,
  fontWeight: 700,
}

const emptyStyle: CSSProperties = {
  padding: '28px 16px',
  borderRadius: 18,
  background: '#f8fafc',
  border: '1px dashed #dbe2ea',
  color: '#64748b',
  textAlign: 'center',
  fontWeight: 600,
}

const gridStyle: CSSProperties = {
  display: 'grid',
  gap: 16,
}

const cardStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '220px 1fr',
  gap: 18,
  padding: 16,
  borderRadius: 20,
  border: '1px solid #edf2f7',
  background: '#fcfdff',
}

const thumbWrapStyle: CSSProperties = {
  width: '100%',
  aspectRatio: '16 / 9',
  overflow: 'hidden',
  borderRadius: 16,
  background: '#e5e7eb',
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
  color: '#64748b',
  fontWeight: 700,
  background: '#f3f4f6',
}

const contentStyle: CSSProperties = {
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
}

const topRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  flexWrap: 'wrap',
}

const badgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 28,
  padding: '0 10px',
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 800,
}

const channelStyle: CSSProperties = {
  color: '#64748b',
  fontSize: 13,
  fontWeight: 700,
}

const titleClampStyle: CSSProperties = {
  fontSize: 18,
  fontWeight: 800,
  color: '#111827',
  lineHeight: 1.45,
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
}

const metricsGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: 10,
}

const metricBoxStyle: CSSProperties = {
  padding: '12px 12px',
  borderRadius: 14,
  background: '#ffffff',
  border: '1px solid #edf2f7',
}

const metricLabelStyle: CSSProperties = {
  fontSize: 12,
  color: '#64748b',
  fontWeight: 700,
  marginBottom: 6,
}

const metricValueStyle: CSSProperties = {
  fontSize: 16,
  fontWeight: 800,
  color: '#111827',
}

const metricValueHotStyle: CSSProperties = {
  fontSize: 18,
  fontWeight: 900,
  color: '#dc2626',
}

const metaStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 10,
  color: '#6b7280',
  fontSize: 13,
  lineHeight: 1.6,
}

const linkStyle: CSSProperties = {
  alignSelf: 'flex-start',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 40,
  padding: '0 14px',
  borderRadius: 12,
  background: '#111827',
  color: '#ffffff',
  textDecoration: 'none',
  fontWeight: 800,
  fontSize: 13,
}
