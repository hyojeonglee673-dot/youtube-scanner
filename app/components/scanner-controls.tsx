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
        <div style={inputWrapStyle}>
          <label style={labelStyle}>채널 입력</label>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="@GoogleDevelopers 또는 채널 URL"
            style={inputStyle}
            disabled={loading}
          />
        </div>

        <div style={buttonGroupStyle}>
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

const inputWrapStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
}

const labelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: '#6b7280',
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '14px 16px',
  border: '1px solid #d1d5db',
  borderRadius: 14,
  fontSize: 14,
  outline: 'none',
  background: '#ffffff',
  color: '#111827',
}

const buttonGroupStyle: CSSProperties = {
  display: 'flex',
  gap: 10,
  flexWrap: 'wrap',
}

const primaryButtonStyle: CSSProperties = {
  padding: '12px 16px',
  borderRadius: 12,
  border: 'none',
  background: '#111827',
  color: '#ffffff',
  fontWeight: 700,
  fontSize: 14,
  cursor: 'pointer',
  minWidth: 120,
}

const secondaryButtonStyle: CSSProperties = {
  padding: '12px 16px',
  borderRadius: 12,
  border: '1px solid #d1d5db',
  background: '#ffffff',
  color: '#111827',
  fontWeight: 700,
  fontSize: 14,
  cursor: 'pointer',
  minWidth: 120,
}

const messageBoxStyle: CSSProperties = {
  border: '1px solid #ececec',
  borderRadius: 16,
  background: '#fafafa',
  padding: 14,
}

const messageLabelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: '#9ca3af',
  marginBottom: 6,
}

const messageTextStyle: CSSProperties = {
  margin: 0,
  color: '#374151',
  fontSize: 14,
  lineHeight: 1.6,
}
