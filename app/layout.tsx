import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import { BackgroundSwitch } from '@/components/BackgroundSwitch'
import { PwaRegister } from '@/components/PwaRegister'
import { ToastProvider } from '@/components/ToastContext'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'EXAMIO — Final Exam Study Planner',
  description: 'Your final exam study planner. Plan, study, ace your finals.',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'EXAMIO' },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  themeColor: '#FF6A00',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <body className={spaceGrotesk.className}>
        <BackgroundSwitch />
        <PwaRegister />
        <ToastProvider>
          <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
        </ToastProvider>
      </body>
    </html>
  )
}
