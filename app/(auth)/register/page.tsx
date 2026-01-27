import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RegisterForm } from "@/components/auth/register-form"

export default function RegisterPage() {
  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">注册</CardTitle>
        <CardDescription className="text-center">
          创建一个新账号
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
        <div className="mt-4 text-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            已有账号？{" "}
          </span>
          <Link href="/login" className="text-primary hover:underline font-medium">
            立即登录
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
