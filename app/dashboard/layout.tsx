import { PomodoroProvider } from '@/components/PomodoroProvider'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <PomodoroProvider>{children}</PomodoroProvider>
}

