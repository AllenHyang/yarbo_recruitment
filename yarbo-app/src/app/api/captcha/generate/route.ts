import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.***REMOVED***!
);

// 生成随机验证码
function generateCaptchaCode(): string {
  const chars = "ABCDEFGHIJKLMNPQRSTUVWXYZ23456789"; // 排除容易混淆的字符
  let result = "";
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

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

// 检查IP是否被限制
async function checkRateLimit(ipAddress: string): Promise<{ allowed: boolean; blockedUntil?: Date }> {
  const { data: rateLimit } = await supabase
    .from('captcha_rate_limits')
    .select('*')
    .eq('ip_address', ipAddress)
    .single();

  if (!rateLimit) {
    return { allowed: true };
  }

  const now = new Date();

  // 检查是否在封禁期内
  if (rateLimit.blocked_until && new Date(rateLimit.blocked_until) > now) {
    return {
      allowed: false,
      blockedUntil: new Date(rateLimit.blocked_until)
    };
  }

  // 检查1小时内的尝试次数 - 调整为更合理的限制
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  if (new Date(rateLimit.first_attempt_at) > oneHourAgo && rateLimit.attempt_count >= 50) {
    // 封禁30分钟
    const blockedUntil = new Date(now.getTime() + 30 * 60 * 1000);

    await supabase
      .from('captcha_rate_limits')
      .update({
        blocked_until: blockedUntil.toISOString(),
        updated_at: now.toISOString()
      })
      .eq('ip_address', ipAddress);

    return { allowed: false, blockedUntil };
  }

  return { allowed: true };
}

// 更新速率限制记录
async function updateRateLimit(ipAddress: string): Promise<void> {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const { data: existing } = await supabase
    .from('captcha_rate_limits')
    .select('*')
    .eq('ip_address', ipAddress)
    .single();

  if (!existing) {
    // 创建新记录
    await supabase
      .from('captcha_rate_limits')
      .insert({
        ip_address: ipAddress,
        attempt_count: 1,
        first_attempt_at: now.toISOString(),
        last_attempt_at: now.toISOString()
      });
  } else {
    // 更新现有记录
    const isNewHour = new Date(existing.first_attempt_at) < oneHourAgo;

    await supabase
      .from('captcha_rate_limits')
      .update({
        attempt_count: isNewHour ? 1 : existing.attempt_count + 1,
        first_attempt_at: isNewHour ? now.toISOString() : existing.first_attempt_at,
        last_attempt_at: now.toISOString(),
        updated_at: now.toISOString()
      })
      .eq('ip_address', ipAddress);
  }
}

export async function POST(request: NextRequest) {
  try {
    const ipAddress = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || '';

    // 检查速率限制
    const rateLimitCheck = await checkRateLimit(ipAddress);
    if (!rateLimitCheck.allowed) {
      const blockedMinutes = rateLimitCheck.blockedUntil
        ? Math.ceil((rateLimitCheck.blockedUntil.getTime() - Date.now()) / (1000 * 60))
        : 30;

      return NextResponse.json(
        {
          error: `请求过于频繁，请等待 ${blockedMinutes} 分钟后再试`,
          blockedUntil: rateLimitCheck.blockedUntil
        },
        { status: 429 }
      );
    }

    // 更新速率限制
    await updateRateLimit(ipAddress);

    // 清理过期的验证码会话
    await supabase.rpc('cleanup_expired_captcha_sessions');

    // 生成新的验证码会话
    const sessionToken = uuidv4();
    const captchaCode = generateCaptchaCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5分钟过期

    const { error } = await supabase
      .from('captcha_sessions')
      .insert({
        session_token: sessionToken,
        captcha_code: captchaCode,
        ip_address: ipAddress,
        user_agent: userAgent,
        expires_at: expiresAt.toISOString()
      });

    if (error) {
      console.error('创建验证码会话失败:', error);
      return NextResponse.json(
        { error: '生成验证码失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      sessionToken,
      captchaCode,
      expiresAt: expiresAt.toISOString()
    });

  } catch (error) {
    console.error('生成验证码API错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
