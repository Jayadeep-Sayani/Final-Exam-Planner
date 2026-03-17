'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/Header'
import { useToast } from '@/components/ToastContext'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Exams' },
  { href: '/dashboard/homework', label: 'Homework' },
  { href: '/dashboard/planner', label: 'AI Planner' },
  { href: '/dashboard/pomodoro', label: 'Pomodoro' },
  { href: '/dashboard/study', label: 'Study' },
]

const DEFAULT_LINKS: { label: string; url: string; color: string }[] = [
  { label: 'YouTube', url: 'https://www.youtube.com', color: '#111111' },
  { label: 'Brightspace', url: 'https://bright.uvic.ca', color: '#0066cc' },
]

const STORAGE_KEY = 'examio_study_links'
const DEFAULT_BORDER_COLOR = '#111111'

type StudyLink = { label: string; url: string; color?: string }

function loadCustomLinks(): StudyLink[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (x: unknown) =>
        x &&
        typeof x === 'object' &&
        typeof (x as StudyLink).label === 'string' &&
        typeof (x as StudyLink).url === 'string'
    ).map((x: StudyLink) => ({
      label: x.label,
      url: x.url,
      color: typeof (x as StudyLink).color === 'string' ? (x as StudyLink).color : DEFAULT_BORDER_COLOR,
    }))
  } catch {
    return []
  }
}

function saveCustomLinks(links: StudyLink[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(links))
}

