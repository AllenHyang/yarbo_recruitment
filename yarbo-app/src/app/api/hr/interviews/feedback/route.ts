import { NextRequest, NextResponse } from 'next/server';

// 模拟面试反馈数据
const mockFeedbackData = [
  {
    id: '1',
    interview_id: 'iv-001',
    candidate_name: '张三',
    job_title: '高级前端工程师',
    interviewer: '李经理',
    interview_date: '2025-06-10',
    interview_type: 'technical',
    duration: 60,
    technical_score: 4,
    communication_score: 5,
    culture_fit_score: 4,
    problem_solving_score: 4,
    motivation_score: 5,
    overall_rating: 4,
    recommendation: 'hire',
    strengths: ['React技术扎实', '沟通能力强', '学习能力强', '团队协作好'],
    weaknesses: ['后端经验较少', 'TypeScript待提升'],
    feedback: '候选人技术基础扎实，沟通表达清晰，对前端技术有深入理解。在React、Vue等框架方面经验丰富，能够独立完成复杂项目。性格开朗，团队协作能力强，学习意愿强烈。',
    next_steps: '建议进入终面环节，可以考虑发放offer',
    interviewer_notes: '整体表现优秀，符合岗位要求',
    status: 'submitted',
    submitted_at: '2025-06-10T16:30:00Z',
    created_at: '2025-06-10T16:30:00Z',
    updated_at: '2025-06-10T16:30:00Z'
  },
  {
    id: '2',
    interview_id: 'iv-002',
    candidate_name: '李四',
    job_title: '产品经理',
    interviewer: '王总监',
    interview_date: '2025-06-11',
    interview_type: 'video',
    duration: 45,
    technical_score: 3,
    communication_score: 4,
    culture_fit_score: 3,
    problem_solving_score: 3,
    motivation_score: 4,
    overall_rating: 3,
    recommendation: 'maybe',
    strengths: ['产品思维清晰', '用户体验理解好'],
    weaknesses: ['技术理解不够深入', '项目管理经验不足'],
    feedback: '候选人具备基本的产品思维，对用户体验有一定理解。但在技术理解和项目管理方面还需要加强。',
    next_steps: '需要更多评估，建议安排二面',
    interviewer_notes: '需要进一步了解其实际项目经验',
    status: 'submitted',
    submitted_at: '2025-06-11T11:15:00Z',
    created_at: '2025-06-11T11:15:00Z',
    updated_at: '2025-06-11T11:15:00Z'
  },
  {
    id: '3',
    interview_id: 'iv-003',
    candidate_name: '王五',
    job_title: 'UI设计师',
    interviewer: '陈设计师',
    interview_date: '2025-06-12',
    interview_type: 'onsite',
    duration: 90,
    technical_score: 5,
    communication_score: 4,
    culture_fit_score: 5,
    problem_solving_score: 4,
    motivation_score: 5,
    overall_rating: 5,
    recommendation: 'strong_hire',
    strengths: ['设计能力出众', '创意思维强', '用户体验理解深入', '工具掌握熟练'],
    weaknesses: ['前端代码能力一般'],
    feedback: '候选人设计能力非常出色，作品集质量很高，创意思维活跃。对用户体验有深入理解，能够从用户角度思考问题。虽然前端代码能力一般，但可以通过培训提升。',
    next_steps: '强烈推荐录用，可以直接发放offer',
    interviewer_notes: '优秀候选人，建议尽快录用',
    status: 'reviewed',
    submitted_at: '2025-06-12T17:00:00Z',
    reviewed_by: '张HR',
    created_at: '2025-06-12T17:00:00Z',
    updated_at: '2025-06-12T17:30:00Z'
  },
  {
    id: '4',
    interview_id: 'iv-004',
    candidate_name: '赵六',
    job_title: '后端工程师',
    interviewer: '刘技术总监',
    interview_date: '2025-06-13',
    interview_type: 'technical',
    duration: 75,
    technical_score: 5,
    communication_score: 3,
    culture_fit_score: 4,
    problem_solving_score: 5,
    motivation_score: 4,
    overall_rating: 4,
    recommendation: 'hire',
    strengths: ['算法能力强', '系统设计能力出色', '技术深度好', '解决问题能力强'],
    weaknesses: ['沟通略显内向', '团队协作待观察'],
    feedback: '候选人技术能力非常强，算法基础扎实，系统设计思路清晰。在数据库优化、分布式系统方面有丰富经验。性格偏内向，但专业能力突出。',
    next_steps: '技术面试通过，建议安排HR面试了解软技能',
    interviewer_notes: '技术能力优秀，值得培养',
    status: 'submitted',
    submitted_at: '2025-06-13T15:45:00Z',
    created_at: '2025-06-13T15:45:00Z',
    updated_at: '2025-06-13T15:45:00Z'
  },
  {
    id: '5',
    interview_id: 'iv-005',
    candidate_name: '钱七',
    job_title: '数据分析师',
    interviewer: '孙数据总监',
    interview_date: '2025-06-14',
    interview_type: 'video',
    duration: 50,
    technical_score: 4,
    communication_score: 5,
    culture_fit_score: 5,
    problem_solving_score: 4,
    motivation_score: 5,
    overall_rating: 5,
    recommendation: 'strong_hire',
    strengths: ['数据敏感度高', '沟通表达优秀', '业务理解能力强', '学习能力强'],
    weaknesses: ['编程基础待加强'],
    feedback: '候选人对数据有很好的敏感度，能够快速发现数据中的问题和机会。沟通表达能力出色，能够将复杂的数据分析结果清晰地传达给业务方。虽然编程基础相对薄弱，但学习意愿强烈。',
    next_steps: '强烈推荐录用，可安排终面',
    interviewer_notes: '综合素质优秀，是团队需要的人才',
    status: 'submitted',
    submitted_at: '2025-06-14T14:20:00Z',
    created_at: '2025-06-14T14:20:00Z',
    updated_at: '2025-06-14T14:20:00Z'
  }
];

