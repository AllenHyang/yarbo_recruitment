# 使用 OpenNext 部署到 AWS Amplify

OpenNext 是一个开源适配器，可以将 Next.js 应用打包成适合在 AWS Lambda 上运行的格式。

## 安装步骤

1. 安装 OpenNext：
```bash
npm install --save-dev open-next
```

2. 更新 package.json：
```json
{
  "scripts": {
    "build": "next build",
    "build:amplify": "open-next build"
  }
}
```

3. 创建新的 amplify.yml：
```yaml
version: 1
applications:
  - appRoot: yarbo-app
    frontend:
      phases:
        preBuild:
          commands:
            - npm ci
        build:
          commands:
            - npx open-next@latest build
      artifacts:
        baseDirectory: .open-next
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
```

## 优势
- 更好的 Next.js 版本兼容性
- 社区支持和更新频繁
- 绕过 Amplify 的原生集成问题