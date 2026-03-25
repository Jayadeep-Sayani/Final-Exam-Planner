import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { updateHomework, deleteHomework } from '@/lib/users'

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
    status?: 'not_started' | 'in_progress' | 'done'
    estimatedHours?: number
    courseName?: string
    assignmentName?: string
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const updates: {
    status?: 'not_started' | 'in_progress' | 'done'
    estimatedHours?: number
    courseName?: string
    assignmentName?: string
  } = {}
  if (typeof body.status === 'string' && ['not_started', 'in_progress', 'done'].includes(body.status)) {
    updates.status = body.status
  }
  if (typeof body.estimatedHours === 'number' && body.estimatedHours >= 0) {
    updates.estimatedHours = body.estimatedHours
  }
  if (typeof body.courseName === 'string') {
    const c = body.courseName.trim()
    if (c) updates.courseName = c
  }
  if (typeof body.assignmentName === 'string') {
    const a = body.assignmentName.trim()
    if (a) updates.assignmentName = a
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid updates' }, { status: 400 })
  }
  const item = await updateHomework(user.userId, id, updates)
  if (!item) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json({ homework: item })
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
  const ok = await deleteHomework(user.userId, id)
  if (!ok) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json({ ok: true })
}
