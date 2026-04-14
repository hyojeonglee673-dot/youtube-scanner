'use client'

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react'
import Sidebar from './sidebar'

type ChannelItem = {
  channel_id: string
  channel_name: string
  channel_url: string
  last_scanned_at: string | null
}

function formatDate(value: string | null) {
  if (!value) return '-'
  return new Date(value).toLocaleString('ko-KR')
}

export default function ChannelsPageClient() {
  const [channels, setChannels] = useState<ChannelItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refreshChannels = useCallback(async () => {
    try {
      setError('')

      const res = await fetch(`/api/dashboard?t=${Date.now()}`, {
        cache: 'no-store',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || '채널 데이터를 불러오지 못했습니다.')
      }

      setChannels(data.channels || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshChannels()
  }, [refreshChannels])

  const scannedCount = useMemo(
    () => channels.filter((channel) => channel.last_scanned_at).length,
    [channels]
  )

  return (
    <div style={shellStyle}>
      <Sidebar />

      <main style={pageStyle}>
        <section style={heroStyle}>
          <div>
            <div style={eyebrowStyle}>CHANNEL LIST</div>
            <h1 style={titleStyle}>Tracked Channels</h1>
            <p style={subtitleStyle}>
              현재 등록된 채널 목록과 마지막 스캔 상태를 확인하는 페이지입니다.
            </p>
          </div>

          <button type="button" onClick={refreshChannels} style={refreshButtonStyle}>
            새로고침
          </button>
        </section>

        {error ? <div style={errorBoxStyle}>{error}</div> : null}

        <section style={statsGridStyle}>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>총 채널 수</div>
            <div style={statValueStyle}>{loading ? '...' : channels.length}</div>
            <div style={statHelperStyle}>현재 추적 중인 채널</div>
          </div>

          <div style={statCardStyle}>
            <div style={statLabelStyle}>스캔 완료</div>
            <div style={statValueStyle}>{loading ? '...' : scannedCount}</div>
            <div style={statHelperStyle}>최근 스캔 기록이 있는 채널</div>
          </div>
        </section>

        <section style={cardStyle}>
          <div style={cardHeaderStyle}>
            <div>
              <div style={cardEyebrowStyle}>CHANNEL DIRECTORY</div>
              <h2 style={cardTitleStyle}>등록 채널 목록</h2>
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
                  <th style={thStyle}>링크</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={emptyCellStyle}>
                      불러오는 중...
                    </td>
                  </tr>
                ) : channels.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={emptyCellStyle}>
                      아직 등록된 채널이 없습니다.
                    </td>
                  </tr>
                ) : (
                  channels.map((channel) => (
                    <tr key={channel.channel_id}>
                      <td style={tdStyle}>
                        <strong>{channel.channel_name || '(이름 없음)'}</strong>
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
                      <td style={tdStyle}>
                        <a
                          href={channel.channel_url}
                          target="_blank"
                          rel="noreferrer"
                          style={linkButtonStyle}
                        >
                          열기
                        </a>
                      </td>
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