function normalizeUrl(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return ''
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

export default function StudyPage() {
  const { showToast } = useToast()
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [customLinks, setCustomLinks] = useState<StudyLink[]>([])
  const [addLabel, setAddLabel] = useState('')
  const [addUrl, setAddUrl] = useState('')
  const [addColor, setAddColor] = useState(DEFAULT_BORDER_COLOR)
  const [removingIndex, setRemovingIndex] = useState<number | null>(null)

  useEffect(() => {
    setCustomLinks(loadCustomLinks())
  }, [])

  const customWithColor = customLinks.map((x) => ({ ...x, color: x.color ?? DEFAULT_BORDER_COLOR }))

  function openLink(url: string) {
    window.open(normalizeUrl(url), '_blank', 'noopener,noreferrer')
  }

  function addLink() {
    const label = addLabel.trim()
    const url = normalizeUrl(addUrl.trim())
    if (!label || !url) {
      showToast('Enter a name and URL')
      return
    }
    try {
      new URL(url)
    } catch {
      showToast('Enter a valid URL')
      return
    }
    const next = [...customLinks, { label, url, color: addColor }]
    setCustomLinks(next)
    saveCustomLinks(next)
    setAddLabel('')
    setAddUrl('')
    setAddColor(DEFAULT_BORDER_COLOR)
    showToast('Link added')
  }

  function removeCustomLink(index: number) {
    const next = customLinks.filter((_, i) => i !== index)
    setCustomLinks(next)
    saveCustomLinks(next)
    setRemovingIndex(null)
    showToast('Link removed')
  }

  async function handleConfirmSignOut() {
    setLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      showToast('Signed out successfully')
      setTimeout(() => { window.location.href = '/' }, 1200)
    } catch {
      setLoggingOut(false)
    }
  }

  return (
    <>
      <Header
        navItems={NAV_ITEMS}
        rightButton={{ label: 'Sign out', onClick: () => setShowLogoutModal(true) }}
      />
      {showLogoutModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
          }}
          onClick={() => !loggingOut && setShowLogoutModal(false)}
        >
          <div
            style={{ background: '#fff', border: '2px solid #111', padding: 32, maxWidth: 400, width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase', margin: '0 0 12px', color: '#111' }}>Sign out?</h3>
            <p style={{ fontSize: 16, color: '#444', margin: '0 0 24px' }}>Are you sure you want to sign out?</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowLogoutModal(false)} disabled={loggingOut} style={{ padding: '12px 24px', border: '2px solid #111', background: '#fff', color: '#111', font: 'inherit', fontSize: 14, fontWeight: 600, cursor: loggingOut ? 'not-allowed' : 'pointer' }}>Cancel</button>
              <button type="button" onClick={handleConfirmSignOut} disabled={loggingOut} className="btn-primary">{loggingOut ? 'Signing out…' : 'Sign out'}</button>
            </div>
          </div>
        </div>
      )}
      <main
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 72px)',
          paddingBottom: 100,
          padding: 24,
          background: '#fafafa',
        }}
      >
        <div style={{ maxWidth: 560, width: '100%', display: 'flex', flexDirection: 'column', gap: 32, textAlign: 'center' }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 16px', color: '#111' }}>Study links</h2>
            <p style={{ fontSize: 14, color: '#666', margin: '0 0 16px' }}>Click to open in a new tab.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
                {DEFAULT_LINKS.map((item, index) => (
                  <button
                    key={`default-${index}`}
                    type="button"
                    onClick={() => openLink(item.url)}
                    style={{
                      padding: '10px 18px',
                      border: `2px solid ${item.color}`,
                      background: '#fff',
                      color: '#111',
                      font: 'inherit',
                      fontSize: 14,
                      cursor: 'pointer',
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              {customWithColor.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
                  {customWithColor.map((item, index) => (
                    <span key={`custom-${index}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                      <button
                        type="button"
                        onClick={() => openLink(item.url)}
                        style={{
                          padding: '10px 18px',
                          border: `2px solid ${item.color}`,
                          background: '#fff',
                          color: '#111',
                          font: 'inherit',
                          fontSize: 14,
                          cursor: 'pointer',
                        }}
                      >
                        {item.label}
                      </button>
                      {removingIndex === index ? (
                        <span style={{ fontSize: 11, color: '#666' }}>
                          <button type="button" onClick={() => setRemovingIndex(null)} style={{ marginLeft: 2, padding: '0 3px', border: 'none', background: 'none', color: '#666', font: 'inherit', cursor: 'pointer', textDecoration: 'underline' }}>n</button>
                          <button type="button" onClick={() => removeCustomLink(index)} style={{ marginLeft: 2, padding: '0 3px', border: 'none', background: 'none', color: '#c00', font: 'inherit', cursor: 'pointer', textDecoration: 'underline' }}>y</button>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setRemovingIndex(index) }}
                          style={{
                            padding: '2px 4px',
                            border: 'none',
                            background: 'none',
                            color: '#aaa',
                            font: 'inherit',
                            fontSize: 10,
                            cursor: 'pointer',
                            lineHeight: 1,
                          }}
                          title="Remove link"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 16px', color: '#111' }}>Add a link</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                type="text"
                value={addLabel}
                onChange={(e) => setAddLabel(e.target.value)}
                placeholder="Name (e.g. Course site)"
                style={{
                  padding: '10px 14px',
                  border: '2px solid #111',
                  font: 'inherit',
                  fontSize: 14,
                }}
                aria-label="Link name"
              />
              <input
                type="url"
                value={addUrl}
                onChange={(e) => setAddUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addLink()}
                placeholder="URL (e.g. https://example.com)"
                style={{
                  padding: '10px 14px',
                  border: '2px solid #111',
                  font: 'inherit',
                  fontSize: 14,
                }}
                aria-label="Link URL"
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                <label style={{ fontSize: 14, color: '#444' }} htmlFor="study-link-color">
                  Border color
                </label>
                <input
                  id="study-link-color"
                  type="color"
                  value={addColor}
                  onChange={(e) => setAddColor(e.target.value)}
                  style={{ width: 40, height: 36, padding: 2, cursor: 'pointer', border: '1px solid #ccc' }}
                  aria-label="Border color"
                />
              </div>
              <button type="button" onClick={addLink} className="btn-primary" style={{ alignSelf: 'center', padding: '10px 20px' }}>
                Add link
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
