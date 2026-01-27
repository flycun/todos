import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">登录</CardTitle>
        <CardDescription className="text-center">
          输入您的账号信息以登录
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
        <div className="mt-4 text-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            还没有账号？{" "}
          </span>
          <Link href="/register" className="text-primary hover:underline font-medium">
            立即注册
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
