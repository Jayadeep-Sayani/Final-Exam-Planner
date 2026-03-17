'use client'

import Link from 'next/link'
import { LockIcon } from '@/components/LockIcon'

const accent = '#FF6A00'
const accentSoft = 'rgba(255, 106, 0, 0.08)'
const accentGlow = 'rgba(255, 106, 0, 0.28)'
const accentMedium = 'rgba(255, 106, 0, 0.18)'

const FEATURES = [
  {
    title: 'Exams',
    description: 'Add exams with dates and study start. Track topics (hard / medium / easy) and see a progress bar so you know if you’re ahead or behind.',
  },
  {
    title: 'Homework',
    description: 'List assignments with due dates and estimated time. See days left with urgency colors. Mark as done with one click, finished items move to the bottom.',
  },
  {
    title: "Today's plan",
    description: "Generate a simple to-do list for today from your exams and homework. 0–5 tasks, saved until end of day. No fluff, just what to do.",
  },
]

export default function LandingPage() {
  return (
    <>
      <main style={{ background: '#fafafa' }}>
        <section
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            background: `
              radial-gradient(ellipse 100% 70% at 50% -10%, ${accentGlow} 0%, ${accentMedium} 25%, transparent 65%),
              radial-gradient(ellipse 80% 50% at 50% 0%, ${accentSoft} 0%, transparent 50%),
              #ffffff
            `,
          }}
        >
          <div aria-hidden style={{ position: 'absolute', left: '22%', top: '16%', width: 44, height: 28, transform: 'rotate(-12deg)', transformOrigin: 'center center', pointerEvents: 'none', overflow: 'visible' }}>
            <svg style={{ position: 'absolute', left: -24, top: '50%', marginTop: -11, width: 28, height: 22 }} viewBox="0 0 28 22" fill="none">
              <path d="M4 11 Q2 8 5 6 Q10 5 12 9 Q14 14 10 16 Q6 17 4 13 Q3 12 4 11 Z" fill={accent} opacity={0.4} />
              <path d="M10 11 Q8 9 11 7.5 Q15 6 17 9.5 Q18 12 15 14 Q11 15 9 12 Q9 11 10 11 Z" fill={accent} opacity={0.24} />
              <path d="M16 11 Q15 10 16.5 9 Q18 8 19 10 Q19.5 11.5 18 12 Q16.5 12.5 16 11 Z" fill={accent} opacity={0.12} />
            </svg>
            <svg style={{ position: 'relative', display: 'block', width: 20, height: 20 }} viewBox="0 0 24 24" fill={accent}><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /><path d="M8 7h8M8 11h8" stroke="#fff" strokeWidth="1.2" fill="none" /></svg>
          </div>
          <div aria-hidden style={{ position: 'absolute', right: '24%', top: '12%', width: 44, height: 28, transform: 'rotate(8deg)', transformOrigin: 'center center', pointerEvents: 'none', overflow: 'visible' }}>
            <svg style={{ position: 'absolute', right: -24, left: 'auto', top: '50%', marginTop: -11, width: 28, height: 22, transform: 'scaleX(-1)' }} viewBox="0 0 28 22" fill="none">
              <path d="M4 11 Q2 8 5 6 Q10 5 12 9 Q14 14 10 16 Q6 17 4 13 Q3 12 4 11 Z" fill={accent} opacity={0.4} />
              <path d="M10 11 Q8 9 11 7.5 Q15 6 17 9.5 Q18 12 15 14 Q11 15 9 12 Q9 11 10 11 Z" fill={accent} opacity={0.24} />
              <path d="M16 11 Q15 10 16.5 9 Q18 8 19 10 Q19.5 11.5 18 12 Q16.5 12.5 16 11 Z" fill={accent} opacity={0.12} />
            </svg>
            <svg style={{ position: 'relative', display: 'block', width: 18, height: 18 }} viewBox="0 0 24 24" fill={accent}><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" /></svg>
          </div>
          <div aria-hidden style={{ position: 'absolute', left: '20%', top: '44%', width: 44, height: 28, transform: 'rotate(18deg)', transformOrigin: 'center center', pointerEvents: 'none', overflow: 'visible' }}>
            <svg style={{ position: 'absolute', left: -24, top: '50%', marginTop: -11, width: 28, height: 22 }} viewBox="0 0 28 22" fill="none">
              <path d="M4 11 Q2 8 5 6 Q10 5 12 9 Q14 14 10 16 Q6 17 4 13 Q3 12 4 11 Z" fill={accent} opacity={0.4} />
              <path d="M10 11 Q8 9 11 7.5 Q15 6 17 9.5 Q18 12 15 14 Q11 15 9 12 Q9 11 10 11 Z" fill={accent} opacity={0.24} />
              <path d="M16 11 Q15 10 16.5 9 Q18 8 19 10 Q19.5 11.5 18 12 Q16.5 12.5 16 11 Z" fill={accent} opacity={0.12} />
            </svg>
            <svg style={{ position: 'relative', display: 'block', width: 20, height: 20 }} viewBox="0 0 24 24" fill={accent}><path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z" /></svg>
          </div>
          <div aria-hidden style={{ position: 'absolute', right: '22%', top: '40%', width: 44, height: 28, transform: 'rotate(-6deg)', transformOrigin: 'center center', pointerEvents: 'none', overflow: 'visible' }}>
            <svg style={{ position: 'absolute', right: -24, left: 'auto', top: '50%', marginTop: -11, width: 28, height: 22, transform: 'scaleX(-1)' }} viewBox="0 0 28 22" fill="none">
              <path d="M4 11 Q2 8 5 6 Q10 5 12 9 Q14 14 10 16 Q6 17 4 13 Q3 12 4 11 Z" fill={accent} opacity={0.4} />
              <path d="M10 11 Q8 9 11 7.5 Q15 6 17 9.5 Q18 12 15 14 Q11 15 9 12 Q9 11 10 11 Z" fill={accent} opacity={0.24} />
              <path d="M16 11 Q15 10 16.5 9 Q18 8 19 10 Q19.5 11.5 18 12 Q16.5 12.5 16 11 Z" fill={accent} opacity={0.12} />
            </svg>
            <svg style={{ position: 'relative', display: 'block', width: 18, height: 18 }} viewBox="0 0 24 24" fill={accent}><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
          </div>
          <div aria-hidden style={{ position: 'absolute', left: '24%', top: '70%', width: 44, height: 28, transform: 'rotate(-22deg)', transformOrigin: 'center center', pointerEvents: 'none', overflow: 'visible' }}>
            <svg style={{ position: 'absolute', left: -24, top: '50%', marginTop: -11, width: 28, height: 22 }} viewBox="0 0 28 22" fill="none">
              <path d="M4 11 Q2 8 5 6 Q10 5 12 9 Q14 14 10 16 Q6 17 4 13 Q3 12 4 11 Z" fill={accent} opacity={0.4} />
              <path d="M10 11 Q8 9 11 7.5 Q15 6 17 9.5 Q18 12 15 14 Q11 15 9 12 Q9 11 10 11 Z" fill={accent} opacity={0.24} />
              <path d="M16 11 Q15 10 16.5 9 Q18 8 19 10 Q19.5 11.5 18 12 Q16.5 12.5 16 11 Z" fill={accent} opacity={0.12} />
            </svg>
            <svg style={{ position: 'relative', display: 'block', width: 19, height: 19 }} viewBox="0 0 24 24" fill={accent}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" stroke="#fff" strokeWidth="1.2" fill="none" /></svg>
          </div>
          <div aria-hidden style={{ position: 'absolute', right: '20%', top: '64%', width: 44, height: 28, transform: 'rotate(14deg)', transformOrigin: 'center center', pointerEvents: 'none', overflow: 'visible' }}>
            <svg style={{ position: 'absolute', right: -24, left: 'auto', top: '50%', marginTop: -11, width: 28, height: 22, transform: 'scaleX(-1)' }} viewBox="0 0 28 22" fill="none">
              <path d="M4 11 Q2 8 5 6 Q10 5 12 9 Q14 14 10 16 Q6 17 4 13 Q3 12 4 11 Z" fill={accent} opacity={0.4} />
              <path d="M10 11 Q8 9 11 7.5 Q15 6 17 9.5 Q18 12 15 14 Q11 15 9 12 Q9 11 10 11 Z" fill={accent} opacity={0.24} />
              <path d="M16 11 Q15 10 16.5 9 Q18 8 19 10 Q19.5 11.5 18 12 Q16.5 12.5 16 11 Z" fill={accent} opacity={0.12} />
            </svg>
            <svg style={{ position: 'relative', display: 'block', width: 20, height: 20 }} viewBox="0 0 24 24" fill={accent}><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" /></svg>
          </div>
          <div aria-hidden style={{ position: 'absolute', left: '22%', bottom: '14%', width: 44, height: 28, transform: 'rotate(5deg)', transformOrigin: 'center center', pointerEvents: 'none', overflow: 'visible' }}>
            <svg style={{ position: 'absolute', left: -24, top: '50%', marginTop: -11, width: 28, height: 22 }} viewBox="0 0 28 22" fill="none">
              <path d="M4 11 Q2 8 5 6 Q10 5 12 9 Q14 14 10 16 Q6 17 4 13 Q3 12 4 11 Z" fill={accent} opacity={0.4} />
              <path d="M10 11 Q8 9 11 7.5 Q15 6 17 9.5 Q18 12 15 14 Q11 15 9 12 Q9 11 10 11 Z" fill={accent} opacity={0.24} />
              <path d="M16 11 Q15 10 16.5 9 Q18 8 19 10 Q19.5 11.5 18 12 Q16.5 12.5 16 11 Z" fill={accent} opacity={0.12} />
            </svg>
            <svg style={{ position: 'relative', display: 'block', width: 19, height: 19 }} viewBox="0 0 24 24" fill={accent}><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" /></svg>
          </div>
          <div aria-hidden style={{ position: 'absolute', right: '24%', bottom: '20%', width: 44, height: 28, transform: 'rotate(-16deg)', transformOrigin: 'center center', pointerEvents: 'none', overflow: 'visible' }}>
            <svg style={{ position: 'absolute', right: -24, left: 'auto', top: '50%', marginTop: -11, width: 28, height: 22, transform: 'scaleX(-1)' }} viewBox="0 0 28 22" fill="none">
              <path d="M4 11 Q2 8 5 6 Q10 5 12 9 Q14 14 10 16 Q6 17 4 13 Q3 12 4 11 Z" fill={accent} opacity={0.4} />
              <path d="M10 11 Q8 9 11 7.5 Q15 6 17 9.5 Q18 12 15 14 Q11 15 9 12 Q9 11 10 11 Z" fill={accent} opacity={0.24} />
              <path d="M16 11 Q15 10 16.5 9 Q18 8 19 10 Q19.5 11.5 18 12 Q16.5 12.5 16 11 Z" fill={accent} opacity={0.12} />
            </svg>
            <svg style={{ position: 'relative', display: 'block', width: 18, height: 18 }} viewBox="0 0 24 24" fill={accent}><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
          </div>
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 720, width: '100%' }}>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                color: '#111111',
                textDecoration: 'none',
                marginBottom: 48,
              }}
            >
              <LockIcon size={28} />
              <span
                style={{
                  fontFamily: 'var(--font-logo), sans-serif',
                  fontSize: 32,
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                }}
              >
                EXAMIO
              </span>
            </Link>
            <p
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: accent,
                margin: '0 0 20px',
              }}
            >
              Final exam study planner
            </p>
            <h1
              style={{
                fontFamily: 'var(--font-logo), sans-serif',
                fontSize: 'clamp(48px, 10vw, 80px)',
                fontWeight: 400,
                letterSpacing: '0.02em',
                lineHeight: 1.1,
                textTransform: 'uppercase',
                color: '#111111',
                margin: '0 0 20px',
              }}
            >
              Get ready. Stay on track.
            </h1>
            <p
              style={{
                fontSize: 18,
                color: '#444444',
                margin: '0 0 36px',
                lineHeight: 1.5,
              }}
            >
              Plan exams, track homework, and build a simple to-do for today. No clutter, just what you need to ace your finals.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/signup"
                className="btn-primary"
                style={{ padding: '16px 32px', fontSize: 14 }}
              >
                Get started
              </Link>
              <Link
                href="/login"
                style={{
                  padding: '16px 32px',
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  border: '2px solid #111111',
                  background: '#ffffff',
                  color: '#111111',
                  textDecoration: 'none',
                  display: 'inline-block',
                }}
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>

        <section
          style={{
            padding: '60px 24px 80px',
            maxWidth: 1100,
            margin: '0 auto',
          }}
        >
          <h2
            style={{
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#666666',
              margin: '0 0 8px',
              textAlign: 'center',
            }}
          >
            What you get
          </h2>
          <p
            style={{
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
              color: '#111111',
              margin: '0 0 48px',
              textAlign: 'center',
            }}
          >
            One place for exams & homework
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 24,
            }}
          >
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                style={{
                  padding: 28,
                  border: '2px solid #111111',
                  background: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    background: accent,
                    flexShrink: 0,
                  }}
                />
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: '#111111',
                    margin: 0,
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    fontSize: 15,
                    color: '#444444',
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          style={{
            padding: '96px 24px 104px',
            background: '#ffffff',
          }}
        >
          <h2
            style={{
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#666666',
              margin: '0 0 8px',
              textAlign: 'center',
            }}
          >
            How it works
          </h2>
          <p
            style={{
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
              color: '#111111',
              margin: '0 0 40px',
              textAlign: 'center',
            }}
          >
            Three steps
          </p>
          <div
            style={{
              maxWidth: 700,
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <span
                style={{
                  width: 32,
                  height: 32,
                  border: '2px solid #111111',
                  background: accent,
                  color: '#ffffff',
                  fontSize: 14,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                1
              </span>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#111111', margin: '0 0 6px' }}>
                  Sign up
                </h3>
                <p style={{ fontSize: 15, color: '#444444', margin: 0, lineHeight: 1.5 }}>
                  Create an account. No payment, no extra setup.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <span
                style={{
                  width: 32,
                  height: 32,
                  border: '2px solid #111111',
                  background: accent,
                  color: '#ffffff',
                  fontSize: 14,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                2
              </span>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#111111', margin: '0 0 6px' }}>
                  Add exams and homework
                </h3>
                <p style={{ fontSize: 15, color: '#444444', margin: 0, lineHeight: 1.5 }}>
                  Enter your exam dates, study start, and topics. Add assignments with due dates.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <span
                style={{
                  width: 32,
                  height: 32,
                  border: '2px solid #111111',
                  background: accent,
                  color: '#ffffff',
                  fontSize: 14,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                3
              </span>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#111111', margin: '0 0 6px' }}>
                  Use today’s plan
                </h3>
                <p style={{ fontSize: 15, color: '#444444', margin: 0, lineHeight: 1.5 }}>
                  Hit the AI Planner, get a short to-do for today. Mark tasks done as you go.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            padding: '60px 24px 80px',
            textAlign: 'center',
            background: '#111111',
            color: '#ffffff',
          }}
        >
          <p
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
              margin: '0 0 12px',
            }}
          >
            Start planning today
          </p>
          <p style={{ fontSize: 16, color: '#aaaaaa', margin: '0 0 28px' }}>
            Free. No credit card. Just sign up and add your first exam or assignment.
          </p>
          <Link
            href="/signup"
            style={{
              display: 'inline-block',
              padding: '14px 28px',
              border: '2px solid #FF6A00',
              background: accent,
              color: '#ffffff',
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              textDecoration: 'none',
            }}
          >
            Create account
          </Link>
        </section>

      </main>
    </>
  )
}
