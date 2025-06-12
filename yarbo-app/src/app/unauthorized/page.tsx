import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center px-4">
      <AlertTriangle className="w-16 h-16 text-yellow-500 mb-6" />
      <h1 className="text-3xl font-bold text-gray-900 mb-4">访问未授权</h1>
      <p className="text-gray-600 mb-8 max-w-md">
        抱歉，您没有权限访问此页面。请检查您的账户角色或联系管理员。
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/">返回首页</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/auth/login">重新登录</Link>
        </Button>
      </div>
    </div>
  );
} 