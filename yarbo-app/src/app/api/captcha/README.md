# 验证码 API

## 概述
这个 API 提供了验证码的生成和验证功能，用于保护表单提交免受机器人攻击。

## 端点

### POST /api/captcha/generate
生成新的验证码会话

**响应：**
```json
{
  "sessionToken": "string",
  "captchaCode": "string",
  "expiresAt": "ISO 8601 date string"
}
```

### POST /api/captcha/verify
验证用户输入的验证码

**请求体：**
```json
{
  "sessionToken": "string",
  "captchaCode": "string"
}
```

**响应：**
```json
{
  "success": true,
  "message": "验证成功"
}
```

## 注意事项
- 验证码有效期为 5 分钟
- 每个验证码最多可尝试 3 次
- 生产环境建议使用 Redis 或数据库存储会话