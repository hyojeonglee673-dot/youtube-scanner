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
    <aside style={sidebarStyle}>
      <div style={brandWrapStyle}>
        <div style={brandDotStyle} />
        <div>
          <div style={brandTitleStyle}>YOUTUBE-SCANNER</div>
          <div style={brandSubtitleStyle}>Control Panel</div>
        </div>
      </div>

      <nav style={navStyle}>
        {navItems.map((item) => {
          const active = item.href && pathname === item.href

          if (!item.href) {
            return (
              <div key={item.label} style={navItemDisabledStyle}>
                <span style={navDotStyle} />
                <span>{item.label}</span>
              </div>
            )
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              style={{
                ...navItemStyle,
                ...(active ? navItemActiveStyle : {}),
              }}
            >
              <span style={navDotStyle} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div style={sideInfoBoxStyle}>
        <div style={sideInfoTitleStyle}>안내</div>
        <p style={sideInfoTextStyle}>
          지금은 Overview, Channels, Benchmarks까지 연결했어요.
          <br />
          다음 단계에서 Reports, Settings도 이어서 만들 수 있어요.
        </p>
      </div>
    </aside>
  )
}

const sidebarStyle: CSSProperties = {
  width: 240,
  minWidth: 240,
  background: '#ffffff',
  border: '1px solid #ececec',
  borderRadius: 24,
  padding: 20,
  boxShadow: '0 8px 24px rgba(15,23,42,0.04)',
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
  alignSelf: 'flex-start',
  position: 'sticky',
  top: 20,
}

const brandWrapStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  paddingBottom: 16,
  borderBottom: '1px solid #f1f5f9',
}

const brandDotStyle: CSSProperties = {
  width: 14,
  height: 14,
  borderRadius: 999,
  background: '#ef4444',
  boxShadow: '0 0 0 6px rgba(239,68,68,0.12)',
}

const brandTitleStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 800,
  letterSpacing: '0.08em',
  color: '#111827',
}

const brandSubtitleStyle: CSSProperties = {
  fontSize: 12,
  color: '#9ca3af',
  marginTop: 4,
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
  padding: '12px 14px',
  borderRadius: 14,
  background: '#f9fafb',
  color: '#374151',
  fontSize: 14,
  fontWeight: 700,
  border: '1px solid transparent',
  textDecoration: 'none',
}

const navItemActiveStyle: CSSProperties = {
  background: '#111827',
  color: '#ffffff',
}

const navItemDisabledStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '12px 14px',
  borderRadius: 14,
  background: '#f9fafb',
  color: '#9ca3af',
  fontSize: 14,
  fontWeight: 700,
  border: '1px solid transparent',
  opacity: 0.7,
}

const navDotStyle: CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: 999,
  background: 'currentColor',
  opacity: 0.9,
}

const sideInfoBoxStyle: CSSProperties = {
  marginTop: 'auto',
  borderRadius: 18,
  background: '#111827',
  color: '#ffffff',
  padding: 16,
}

const sideInfoTitleStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 800,
  marginBottom: 8,
}

const sideInfoTextStyle: CSSProperties = {
  margin: 0,
  color: '#d1d5db',
  fontSize: 12,
  lineHeight: 1.7,
}
