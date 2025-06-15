'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToastActions } from '@/components/ui/toast'

export default function TestApplyPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const toast = useToastActions()

  const handleTestSubmit = async () => {
    setIsSubmitting(true)
    setResult(null)

    try {
      // 创建一个测试文件
      const testFileContent = 'This is a test resume file content'
      const testFile = new File([testFileContent], 'test-resume.txt', { type: 'text/plain' })

      // 转换为base64
      const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.readAsDataURL(file)
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = error => reject(error)
        })
      }

      const base64Data = await fileToBase64(testFile)

      const response = await fetch('/api/applications/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: 'b331caed-3f65-4d4f-8b92-f94e64ba357c', // 使用真实的jobId (高级前端工程师)
          applicantInfo: {
            name: '测试用户',
            email: `test${Date.now()}@example.com`, // 使用时间戳确保邮箱唯一
            phone: '13800138000',
          },
          resumeFile: {
            name: testFile.name,
            size: testFile.size,
            type: testFile.type,
            data: base64Data
          }
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '提交失败')
      }

      setResult(data)
      toast.success('测试申请提交成功！')

    } catch (error) {
      console.error('测试失败:', error)
      toast.error(error instanceof Error ? error.message : '测试失败')
      setResult({ error: error instanceof Error ? error.message : '测试失败' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>申请提交功能测试</CardTitle>
          <CardDescription>
            测试新的申请提交API，包括自动用户注册和职位关联功能
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>测试说明</Label>
              <p className="text-sm text-gray-600 mt-1">
                点击下面的按钮将会：
              </p>
              <ul className="text-sm text-gray-600 mt-2 list-disc list-inside space-y-1">
                <li>创建一个随机邮箱的测试用户</li>
                <li>自动注册用户账户（candidate角色）</li>
                <li>创建申请者记录</li>
                <li>上传测试简历文件</li>
                <li>创建申请记录并关联到职位</li>
              </ul>
            </div>

            <Button
              onClick={handleTestSubmit}
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? '提交中...' : '开始测试申请提交'}
            </Button>
          </div>

          {result && (
            <div className="mt-6">
              <Label>测试结果</Label>
              <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          )}

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">功能特性</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-green-700">✅ 已实现</h4>
                <ul className="text-sm space-y-1">
                  <li>• 自动用户注册</li>
                  <li>• 申请者记录创建</li>
                  <li>• 简历文件上传</li>
                  <li>• 申请记录创建</li>
                  <li>• 职位关联</li>
                  <li>• 错误处理</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-blue-700">🔄 流程说明</h4>
                <ul className="text-sm space-y-1">
                  <li>1. 检查用户是否存在</li>
                  <li>2. 不存在则自动注册</li>
                  <li>3. 创建/更新申请者记录</li>
                  <li>4. 上传简历到Storage</li>
                  <li>5. 创建申请记录</li>
                  <li>6. 关联职位和申请者</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
