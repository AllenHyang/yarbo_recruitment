import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { captchaStore } from '@/lib/captcha-store';

// 生成随机验证码
function generateCaptchaCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 去除容易混淆的字符
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST() {
  try {
    // 生成会话令牌
    const sessionToken = randomBytes(32).toString('hex');
    
    // 生成验证码
    const captchaCode = generateCaptchaCode();
    
    // 设置过期时间（5分钟）
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);
    
    // 存储会话
    captchaStore.set(sessionToken, {
      captchaCode,
      expiresAt,
      attempts: 0
    });
    
    return NextResponse.json({
      sessionToken,
      captchaCode,
      expiresAt: expiresAt.toISOString()
    });
  } catch (error) {
    console.error('生成验证码失败:', error);
    return NextResponse.json(
      { error: '生成验证码失败' },
      { status: 500 }
    );
  }
}