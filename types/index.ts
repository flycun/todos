export type { TodoFormData, TodoFilters } from '@/lib/validations/todo'
export type { LoginFormData, RegisterFormData } from '@/lib/validations/auth'
export type { CategoryFormData } from '@/lib/validations/category'

export interface Todo {
  id: string
  title: string
  description: string | null
  completed: boolean
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  dueDate: Date | null
  userId: string
  categoryId: string | null
  createdAt: Date
  updatedAt: Date
  category: Category | null
  tags: TodoTag[]
}

export interface Category {
  id: string
  name: string
  color: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface Tag {
  id: string
  name: string
  color: string
  createdAt: Date
  updatedAt: Date
}

export interface TodoTag {
  todoId: string
  tagId: string
  tag: Tag
}

export interface User {
  id: string
  name: string | null
  email: string
  image: string | null
  createdAt: Date
  updatedAt: Date
}
