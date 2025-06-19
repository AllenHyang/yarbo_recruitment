#!/bin/bash

echo "🎭 Playwright MCP 安装脚本"
echo "=========================="

# 1. 安装 Playwright MCP Server
echo "1. 安装 Playwright MCP Server..."
npm install -g @playwright/mcp

# 2. 检查安装
if command -v mcp-server-playwright &> /dev/null; then
    echo "✅ Playwright MCP Server 安装成功"
else
    echo "⚠️  使用 npx 方式..."
fi

# 3. 找到 Claude Desktop 配置文件
CONFIG_PATH="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
echo ""
echo "2. 配置 Claude Desktop..."
echo "配置文件位置: $CONFIG_PATH"

# 4. 检查配置文件是否存在
if [ ! -f "$CONFIG_PATH" ]; then
    echo "⚠️  配置文件不存在，创建新文件..."
    mkdir -p "$(dirname "$CONFIG_PATH")"
    echo '{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp"]
    }
  }
}' > "$CONFIG_PATH"
    echo "✅ 配置文件已创建"
else
    echo "📝 配置文件已存在"
    echo "当前内容："
    cat "$CONFIG_PATH"
    echo ""
    echo "请手动编辑配置文件，添加以下内容到 mcpServers 部分："
    echo '
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp"]
    }
'
fi

echo ""
echo "3. 下一步："
echo "   1) 如果配置文件已存在，请手动编辑添加 Playwright 配置"
echo "   2) 完全退出 Claude Desktop"
echo "   3) 重新启动 Claude Desktop"
echo "   4) 我就可以使用 Playwright 进行浏览器自动化测试了"
echo ""
echo "✅ 安装脚本完成！"