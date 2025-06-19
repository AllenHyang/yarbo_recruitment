# 降级到 Next.js 14 指南

## 步骤

1. 修改 package.json：
```bash
npm uninstall next react react-dom
npm install next@14.2.22 react@18.3.1 react-dom@18.3.1
```

2. 检查并更新依赖：
```bash
# 更新 Next.js 相关类型
npm install --save-dev @types/react@18 @types/react-dom@18
```

3. 验证 next.config.ts 兼容性（通常不需要修改）

4. 重新构建：
```bash
npm run build
```

## 注意事项

- Next.js 14.2.x 是最新的稳定版本
- React 18 与 Next.js 14 完全兼容
- 不会影响现有功能

## AWS Amplify 配置

使用以下 amplify.yml：

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
            - npm run build
      artifacts:
        baseDirectory: .next
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
          - .next/cache/**/*
```