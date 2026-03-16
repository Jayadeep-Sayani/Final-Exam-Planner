import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import {
  getPlannerSchedule,
  updatePlannerSchedule,
  getHomework,
  findUserById,
  type PlannerSchedule,
  type PlannerScheduleItem,
} from '@/lib/users'

function todayServerDate(): string {
  return new Date().toISOString().slice(0, 10)
}

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const schedule = await getPlannerSchedule(user.userId)
  const today = todayServerDate()
  if (!schedule || schedule.date !== today) {
    return NextResponse.json({ schedule: null })
  }
  return NextResponse.json({ schedule })
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  let body: { itemId?: string; done?: boolean }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const itemId = body.itemId
  const done = body.done
  if (typeof itemId !== 'string' || typeof done !== 'boolean') {
    return NextResponse.json({ error: 'itemId and done required' }, { status: 400 })
  }
  const schedule = await getPlannerSchedule(user.userId)
  const today = todayServerDate()
  if (!schedule || schedule.date !== today) {
    return NextResponse.json({ error: 'No schedule for today' }, { status: 404 })
  }
  const item = schedule.items.find((i) => i.id === itemId)
  if (!item) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 })
  }
  item.done = done
  await updatePlannerSchedule(user.userId, schedule)
  return NextResponse.json({ schedule })
}
