'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LockIcon } from './LockIcon'

type NavItem = { href: string; label: string }

type HeaderProps = {
  navItems?: NavItem[]
  rightLink?: { href: string; label: string }
  rightButton?: { label: string; onClick: () => void }
}

export function Header({ navItems, rightLink, rightButton }: HeaderProps) {
  const pathname = usePathname()
  return (
    <header
      style={{
        height: 72,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '2px solid #111111',
        padding: '0 32px',
        background: '#ffffff',
      }}
    >
      <Link
        href="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          color: '#111111',
          textDecoration: 'none',
        }}
      >
        <LockIcon size={22} />
        <span
          style={{
            fontFamily: 'var(--font-logo), sans-serif',
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: '0.02em',
          }}
        >
          EXAMIO
        </span>
      </Link>
      {navItems && navItems.length > 0 ? (
        <nav style={{ display: 'flex', alignItems: 'center', gap: 24, marginLeft: 24 }}>
          {navItems.slice(0, 3).map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === '/dashboard' && pathname.startsWith('/dashboard/exam'))
            return (
              <Link
                key={item.href}
                href={item.href}
                className="header-nav-action"
                style={{
                  borderBottomColor: isActive ? 'var(--color-accent)' : 'transparent',
                }}
              >
                {item.label}
              </Link>
            )
          })}
          {navItems.length > 3 ? (
            <>
              <span
                aria-hidden
                style={{
                  width: 1,
                  height: 20,
                  background: '#ccc',
                  flexShrink: 0,
                }}
              />
              {navItems.slice(3).map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href === '/dashboard' && pathname.startsWith('/dashboard/exam'))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="header-nav-action"
                    style={{
                      borderBottomColor: isActive ? 'var(--color-accent)' : 'transparent',
                    }}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </>
          ) : null}
        </nav>
      ) : null}
      <div style={{ marginLeft: 'auto' }}>
        {rightLink ? (
          <Link href={rightLink.href} className="header-nav-action">
            {rightLink.label}
          </Link>
        ) : rightButton ? (
          <button
            type="button"
            onClick={rightButton.onClick}
            className="header-nav-action"
          >
            {rightButton.label}
          </button>
        ) : null}
      </div>
    </header>
  )
}
