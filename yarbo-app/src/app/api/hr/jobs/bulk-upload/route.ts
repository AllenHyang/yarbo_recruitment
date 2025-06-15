import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import * as XLSX from 'xlsx'

// 创建服务端Supabase客户端
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.***REMOVED***!
)

// 字段映射
const FIELD_MAPPING = {
  '职位名称*': 'title',
  '部门*': 'department', 
  '工作地点*': 'location',
  '薪资最低值': 'salary_min',
  '薪资最高值': 'salary_max',
  '薪资显示文本': 'salary_display',
  '是否远程工作': 'is_remote',
  '职位状态*': 'status',
  '优先级*': 'priority',
  '过期日期*': 'expires_at',
  '职位描述*': 'description',
  '职位要求': 'requirements',
  '福利待遇': 'benefits',
  '工作类型': 'employment_type',
  '经验要求': 'experience_required',
  '学历要求': 'education_required'
}

// 验证必填字段
const REQUIRED_FIELDS = ['title', 'department', 'location', 'status', 'priority', 'expires_at', 'description']

// 状态映射
const STATUS_MAPPING: { [key: string]: string } = {
  'published': 'published',
  '已发布': 'published',
  'draft': 'draft',
  '草稿': 'draft',
  'paused': 'paused',
  '暂停': 'paused',
  'closed': 'closed',
  '关闭': 'closed'
}

// 优先级映射
const PRIORITY_MAPPING: { [key: string]: number } = {
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '极紧急': 1,
  '紧急': 2,
  '普通': 3,
  '不急': 4,
  '储备': 5
}

interface JobData {
  title: string
  department: string
  location: string
  salary_min?: number
  salary_max?: number
  salary_display?: string
  is_remote: boolean
  status: string
  priority: number
  expires_at: string
  description: string
  requirements?: string
  benefits?: string
  employment_type?: string
  experience_required?: string
  education_required?: string
  created_by?: string
}

export async function POST(request: NextRequest) {
  try {
    // 验证用户权限
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    
    // 验证JWT token并获取用户信息
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '身份验证失败' },
        { status: 401 }
      )
    }

    // 获取上传的文件
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: '未找到上传文件' },
        { status: 400 }
      )
    }

    // 读取Excel文件
    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })
    
    // 获取第一个工作表
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    // 转换为JSON数据
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]
    
    if (rawData.length < 2) {
      return NextResponse.json(
        { error: 'Excel文件格式错误，至少需要包含表头和一行数据' },
        { status: 400 }
      )
    }

    // 获取表头
    const headers = rawData[0] as string[]
    const dataRows = rawData.slice(1)

    // 验证表头
    const requiredHeaders = Object.keys(FIELD_MAPPING)
    const missingHeaders = requiredHeaders.filter(header => !headers.includes(header))
    
    if (missingHeaders.length > 0) {
      return NextResponse.json(
        { error: `缺少必要的列: ${missingHeaders.join(', ')}` },
        { status: 400 }
      )
    }

    // 处理数据
    const jobs: JobData[] = []
    const errors: string[] = []

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i]
      const rowIndex = i + 2 // Excel行号（从1开始，加上表头）

      try {
        const jobData: any = { created_by: user.id }

        // 映射字段
        headers.forEach((header, index) => {
          const fieldName = FIELD_MAPPING[header as keyof typeof FIELD_MAPPING]
          if (fieldName && row[index] !== undefined && row[index] !== '') {
            let value = row[index]

            // 特殊字段处理
            switch (fieldName) {
              case 'salary_min':
              case 'salary_max':
                value = parseInt(value)
                if (isNaN(value)) {
                  throw new Error(`${header}必须是数字`)
                }
                break
              
              case 'is_remote':
                value = value === '是' || value === 'true' || value === '1'
                break
              
              case 'status':
                value = STATUS_MAPPING[value] || value
                if (!['published', 'draft', 'paused', 'closed'].includes(value)) {
                  throw new Error(`职位状态无效: ${value}`)
                }
                break
              
              case 'priority':
                value = PRIORITY_MAPPING[value] || parseInt(value)
                if (isNaN(value) || value < 1 || value > 5) {
                  throw new Error(`优先级必须是1-5之间的数字`)
                }
                break
              
              case 'expires_at':
                // 验证日期格式
                const date = new Date(value)
                if (isNaN(date.getTime())) {
                  throw new Error(`过期日期格式错误: ${value}`)
                }
                value = date.toISOString().split('T')[0]
                break
            }

            jobData[fieldName] = value
          }
        })

        // 验证必填字段
        const missingFields = REQUIRED_FIELDS.filter(field => !jobData[field])
        if (missingFields.length > 0) {
          throw new Error(`缺少必填字段: ${missingFields.join(', ')}`)
        }

        jobs.push(jobData)

      } catch (error) {
        errors.push(`第${rowIndex}行: ${error instanceof Error ? error.message : '数据格式错误'}`)
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { 
          error: '数据验证失败',
          details: errors
        },
        { status: 400 }
      )
    }

    // 批量插入数据库
    let created = 0
    let skipped = 0

    for (const job of jobs) {
      try {
        // 检查是否已存在相同职位
        const { data: existing } = await supabaseAdmin
          .from('jobs')
          .select('id')
          .eq('title', job.title)
          .eq('department', job.department)
          .eq('location', job.location)
          .single()

        if (existing) {
          skipped++
          continue
        }

        // 插入新职位
        const { error: insertError } = await supabaseAdmin
          .from('jobs')
          .insert(job)

        if (insertError) {
          console.error('插入职位失败:', insertError)
          continue
        }

        created++

      } catch (error) {
        console.error('处理职位数据失败:', error)
        continue
      }
    }

    return NextResponse.json({
      success: true,
      message: `批量上传完成`,
      created,
      skipped,
      total: jobs.length
    })

  } catch (error) {
    console.error('Excel批量上传失败:', error)
    return NextResponse.json(
      { error: '处理Excel文件失败' },
      { status: 500 }
    )
  }
}
