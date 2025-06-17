# 环境变量配置示例

创建 `.env.local` 文件并配置以下环境变量：

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Application URL
NEXT_PUBLIC_APP_URL=https://your-app-name.amplifyapp.com

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

## AWS Amplify 环境变量设置

在 AWS Amplify 控制台的环境变量部分添加上述变量（不包括注释）。 