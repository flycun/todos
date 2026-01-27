import { z } from 'zod'

export const todoSchema = z.object({
  title: z.string()
    .min(1, '标题不能为空')
    .max(200, '标题最多200个字符')
    .trim(),
  description: z.string()
    .max(1000, '描述最多1000个字符')
    .optional(),
  priority: z.enum(['low', 'medium', 'high'], {
    errorMap: () => ({ message: '无效的优先级' })
  }),
  dueDate: z.coerce.date().optional(),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
})

export type TodoFormData = z.infer<typeof todoSchema>

export const todoFilterSchema = z.object({
  search: z.string().optional(),
  completed: z.boolean().optional(),
  categoryId: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
})

export type TodoFilters = z.infer<typeof todoFilterSchema>
