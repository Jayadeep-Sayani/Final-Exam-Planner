import * as admin from 'firebase-admin'

function getAdminApp() {
  if (admin.apps.length > 0) {
    return admin.app() as admin.app.App
  }
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Missing Firebase Admin env: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY'
    )
  }
  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  })
}

export function getAuth() {
  return getAdminApp().auth()
}

export function getFirestore() {
  return getAdminApp().firestore()
}

export async function verifyIdToken(token: string): Promise<{ uid: string; email?: string }> {
  const decoded = await getAuth().verifyIdToken(token)
  return {
    uid: decoded.uid,
    email: decoded.email ?? undefined,
  }
}
