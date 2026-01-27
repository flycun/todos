import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // 创建示例用户
  const hashedPassword = await bcrypt.hash('password123', 10)

  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
      password: hashedPassword,
    },
  })

  console.log({ user })

  // 创建示例分类
  const workCategory = await prisma.category.create({
    data: {
      name: '工作',
      color: '#3B82F6',
      userId: user.id,
    },
  })

  const personalCategory = await prisma.category.create({
    data: {
      name: '个人',
      color: '#10B981',
      userId: user.id,
    },
  })

  console.log({ workCategory, personalCategory })

  // 创建示例标签
  const importantTag = await prisma.tag.create({
    data: {
      name: '重要',
      color: '#EF4444',
    },
  })

  const urgentTag = await prisma.tag.create({
    data: {
      name: '紧急',
      color: '#F59E0B',
    },
  })

  console.log({ importantTag, urgentTag })

  // 创建示例 Todos
  await prisma.todo.create({
    data: {
      title: '学习 Next.js 15',
      description: '深入学习 React Server Components 和 Server Actions',
      priority: 'HIGH',
      categoryId: workCategory.id,
      userId: user.id,
      tags: {
        create: [
          { tagId: importantTag.id },
          { tagId: urgentTag.id },
        ],
      },
    },
  })

  await prisma.todo.create({
    data: {
      title: '购买日用品',
      description: '牛奶、面包、鸡蛋',
      priority: 'MEDIUM',
      categoryId: personalCategory.id,
      userId: user.id,
      tags: {
        create: [{ tagId: urgentTag.id }],
      },
    },
  })

  await prisma.todo.create({
    data: {
      title: '回复邮件',
      priority: 'LOW',
      categoryId: workCategory.id,
      userId: user.id,
    },
  })

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
