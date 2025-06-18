import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 加载环境变量
config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testJobDetail() {
  try {
    // 获取前5个职位作为测试样本
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('id, title, department, location, type')
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) throw error

    console.log('=== 最新的5个职位 ===')
    jobs.forEach((job, index) => {
      console.log(`\n${index + 1}. ${job.title}`)
      console.log(`   部门: ${job.department}`)
      console.log(`   地点: ${job.location}`)
      console.log(`   类型: ${job.type}`)
      console.log(`   详情页: http://localhost:3000/jobs/${job.id}`)
    })

    // 测试第一个职位的详情
    if (jobs.length > 0) {
      const testJobId = jobs[0].id
      console.log(`\n=== 测试职位详情数据 (ID: ${testJobId}) ===`)
      
      const { data: jobDetail, error: detailError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', testJobId)
        .single()

      if (detailError) {
        console.error('获取职位详情失败:', detailError)
      } else {
        console.log('职位标题:', jobDetail.title)
        console.log('部门:', jobDetail.department)
        console.log('地点:', jobDetail.location)
        console.log('工作类型:', jobDetail.type)
        console.log('招聘人数:', jobDetail.headcount)
        console.log('申请邮箱:', jobDetail.application_email)
        console.log('\n建议访问此URL测试详情页:')
        console.log(`http://localhost:3000/jobs/${testJobId}`)
      }
    }

  } catch (err) {
    console.error('错误:', err.message)
  }
}

testJobDetail()