/*
 * @Author: Allen
 * @Date: 2025-06-09 17:00:00
 * @LastEditors: Allen
 * @LastEditTime: 2025-06-09 17:00:00
 * @FilePath: /yarbo_招聘/yarbo-app/src/lib/notification.ts
 * @Description: 通知服务 - 状态更新邮件通知
 * 
 * Copyright (c) 2025 by Yarbo Inc., All Rights Reserved. 
 */

// 邮件发送参数
export interface EmailNotificationParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// 邮件发送结果
export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// 申请状态变更通知数据
export interface StatusChangeNotificationData {
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  oldStatus: string;
  newStatus: string;
  statusNote: string;
  companyName: string;
  hrName: string;
  applicationDate: string;
  applicationId: string;
}

// 状态文本映射
const statusTextMap: { [key: string]: string } = {
  'pending': '待处理',
  'reviewing': '审核中',
  'interview': '面试中',
  'hired': '已录用',
  'rejected': '已拒绝'
};

// 获取状态文本
export function getStatusText(status: string): string {
  return statusTextMap[status] || status;
}

// 获取状态颜色
export function getStatusColor(status: string): string {
  const colorMap: { [key: string]: string } = {
    'pending': '#f59e0b',
    'reviewing': '#3b82f6',
    'interview': '#8b5cf6',
    'hired': '#10b981',
    'rejected': '#ef4444'
  };
  return colorMap[status] || '#6b7280';
}

// 获取状态图标
export function getStatusIcon(status: string): string {
  const iconMap: { [key: string]: string } = {
    'pending': '⏳',
    'reviewing': '🔍',
    'interview': '💼',
    'hired': '🎉',
    'rejected': '📝'
  };
  return iconMap[status] || '📋';
}

