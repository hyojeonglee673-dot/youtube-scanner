'use client'

import Sidebar from '../components/sidebar'
import type { CSSProperties } from 'react'

function SettingCard({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div style={cardStyle}>
      <div style={cardEyebrowStyle}>SETTINGS</div>
      <h2 style={cardTitleStyle}>{title}</h2>
      <p style={cardDescStyle}>{description}</p>
      <div style={{ marginTop: 16 }}>{children}</div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <div style={shellStyle}>
      <Sidebar />

      <main style={pageStyle}>
        <section style={heroStyle}>
          <div>
            <div style={eyebrowStyle}>SETTINGS</div>
            <h1 style={titleStyle}>Workspace Settings</h1>
            <p style={subtitleStyle}>
              현재 프로젝트 운영 방식, 자동 스캔 구조, 다음 확장 포인트를 정리하는 설정 화면입니다.
            </p>
          </div>

          <button type="button" style={saveButtonStyle}>
            저장 예정
          </button>
        </section>

        <section style={gridStyle}>
          <SettingCard
            title="자동 스캔 운영"
            description="현재 자동 수집 구조를 요약해서 보여주는 영역입니다."
          >
            <div style={infoListStyle}>
              <div style={infoRowStyle}>
                <span style={infoLabelStyle}>스캔 방식</span>
                <strong style={infoValueStyle}>Supabase + API 호출 기반</strong>
              </div>
              <div style={infoRowStyle}>
                <span style={infoLabelStyle}>현재 상태</span>
                <strong style={{ ...infoValueStyle, color: '#dc2626' }}>정상 운영</strong>
              </div>
              <div style={infoRowStyle}>
                <span style={infoLabelStyle}>다음 목표</span>
                <strong style={infoValueStyle}>설정 저장 UI 확장</strong>
              </div>
            </div>
          </SettingCard>

          <SettingCard
            title="프로젝트 메모"
            description="운영자가 나중에 확인할 수 있는 설명용 카드입니다."
          >
            <div style={memoBoxStyle}>
              현재 Settings 페이지는 구조를 먼저 만드는 단계입니다. 이후에는 스캔 주기, 표시 개수,
              알림 조건, 관리자 메모 같은 실제 설정 항목으로 확장할 수 있습니다.
            </div>
          </SettingCard>
        </section>

        <section style={bottomGridStyle}>
          <div style={cardStyle}>
            <div style={cardEyebrowStyle}>DISPLAY</div>
            <h2 style={cardTitleStyle}>표시 설정</h2>
            <p style={cardDescStyle}>나중에 연결할 수 있는 화면 설정 예시입니다.</p>

            <div style={optionListStyle}>
              <div style={optionRowStyle}>
                <span>대시보드 카드 강조</span>
                <span style={pillStyle}>ON</span>
              </div>
              <div style={optionRowStyle}>
                <span>최근 영상 우선 표시</span>
                <span style={pillStyle}>ON</span>
              </div>
              <div style={optionRowStyle}>
                <span>다크 모드</span>
                <span style={pillMutedStyle}>준비 중</span>
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={cardEyebrowStyle}>NEXT STEP</div>
            <h2 style={cardTitleStyle}>다음 확장</h2>
            <p style={cardDescStyle}>여기서 이어서 붙이면 좋은 기능들입니다.</p>

            <ul style={todoListStyle}>
              <li>실제 설정값 입력 폼 추가</li>
              <li>자동 스캔 주기 편집 UI</li>
              <li>채널별 알림 설정</li>
              <li>리포트 내보내기 옵션</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  )
}

const shellStyle: CSSProperties = {
  display: 'flex',
  minHeight: '100vh',
  background: '#f5f7fb',
}

const pageStyle: CSSProperties = {
  flex: 1,
  padding: '28px',
}

const heroStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 16,
  marginBottom: 20,
}

const eyebrowStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: '0.14em',
  color: '#ef4444',
  marginBottom: 8,
}

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: 36,
  lineHeight: 1.1,
  fontWeight: 800,
  color: '#111827',
}

const subtitleStyle: CSSProperties = {
  margin: '10px 0 0',
  fontSize: 14,
  lineHeight: 1.7,
  color: '#6b7280',
}

const saveButtonStyle: CSSProperties = {
  border: 'none',
  background: '#ef4444',
  color: '#fff',
  borderRadius: 12,
  padding: '12px 16px',
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer',
  boxShadow: '0 8px 20px rgba(239, 68, 68, 0.22)',
}

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 16,
  marginBottom: 16,
}

const bottomGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 16,
}

const cardStyle: CSSProperties = {
  background: '#ffffff',
  borderRadius: 20,
  padding: 20,
  border: '1px solid #eceef3',
  boxShadow: '0 12px 30px rgba(15, 23, 42, 0.05)',
}

const cardEyebrowStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: '0.14em',
  color: '#9ca3af',
  marginBottom: 8,
}

const cardTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 24,
  fontWeight: 800,
  color: '#111827',
}

const cardDescStyle: CSSProperties = {
  margin: '10px 0 0',
  fontSize: 14,
  lineHeight: 1.7,
  color: '#6b7280',
}

const infoListStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
}

const infoRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '14px 16px',
  borderRadius: 14,
  background: '#f8fafc',
  border: '1px solid #eef2f7',
  gap: 12,
}

const infoLabelStyle: CSSProperties = {
  fontSize: 13,
  color: '#6b7280',
  fontWeight: 600,
}

const infoValueStyle: CSSProperties = {
  fontSize: 14,
  color: '#111827',
  fontWeight: 800,
}

const memoBoxStyle: CSSProperties = {
  padding: 16,
  borderRadius: 16,
  background: '#111827',
  color: '#e5e7eb',
  fontSize: 13,
  lineHeight: 1.8,
}

const optionListStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  marginTop: 16,
}

const optionRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '14px 16px',
  borderRadius: 14,
  background: '#f8fafc',
  border: '1px solid #eef2f7',
}

const pillStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '6px 10px',
  borderRadius: 999,
  background: '#fef2f2',
  color: '#dc2626',
  fontSize: 12,
  fontWeight: 800,
}

const pillMutedStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '6px 10px',
  borderRadius: 999,
  background: '#f3f4f6',
  color: '#6b7280',
  fontSize: 12,
  fontWeight: 800,
}

const todoListStyle: CSSProperties = {
  margin: '16px 0 0',
  paddingLeft: 18,
  color: '#374151',
  lineHeight: 1.9,
  fontSize: 14,
}