// GET /api/hr/interviews/feedback - 获取面试反馈列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const recommendation = searchParams.get('recommendation');
    const interviewer = searchParams.get('interviewer');
    const search = searchParams.get('search');

    let filteredData = [...mockFeedbackData];

    // 按状态筛选
    if (status && status !== 'all') {
      filteredData = filteredData.filter(item => item.status === status);
    }

    // 按推荐等级筛选
    if (recommendation && recommendation !== 'all') {
      filteredData = filteredData.filter(item => item.recommendation === recommendation);
    }

    // 按面试官筛选
    if (interviewer) {
      filteredData = filteredData.filter(item => 
        item.interviewer.toLowerCase().includes(interviewer.toLowerCase())
      );
    }

    // 搜索候选人姓名或职位
    if (search) {
      filteredData = filteredData.filter(item => 
        item.candidate_name.toLowerCase().includes(search.toLowerCase()) ||
        item.job_title.toLowerCase().includes(search.toLowerCase())
      );
    }

    // 计算统计数据
    const stats = {
      total: mockFeedbackData.length,
      pending_review: mockFeedbackData.filter(item => item.status === 'submitted').length,
      average_rating: mockFeedbackData.length > 0 
        ? Math.round((mockFeedbackData.reduce((sum, item) => sum + item.overall_rating, 0) / mockFeedbackData.length) * 10) / 10
        : 0,
      recommended_count: mockFeedbackData.filter(item => ['hire', 'strong_hire'].includes(item.recommendation)).length,
      by_recommendation: {
        strong_hire: mockFeedbackData.filter(item => item.recommendation === 'strong_hire').length,
        hire: mockFeedbackData.filter(item => item.recommendation === 'hire').length,
        maybe: mockFeedbackData.filter(item => item.recommendation === 'maybe').length,
        no_hire: mockFeedbackData.filter(item => item.recommendation === 'no_hire').length,
        strong_no_hire: mockFeedbackData.filter(item => item.recommendation === 'strong_no_hire').length,
      },
      by_interviewer: Object.entries(
        mockFeedbackData.reduce((acc, item) => {
          if (!acc[item.interviewer]) {
            acc[item.interviewer] = {
              count: 0,
              total_rating: 0,
              recommended: 0
            };
          }
          acc[item.interviewer].count++;
          acc[item.interviewer].total_rating += item.overall_rating;
          if (['hire', 'strong_hire'].includes(item.recommendation)) {
            acc[item.interviewer].recommended++;
          }
          return acc;
        }, {} as any)
      ).map(([interviewer, data]: [string, any]) => ({
        interviewer,
        interview_count: data.count,
        average_rating: Math.round((data.total_rating / data.count) * 10) / 10,
        recommended_count: data.recommended
      }))
    };

    return NextResponse.json({
      success: true,
      data: filteredData,
      stats,
      pagination: {
        total: filteredData.length,
        page: 1,
        limit: filteredData.length,
        pages: 1
      }
    });

  } catch (error) {
    console.error('获取面试反馈数据错误:', error);
    return NextResponse.json(
      { success: false, error: '获取面试反馈数据失败' },
      { status: 500 }
    );
  }
}

