import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import {
  findUserById,
  getHomework,
  updatePlannerSchedule,
  type PlannerSchedule,
  type PlannerScheduleItem,
} from '@/lib/users'

function todayServerDate(): string {
  return new Date().toISOString().slice(0, 10)
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function buildTasks(
  homework: { assignmentName: string; courseName: string }[],
  exams: { name: string }[]
): string[] {
  const tasks: string[] = []
  for (const h of homework.slice(0, 5)) {
    tasks.push(`${h.assignmentName} (${h.courseName})`)
  }
  for (const e of exams) {
    if (tasks.length >= 5) break
    tasks.push(`Study for ${e.name}`)
  }
  return tasks.slice(0, 5)
}

export async function POST() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dbUser = await findUserById(user.userId)
  if (!dbUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const exams = dbUser.exams ?? []
  const allHomework = await getHomework(user.userId)
  const unfinishedHomework = allHomework.filter((h) => h.status !== 'done')
  const today = todayServerDate()

  const labels = buildTasks(
    unfinishedHomework.map((h) => ({ assignmentName: h.assignmentName, courseName: h.courseName })),
    exams.map((e) => ({ name: e.name }))
  )

  const items: PlannerScheduleItem[] = labels.map((label) => ({
    id: generateId(),
    label,
    done: false,
  }))

  const schedule: PlannerSchedule = {
    date: today,
    items,
  }

  await updatePlannerSchedule(user.userId, schedule)

  return NextResponse.json({ schedule })
}
