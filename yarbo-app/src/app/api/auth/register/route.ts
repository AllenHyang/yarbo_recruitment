import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullName, role = 'candidate' } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json({
        success: false,
        error: '邮箱、密码和姓名不能为空'
      }, { status: 400 });
    }

    // 调用 Supabase 注册
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role
        }
      }
    });

    if (error) {
      return NextResponse.json({
        success: false,
        error: '注册失败',
        details: error.message
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: '注册成功，请检查邮箱验证链接',
      data: {
        user: data.user,
        session: data.session
      },
      runtime: 'Next.js API Routes - 认证服务'
    }, { status: 201 });

  } catch (error) {
    console.error('注册错误:', error);
    return NextResponse.json({
      success: false,
      error: '服务器内部错误',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
} 