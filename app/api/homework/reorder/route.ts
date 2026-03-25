import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { findUserById, updateUserHomework } from '@/lib/users'

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  let body: { ids?: string[] }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const ids = body.ids
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'ids array required' }, { status: 400 })
  }
  const dbUser = await findUserById(user.userId)
  const list = dbUser?.homework ?? []
  if (ids.length !== list.length) {
    return NextResponse.json({ error: 'Invalid order' }, { status: 400 })
  }
  const idSet = new Set(list.map((h) => h.id))
  if (!ids.every((id) => idSet.has(id)) || new Set(ids).size !== ids.length) {
    return NextResponse.json({ error: 'Invalid order' }, { status: 400 })
  }
  const map = new Map(list.map((h) => [h.id, h]))
  const reordered = ids.map((id) => map.get(id)!)
  await updateUserHomework(user.userId, reordered)
  return NextResponse.json({ homework: reordered })
}
