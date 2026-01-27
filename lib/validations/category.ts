import { z } from 'zod'

export const categorySchema = z.object({
  name: z.string()
    .min(1, '分类名称不能为空')
    .min(2, '分类名称至少2个字符')
    .max(50, '分类名称最多50个字符')
    .trim(),
  color: z.string()
    .regex(/^#[0-9A-F]{6}$/i, '请输入有效的颜色代码（如 #3B82F6）')
    .default('#3B82F6'),
})

export type CategoryFormData = z.infer<typeof categorySchema>
