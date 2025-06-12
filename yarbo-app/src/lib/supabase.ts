import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.***REMOVED***!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // 启用会话持久化
    autoRefreshToken: true, // 自动刷新token
    detectSessionInUrl: true // 检测URL中的会话信息
  },
})

// 工具函数：根据部门名称获取颜色主题
export function getDepartmentColorTheme(department: string): string {
  if (department.includes("产品")) return "green";
  if (department.includes("研发") || department.includes("系统")) return "blue";
  if (department.includes("质量")) return "purple";
  if (department.includes("数据")) return "orange";
  return "blue";
}

// 工具函数：根据颜色主题获取CSS类
export function getDepartmentColor(colorTheme: string) {
  const colorMap = {
    green: {
      color: "text-green-600",
      bgColor: "bg-green-50",
      badge: "bg-green-100 text-green-800",
      accent: "border-green-200"
    },
    blue: {
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      badge: "bg-blue-100 text-blue-800",
      accent: "border-blue-200"
    },
    purple: {
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      badge: "bg-purple-100 text-purple-800",
      accent: "border-purple-200"
    },
    orange: {
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      badge: "bg-orange-100 text-orange-800",
      accent: "border-orange-200"
    }
  };
  
  return colorMap[colorTheme as keyof typeof colorMap] || colorMap.blue;
} 