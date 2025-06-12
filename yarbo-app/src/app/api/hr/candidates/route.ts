import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 获取候选人数据的辅助函数
async function getCandidatesFromDatabase(options: {
  search?: string;
  status?: string;
  experience?: string;
  rating?: string;
  skills?: string;
  location?: string;
  source?: string;
  page?: number;
  limit?: number;
}) {
  try {
    let query = supabase
      .from('applicants')
      .select(`
        *,
        applications (
          id,
          status,
          applied_at,
          jobs (
            id,
            title,
            departments (name)
          )
        ),
        resumes (
          id,
          filename,
          file_path
        )
      `);

    // 应用筛选条件
    if (options.search) {
      query = query.or(`name.ilike.%${options.search}%,email.ilike.%${options.search}%`);
    }

    // 分页
    const page = options.page || 1;
    const limit = options.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to);

    const { data, error, count } = await supabase
      .from('applicants')
      .select(`
        *,
        applications (
          id,
          status,
          applied_at,
          jobs (
            id,
            title,
            departments (name)
          )
        ),
        resumes (
          id,
          filename,
          file_path
        )
      `, { count: 'exact' })
      .range(from, to);

    if (error) {
      throw error;
    }

    // 转换数据格式以匹配前端期望的格式
    const formattedData = data?.map(candidate => ({
      id: candidate.id,
      name: candidate.name,
      email: candidate.email,
      phone: candidate.phone,
      location: '上海', // 暂时固定，后续可以从数据库获取
      experience: '3-5年', // 暂时固定，后续可以从数据库获取
      education: '本科', // 暂时固定，后续可以从数据库获取
      skills: ['React', 'JavaScript'], // 暂时固定，后续可以从数据库获取
      rating: Math.floor(Math.random() * 5) + 1, // 暂时随机，后续可以从数据库获取
      status: 'active',
      applied_jobs: candidate.applications?.map(app => ({
        job_id: app.jobs?.id || '',
        job_title: app.jobs?.title || '',
        applied_date: app.applied_at?.split('T')[0] || '',
        status: app.status,
        department: app.jobs?.departments?.name || ''
      })) || [],
      resume_url: candidate.resumes?.[0]?.file_path ?
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/resumes/${candidate.resumes[0].file_path}` :
        '',
      notes: [], // 暂时为空，后续可以添加备注功能
      last_contact: candidate.updated_at?.split('T')[0] || candidate.created_at?.split('T')[0] || '',
      source: '官网投递', // 暂时固定，后续可以从数据库获取
      salary_expectation: '面议', // 暂时固定，后续可以从数据库获取
      interview_count: candidate.applications?.filter(app =>
        ['interview_scheduled', 'interviewed'].includes(app.status)
      ).length || 0,
      created_at: candidate.created_at,
      updated_at: candidate.updated_at
    })) || [];

    return {
      data: formattedData,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };

  } catch (error) {
    console.error('获取候选人数据失败:', error);
    throw error;
  }
}

// 保留一些模拟数据作为备用
const mockCandidatesData = [
  {
    id: '1',
    name: '张三',
    email: 'zhangsan@example.com',
    phone: '+86 138-0013-8001',
    location: '上海',
    experience: '5年',
    education: '本科',
    skills: ['React', 'Vue', 'TypeScript', 'Node.js', 'JavaScript', 'CSS'],
    rating: 4,
    status: 'active',
    applied_jobs: [
      {
        job_id: '1',
        job_title: '高级前端工程师',
        applied_date: '2025-06-08',
        status: 'interview',
        department: '技术部'
      }
    ],
    resume_url: '/resume/zhangsan.pdf',
    notes: [],
    last_contact: '2025-06-10',
    source: '智联招聘',
    salary_expectation: '25K-35K',
    interview_count: 2,
    created_at: '2025-05-20T10:00:00Z',
    updated_at: '2025-06-10T16:30:00Z'
  },
  {
    id: '2',
    name: '李四',
    email: 'lisi@example.com',
    phone: '+86 139-0014-8002',
    location: '北京',
    experience: '3年',
    education: '硕士',
    skills: ['Python', 'Django', 'PostgreSQL', 'Redis', 'AWS', 'Docker'],
    rating: 3,
    status: 'passive',
    applied_jobs: [
      {
        job_id: '3',
        job_title: '后端工程师',
        applied_date: '2025-06-05',
        status: 'reviewing',
        department: '技术部'
      }
    ],
    resume_url: '/resume/lisi.pdf',
    notes: [
      { id: '3', content: '技术基础扎实', created_by: '刘技术总监', created_at: '2025-06-05' }
    ],
    last_contact: '2025-06-07',
    source: 'BOSS直聘',
    salary_expectation: '18K-25K',
    interview_count: 1,
    created_at: '2025-06-05T09:00:00Z',
    updated_at: '2025-06-07T14:20:00Z'
  },
  {
    id: '3',
    name: '王五',
    email: 'wangwu@example.com',
    phone: '+86 137-0015-8003',
    location: '深圳',
    experience: '7年',
    education: '本科',
    skills: ['Java', 'Spring', 'MySQL', 'Docker', 'Kubernetes', '微服务'],
    rating: 5,
    status: 'hired',
    applied_jobs: [
      {
        job_id: '4',
        job_title: '技术主管',
        applied_date: '2025-05-15',
        status: 'hired',
        department: '技术部'
      }
    ],
    resume_url: '/resume/wangwu.pdf',
    notes: [
      { id: '4', content: '优秀候选人', created_by: '张CTO', created_at: '2025-05-20' },
      { id: '5', content: '已录用', created_by: '张HR', created_at: '2025-05-30' }
    ],
    last_contact: '2025-05-30',
    source: '内推',
    salary_expectation: '35K-45K',
    interview_count: 3,
    created_at: '2025-05-15T08:00:00Z',
    updated_at: '2025-05-30T17:00:00Z'
  },
  {
    id: '4',
    name: '赵六',
    email: 'zhaoliu@example.com',
    phone: '+86 136-0016-8004',
    location: '杭州',
    experience: '2年',
    education: '本科',
    skills: ['Figma', 'Sketch', 'Photoshop', 'Principle', 'Axure', 'UI/UX'],
    rating: 4,
    status: 'active',
    applied_jobs: [
      {
        job_id: '5',
        job_title: 'UI设计师',
        applied_date: '2025-06-12',
        status: 'applied',
        department: '设计部'
      }
    ],
    resume_url: '/resume/zhaoliu.pdf',
    notes: [
      { id: '6', content: '设计作品优秀', created_by: '陈设计师', created_at: '2025-06-12' }
    ],
    last_contact: '2025-06-12',
    source: '拉勾网',
    salary_expectation: '15K-20K',
    interview_count: 0,
    created_at: '2025-06-12T11:00:00Z',
    updated_at: '2025-06-12T11:00:00Z'
  },
  {
    id: '5',
    name: '钱七',
    email: 'qianqi@example.com',
    phone: '+86 135-0017-8005',
    location: '广州',
    experience: '4年',
    education: '硕士',
    skills: ['Product Management', 'Axure', 'SQL', 'Data Analysis', 'Figma', 'Sketch'],
    rating: 3,
    status: 'rejected',
    applied_jobs: [
      {
        job_id: '6',
        job_title: '产品经理',
        applied_date: '2025-05-25',
        status: 'rejected',
        department: '产品部'
      }
    ],
    resume_url: '/resume/qianqi.pdf',
    notes: [
      { id: '7', content: '产品思维清晰', created_by: '孙产品总监', created_at: '2025-05-26' },
      { id: '8', content: '但经验不足', created_by: '孙产品总监', created_at: '2025-06-01' }
    ],
    last_contact: '2025-06-01',
    source: '前程无忧',
    salary_expectation: '20K-28K',
    interview_count: 1,
    created_at: '2025-05-25T13:00:00Z',
    updated_at: '2025-06-01T15:30:00Z'
  },
  {
    id: '6',
    name: '孙八',
    email: 'sunba@example.com',
    phone: '+86 134-0018-8006',
    location: '成都',
    experience: '6年',
    education: '硕士',
    skills: ['Data Science', 'Python', 'R', 'SQL', 'Tableau', 'Machine Learning'],
    rating: 5,
    status: 'active',
    applied_jobs: [
      {
        job_id: '7',
        job_title: '数据科学家',
        applied_date: '2025-06-14',
        status: 'interview',
        department: '数据部'
      }
    ],
    resume_url: '/resume/sunba.pdf',
    notes: [
      { id: '9', content: '数据分析能力突出', created_by: '周数据总监', created_at: '2025-06-14' }
    ],
    last_contact: '2025-06-14',
    source: 'LinkedIn',
    salary_expectation: '30K-40K',
    interview_count: 1,
    created_at: '2025-06-14T16:00:00Z',
    updated_at: '2025-06-14T16:00:00Z'
  },
  {
    id: '7',
    name: '周九',
    email: 'zhoujiu@example.com',
    phone: '+86 133-0019-8007',
    location: '武汉',
    experience: '1年',
    education: '本科',
    skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Vue', 'Git'],
    rating: 2,
    status: 'passive',
    applied_jobs: [
      {
        job_id: '8',
        job_title: '前端工程师',
        applied_date: '2025-06-11',
        status: 'reviewing',
        department: '技术部'
      }
    ],
    resume_url: '/resume/zhoujiu.pdf',
    notes: [
      { id: '10', content: '应届毕业生，基础还需加强', created_by: '李经理', created_at: '2025-06-11' }
    ],
    last_contact: '2025-06-11',
    source: '校园招聘',
    salary_expectation: '8K-12K',
    interview_count: 0,
    created_at: '2025-06-11T10:00:00Z',
    updated_at: '2025-06-11T10:00:00Z'
  },
  {
    id: '8',
    name: '吴十',
    email: 'wushi@example.com',
    phone: '+86 132-0020-8008',
    location: '西安',
    experience: '8年',
    education: '硕士',
    skills: ['DevOps', 'Kubernetes', 'Docker', 'AWS', 'Jenkins', 'Terraform'],
    rating: 4,
    status: 'active',
    applied_jobs: [
      {
        job_id: '9',
        job_title: 'DevOps工程师',
        applied_date: '2025-06-13',
        status: 'applied',
        department: '运维部'
      }
    ],
    resume_url: '/resume/wushi.pdf',
    notes: [
      { id: '11', content: 'DevOps经验丰富', created_by: '郑运维总监', created_at: '2025-06-13' }
    ],
    last_contact: '2025-06-13',
    source: 'GitHub',
    salary_expectation: '28K-38K',
    interview_count: 0,
    created_at: '2025-06-13T14:00:00Z',
    updated_at: '2025-06-13T14:00:00Z'
  }
];

// GET /api/hr/candidates - 获取候选人列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 获取查询参数
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const experience = searchParams.get('experience');
    const rating = searchParams.get('rating');
    const skills = searchParams.get('skills');
    const location = searchParams.get('location');
    const source = searchParams.get('source');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // 尝试从数据库获取数据
    try {
      const result = await getCandidatesFromDatabase({
        search,
        status,
        experience,
        rating,
        skills,
        location,
        source,
        page,
        limit
      });

      return NextResponse.json({
        success: true,
        data: result.data,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        },
        message: '候选人列表获取成功'
      });

    } catch (dbError) {
      console.error('数据库查询失败，使用模拟数据:', dbError);

      // 如果数据库查询失败，使用模拟数据
      let filteredData = [...mockCandidatesData];

      // 搜索候选人姓名、邮箱、技能
      if (search) {
        const searchLower = search.toLowerCase();
        filteredData = filteredData.filter(candidate =>
          candidate.name.toLowerCase().includes(searchLower) ||
          candidate.email.toLowerCase().includes(searchLower) ||
          candidate.skills.some(skill => skill.toLowerCase().includes(searchLower)) ||
          candidate.location.toLowerCase().includes(searchLower)
        );
      }

      // 按状态筛选
      if (status && status !== 'all') {
        filteredData = filteredData.filter(candidate => candidate.status === status);
      }

      // 按经验筛选
      if (experience && experience !== 'all') {
        filteredData = filteredData.filter(candidate => {
          const exp = parseInt(candidate.experience);
          switch (experience) {
            case '1': return exp <= 2;
            case '3': return exp >= 3 && exp <= 5;
            case '5': return exp > 5;
            default: return true;
          }
        });
      }

      // 按评分筛选
      if (rating && rating !== 'all') {
        const ratingNum = parseInt(rating);
        if (ratingNum === 2) {
          filteredData = filteredData.filter(candidate => candidate.rating <= 2);
        } else {
          filteredData = filteredData.filter(candidate => candidate.rating === ratingNum);
        }
      }

      // 按技能筛选
      if (skills) {
        const skillsArray = skills.split(',').map(s => s.trim().toLowerCase());
        filteredData = filteredData.filter(candidate =>
          skillsArray.some(skill =>
            candidate.skills.some(candidateSkill =>
              candidateSkill.toLowerCase().includes(skill)
            )
          )
        );
      }

      // 按地点筛选
      if (location && location !== 'all') {
        filteredData = filteredData.filter(candidate => candidate.location === location);
      }

      // 按来源筛选
      if (source && source !== 'all') {
        filteredData = filteredData.filter(candidate => candidate.source === source);
      }

      // 分页
      const total = filteredData.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = filteredData.slice(startIndex, endIndex);

      // 统计数据
      const stats = {
        total: mockCandidatesData.length,
        filtered_total: total,
        active: mockCandidatesData.filter(c => c.status === 'active').length,
        passive: mockCandidatesData.filter(c => c.status === 'passive').length,
        hired: mockCandidatesData.filter(c => c.status === 'hired').length,
        rejected: mockCandidatesData.filter(c => c.status === 'rejected').length,
        average_rating: mockCandidatesData.length > 0
          ? Math.round((mockCandidatesData.reduce((sum, c) => sum + c.rating, 0) / mockCandidatesData.length) * 10) / 10
          : 0,
        by_experience: {
          junior: mockCandidatesData.filter(c => parseInt(c.experience) <= 2).length,
          mid: mockCandidatesData.filter(c => parseInt(c.experience) >= 3 && parseInt(c.experience) <= 5).length,
          senior: mockCandidatesData.filter(c => parseInt(c.experience) > 5).length
        },
        by_location: Object.entries(
          mockCandidatesData.reduce((acc, c) => {
            acc[c.location] = (acc[c.location] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        ).map(([location, count]) => ({ location, count })),
        by_source: Object.entries(
          mockCandidatesData.reduce((acc, c) => {
            acc[c.source] = (acc[c.source] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        ).map(([source, count]) => ({ source, count }))
      };

      return NextResponse.json({
        success: true,
        data: paginatedData,
        stats,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          has_next: endIndex < total,
          has_prev: page > 1
        }
      });

    } catch (error) {
      console.error('获取候选人数据错误:', error);
      return NextResponse.json(
        { success: false, error: '获取候选人数据失败' },
        { status: 500 }
      );
    }
  }

// POST /api/hr/candidates - 创建新候选人记录
export async function POST(request: NextRequest) {
    try {
      const body = await request.json();

      // 验证必要字段
      const requiredFields = ['name', 'email', 'phone'];
      for (const field of requiredFields) {
        if (!body[field]) {
          return NextResponse.json(
            { success: false, error: `缺少必要字段: ${field}` },
            { status: 400 }
          );
        }
      }

      // 验证邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return NextResponse.json(
          { success: false, error: '邮箱格式不正确' },
          { status: 400 }
        );
      }

      // 检查邮箱是否已存在
      const existingCandidate = mockCandidatesData.find(c => c.email === body.email);
      if (existingCandidate) {
        return NextResponse.json(
          { success: false, error: '该邮箱已存在候选人记录' },
          { status: 400 }
        );
      }

      // 创建新候选人记录
      const newCandidate = {
        id: String(mockCandidatesData.length + 1),
        name: body.name,
        email: body.email,
        phone: body.phone,
        location: body.location || '',
        experience: body.experience || '0年',
        education: body.education || '',
        skills: body.skills || [],
        rating: body.rating || 3,
        status: body.status || 'active',
        applied_jobs: [],
        resume_url: body.resume_url || '',
        notes: [],
        last_contact: new Date().toISOString().split('T')[0],
        source: body.source || '手动添加',
        salary_expectation: body.salary_expectation || '',
        interview_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // 在实际项目中，这里应该保存到数据库
      mockCandidatesData.push(newCandidate);

      return NextResponse.json({
        success: true,
        data: newCandidate,
        message: '候选人创建成功'
      });

    } catch (error) {
      console.error('创建候选人错误:', error);
      return NextResponse.json(
        { success: false, error: '创建候选人失败' },
        { status: 500 }
      );
    }
  }

  // PUT /api/hr/candidates - 批量更新候选人状态
  export async function PUT(request: NextRequest) {
    try {
      const body = await request.json();
      const { action, candidate_ids, data } = body;

      if (!action || !candidate_ids || !Array.isArray(candidate_ids)) {
        return NextResponse.json(
          { success: false, error: '无效的请求参数' },
          { status: 400 }
        );
      }

      let updatedCount = 0;
      const updatedCandidates = [];

      for (const candidateId of candidate_ids) {
        const index = mockCandidatesData.findIndex(candidate => candidate.id === candidateId);
        if (index !== -1) {
          const candidate = mockCandidatesData[index];

          switch (action) {
            case 'update_status':
              if (data.status) {
                candidate.status = data.status;
              }
              break;
            case 'update_rating':
              if (data.rating >= 1 && data.rating <= 5) {
                candidate.rating = data.rating;
              }
              break;
            case 'add_note':
              if (data.note) {
                candidate.notes.push({
                  id: String(candidate.notes.length + 1),
                  content: data.note,
                  created_by: data.created_by || 'Admin',
                  created_at: new Date().toISOString().split('T')[0]
                });
              }
              break;
            case 'update_contact':
              candidate.last_contact = new Date().toISOString().split('T')[0];
              break;
            default:
              continue;
          }

          candidate.updated_at = new Date().toISOString();
          updatedCount++;
          updatedCandidates.push(candidate);
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          updated_count: updatedCount,
          updated_candidates: updatedCandidates
        },
        message: `成功更新 ${updatedCount} 个候选人记录`
      });

    } catch (error) {
      console.error('批量更新候选人错误:', error);
      return NextResponse.json(
        { success: false, error: '批量更新候选人失败' },
        { status: 500 }
      );
    }
  }

