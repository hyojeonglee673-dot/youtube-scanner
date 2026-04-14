'use client'

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react'
import Sidebar from './sidebar'

type ChannelItem = {
  channel_id: string
  channel_name: string
  channel_url: string
  last_scanned_at: string | null
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

export default function ChannelsPageClient() {
  const [channels, setChannels] = useState<ChannelItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)

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
    setSettings(getStoredSettings())
    refreshChannels()
  }, [refreshChannels])

  const stats = useMemo(() => {
    const scannedChannels = channels.filter((channel) => channel.last_scanned_at).length
    const waitingChannels = channels.length - scannedChannels
    const latestScan = getLatestScan(channels)

    return {
      totalChannels: channels.length,
      scannedChannels,
      waitingChannels,
      latestScan,
    }
  }, [channels])

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
            <div style={eyebrowStyle}>CHANNELS</div>
            <h1 style={titleStyle}>Tracked Channels</h1>
            <p style={subtitleStyle}>
              등록된 채널 목록과 최근 스캔 상태를 확인하는 채널 관리 페이지입니다.
            </p>

            <div style={heroChipRowStyle}>
              <span style={heroChipStyle}>전체 {stats.totalChannels}개 채널</span>
              <span style={heroChipStyle}>활성 {stats.scannedChannels}개</span>
              <span style={heroChipStyle}>카드 강조 {settings.highlightCards ? 'ON' : 'OFF'}</span>
            </div>
          </div>

          <button type="button" onClick={refreshChannels} style={refreshButtonStyle}>
            새로고침
          </button>
        </section>

        {error ? <div style={errorBoxStyle}>{error}</div> : null}

        <section style={statsGridStyle}>
          <StatCard
            label="등록 채널"
            value={loading ? '...' : String(stats.totalChannels)}
            helper="현재 추적 중인 전체 채널 수"
            highlighted={settings.highlightCards}
          />
          <StatCard
            label="활성 채널"
            value={loading ? '...' : String(stats.scannedChannels)}
            helper="최근 스캔 기록이 있는 채널"
            highlighted={settings.highlightCards}
          />
          <StatCard
            label="대기 채널"
            value={loading ? '...' : String(stats.waitingChannels)}
            helper="아직 최근 스캔 기록이 없는 채널"
            highlighted={settings.highlightCards}
          />
          <StatCard
            label="최근 스캔"
            value={loading ? '...' : stats.latestScan}
            helper="가장 마지막으로 확인된 스캔 시각"
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
                <div style={sectionEyebrowStyle}>CHANNEL OVERVIEW</div>
                <h2 style={sectionTitleStyle}>운영 요약</h2>
              </div>
            </div>

            <div style={summaryListStyle}>
              <div style={summaryRowStyle}>
                <span style={summaryLabelStyle}>최근 스캔 시각</span>
                <strong style={summaryValueStyle}>{loading ? '...' : stats.latestScan}</strong>
              </div>

              <div style={summaryRowStyle}>
                <span style={summaryLabelStyle}>현재 활성 채널</span>
                <strong style={summaryValueStyle}>
                  {loading ? '...' : `${stats.scannedChannels}개`}
                </strong>
              </div>

              <div style={summaryRowStyle}>
                <span style={summaryLabelStyle}>대기 중 채널</span>
                <strong style={summaryValueStyle}>
                  {loading ? '...' : `${stats.waitingChannels}개`}
                </strong>
              </div>

              <div style={summaryRowStyle}>
                <span style={summaryLabelStyle}>카드 강조 상태</span>
                <strong style={summaryValueStyle}>
                  {settings.highlightCards ? 'ON' : 'OFF'}
                </strong>
              </div>
            </div>

            <div style={noteBoxStyle}>
              <div style={noteTitleStyle}>채널 메모</div>
              <p style={noteTextStyle}>
                이 화면은 등록된 채널 상태를 빠르게 확인하는 용도입니다. 마지막 스캔 시각과
                활성/대기 상태를 중심으로 보면 됩니다.
              </p>
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
                <div style={sectionEyebrowStyle}>CHANNEL STATUS</div>
                <h2 style={sectionTitleStyle}>상태 요약</h2>
              </div>
            </div>

            <div style={statusCardListStyle}>
              <div style={statusMiniCardStyle}>
                <div style={statusMiniLabelStyle}>활성</div>
                <div style={statusMiniValueStyle}>{loading ? '...' : `${stats.scannedChannels}`}</div>
                <div style={statusMiniHelperStyle}>최근 스캔 기록 있음</div>
              </div>

              <div style={statusMiniCardStyle}>
                <div style={statusMiniLabelStyle}>대기</div>
                <div style={statusMiniValueStyle}>{loading ? '...' : `${stats.waitingChannels}`}</div>
                <div style={statusMiniHelperStyle}>스캔 기록 없음</div>
              </div>
            </div>

            <div style={statusGuideBoxStyle}>
              <div style={statusGuideTitleStyle}>확인 팁</div>
              <ul style={statusGuideListStyle}>
                <li>최근 스캔 시각이 있는 채널은 정상 동작 중인 상태로 보면 됩니다.</li>
                <li>대기 채널이 많다면 Overview에서 전체 스캔을 한 번 실행해 보세요.</li>
                <li>채널 링크를 누르면 원본 채널 페이지를 새 탭으로 열 수 있습니다.</li>
              </ul>
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
              <div style={sectionEyebrowStyle}>CHANNEL TABLE</div>
              <h2 style={sectionTitleStyle}>채널 리스트</h2>
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
  gridTemplateColumns: '1.05fr 0.95fr',
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

const statusCardListStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 12,
  marginTop: 18,
}

const statusMiniCardStyle: CSSProperties = {
  padding: 18,
  borderRadius: 20,
  background: '#ffffff',
  border: '1px solid #edf1f7',
}

const statusMiniLabelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  color: '#94a3b8',
  marginBottom: 10,
  letterSpacing: '0.08em',
}

const statusMiniValueStyle: CSSProperties = {
  fontSize: 28,
  lineHeight: 1.05,
  fontWeight: 800,
  color: '#0f172a',
  marginBottom: 8,
}

const statusMiniHelperStyle: CSSProperties = {
  fontSize: 12,
  color: '#64748b',
  lineHeight: 1.6,
}

const statusGuideBoxStyle: CSSProperties = {
  marginTop: 16,
  padding: 16,
  borderRadius: 18,
  background: '#fcfdff',
  border: '1px solid #edf1f7',
}

const statusGuideTitleStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  color: '#0f172a',
  marginBottom: 8,
}

const statusGuideListStyle: CSSProperties = {
  margin: 0,
  paddingLeft: 18,
  color: '#64748b',
  fontSize: 13,
  lineHeight: 1.8,
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
