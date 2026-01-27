'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { todoSchema, type TodoFormData } from '@/lib/validations/todo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

export function TodoForm() {
  const router = useRouter()
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TodoFormData>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      priority: 'medium',
    },
  })

  const onSubmit = async (data: TodoFormData) => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || '创建失败')
        setIsLoading(false)
        return
      }

      reset()
      router.refresh()
      setIsLoading(false)
    } catch (err) {
      setError('发生错误，请稍后重试')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="title">标题 *</Label>
          <Input
            id="title"
            placeholder="要做什么？"
            {...register('title')}
          />
          {errors.title && (
            <p className="text-sm text-red-500 dark:text-red-400">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">描述</Label>
          <Textarea
            id="description"
            placeholder="添加更多细节..."
            rows={3}
            {...register('description')}
          />
          {errors.description && (
            <p className="text-sm text-red-500 dark:text-red-400">{errors.description.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">优先级</Label>
          <select
            id="priority"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            {...register('priority')}
          >
            <option value="low">低</option>
            <option value="medium">中</option>
            <option value="high">高</option>
          </select>
          {errors.priority && (
            <p className="text-sm text-red-500 dark:text-red-400">{errors.priority.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueDate">截止日期</Label>
          <Input
            id="dueDate"
            type="date"
            {...register('dueDate')}
          />
          {errors.dueDate && (
            <p className="text-sm text-red-500 dark:text-red-400">{errors.dueDate.message}</p>
          )}
        </div>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        创建任务
      </Button>
    </form>
  )
}
