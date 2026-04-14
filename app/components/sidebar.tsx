'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { CSSProperties } from 'react'

const navItems = [
  { label: 'Overview', href: '/' },
  { label: 'Channels', href: '/channels' },
  { label: 'Benchmarks', href: '/benchmarks' },
  { label: 'Reports', href: '/reports' },
  { label: 'Settings', href: '/settings' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside style={asideStyle}>
      <div style={brandWrapStyle}>
        <div style={brandTopStyle}>
          <div style={brandIconStyle}>
            <div style={brandDotStyle} />
          </div>

          <div>
            <div style={brandTitleStyle}>YOUTUBE-SCANNER</div>
            <div style={brandSubStyle}>Control Panel</div>
          </div>
        </div>
      </div>

      <nav style={navStyle}>
        {navItems.map((item) => {
          const active = pathname === item.href

          return (
            <Link
              key={item.label}
              href={item.href}
              style={active ? navItemActiveStyle : navItemStyle}
            >
              <span style={navBulletStyle} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div style={bottomBoxStyle}>
        <div style={bottomTitleStyle}>안내</div>
        <p style={bottomTextStyle}>
          지금은 Overview, Channels, Benchmarks, Reports, Settings 구조를 먼저 정리한 상태입니다.
        </p>
      </div>
    </aside>
  )
}

const asideStyle: CSSProperties = {
  width: 236,
  padding: 16,
  background: 'rgba(255,255,255,0.92)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(226,232,240,0.9)',
  borderRadius: 28,
  boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)',
  display: 'flex',
  flexDirection: 'column',
  gap: 18,
  position: 'sticky',
  top: 16,
  alignSelf: 'flex-start',
  flexShrink: 0,
}

const brandWrapStyle: CSSProperties = {
  padding: '6px 2px 0',
}

const brandTopStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
}

const brandIconStyle: CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 14,
  background: 'linear-gradient(135deg, #ef4444 0%, #fb7185 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 12px 26px rgba(239, 68, 68, 0.24)',
  flexShrink: 0,
}

const brandDotStyle: CSSProperties = {
  width: 12,
  height: 12,
  borderRadius: 999,
  background: '#ffffff',
}

const brandTitleStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 800,
  letterSpacing: '0.08em',
  color: '#0f172a',
}

const brandSubStyle: CSSProperties = {
  marginTop: 2,
  fontSize: 11,
  color: '#64748b',
  fontWeight: 600,
}

const navStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
}

const navItemStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  minHeight: 48,
  padding: '0 16px',
  borderRadius: 16,
  color: '#334155',
  fontSize: 14,
  fontWeight: 700,
  background: '#ffffff',
  border: '1px solid #e7ebf3',
  boxShadow: '0 8px 20px rgba(15, 23, 42, 0.03)',
}

const navItemActiveStyle: CSSProperties = {
  ...navItemStyle,
  color: '#ffffff',
  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  border: '1px solid rgba(15,23,42,0.95)',
  boxShadow: '0 14px 30px rgba(15, 23, 42, 0.18)',
}

const navBulletStyle: CSSProperties = {
  width: 7,
  height: 7,
  borderRadius: 999,
  background: 'currentColor',
  opacity: 0.88,
  flexShrink: 0,
}

const bottomBoxStyle: CSSProperties = {
  marginTop: 8,
  padding: 16,
  borderRadius: 18,
  background: '#0f172a',
  boxShadow: '0 18px 32px rgba(15, 23, 42, 0.18)',
}

const bottomTitleStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: '0.12em',
  color: '#fca5a5',
  marginBottom: 8,
}

const bottomTextStyle: CSSProperties = {
  margin: 0,
  fontSize: 12,
  lineHeight: 1.75,
  color: '#e2e8f0',
}
