import ScannerControls from './components/scanner-controls'
import VideoTable from './components/video-table'
import { getDashboardData } from '../lib/scanner'

function formatDate(value: string | null) {
  if (!value) return '-'
  return new Date(value).toLocaleString('ko-KR')
}

export default async function HomePage() {
  const { channels, videos } = await getDashboardData()

  return (
    <main
      style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '32px 20px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>유튜브 채널 스캐너</h1>
      <p style={{ color: '#4b5563', marginBottom: 24 }}>
        등록한 채널의 최신 영상 데이터를 저장하고 필터로 추려보는 버전입니다.
      </p>

      <ScannerControls />

      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 24, marginBottom: 12 }}>등록된 채널</h2>
        <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: 12 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f9fafb' }}>
              <tr>
                <th style={thStyle}>채널명</th>
                <th style={thStyle}>채널 ID</th>
                <th style={thStyle}>마지막 스캔</th>
              </tr>
            </thead>
            <tbody>
              {channels.length === 0 ? (
                <tr>
                  <td colSpan={3} style={emptyCellStyle}>
                    아직 등록된 채널이 없습니다.
                  </td>
                </tr>
              ) : (
                channels.map((channel: any) => (
                  <tr key={channel.channel_id}>
                    <td style={tdStyle}>
                      <a href={channel.channel_url} target="_blank" rel="noreferrer">
                        {channel.channel_name || '(이름 없음)'}
                      </a>
                    </td>
                    <td style={tdStyle}>{channel.channel_id}</td>
                    <td style={tdStyle}>{formatDate(channel.last_scanned_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <VideoTable videos={videos} />
    </main>
  )
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: 12,
  borderBottom: '1px solid #e5e7eb',
  fontSize: 14,
}

const tdStyle: React.CSSProperties = {
  padding: 12,
  borderBottom: '1px solid #f1f5f9',
  verticalAlign: 'top',
  fontSize: 14,
}

const emptyCellStyle: React.CSSProperties = {
  padding: 20,
  textAlign: 'center',
  color: '#6b7280',
}
