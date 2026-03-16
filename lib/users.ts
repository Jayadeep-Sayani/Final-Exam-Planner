import { getFirestore } from '@/lib/firebase-admin'

const USERS_COLLECTION = 'users'

export type TopicRecord = {
  id: string
  label: string
  difficulty: 'hard' | 'medium' | 'easy'
}

export type ExamRecord = {
  id: string
  name: string
  examDate: string
  startStudyingDate: string
  bufferDays: number
  topics?: TopicRecord[]
}

export type HomeworkRecord = {
  id: string
  courseName: string
  assignmentName: string
  dueDate: string
  status: 'not_started' | 'in_progress' | 'done'
  estimatedHours?: number
}

export type PlannerScheduleItem = {
  id: string
  label: string
  done: boolean
}

export type PlannerSchedule = {
  date: string
  items: PlannerScheduleItem[]
}

export type User = {
  id: string
  email: string
  passwordHash: string
  createdAt: string
  exams?: ExamRecord[]
  homework?: HomeworkRecord[]
  plannerSchedule?: PlannerSchedule
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function docToUser(id: string, data: Record<string, unknown>): User {
  return {
    id,
    email: typeof data.email === 'string' ? data.email : '',
    passwordHash: '',
    createdAt: typeof data.createdAt === 'string' ? data.createdAt : new Date().toISOString(),
    exams: Array.isArray(data.exams) ? (data.exams as ExamRecord[]) : [],
    homework: Array.isArray(data.homework) ? (data.homework as HomeworkRecord[]) : [],
    plannerSchedule:
      data.plannerSchedule && typeof data.plannerSchedule === 'object' && data.plannerSchedule !== null
        ? (data.plannerSchedule as PlannerSchedule)
        : undefined,
  }
}

export async function ensureUserDoc(uid: string, email: string): Promise<void> {
  const db = getFirestore()
  const ref = db.collection(USERS_COLLECTION).doc(uid)
  const snap = await ref.get()
  if (snap.exists) return
  await ref.set({
    email: email.trim().toLowerCase(),
    createdAt: new Date().toISOString(),
    exams: [],
    homework: [],
    plannerSchedule: null,
  })
}

export async function findUserById(id: string): Promise<User | null> {
  const db = getFirestore()
  const snap = await db.collection(USERS_COLLECTION).doc(id).get()
  if (!snap.exists) return null
  return docToUser(snap.id, snap.data()!)
}

export async function updateUserExams(
  userId: string,
  exams: ExamRecord[]
): Promise<ExamRecord[]> {
  const db = getFirestore()
  await db.collection(USERS_COLLECTION).doc(userId).update({ exams })
  return exams
}

export async function updateExam(
  userId: string,
  examId: string,
  updates: Partial<Pick<ExamRecord, 'name' | 'examDate' | 'startStudyingDate' | 'bufferDays' | 'topics'>>
): Promise<ExamRecord | null> {
  const user = await findUserById(userId)
  if (!user) return null
  const exams = user.exams ?? []
  const ei = exams.findIndex((e) => e.id === examId)
  if (ei === -1) return null
  const exam = { ...exams[ei], ...updates }
  exams[ei] = exam
  await updateUserExams(userId, exams)
  return exam
}

export async function deleteExam(userId: string, examId: string): Promise<boolean> {
  const user = await findUserById(userId)
  if (!user) return false
  const exams = (user.exams ?? []).filter((e) => e.id !== examId)
  if (exams.length === (user.exams ?? []).length) return false
  await updateUserExams(userId, exams)
  return true
}

export async function getHomework(userId: string): Promise<HomeworkRecord[]> {
  const user = await findUserById(userId)
  return user?.homework ?? []
}

export async function updateUserHomework(
  userId: string,
  homework: HomeworkRecord[]
): Promise<HomeworkRecord[]> {
  const db = getFirestore()
  await db.collection(USERS_COLLECTION).doc(userId).update({ homework })
  return homework
}

export async function updateHomework(
  userId: string,
  homeworkId: string,
  updates: Partial<Pick<HomeworkRecord, 'status' | 'courseName' | 'assignmentName' | 'dueDate' | 'estimatedHours'>>
): Promise<HomeworkRecord | null> {
  const user = await findUserById(userId)
  if (!user) return null
  const list = user.homework ?? []
  const hi = list.findIndex((h) => h.id === homeworkId)
  if (hi === -1) return null
  const item = { ...list[hi], ...updates }
  list[hi] = item
  await updateUserHomework(userId, list)
  return item
}

export async function deleteHomework(userId: string, homeworkId: string): Promise<boolean> {
  const user = await findUserById(userId)
  if (!user) return false
  const list = (user.homework ?? []).filter((h) => h.id !== homeworkId)
  if (list.length === (user.homework ?? []).length) return false
  await updateUserHomework(userId, list)
  return true
}

export async function getPlannerSchedule(userId: string): Promise<PlannerSchedule | null> {
  const user = await findUserById(userId)
  const ps = user?.plannerSchedule
  return ps ?? null
}

export async function updatePlannerSchedule(
  userId: string,
  schedule: PlannerSchedule
): Promise<PlannerSchedule> {
  const db = getFirestore()
  await db.collection(USERS_COLLECTION).doc(userId).update({ plannerSchedule: schedule })
  return schedule
}
