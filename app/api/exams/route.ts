import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { findUserById, updateUserExams, type ExamRecord } from '@/lib/users'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const dbUser = await findUserById(user.userId)
  const exams = dbUser?.exams ?? []
  return NextResponse.json({ exams })
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  let body: { name?: string; examDate?: string; startStudyingDate?: string; bufferDays?: number }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const name = (body.name ?? '').trim()
  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }
  const today = new Date().toISOString().slice(0, 10)
  const exam: ExamRecord = {
    id: generateId(),
    name,
    examDate: body.examDate ?? today,
    startStudyingDate: body.startStudyingDate ?? today,
    bufferDays: Math.max(0, typeof body.bufferDays === 'number' ? body.bufferDays : 0),
  }
  const dbUser = await findUserById(user.userId)
  const existing = dbUser?.exams ?? []
  const updated = [...existing, exam]
  await updateUserExams(user.userId, updated)
  return NextResponse.json({ exams: updated })
}
