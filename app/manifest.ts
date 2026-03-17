import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'EXAMIO — Final Exam Study Planner',
    short_name: 'EXAMIO',
    description: 'Plan your finals. Track exams, homework, and study with the Pomodoro timer.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fafafa',
    theme_color: '#FF6A00',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  }
}
