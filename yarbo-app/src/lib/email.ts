/*
 * @Author: Allen
 * @Date: 2025-06-09 10:00:00
 * @LastEditors: Allen
 * @LastEditTime: 2025-06-09 10:00:00
 * @FilePath: /yarbo_招聘/yarbo-app/src/lib/email.ts
 * @Description: 邮件服务核心配置 (仅服务端)
 * 
 * Copyright (c) 2025 by Yarbo Inc., All Rights Reserved. 
 */

// 邮件配置接口
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// 邮件模板数据接口
export interface TemplateData {
  candidateName: string;
  jobTitle: string;
  companyName: string;
  applicationId: string;
  status?: string;
  nextSteps?: string;
  hrContactEmail?: string;
  hrContactName?: string;
  applicationDate?: string;
  interviewDate?: string;
  [key: string]: any;
}

// 邮件类型枚举
export enum EmailType {
  APPLICATION_RECEIVED = 'application_received',
  APPLICATION_UNDER_REVIEW = 'application_under_review',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  APPLICATION_ACCEPTED = 'application_accepted',
  APPLICATION_REJECTED = 'application_rejected',
  HR_NEW_APPLICATION = 'hr_new_application'
}

class EmailService {
  private transporter: any = null;
  private isServerSide = typeof window === 'undefined';

  constructor() {
    // 只在服务端初始化
    if (!this.isServerSide) {
      console.warn('EmailService 只能在服务端环境使用');
      return;
    }
    this.initializeTransporter();
  }

  private async initializeTransporter() {
    try {
      // 动态导入 nodemailer 和 handlebars，避免客户端错误
      const nodemailer = await import('nodemailer');

      const config: EmailConfig = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER || 'your-email@gmail.com',
          pass: process.env.SMTP_PASSWORD || 'your-app-password'
        }
      };

      this.transporter = nodemailer.default.createTransport(config);
    } catch (error) {
      console.error('邮件服务初始化失败:', error);
    }
  }

  // 验证邮件服务连接
  async verifyConnection(): Promise<boolean> {
    if (!this.isServerSide || !this.transporter) {
      console.error('邮件服务未正确初始化');
      return false;
    }

    try {
      await this.transporter.verify();
      console.log('✅ 邮件服务连接成功');
      return true;
    } catch (error) {
      console.error('❌ 邮件服务连接失败:', error);
      return false;
    }
  }

  // 发送邮件的核心方法
  async sendEmail(
    to: string,
    subject: string,
    htmlContent: string,
    textContent?: string
  ): Promise<boolean> {
    if (!this.isServerSide || !this.transporter) {
      console.error('邮件服务未正确初始化');
      return false;
    }

    try {
      const mailOptions = {
        from: `"Yarbo 招聘团队" <${process.env.SMTP_USER || 'noreply@yarbo.com'}>`,
        to,
        subject,
        text: textContent,
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ 邮件发送成功:', result.messageId);
      return true;
    } catch (error) {
      console.error('❌ 邮件发送失败:', error);
      return false;
    }
  }

  // 渲染邮件模板
  private async renderTemplate(templateName: string, data: TemplateData): Promise<string> {
    try {
      // 动态导入 Handlebars
      const Handlebars = await import('handlebars');

      const templates = {
        // 申请确认邮件模板
        application_received: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">📩 申请已收到</h1>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">亲爱的 <strong>{{candidateName}}</strong>，</p>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                感谢您申请我们的 <strong style="color: #4f46e5;">{{jobTitle}}</strong> 职位！我们已经收到您的申请，我们的HR团队将会在3个工作日内审核您的资料。
              </p>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1f2937; margin: 0 0 10px 0;">📋 申请信息</h3>
                <p style="margin: 5px 0; color: #6b7280;"><strong>职位：</strong> {{jobTitle}}</p>
                <p style="margin: 5px 0; color: #6b7280;"><strong>公司：</strong> {{companyName}}</p>
                <p style="margin: 5px 0; color: #6b7280;"><strong>申请编号：</strong> {{applicationId}}</p>
                <p style="margin: 5px 0; color: #6b7280;"><strong>申请时间：</strong> {{applicationDate}}</p>
              </div>
              
              <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
                <h4 style="color: #1e40af; margin: 0 0 8px 0;">🚀 下一步</h4>
                <p style="color: #1e40af; margin: 0; font-size: 14px;">我们会仔细审核您的申请材料，如果您符合我们的要求，我们会尽快联系您安排面试。请保持邮箱和电话畅通。</p>
              </div>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 0;">
                如有任何问题，请联系我们：<a href="mailto:{{hrContactEmail}}" style="color: #4f46e5;">{{hrContactEmail}}</a>
              </p>
            </div>
          </div>
        `,

        // 其他模板保持相同结构，为简洁只显示一个
        application_under_review: `<div>审核中邮件模板...</div>`,
        interview_scheduled: `<div>面试邀请邮件模板...</div>`,
        hr_new_application: `<div>HR通知邮件模板...</div>`,
        application_accepted: `<div>录用通知邮件模板...</div>`,
        application_rejected: `<div>拒绝通知邮件模板...</div>`
      };

      const template = templates[templateName as keyof typeof templates];
      if (!template) {
        throw new Error(`邮件模板 ${templateName} 不存在`);
      }

      const compiledTemplate = Handlebars.default.compile(template);
      return compiledTemplate(data);
    } catch (error) {
      console.error('模板渲染失败:', error);
      return `<div>邮件模板渲染失败: ${templateName}</div>`;
    }
  }

  // 发送特定类型的邮件
  async sendNotificationEmail(
    type: EmailType,
    to: string,
    data: TemplateData
  ): Promise<boolean> {
    if (!this.isServerSide) {
      console.error('邮件发送只能在服务端进行');
      return false;
    }

    try {
      const subjects = {
        [EmailType.APPLICATION_RECEIVED]: `申请已收到 - ${data.jobTitle} | Yarbo`,
        [EmailType.APPLICATION_UNDER_REVIEW]: `申请审核中 - ${data.jobTitle} | Yarbo`,
        [EmailType.INTERVIEW_SCHEDULED]: `面试邀请 - ${data.jobTitle} | Yarbo`,
        [EmailType.APPLICATION_ACCEPTED]: `申请通过 - ${data.jobTitle} | Yarbo`,
        [EmailType.APPLICATION_REJECTED]: `申请结果 - ${data.jobTitle} | Yarbo`,
        [EmailType.HR_NEW_APPLICATION]: `新申请待审核 - ${data.jobTitle} | Yarbo HR`
      };

      const subject = subjects[type];
      const htmlContent = await this.renderTemplate(type, data);

      return await this.sendEmail(to, subject, htmlContent);
    } catch (error) {
      console.error(`发送${type}邮件失败:`, error);
      return false;
    }
  }
}

// 导出邮件服务单例 (仅在服务端可用)
export const emailService = new EmailService();

// 便捷的邮件发送函数
export async function sendApplicationReceivedEmail(
  candidateEmail: string,
  data: TemplateData
): Promise<boolean> {
  return emailService.sendNotificationEmail(
    EmailType.APPLICATION_RECEIVED,
    candidateEmail,
    {
      ...data,
      companyName: 'Yarbo',
      hrContactEmail: 'hr@yarbo.com',
      hrContactName: 'Yarbo HR团队'
    }
  );
}

export async function sendHRNotificationEmail(
  hrEmail: string,
  data: TemplateData
): Promise<boolean> {
  return emailService.sendNotificationEmail(
    EmailType.HR_NEW_APPLICATION,
    hrEmail,
    data
  );
} 