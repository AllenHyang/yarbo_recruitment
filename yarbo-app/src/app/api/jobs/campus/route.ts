import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const location = searchParams.get('location');
    const search = searchParams.get('search');

    // 示例校园招聘职位数据
    let campusJobs = [
      {
        id: 'campus-1',
        title: '软件开发工程师 - 校园招聘',
        department: '技术部',
        location: '上海',
        type: '全职',
        level: '校园招聘',
        salary_display: '12-18K',
        description: '面向应届毕业生的软件开发岗位，提供完整的培训体系和职业发展规划。',
        requirements: ['计算机相关专业', '扎实的编程基础', '良好的学习能力'],
        benefits: ['五险一金', '年终奖', '培训机会', '团建活动'],
        posted_at: new Date().toISOString(),
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        is_featured: true,
        campus_specific: true
      },
      {
        id: 'campus-2',
        title: '产品经理 - 校园招聘',
        department: '产品部',
        location: '北京',
        type: '全职',
        level: '校园招聘',
        salary_display: '10-15K',
        description: '产品经理培养计划，从基础产品技能到高级产品思维的全方位培养。',
        requirements: ['优秀的逻辑思维', '沟通协调能力', '对产品有热情'],
        benefits: ['导师制培养', '项目轮岗', '海外交流机会'],
        posted_at: new Date().toISOString(),
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        is_featured: false,
        campus_specific: true
      },
      {
        id: 'campus-3',
        title: '市场营销专员 - 校园招聘',
        department: '市场部',
        location: '深圳',
        type: '全职',
        level: '校园招聘',
        salary_display: '8-12K',
        description: '面向市场营销、广告等相关专业的应届毕业生，参与品牌推广和市场活动。',
        requirements: ['市场营销相关专业', '创意思维', '活动策划经验'],
        benefits: ['弹性工作', '创意奖金', '行业培训'],
        posted_at: new Date().toISOString(),
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        is_featured: false,
        campus_specific: true
             }
     ];

     // 应用筛选条件
     if (department && department !== 'all') {
       campusJobs = campusJobs.filter(job => job.department === department);
     }

     if (location && location !== 'all') {
       campusJobs = campusJobs.filter(job => job.location === location);
     }

     if (search) {
       const searchLower = search.toLowerCase();
       campusJobs = campusJobs.filter(job => 
         job.title.toLowerCase().includes(searchLower) ||
         job.description.toLowerCase().includes(searchLower) ||
         job.department.toLowerCase().includes(searchLower)
       );
     }

     return NextResponse.json({
       success: true,
       jobs: campusJobs,
       count: campusJobs.length
     });

   } catch (error) {
     console.error('获取校园招聘职位失败:', error);
     return NextResponse.json(
       {
         success: false,
         error: '获取校园招聘职位失败',
         details: error instanceof Error ? error.message : '未知错误'
       },
       { status: 500 }
     );
   }
 } 