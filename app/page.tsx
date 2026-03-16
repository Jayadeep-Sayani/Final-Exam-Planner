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
