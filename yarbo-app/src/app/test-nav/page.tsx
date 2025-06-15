"use client";

import { useAuth } from "@/contexts/AuthContext";

export default function TestNavPage() {
  const { user, userRole } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">导航栏测试页面</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">用户信息</h2>
          <p>用户: {user?.email || '未登录'}</p>
          <p>角色: {userRole || '无'}</p>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold">导航栏修复说明</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>✅ 移除了重复的通知按钮</li>
            <li>✅ 保留了统一的通知中心</li>
            <li>✅ 通知中心现在包含消息提醒</li>
            <li>✅ 通知徽章显示总的未读数量（通知 + 消息）</li>
          </ul>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold">测试步骤</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>检查导航栏右侧是否只有一个通知按钮</li>
            <li>点击通知按钮查看通知中心</li>
            <li>如果有未读消息，应该在通知中心顶部显示消息提醒</li>
            <li>点击"查看消息"按钮应该跳转到消息页面</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
