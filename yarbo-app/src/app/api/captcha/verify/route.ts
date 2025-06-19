import { NextResponse } from 'next/server';
import { captchaStore } from '@/lib/captcha-store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionToken, captchaCode } = body;
    
    // 验证参数
    if (!sessionToken || !captchaCode) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }
    
    // 获取会话
    const session = captchaStore.get(sessionToken);
    
    if (!session) {
      return NextResponse.json(
        { error: '验证码已过期或无效' },
        { status: 400 }
      );
    }
    
    // 检查是否过期
    if (session.expiresAt < new Date()) {
      captchaStore.delete(sessionToken);
      return NextResponse.json(
        { error: '验证码已过期' },
        { status: 400 }
      );
    }
    
    // 检查尝试次数
    if (session.attempts >= 3) {
      captchaStore.delete(sessionToken);
      return NextResponse.json(
        { error: '尝试次数过多，请重新获取验证码' },
        { status: 400 }
      );
    }
    
    // 增加尝试次数
    session.attempts++;
    
    // 验证验证码（不区分大小写）
    if (session.captchaCode.toUpperCase() !== captchaCode.toUpperCase()) {
      return NextResponse.json(
        { error: '验证码错误' },
        { status: 400 }
      );
    }
    
    // 验证成功，删除会话
    captchaStore.delete(sessionToken);
    
    return NextResponse.json({
      success: true,
      message: '验证成功'
    });
  } catch (error) {
    console.error('验证验证码失败:', error);
    return NextResponse.json(
      { error: '验证失败' },
      { status: 500 }
    );
  }
}