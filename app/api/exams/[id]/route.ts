import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { findUserById, updateExam, deleteExam, type TopicRecord } from '@/lib/users'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  const dbUser = await findUserById(user.userId)
  const exam = (dbUser?.exams ?? []).find((e) => e.id === id)
  if (!exam) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json({ exam })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  let body: {
    name?: string
    examDate?: string
    startStudyingDate?: string
    bufferDays?: number
    topics?: TopicRecord[]
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const updates: Partial<{ name: string; examDate: string; startStudyingDate: string; bufferDays: number; topics: TopicRecord[] }> = {}
  if (typeof body.name === 'string') updates.name = body.name.trim()
  if (typeof body.examDate === 'string') updates.examDate = body.examDate
  if (typeof body.startStudyingDate === 'string') updates.startStudyingDate = body.startStudyingDate
  if (typeof body.bufferDays === 'number') updates.bufferDays = Math.max(0, body.bufferDays)
  if (Array.isArray(body.topics)) updates.topics = body.topics
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid updates' }, { status: 400 })
  }
  const exam = await updateExam(user.userId, id, updates)
  if (!exam) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json({ exam })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  const ok = await deleteExam(user.userId, id)
  if (!ok) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json({ ok: true })
}
