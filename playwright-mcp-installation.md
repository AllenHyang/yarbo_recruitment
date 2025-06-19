# Playwright MCP 安装指南

## 1. 安装 Playwright MCP Server

首先，在终端中运行以下命令安装 Playwright MCP：

```bash
# 使用 npm 全局安装
npm install -g @modelcontextprotocol/server-playwright

# 或者使用 npx（推荐）
npx @modelcontextprotocol/server-playwright
```

## 2. 找到 Claude Desktop 配置文件

Claude Desktop 的配置文件位置：
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

## 3. 编辑配置文件

在配置文件中添加 Playwright MCP server：

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-playwright"]
    }
  }
}
```

如果您已经有其他 MCP servers（比如 zen），配置应该像这样：

```json
{
  "mcpServers": {
    "zen": {
      // 您现有的 zen 配置
    },
    "playwright": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-playwright"]
    }
  }
}
```

## 4. 重启 Claude Desktop

完全退出并重新启动 Claude Desktop 应用程序。

## 5. 验证安装

重启后，我应该能够使用 Playwright MCP 工具，包括：
- `playwright_navigate` - 导航到网页
- `playwright_screenshot` - 截取屏幕截图
- `playwright_click` - 点击元素
- `playwright_fill` - 填写表单
- `playwright_evaluate` - 执行 JavaScript
- 等等

## 常见问题

### 如果安装失败
1. 确保 Node.js 已安装（版本 16 或更高）
2. 确保 npm 可以访问网络
3. 尝试使用管理员权限运行安装命令

### 如果 Claude 无法识别
1. 检查配置文件 JSON 格式是否正确
2. 确保路径中没有特殊字符
3. 查看 Claude Desktop 的日志文件

## 测试 Playwright MCP

安装成功后，我将能够执行如下操作：
```
- 打开浏览器访问您的网站
- 自动点击职位卡片
- 验证职位详情页内容
- 截取页面截图
- 执行完整的自动化测试
```