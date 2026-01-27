'use client'

import { useRouter } from 'next/navigation'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import type { Todo } from '@/types'

interface TodoListProps {
  initialTodos: Todo[]
}

export function TodoList({ initialTodos }: TodoListProps) {
  const router = useRouter()

  const handleToggle = async (id: string, completed: boolean) => {
    try {
      await fetch(`/api/todos/${id}/toggle`, {
        method: 'PATCH',
      })
      router.refresh()
    } catch (error) {
      console.error('Toggle error:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个任务吗？')) {
      return
    }

    try {
      await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      })
      router.refresh()
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'LOW':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return '高'
      case 'MEDIUM':
        return '中'
      case 'LOW':
        return '低'
      default:
        return '未知'
    }
  }

  if (initialTodos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>还没有任务</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {initialTodos.map((todo) => (
        <Card
          key={todo.id}
          className={`p-4 ${
            todo.completed ? 'opacity-60' : ''
          }`}
        >
          <div className="flex items-start space-x-3">
            <Checkbox
              checked={todo.completed}
              onCheckedChange={() => handleToggle(todo.id, todo.completed)}
              className="mt-1"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3
                    className={`font-medium ${
                      todo.completed
                        ? 'line-through text-gray-500 dark:text-gray-400'
                        : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {todo.title}
                  </h3>

                  {todo.description && (
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {todo.description}
                    </p>
                  )}

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge className={getPriorityColor(todo.priority)}>
                      {getPriorityLabel(todo.priority)}
                    </Badge>

                    {todo.category && (
                      <Badge
                        style={{
                          backgroundColor: todo.category.color + '20',
                          color: todo.category.color,
                          border: `1px solid ${todo.category.color}`,
                        }}
                      >
                        {todo.category.name}
                      </Badge>
                    )}

                    {todo.dueDate && (
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="mr-1 h-3 w-3" />
                        {format(new Date(todo.dueDate), 'yyyy-MM-dd', {
                          locale: zhCN,
                        })}
                      </div>
                    )}

                    {todo.tags && todo.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {todo.tags.map((tt) => (
                          <Badge
                            key={tt.tagId}
                            variant="outline"
                            style={{
                              borderColor: tt.tag.color,
                              color: tt.tag.color,
                            }}
                          >
                            {tt.tag.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(todo.id)}
                  className="flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
