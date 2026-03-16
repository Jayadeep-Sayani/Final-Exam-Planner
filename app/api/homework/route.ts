import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { findUserById, updateUserHomework, type HomeworkRecord } from '@/lib/users'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { getHomework } = await import('@/lib/users')
  const homework = await getHomework(user.userId)
  return NextResponse.json({ homework })
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  let body: { courseName?: string; assignmentName?: string; dueDate?: string; estimatedHours?: number }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const courseName = (body.courseName ?? '').trim()
  const assignmentName = (body.assignmentName ?? '').trim()
  if (!courseName || !assignmentName) {
    return NextResponse.json({ error: 'Course name and assignment name are required' }, { status: 400 })
  }
  const today = new Date().toISOString().slice(0, 10)
  const estimatedHours =
    typeof body.estimatedHours === 'number' && body.estimatedHours >= 0 ? body.estimatedHours : undefined
  const item: HomeworkRecord = {
    id: generateId(),
    courseName,
    assignmentName,
    dueDate: body.dueDate ?? today,
    status: 'not_started',
    ...(estimatedHours !== undefined && { estimatedHours }),
  }
  const dbUser = await findUserById(user.userId)
  const existing = dbUser?.homework ?? []
  const updated = [...existing, item]
  await updateUserHomework(user.userId, updated)
  return NextResponse.json({ homework: updated })
}
