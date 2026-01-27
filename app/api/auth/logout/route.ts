import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('next-auth.session-token')?.value

    if (sessionToken) {
      // 删除数据库中的 session
      await prisma.session.deleteMany({
        where: { sessionToken },
      })
    }

    const response = NextResponse.json({ success: true })

    // 清除 cookie
    response.cookies.delete('next-auth.session-token')

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: '登出失败' },
      { status: 500 }
    )
  }
}
