import { PomodoroProvider } from '@/components/PomodoroProvider'
import { SessionRefresh } from '@/components/SessionRefresh'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <PomodoroProvider>
      <SessionRefresh />
      {children}
    </PomodoroProvider>
  )
}

