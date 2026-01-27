import { getServerSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { TodoForm } from '@/components/todo/todo-form'
import { TodoList } from '@/components/todo/todo-list'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DashboardPage() {
  const session = await getServerSession()

  if (!session?.user) {
    redirect('/login')
  }

  // 获取用户的 todos
  const todos = await prisma.todo.findMany({
    where: {
      userId: session.user.id,
    },
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
    take: 10,
  })

  // 统计信息
  const totalTodos = await prisma.todo.count({
    where: { userId: session.user.id },
  })

  const completedTodos = await prisma.todo.count({
    where: {
      userId: session.user.id,
      completed: true,
    },
  })

  const pendingTodos = totalTodos - completedTodos

  return (
    <div className="space-y-8">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总任务</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTodos}</div>
            <p className="text-xs text-muted-foreground">所有待办事项</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已完成</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedTodos}</div>
            <p className="text-xs text-muted-foreground">
              {totalTodos > 0 ? `完成率 ${Math.round((completedTodos / totalTodos) * 100)}%` : '-'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待完成</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingTodos}</div>
            <p className="text-xs text-muted-foreground">需要完成的任务</p>
          </CardContent>
        </Card>
      </div>

      {/* 创建任务表单 */}
      <Card>
        <CardHeader>
          <CardTitle>创建新任务</CardTitle>
          <CardDescription>添加一个新的待办事项</CardDescription>
        </CardHeader>
        <CardContent>
          <TodoForm />
        </CardContent>
      </Card>

      {/* 最近任务列表 */}
      <Card>
        <CardHeader>
          <CardTitle>最近任务</CardTitle>
          <CardDescription>您最近创建的待办事项</CardDescription>
        </CardHeader>
        <CardContent>
          {todos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>还没有任务，创建一个吧！</p>
            </div>
          ) : (
            <TodoList initialTodos={todos} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
