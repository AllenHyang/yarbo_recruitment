import { NextRequest, NextResponse } from 'next/server';

interface NotificationTemplate {
  id: string;
  name: string;
  type: string;
  subject: string;
  content: string;
  variables: string[];
  usage: number;
  created: string;
  updated: string;
  isActive: boolean;
  userId?: string;
}

// 模拟通知模板数据
const mockTemplates: NotificationTemplate[] = [
  {
    id: 'template_1',
    name: '面试邀请模板',
    type: '面试通知',
    subject: '面试邀请 - {{position}} 职位',
    content: `亲爱的 {{candidateName}}，

感谢您申请我们公司的 {{position}} 职位。经过初步筛选，我们很高兴邀请您参加面试。

面试详情：
- 时间：{{interviewTime}}
- 地点：{{interviewLocation}}
- 面试官：{{interviewer}}
- 联系电话：{{phone}}

请提前10分钟到达，并携带相关证件。

期待与您见面！

{{companyName}} 人力资源部`,
    variables: ['candidateName', 'position', 'interviewTime', 'interviewLocation', 'interviewer', 'phone', 'companyName'],
    usage: 25,
    created: '2025-05-01T10:00:00Z',
    updated: '2025-06-01T15:30:00Z',
    isActive: true,
    userId: 'user_1'
  },
  {
    id: 'template_2',
    name: '申请确认模板',
    type: '申请通知',
    subject: '收到您的申请 - {{position}} 职位',
    content: `亲爱的 {{candidateName}}，

感谢您申请我们公司的 {{position}} 职位。我们已收到您的申请材料。

我们将在 {{reviewDays}} 个工作日内完成初步筛选，并通过邮件或电话与您联系。

如有任何疑问，请随时联系我们：
- 邮箱：{{hrEmail}}
- 电话：{{hrPhone}}

再次感谢您对我们公司的关注！

{{companyName}} 人力资源部`,
    variables: ['candidateName', 'position', 'reviewDays', 'hrEmail', 'hrPhone', 'companyName'],
    usage: 18,
    created: '2025-05-01T10:00:00Z',
    updated: '2025-05-15T12:00:00Z',
    isActive: true,
    userId: 'user_1'
  },
  {
    id: 'template_3',
    name: '入职通知模板',
    type: '录用通知',
    subject: '恭喜！您已被录用 - {{position}} 职位',
    content: `亲爱的 {{candidateName}}，

恭喜您成功通过面试！我们很高兴地通知您，您已被录用为我们公司的 {{position}}。

入职详情：
- 入职日期：{{startDate}}
- 报到时间：{{reportTime}}
- 报到地点：{{reportLocation}}
- 联系人：{{hrContact}}

请在入职前准备以下材料：
{{requiredDocuments}}

我们期待您的加入，共同创造美好的未来！

{{companyName}} 人力资源部`,
    variables: ['candidateName', 'position', 'startDate', 'reportTime', 'reportLocation', 'hrContact', 'requiredDocuments', 'companyName'],
    usage: 12,
    created: '2025-05-01T10:00:00Z',
    updated: '2025-05-20T16:45:00Z',
    isActive: true,
    userId: 'user_1'
  },
  {
    id: 'template_4',
    name: '拒绝通知模板',
    type: '申请通知',
    subject: '关于您的申请 - {{position}} 职位',
    content: `亲爱的 {{candidateName}}，

感谢您申请我们公司的 {{position}} 职位，以及您在面试过程中的时间投入。

经过慎重考虑，我们遗憾地通知您，此次申请未能成功。这个决定非常困难，因为我们收到了许多优秀的申请。

我们会将您的简历保存在我们的人才库中，如果有合适的机会，我们会主动与您联系。

再次感谢您对我们公司的关注，祝您求职顺利！

{{companyName}} 人力资源部`,
    variables: ['candidateName', 'position', 'companyName'],
    usage: 8,
    created: '2025-05-01T10:00:00Z',
    updated: '2025-05-10T11:20:00Z',
    isActive: true,
    userId: 'user_1'
  },
  {
    id: 'template_5',
    name: '面试结果通知模板',
    type: '面试结果',
    subject: '面试结果通知 - {{position}} 职位',
    content: `亲爱的 {{candidateName}}，

感谢您参加我们公司 {{position}} 职位的面试。

{{#if passed}}
恭喜您！您已通过本轮面试。我们将安排下一轮面试，具体时间我们会另行通知。
{{else}}
经过慎重考虑，您暂未通过本轮面试。感谢您的参与，祝您求职顺利！
{{/if}}

如有任何疑问，请随时联系我们。

{{companyName}} 人力资源部`,
    variables: ['candidateName', 'position', 'passed', 'companyName'],
    usage: 15,
    created: '2025-05-10T14:00:00Z',
    updated: '2025-06-05T10:15:00Z',
    isActive: true,
    userId: 'user_1'
  },
  {
    id: 'template_6',
    name: '简历收到确认模板',
    type: '简历确认',
    subject: '简历收到确认 - {{position}} 职位',
    content: `亲爱的 {{candidateName}}，

我们已收到您投递的 {{position}} 职位简历。

简历编号：{{resumeId}}
收到时间：{{receivedTime}}

我们会认真审阅您的简历，并在 {{reviewDays}} 个工作日内给您回复。

感谢您对我们公司的关注！

{{companyName}} 人力资源部`,
    variables: ['candidateName', 'position', 'resumeId', 'receivedTime', 'reviewDays', 'companyName'],
    usage: 32,
    created: '2025-04-15T09:30:00Z',
    updated: '2025-05-25T16:45:00Z',
    isActive: true,
    userId: 'user_1'
  }
];

