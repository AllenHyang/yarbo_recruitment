import { NextRequest, NextResponse } from 'next/server';
import { emailService, EmailType, TemplateData } from '@/lib/email';

// POST /api/email - 发送邮件
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, to, data } = body;

    // 验证必要参数
    if (!type || !to || !data) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数: type, to, data' },
        { status: 400 }
      );
    }

    // 验证邮件类型
    if (!Object.values(EmailType).includes(type)) {
      return NextResponse.json(
        { success: false, error: '无效的邮件类型' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { success: false, error: '无效的邮箱地址' },
        { status: 400 }
      );
    }

    // 发送邮件
    const success = await emailService.sendNotificationEmail(type, to, data);

    if (success) {
      return NextResponse.json({
        success: true,
        message: '邮件发送成功'
      });
    } else {
      return NextResponse.json(
        { success: false, error: '邮件发送失败' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('邮件API错误:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

// GET /api/email/verify - 验证邮件服务连接
export async function GET() {
  try {
    const isConnected = await emailService.verifyConnection();
    
    return NextResponse.json({
      success: true,
      connected: isConnected,
      message: isConnected ? '邮件服务连接正常' : '邮件服务连接失败'
    });

  } catch (error) {
    console.error('邮件服务验证错误:', error);
    return NextResponse.json(
      { success: false, error: '验证邮件服务时发生错误' },
      { status: 500 }
    );
  }
}

// 便捷的邮件发送函数
export async function sendApplicationEmail(
  applicantEmail: string,
  applicantName: string,
  jobTitle: string,
  applicationId: string
): Promise<boolean> {
  try {
    const templateData: TemplateData = {
      candidateName: applicantName,
      jobTitle,
      companyName: 'Yarbo Inc.',
      applicationId,
      applicationDate: new Date().toLocaleDateString('zh-CN'),
      hrContactEmail: 'hr@yarbo.com',
      hrContactName: 'Yarbo HR团队'
    };

    const response = await fetch('/api/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: EmailType.APPLICATION_RECEIVED,
        to: applicantEmail,
        data: templateData
      })
    });

    return response.ok;
  } catch (error) {
    console.error('发送申请确认邮件失败:', error);
    return false;
  }
}

export async function sendStatusUpdateEmail(
  applicantEmail: string,
  applicantName: string,
  jobTitle: string,
  applicationId: string,
  status: string,
  additionalData?: Partial<TemplateData>
): Promise<boolean> {
  try {
    const emailTypeMap = {
      'reviewing': EmailType.APPLICATION_UNDER_REVIEW,
      'interview_scheduled': EmailType.INTERVIEW_SCHEDULED,
      'hired': EmailType.APPLICATION_ACCEPTED,
      'rejected': EmailType.APPLICATION_REJECTED
    };

    const emailType = emailTypeMap[status as keyof typeof emailTypeMap];
    if (!emailType) {
      console.warn(`未知的申请状态: ${status}`);
      return false;
    }

    const templateData: TemplateData = {
      candidateName: applicantName,
      jobTitle,
      companyName: 'Yarbo Inc.',
      applicationId,
      status,
      hrContactEmail: 'hr@yarbo.com',
      hrContactName: 'Yarbo HR团队',
      ...additionalData
    };

    const response = await fetch('/api/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: emailType,
        to: applicantEmail,
        data: templateData
      })
    });

    return response.ok;
  } catch (error) {
    console.error('发送状态更新邮件失败:', error);
    return false;
  }
}

export async function sendHRNotificationEmail(
  hrEmail: string,
  applicantName: string,
  jobTitle: string,
  applicationId: string
): Promise<boolean> {
  try {
    const templateData: TemplateData = {
      candidateName: applicantName,
      jobTitle,
      companyName: 'Yarbo Inc.',
      applicationId,
      applicationDate: new Date().toLocaleDateString('zh-CN')
    };

    const response = await fetch('/api/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: EmailType.HR_NEW_APPLICATION,
        to: hrEmail,
        data: templateData
      })
    });

    return response.ok;
  } catch (error) {
    console.error('发送HR通知邮件失败:', error);
    return false;
  }
}
