/*
 * @Author: Allen
 * @Date: 2025-06-10 12:00:00
 * @LastEditors: Allen
 * @LastEditTime: 2025-06-10 12:00:00
 * @FilePath: /yarbo_招聘/yarbo-app/src/lib/email-client.ts
 * @Description: 客户端邮件服务函数
 * 
 * Copyright (c) 2025 by Yarbo Inc., All Rights Reserved. 
 */

// 邮件类型枚举
export enum EmailType {
  APPLICATION_RECEIVED = 'application_received',
  APPLICATION_UNDER_REVIEW = 'application_under_review',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  APPLICATION_ACCEPTED = 'application_accepted',
  APPLICATION_REJECTED = 'application_rejected',
  HR_NEW_APPLICATION = 'hr_new_application'
}

// 模板数据接口
export interface TemplateData {
  candidateName: string;
  jobTitle: string;
  companyName: string;
  applicationId: string;
  applicationDate?: string;
  status?: string;
  hrContactEmail?: string;
  hrContactName?: string;
  interviewDate?: string;
  interviewTime?: string;
  interviewLocation?: string;
  interviewLink?: string;
  rejectionReason?: string;
  nextSteps?: string;
  [key: string]: any;
}

/**
 * 发送申请确认邮件
 */
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

    const result = await response.json();
    
    if (!response.ok) {
      console.error('邮件发送失败:', result.error);
      return false;
    }

    return result.success;
  } catch (error) {
    console.error('发送申请确认邮件失败:', error);
    return false;
  }
}

/**
 * 发送状态更新邮件
 */
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

    const result = await response.json();
    
    if (!response.ok) {
      console.error('邮件发送失败:', result.error);
      return false;
    }

    return result.success;
  } catch (error) {
    console.error('发送状态更新邮件失败:', error);
    return false;
  }
}

/**
 * 发送HR通知邮件
 */
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

    const result = await response.json();
    
    if (!response.ok) {
      console.error('邮件发送失败:', result.error);
      return false;
    }

    return result.success;
  } catch (error) {
    console.error('发送HR通知邮件失败:', error);
    return false;
  }
}

/**
 * 验证邮件服务连接
 */
export async function verifyEmailService(): Promise<boolean> {
  try {
    const response = await fetch('/api/email/verify');
    const result = await response.json();
    
    return result.success && result.connected;
  } catch (error) {
    console.error('验证邮件服务失败:', error);
    return false;
  }
}