// 解析模板变量
function extractVariables(content: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g;
  const variables: string[] = [];
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    const variable = match[1].trim();
    if (!variables.includes(variable) && !variable.startsWith('#') && !variable.startsWith('/')) {
      variables.push(variable);
    }
  }
  
  return variables;
}

// GET 请求 - 获取模板列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'user_1';
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'updated';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // 筛选模板
    let filteredTemplates = mockTemplates.filter(t => 
      t.userId === userId && t.isActive
    );

    if (type && type !== 'all') {
      filteredTemplates = filteredTemplates.filter(t => t.type === type);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredTemplates = filteredTemplates.filter(t => 
        t.name.toLowerCase().includes(searchLower) ||
        t.subject.toLowerCase().includes(searchLower) ||
        t.content.toLowerCase().includes(searchLower) ||
        t.type.toLowerCase().includes(searchLower)
      );
    }

    // 排序
    filteredTemplates.sort((a, b) => {
      const aValue = a[sortBy as keyof NotificationTemplate];
      const bValue = b[sortBy as keyof NotificationTemplate];
      
      if (sortBy === 'usage') {
        return sortOrder === 'desc' ? (b.usage - a.usage) : (a.usage - b.usage);
      }
      
      if (sortBy === 'created' || sortBy === 'updated') {
        const aTime = new Date(aValue as string).getTime();
        const bTime = new Date(bValue as string).getTime();
        return sortOrder === 'desc' ? (bTime - aTime) : (aTime - bTime);
      }
      
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      if (sortOrder === 'desc') {
        return bStr.localeCompare(aStr);
      }
      return aStr.localeCompare(bStr);
    });

    // 分页
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTemplates = filteredTemplates.slice(startIndex, endIndex);

    // 生成统计数据
    const stats = {
      total: filteredTemplates.length,
      totalUsage: filteredTemplates.reduce((sum, t) => sum + t.usage, 0),
      byType: filteredTemplates.reduce((acc, template) => {
        acc[template.type] = (acc[template.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      mostUsed: filteredTemplates.sort((a, b) => b.usage - a.usage).slice(0, 3),
      recentlyUpdated: filteredTemplates
        .sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime())
        .slice(0, 5)
    };

    const response = {
      success: true,
      data: {
        templates: paginatedTemplates,
        pagination: {
          page,
          limit,
          total: filteredTemplates.length,
          totalPages: Math.ceil(filteredTemplates.length / limit),
          hasNext: endIndex < filteredTemplates.length,
          hasPrev: page > 1
        },
        stats
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: '获取模板列表失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}

// POST 请求 - 创建新模板
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, subject, content, userId } = body;

    // 验证必填字段
    if (!name || !type || !subject || !content || !userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: '缺少必填字段',
          details: '请提供 name, type, subject, content, userId'
        },
        { status: 400 }
      );
    }

    // 检查模板名称是否已存在
    const existingTemplate = mockTemplates.find(t => 
      t.name === name && t.userId === userId && t.isActive
    );

    if (existingTemplate) {
      return NextResponse.json(
        { 
          success: false, 
          error: '模板名称已存在',
          details: '请使用不同的模板名称'
        },
        { status: 400 }
      );
    }

    // 提取模板变量
    const variables = extractVariables(content + ' ' + subject);

    // 创建新模板
    const newTemplate: NotificationTemplate = {
      id: `template_${Date.now()}`,
      name,
      type,
      subject,
      content,
      variables,
      usage: 0,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      isActive: true,
      userId
    };

    // 在实际应用中，这里会保存到数据库
    mockTemplates.push(newTemplate);

    return NextResponse.json({
      success: true,
      data: newTemplate,
      message: '模板创建成功'
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: '创建模板失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}

// PUT 请求 - 更新模板
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { templateId, name, type, subject, content, userId } = body;

    if (!templateId) {
      return NextResponse.json(
        { 
          success: false, 
          error: '缺少模板ID'
        },
        { status: 400 }
      );
    }

    // 查找模板
    const templateIndex = mockTemplates.findIndex(t => 
      t.id === templateId && (!userId || t.userId === userId) && t.isActive
    );

    if (templateIndex === -1) {
      return NextResponse.json(
        { 
          success: false, 
          error: '模板不存在或无权限修改'
        },
        { status: 404 }
      );
    }

    const template = mockTemplates[templateIndex];

    // 如果修改了名称，检查是否与其他模板重名
    if (name && name !== template.name) {
      const existingTemplate = mockTemplates.find(t => 
        t.name === name && t.userId === template.userId && t.isActive && t.id !== templateId
      );

      if (existingTemplate) {
        return NextResponse.json(
          { 
            success: false, 
            error: '模板名称已存在',
            details: '请使用不同的模板名称'
          },
          { status: 400 }
        );
      }
    }

    // 更新模板
    const updatedFields: Partial<NotificationTemplate> = {
      updated: new Date().toISOString()
    };

    if (name) updatedFields.name = name;
    if (type) updatedFields.type = type;
    if (subject) updatedFields.subject = subject;
    if (content) {
      updatedFields.content = content;
      // 重新提取变量
      updatedFields.variables = extractVariables(content + ' ' + (subject || template.subject));
    }

    Object.assign(template, updatedFields);

    return NextResponse.json({
      success: true,
      data: template,
      message: '模板更新成功'
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: '更新模板失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}

// DELETE 请求 - 删除模板
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!templateId) {
      return NextResponse.json(
        { 
          success: false, 
          error: '缺少模板ID'
        },
        { status: 400 }
      );
    }

    // 查找模板
    const templateIndex = mockTemplates.findIndex(t => 
      t.id === templateId && (!userId || t.userId === userId) && t.isActive
    );

    if (templateIndex === -1) {
      return NextResponse.json(
        { 
          success: false, 
          error: '模板不存在或无权限删除'
        },
        { status: 404 }
      );
    }

    // 软删除（标记为不活跃）
    const template = mockTemplates[templateIndex];
    template.isActive = false;
    template.updated = new Date().toISOString();

    return NextResponse.json({
      success: true,
      data: template,
      message: '模板删除成功'
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: '删除模板失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
} 