// POST /api/hr/interviews/feedback - 创建新的面试反馈
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证必要字段
    const requiredFields = [
      'interview_id', 'candidate_name', 'job_title', 'interviewer',
      'interview_date', 'technical_score', 'communication_score',
      'culture_fit_score', 'problem_solving_score', 'motivation_score',
      'recommendation', 'feedback'
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `缺少必要字段: ${field}` },
          { status: 400 }
        );
      }
    }

    // 验证评分范围
    const scoreFields = [
      'technical_score', 'communication_score', 'culture_fit_score',
      'problem_solving_score', 'motivation_score', 'overall_rating'
    ];
    
    for (const field of scoreFields) {
      if (body[field] && (body[field] < 1 || body[field] > 5)) {
        return NextResponse.json(
          { success: false, error: `${field} 必须在1-5之间` },
          { status: 400 }
        );
      }
    }

    // 验证推荐等级
    const validRecommendations = ['strong_hire', 'hire', 'maybe', 'no_hire', 'strong_no_hire'];
    if (!validRecommendations.includes(body.recommendation)) {
      return NextResponse.json(
        { success: false, error: '无效的推荐等级' },
        { status: 400 }
      );
    }

    // 创建新反馈记录
    const newFeedback = {
      id: String(mockFeedbackData.length + 1),
      interview_id: body.interview_id,
      candidate_name: body.candidate_name,
      job_title: body.job_title,
      interviewer: body.interviewer,
      interview_date: body.interview_date,
      interview_type: body.interview_type || 'technical',
      duration: body.duration || 60,
      technical_score: body.technical_score,
      communication_score: body.communication_score,
      culture_fit_score: body.culture_fit_score,
      problem_solving_score: body.problem_solving_score,
      motivation_score: body.motivation_score,
      overall_rating: body.overall_rating || Math.round((
        body.technical_score + body.communication_score + 
        body.culture_fit_score + body.problem_solving_score + 
        body.motivation_score
      ) / 5),
      recommendation: body.recommendation,
      strengths: body.strengths || [],
      weaknesses: body.weaknesses || [],
      feedback: body.feedback,
      next_steps: body.next_steps || '',
      interviewer_notes: body.interviewer_notes || '',
      status: body.status || 'draft',
      submitted_at: body.status === 'submitted' ? new Date().toISOString() : null,
      reviewed_by: body.reviewed_by || undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 在实际项目中，这里应该保存到数据库
    mockFeedbackData.push(newFeedback);

    return NextResponse.json({
      success: true,
      data: newFeedback,
      message: '面试反馈创建成功'
    });

  } catch (error) {
    console.error('创建面试反馈错误:', error);
    return NextResponse.json(
      { success: false, error: '创建面试反馈失败' },
      { status: 500 }
    );
  }
}

// PUT /api/hr/interviews/feedback - 批量更新面试反馈
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, feedback_ids, data } = body;

    if (!action || !feedback_ids || !Array.isArray(feedback_ids)) {
      return NextResponse.json(
        { success: false, error: '无效的请求参数' },
        { status: 400 }
      );
    }

    let updatedCount = 0;
    const updatedFeedback = [];

    for (const feedbackId of feedback_ids) {
      const index = mockFeedbackData.findIndex(item => item.id === feedbackId);
      if (index !== -1) {
        const feedback = mockFeedbackData[index];
        
        switch (action) {
          case 'submit':
            feedback.status = 'submitted';
            feedback.submitted_at = new Date().toISOString();
            break;
          case 'review':
            feedback.status = 'reviewed';
            feedback.reviewed_by = data.reviewed_by || 'Admin';
            break;
          case 'update_recommendation':
            if (data.recommendation) {
              feedback.recommendation = data.recommendation;
            }
            break;
          default:
            continue;
        }
        
        feedback.updated_at = new Date().toISOString();
        updatedCount++;
        updatedFeedback.push(feedback);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        updated_count: updatedCount,
        updated_feedback: updatedFeedback
      },
      message: `成功更新 ${updatedCount} 条面试反馈`
    });

  } catch (error) {
    console.error('批量更新面试反馈错误:', error);
    return NextResponse.json(
      { success: false, error: '批量更新面试反馈失败' },
      { status: 500 }
    );
  }
} 