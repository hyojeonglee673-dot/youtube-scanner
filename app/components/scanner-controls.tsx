'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

export default function ScannerControls() {
  const router = useRouter()
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
      
      setTimeout(() => {
  window.location.reload()
}, 300)
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

setTimeout(() => {
  window.location.reload()
}, 300)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        background: '#fafafa',
      }}
    >
      <form onSubmit={handleAddChannel} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="@GoogleDevelopers 또는 채널 URL"
          style={{
            flex: 1,
            minWidth: 280,
            padding: '12px 14px',
            border: '1px solid #ccc',
            borderRadius: 8,
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px 16px',
            borderRadius: 8,
            border: 'none',
            background: '#111827',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          채널 등록
        </button>
        <button
          type="button"
          onClick={handleScanAll}
          disabled={loading}
          style={{
            padding: '12px 16px',
            borderRadius: 8,
            border: '1px solid #111827',
            background: 'white',
            color: '#111827',
            cursor: 'pointer',
          }}
        >
          전체 스캔
        </button>
      </form>

      <p style={{ marginTop: 12, color: '#374151' }}>
        {message || '채널을 등록하면 최신 영상 10개를 바로 가져옵니다.'}
      </p>
    </div>
  )
}