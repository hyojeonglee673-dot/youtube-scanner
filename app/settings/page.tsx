'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import Sidebar from '../components/sidebar'

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

export default function SettingsPage() {
  const [videoLimit, setVideoLimit] = useState(10)
  const [highlightCards, setHighlightCards] = useState(true)
  const [recentFirst, setRecentFirst] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY)
      if (!raw) return

      const parsed = JSON.parse(raw) as Partial<UserSettings>

      setVideoLimit(
        typeof parsed.videoLimit === 'number' && parsed.videoLimit > 0
          ? parsed.videoLimit
          : defaultSettings.videoLimit
      )
      setHighlightCards(
        typeof parsed.highlightCards === 'boolean'
          ? parsed.highlightCards
          : defaultSettings.highlightCards
      )
      setRecentFirst(
        typeof parsed.recentFirst === 'boolean'
          ? parsed.recentFirst
          : defaultSettings.recentFirst
      )
    } catch {
      setMessage('기존 설정을 읽는 중 문제가 있었지만 기본값으로 시작합니다.')
    }
  }, [])

  function handleSave() {
    const payload: UserSettings = {
      videoLimit,
      highlightCards,
      recentFirst,
    }

    localStorage.setItem(SETTINGS_KEY, JSON.stringify(payload))
    setMessage('설정이 저장되었습니다. Overview 페이지로 이동하면 바로 반영됩니다.')
  }

  function handleReset() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings))
    setVideoLimit(defaultSettings.videoLimit)
    setHighlightCards(defaultSettings.highlightCards)
    setRecentFirst(defaultSettings.recentFirst)
    setMessage('기본 설정으로 되돌렸습니다.')
  }

  return (
    <div style={shellStyle}>
      <Sidebar />

      <main style={pageStyle}>
        <section style={heroStyle}>
          <div>
            <div style={eyebrowStyle}>SETTINGS</div>
            <h1 style={titleStyle}>Workspace Settings</h1>
            <p style={subtitleStyle}>
              Overview 화면에 반영될 표시 개수, 정렬 방식, 카드 강조 옵션을 저장합니다.
            </p>
          </div>

          <div style={heroButtonRowStyle}>
            <button type="button" onClick={handleReset} style={secondaryButtonStyle}>
              기본값 복원
            </button>
            <button type="button" onClick={handleSave} style={primaryButtonStyle}>
              저장
            </button>
          </div>
        </section>

        {message ? <div style={messageBoxStyle}>{message}</div> : null}

        <section style={gridStyle}>
          <div style={cardStyle}>
            <div style={cardEyebrowStyle}>DISPLAY CONTROL</div>
            <h2 style={cardTitleStyle}>오버뷰 표시 설정</h2>
            <p style={cardDescStyle}>메인 화면에서 보이는 영상 수와 카드 톤을 조정합니다.</p>

            <div style={formGroupStyle}>
              <label style={labelStyle}>최근 영상 표시 개수</label>
              <select
                value={videoLimit}
                onChange={(e) => setVideoLimit(Number(e.target.value))}
                style={selectStyle}
              >
                <option value={5}>5개</option>
                <option value={10}>10개</option>
                <option value={20}>20개</option>
              </select>
            </div>

            <div style={toggleListStyle}>
              <label style={toggleRowStyle}>
                <div>
                  <div style={toggleTitleStyle}>카드 강조 스타일</div>
                  <div style={toggleDescStyle}>KPI 카드와 주요 패널 그림자를 더 선명하게 표시합니다.</div>
                </div>
                <input
                  type="checkbox"
                  checked={highlightCards}
                  onChange={(e) => setHighlightCards(e.target.checked)}
                  style={checkboxStyle}
                />
              </label>

              <label style={toggleRowStyle}>
                <div>
                  <div style={toggleTitleStyle}>최근 영상 우선 정렬</div>
                  <div style={toggleDescStyle}>끄면 조회수 기준으로 상위 영상이 먼저 보입니다.</div>
                </div>
                <input
                  type="checkbox"
                  checked={recentFirst}
                  onChange={(e) => setRecentFirst(e.target.checked)}
                  style={checkboxStyle}
                />
              </label>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={cardEyebrowStyle}>LIVE PREVIEW</div>
            <h2 style={cardTitleStyle}>저장될 설정 미리보기</h2>
            <p style={cardDescStyle}>저장 후 Overview에 반영될 값입니다.</p>

            <div style={previewListStyle}>
              <div style={previewRowStyle}>
                <span style={previewLabelStyle}>최근 영상 표시</span>
                <strong style={previewValueStyle}>{videoLimit}개</strong>
              </div>

              <div style={previewRowStyle}>
                <span style={previewLabelStyle}>카드 강조</span>
                <strong style={previewValueStyle}>{highlightCards ? 'ON' : 'OFF'}</strong>
              </div>

              <div style={previewRowStyle}>
                <span style={previewLabelStyle}>정렬 기준</span>
                <strong style={previewValueStyle}>{recentFirst ? '최신순' : '조회수순'}</strong>
              </div>
            </div>

            <div style={noteBoxStyle}>
              저장 후 <strong>Overview</strong> 페이지로 이동하거나 새로고침하면 바로 반영됩니다.
            </div>
          </div>
        </section>

        <section style={cardStyle}>
          <div style={cardEyebrowStyle}>NEXT STEP</div>
          <h2 style={cardTitleStyle}>나중에 더 붙일 수 있는 설정</h2>
          <p style={cardDescStyle}>
            지금은 가장 체감되는 옵션만 연결했습니다. 이후에는 아래 항목도 확장하기 좋습니다.
          </p>

          <ul style={todoListStyle}>
            <li>Benchmarks 정렬 기준 저장</li>
            <li>Reports 기본 표시 개수 저장</li>
            <li>다크 모드 / 컬러 테마</li>
            <li>자동 스캔 주기 표시 UI</li>
          </ul>
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

const heroButtonRowStyle: CSSProperties = {
  display: 'flex',
  gap: 10,
  flexWrap: 'wrap',
}

const primaryButtonStyle: CSSProperties = {
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

const secondaryButtonStyle: CSSProperties = {
  border: '1px solid #e7ebf3',
  background: '#ffffff',
  color: '#334155',
  borderRadius: 14,
  padding: '13px 18px',
  fontSize: 14,
  fontWeight: 800,
  cursor: 'pointer',
}

const messageBoxStyle: CSSProperties = {
  marginBottom: 16,
  padding: '14px 16px',
  borderRadius: 16,
  background: '#ffffff',
  border: '1px solid #e7ebf3',
  color: '#334155',
  boxShadow: '0 10px 24px rgba(15, 23, 42, 0.04)',
}

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 16,
  marginBottom: 16,
}

const cardStyle: CSSProperties = {
  background: 'rgba(255,255,255,0.92)',
  borderRadius: 26,
  padding: 22,
  border: '1px solid #e9edf5',
  boxShadow: '0 12px 30px rgba(15, 23, 42, 0.05)',
}

const cardEyebrowStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: '0.14em',
  color: '#94a3b8',
  marginBottom: 8,
}

const cardTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 24,
  fontWeight: 800,
  color: '#0f172a',
}

const cardDescStyle: CSSProperties = {
  margin: '10px 0 0',
  fontSize: 14,
  lineHeight: 1.75,
  color: '#64748b',
}

const formGroupStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  marginTop: 18,
}

const labelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  color: '#94a3b8',
  letterSpacing: '0.08em',
}

const selectStyle: CSSProperties = {
  height: 48,
  borderRadius: 14,
  border: '1px solid #e7ebf3',
  background: '#ffffff',
  color: '#0f172a',
  padding: '0 14px',
  fontSize: 14,
}

const toggleListStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  marginTop: 18,
}

const toggleRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 16,
  padding: '16px',
  borderRadius: 18,
  background: '#fcfdff',
  border: '1px solid #edf1f7',
}

const toggleTitleStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 800,
  color: '#0f172a',
  marginBottom: 4,
}

const toggleDescStyle: CSSProperties = {
  fontSize: 13,
  lineHeight: 1.7,
  color: '#64748b',
}

const checkboxStyle: CSSProperties = {
  width: 18,
  height: 18,
  accentColor: '#ef4444',
  flexShrink: 0,
}

const previewListStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  marginTop: 18,
}

const previewRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 12,
  padding: '14px 16px',
  borderRadius: 16,
  background: '#ffffff',
  border: '1px solid #edf1f7',
}

const previewLabelStyle: CSSProperties = {
  fontSize: 13,
  color: '#64748b',
  fontWeight: 600,
}

const previewValueStyle: CSSProperties = {
  fontSize: 14,
  color: '#0f172a',
  fontWeight: 800,
}

const noteBoxStyle: CSSProperties = {
  marginTop: 18,
  padding: 16,
  borderRadius: 18,
  background: '#0f172a',
  color: '#e2e8f0',
  fontSize: 13,
  lineHeight: 1.75,
}

const todoListStyle: CSSProperties = {
  margin: '16px 0 0',
  paddingLeft: 18,
  color: '#334155',
  lineHeight: 1.9,
  fontSize: 14,
}
