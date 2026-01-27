import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function getServerSession() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('next-auth.session-token')?.value

  if (!sessionToken) {
    return null
  }

  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  })

  if (!session || session.expires < new Date()) {
    return null
  }

  return {
    user: session.user,
    expires: session.expires,
  }
}

export async function requireAuth() {
  const session = await getServerSession()

  if (!session?.user) {
    return null
  }

  return session.user
}
