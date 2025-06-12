export default function TestPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold">测试页面</h1>
      <p className="text-gray-600 mt-4">如果您能看到这个页面，说明项目运行正常！</p>
      <div className="mt-8 space-y-4">
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h2 className="font-semibold text-green-800">✅ 项目状态：正常运行</h2>
          <p className="text-green-700 mt-2">所有核心文件已创建完成</p>
        </div>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="font-semibold text-blue-800">📋 已完成功能</h2>
          <ul className="text-blue-700 mt-2 space-y-1">
            <li>• 用户认证系统（登录/注册）</li>
            <li>• 权限保护路由</li>
            <li>• HR管理后台</li>
            <li>• 所有必要的UI组件</li>
            <li>• 导航系统</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 