// 生成状态变更邮件HTML
export function generateStatusChangeEmailHTML(data: StatusChangeNotificationData): string {
  const {
    candidateName,
    jobTitle,
    oldStatus,
    newStatus,
    statusNote,
    companyName,
    hrName,
    applicationDate,
    applicationId
  } = data;

  const oldStatusText = getStatusText(oldStatus);
  const newStatusText = getStatusText(newStatus);
  const newStatusColor = getStatusColor(newStatus);
  const statusIcon = getStatusIcon(newStatus);

  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>申请状态更新 - ${jobTitle}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .email-container {
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 16px;
        }
        .content {
            padding: 40px 30px;
        }
        .status-update {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
            border-left: 5px solid ${newStatusColor};
            position: relative;
        }
        .status-update::before {
            content: '${statusIcon}';
            position: absolute;
            top: -10px;
            right: 20px;
            font-size: 24px;
            background: white;
            padding: 8px;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .status-badge {
            display: inline-block;
            background-color: ${newStatusColor};
            color: white;
            padding: 8px 16px;
            border-radius: 25px;
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .job-info {
            background-color: #f1f5f9;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .job-info h3 {
            margin: 0 0 15px 0;
            color: #1e293b;
            font-size: 18px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            padding: 5px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .note-section {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .note-section h3 {
            margin: 0 0 10px 0;
            color: #92400e;
        }
        .footer {
            background-color: #f8fafc;
            padding: 30px;
            text-align: center;
            font-size: 14px;
            color: #6b7280;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
            transition: transform 0.2s;
        }
        .button:hover {
            transform: translateY(-2px);
        }
        .divider {
            height: 2px;
            background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
            margin: 30px 0;
        }
        .highlight {
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #3b82f6;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>📧 申请状态更新</h1>
            <p>您的求职申请状态已更新</p>
        </div>
        
        <div class="content">
            <p style="font-size: 18px; margin-bottom: 20px;">尊敬的 <strong>${candidateName}</strong>，</p>
            
            <p style="font-size: 16px; color: #4b5563;">您好！您在 <strong>${companyName}</strong> 申请的职位状态已更新。</p>
            
            <div class="job-info">
                <h3>📋 申请信息</h3>
                <div class="info-row">
                    <span><strong>职位名称：</strong></span>
                    <span>${jobTitle}</span>
                </div>
                <div class="info-row">
                    <span><strong>申请编号：</strong></span>
                    <span>#${applicationId}</span>
                </div>
                <div class="info-row">
                    <span><strong>申请日期：</strong></span>
                    <span>${applicationDate}</span>
                </div>
                <div class="info-row">
                    <span><strong>处理HR：</strong></span>
                    <span>${hrName}</span>
                </div>
            </div>
            
            <div class="status-update">
                <h3 style="margin: 0 0 15px 0; color: #1e293b;">🔄 状态变更</h3>
                <p style="margin: 10px 0;"><strong>原状态：</strong> ${oldStatusText}</p>
                <p style="margin: 10px 0;"><strong>新状态：</strong> <span class="status-badge">${newStatusText}</span></p>
            </div>
            
            ${statusNote ? `
            <div class="note-section">
                <h3>💬 HR备注</h3>
                <p style="margin: 0; color: #92400e; font-style: italic;">"${statusNote}"</p>
            </div>
            ` : ''}
            
            <div class="divider"></div>
            
            <div class="highlight">
                ${newStatus === 'interview' ? `
                <h3 style="color: #1e40af; margin: 0 0 10px 0;">🎉 恭喜您进入面试环节！</h3>
                <p style="margin: 0; color: #1e40af;">我们将很快与您联系安排面试时间。请保持电话畅通，并准备好相关材料。</p>
                ` : newStatus === 'hired' ? `
                <h3 style="color: #059669; margin: 0 0 10px 0;">🎉 恭喜您！申请成功！</h3>
                <p style="margin: 0; color: #059669;">您已成功通过我们的招聘流程。我们将很快与您联系办理入职手续。欢迎加入${companyName}！</p>
                ` : newStatus === 'rejected' ? `
                <h3 style="color: #dc2626; margin: 0 0 10px 0;">📝 申请结果通知</h3>
                <p style="margin: 0; color: #dc2626;">感谢您对我们公司的关注。虽然这次未能成功，但我们会保留您的简历，如有合适的机会会再次联系您。</p>
                ` : `
                <h3 style="color: #7c3aed; margin: 0 0 10px 0;">📋 申请处理中</h3>
                <p style="margin: 0; color: #7c3aed;">我们正在认真处理您的申请，请耐心等待后续通知。感谢您的理解！</p>
                `}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:3000/candidate/applications" class="button">查看申请详情</a>
            </div>
            
            <p style="color: #6b7280;">如有任何疑问，请随时联系我们。</p>
            
            <p style="margin-top: 30px;">祝好！<br>
            <strong>${companyName} 人力资源部</strong><br>
            <span style="color: #6b7280; font-size: 14px;">${hrName}</span></p>
        </div>
        
        <div class="footer">
            <p><strong>此邮件由 ${companyName} 招聘系统自动发送，请勿直接回复。</strong></p>
            <p style="margin: 10px 0;">© 2024 ${companyName}. All rights reserved.</p>
            <p style="font-size: 12px; color: #9ca3af;">如需取消订阅，请联系 hr@yarbo.com</p>
        </div>
    </div>
</body>
</html>`;
}

// 生成状态变更邮件纯文本版本
export function generateStatusChangeEmailText(data: StatusChangeNotificationData): string {
  const {
    candidateName,
    jobTitle,
    oldStatus,
    newStatus,
    statusNote,
    companyName,
    hrName,
    applicationDate,
    applicationId
  } = data;

  const oldStatusText = getStatusText(oldStatus);
  const newStatusText = getStatusText(newStatus);

  return `
尊敬的 ${candidateName}，

您好！您在 ${companyName} 申请的职位状态已更新。

申请信息：
- 职位名称：${jobTitle}
- 申请编号：#${applicationId}
- 申请日期：${applicationDate}
- 处理HR：${hrName}

状态变更：
- 原状态：${oldStatusText}
- 新状态：${newStatusText}

${statusNote ? `HR备注：${statusNote}` : ''}

${newStatus === 'interview' ? '🎉 恭喜您进入面试环节！我们将很快与您联系安排面试时间。' :
    newStatus === 'hired' ? '🎉 恭喜您！您已成功通过我们的招聘流程。欢迎加入' + companyName + '！' :
    newStatus === 'rejected' ? '感谢您对我们公司的关注。虽然这次未能成功，但我们会保留您的简历。' :
    '我们正在认真处理您的申请，请耐心等待后续通知。'}

查看申请详情：http://localhost:3000/candidate/applications

如有任何疑问，请随时联系我们。

祝好！
${companyName} 人力资源部
${hrName}

此邮件由 ${companyName} 招聘系统自动发送，请勿直接回复。
`;
}

// 模拟邮件发送服务
export async function sendEmailNotification(params: EmailNotificationParams): Promise<EmailResult> {
  const { to, subject, html, text } = params;

  try {
    // 在开发环境中模拟邮件发送
    console.log('\n📧 ===== 邮件发送模拟 =====');
    console.log('📬 收件人:', to);
    console.log('📝 主题:', subject);
    console.log('📄 内容预览:', text?.substring(0, 150) + '...');
    console.log('🕒 发送时间:', new Date().toLocaleString('zh-CN'));
    console.log('========================\n');

    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 800));

    // 生成模拟的消息ID
    const messageId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      success: true,
      messageId
    };

  } catch (error) {
    console.error('❌ 邮件发送失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '邮件发送失败'
    };
  }
}

// 发送状态变更通知邮件
export async function sendStatusChangeNotification(data: StatusChangeNotificationData): Promise<EmailResult> {
  const subject = `申请状态更新 - ${data.jobTitle} | ${data.companyName}`;
  const html = generateStatusChangeEmailHTML(data);
  const text = generateStatusChangeEmailText(data);
  
  return await sendEmailNotification({
    to: data.candidateEmail,
    subject,
    html,
    text
  });
}
