'use client'

import { FormEvent, useState, type CSSProperties } from 'react'

type Props = {
  onDone?: () => void | Promise<void>
}

export default function ScannerControls({ onDone }: Props) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleAddChannel(e: FormEvent) {
    e.preventDefault()

    if (!input.trim()) return

    setLoading(true)
    setMessage('채널 등록 중...')

    try {
      const res = await fetch('/api/channels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || '채널 등록 실패')
      }

      setMessage(`등록 완료: ${data.channel.channelName}`)
      setInput('')

      if (onDone) {
        await onDone()
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  async function handleScanAll() {
    setLoading(true)
    setMessage('전체 채널 스캔 중...')

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || '전체 스캔 실패')
      }

      setMessage('전체 스캔 완료')

      if (onDone) {
        await onDone()
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={wrapStyle}>
      <form onSubmit={handleAddChannel} style={formStyle}>
        <div style={fieldWrapStyle}>
          <label style={labelStyle}>채널 입력</label>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="@GoogleDevelopers 또는 채널 URL"
            style={inputStyle}
            disabled={loading}
          />
        </div>

        <div style={buttonRowStyle}>
          <button type="submit" disabled={loading} style={primaryButtonStyle}>
            {loading ? '처리 중...' : '채널 등록'}
          </button>

          <button
            type="button"
            onClick={handleScanAll}
            disabled={loading}
            style={secondaryButtonStyle}
          >
            {loading ? '처리 중...' : '전체 스캔'}
          </button>
        </div>
      </form>

      <div style={messageBoxStyle}>
        <div style={messageLabelStyle}>상태 메시지</div>
        <p style={messageTextStyle}>
          {message || '채널을 등록하면 최신 영상 10개를 바로 가져옵니다.'}
        </p>
      </div>

      <div style={noteBoxStyle}>
        <div style={noteTitleStyle}>운영 메모</div>
        <ul style={noteListStyle}>
          <li>새 채널 등록 후 바로 최근 영상 반영 여부를 확인하세요.</li>
          <li>전체 스캔 후 Overview와 Reports에서 데이터가 바뀌는지 보면 됩니다.</li>
          <li>오류가 뜨면 새로고침 후 한 번만 다시 시도하세요.</li>
        </ul>
      </div>
    </div>
  )
}

const wrapStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
}

const formStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
}

const fieldWrapStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
}

const labelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  color: '#94a3b8',
  letterSpacing: '0.08em',
}

const inputStyle: CSSProperties = {
  width: '100%',
  height: 50,
  padding: '0 16px',
  borderRadius: 14,
  border: '1px solid #e5eaf3',
  background: '#ffffff',
  color: '#0f172a',
  fontSize: 14,
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
}

const buttonRowStyle: CSSProperties = {
  display: 'flex',
  gap: 10,
  flexWrap: 'wrap',
}

const primaryButtonStyle: CSSProperties = {
  height: 44,
  padding: '0 16px',
  borderRadius: 12,
  border: 'none',
  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  color: '#ffffff',
  fontSize: 14,
  fontWeight: 800,
  cursor: 'pointer',
  boxShadow: '0 12px 24px rgba(15, 23, 42, 0.15)',
}

const secondaryButtonStyle: CSSProperties = {
  height: 44,
  padding: '0 16px',
  borderRadius: 12,
  border: '1px solid #e5eaf3',
  background: '#ffffff',
  color: '#0f172a',
  fontSize: 14,
  fontWeight: 800,
  cursor: 'pointer',
}

const messageBoxStyle: CSSProperties = {
  borderRadius: 18,
  padding: 16,
  background: 'linear-gradient(180deg, #ffffff 0%, #fbfcff 100%)',
  border: '1px solid #edf1f7',
  boxShadow: '0 10px 24px rgba(15, 23, 42, 0.04)',
}

const messageLabelStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: '0.12em',
  color: '#94a3b8',
  marginBottom: 8,
}

const messageTextStyle: CSSProperties = {
  margin: 0,
  fontSize: 14,
  lineHeight: 1.7,
  color: '#334155',
}

const noteBoxStyle: CSSProperties = {
  borderRadius: 18,
  padding: 16,
  background: '#0f172a',
  boxShadow: '0 16px 30px rgba(15, 23, 42, 0.16)',
}

const noteTitleStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: '0.12em',
  color: '#fca5a5',
  marginBottom: 8,
}

const noteListStyle: CSSProperties = {
  margin: 0,
  paddingLeft: 18,
  color: '#e2e8f0',
  fontSize: 13,
  lineHeight: 1.8,
}
