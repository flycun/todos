import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string()
    .min(1, '请输入邮箱')
    .email('请输入有效的邮箱地址'),
  password: z.string()
    .min(1, '请输入密码')
    .min(6, '密码至少6个字符'),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  name: z.string()
    .min(1, '请输入用户名')
    .min(2, '用户名至少2个字符')
    .max(50, '用户名最多50个字符'),
  email: z.string()
    .min(1, '请输入邮箱')
    .email('请输入有效的邮箱地址'),
  password: z.string()
    .min(1, '请输入密码')
    .min(6, '密码至少6个字符')
    .max(100, '密码最多100个字符'),
  confirmPassword: z.string()
    .min(1, '请确认密码'),
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'],
})

export type RegisterFormData = z.infer<typeof registerSchema>
