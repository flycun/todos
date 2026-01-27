import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { todoSchema } from '@/lib/validations/todo'

export async function GET(request: NextRequest) {
  const user = await requireAuth()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const completed = searchParams.get('completed')
  const categoryId = searchParams.get('categoryId')
  const priority = searchParams.get('priority')
  const search = searchParams.get('search')

  const where: any = {
    userId: user.id,
    ...(completed !== null && { completed: completed === 'true' }),
    ...(categoryId && { categoryId }),
    ...(priority && { priority: priority.toUpperCase() }),
    ...(search && {
      OR: [
        { title: { contains: search } },
        { description: { contains: search } },
      ],
    }),
  }

  const todos = await prisma.todo.findMany({
    where,
    include: {
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return NextResponse.json(todos)
}

export async function POST(request: NextRequest) {
  const user = await requireAuth()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()

    // 验证数据
    const validatedData = todoSchema.parse(body)

    // 创建 Todo
    const todo = await prisma.todo.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        priority: validatedData.priority.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH',
        dueDate: validatedData.dueDate,
        categoryId: validatedData.categoryId,
        userId: user.id,
        tags: validatedData.tagIds
          ? {
              create: validatedData.tagIds.map((tagId) => ({
                tagId,
              })),
            }
          : undefined,
      },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    })

    return NextResponse.json(todo, { status: 201 })
  } catch (error: any) {
    console.error('Create todo error:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: '输入数据格式错误' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '创建失败' },
      { status: 500 }
    )
  }
}
