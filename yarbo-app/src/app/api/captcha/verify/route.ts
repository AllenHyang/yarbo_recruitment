import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.***REMOVED***!
);

// 获取客户端IP地址
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return '127.0.0.1';
}

export async function POST(request: NextRequest) {
  try {
    const { sessionToken, captchaCode } = await request.json();

    if (!sessionToken || !captchaCode) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const ipAddress = getClientIP(request);

    // 查找验证码会话
    const { data: session, error: sessionError } = await supabase
      .from('captcha_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: '无效的验证码会话' },
        { status: 400 }
      );
    }

    // 检查会话是否过期
    if (new Date(session.expires_at) < new Date()) {
      // 删除过期会话
      await supabase
        .from('captcha_sessions')
        .delete()
        .eq('session_token', sessionToken);

      return NextResponse.json(
        { error: '验证码已过期，请重新获取' },
        { status: 400 }
      );
    }

    // 检查IP地址是否匹配（可选的安全检查）
    if (session.ip_address !== ipAddress) {
      return NextResponse.json(
        { error: '验证码会话无效' },
        { status: 400 }
      );
    }

    // 检查是否已经验证过
    if (session.is_verified) {
      // 如果是检查会话有效性的请求，返回成功
      if (captchaCode === 'VERIFY_ONLY') {
        return NextResponse.json({
          success: true,
          message: '验证码会话有效'
        });
      }

      return NextResponse.json(
        { error: '验证码已被使用' },
        { status: 400 }
      );
    }

    // 增加尝试次数
    const newAttemptCount = session.attempt_count + 1;

    // 检查尝试次数限制
    if (newAttemptCount > 5) {
      // 删除会话，防止继续尝试
      await supabase
        .from('captcha_sessions')
        .delete()
        .eq('session_token', sessionToken);

      return NextResponse.json(
        { error: '验证码尝试次数过多，请重新获取' },
        { status: 400 }
      );
    }

    // 验证验证码（不区分大小写）
    const isValid = captchaCode.toUpperCase() === session.captcha_code.toUpperCase();

    if (isValid) {
      // 验证成功，标记为已验证
      await supabase
        .from('captcha_sessions')
        .update({
          is_verified: true,
          attempt_count: newAttemptCount,
          updated_at: new Date().toISOString()
        })
        .eq('session_token', sessionToken);

      return NextResponse.json({
        success: true,
        message: '验证码验证成功'
      });
    } else {
      // 验证失败，更新尝试次数
      await supabase
        .from('captcha_sessions')
        .update({
          attempt_count: newAttemptCount,
          updated_at: new Date().toISOString()
        })
        .eq('session_token', sessionToken);

      return NextResponse.json(
        {
          error: '验证码错误',
          remainingAttempts: 5 - newAttemptCount
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('验证验证码API错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
