import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const location = searchParams.get('location');
    const duration = searchParams.get('duration');
    const search = searchParams.get('search');

    // 示例实习职位数据
    let internshipJobs = [
      {
        id: 'internship-1',
        title: '前端开发实习生',
        department: '技术部',
        location: '上海',
        duration: '3个月',
        type: '实习',
        salary_display: '150-200/天',
        description: '参与前端项目开发，学习React、Vue等现代前端技术，有导师指导。',
        requirements: ['计算机相关专业在读', '熟悉HTML/CSS/JavaScript', '有前端框架基础'],
        benefits: ['导师指导', '项目实战', '转正机会', '实习证明'],
        skills_gained: ['React开发', 'Vue开发', '项目管理', '团队协作'],
        posted_at: new Date().toISOString(),
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        start_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        is_featured: true,
        is_remote: false
      },
      {
        id: 'internship-2',
        title: '数据分析实习生',
        department: '数据部',
        location: '北京',
        duration: '6个月',
        type: '实习',
        salary_display: '180-250/天',
        description: '协助数据分析师进行业务数据分析，学习使用Python、SQL等数据分析工具。',
        requirements: ['统计学、数学相关专业', '熟悉Python或R', 'SQL基础'],
        benefits: ['数据技能培训', '业务理解', '行业洞察', '技能证书'],
        skills_gained: ['Python数据分析', 'SQL查询', '数据可视化', '业务分析'],
        posted_at: new Date().toISOString(),
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        start_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        is_featured: false,
        is_remote: true
      },
      {
        id: 'internship-3',
        title: 'UI/UX设计实习生',
        department: '设计部',
        location: '深圳',
        duration: '4个月',
        type: '实习',
        salary_display: '120-180/天',
        description: '参与产品界面设计，学习用户体验设计方法论，有机会参与重要项目。',
        requirements: ['设计相关专业', '熟悉Figma/Sketch', '有作品集'],
        benefits: ['设计思维培养', '作品集完善', '行业人脉', '设计工具授权'],
        skills_gained: ['用户体验设计', '界面设计', '原型制作', '用户研究'],
        posted_at: new Date().toISOString(),
        deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
        start_date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
        is_featured: false,
        is_remote: false
      },
      {
        id: 'internship-4',
        title: '市场运营实习生',
        department: '市场部',
        location: '广州',
        duration: '3个月',
        type: '实习',
        salary_display: '100-150/天',
        description: '协助市场运营活动策划执行，学习社交媒体运营、内容创作等技能。',
        requirements: ['市场营销、新闻传播相关专业', '文案功底', '创意思维'],
        benefits: ['运营经验', '内容创作培训', '渠道资源', '活动策划经验'],
        skills_gained: ['社交媒体运营', '内容营销', '活动策划', '数据分析'],
        posted_at: new Date().toISOString(),
        deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
        start_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        is_featured: true,
        is_remote: false
      }
    ];

    // 应用筛选条件
    if (department && department !== 'all') {
      internshipJobs = internshipJobs.filter(job => job.department === department);
    }

    if (location && location !== 'all') {
      internshipJobs = internshipJobs.filter(job => job.location === location);
    }

    if (duration && duration !== 'all') {
      internshipJobs = internshipJobs.filter(job => job.duration === duration);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      internshipJobs = internshipJobs.filter(job => 
        job.title.toLowerCase().includes(searchLower) ||
        job.description.toLowerCase().includes(searchLower) ||
        job.department.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({
      success: true,
      jobs: internshipJobs,
      count: internshipJobs.length
    });

  } catch (error) {
    console.error('获取实习职位失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取实习职位失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
} 