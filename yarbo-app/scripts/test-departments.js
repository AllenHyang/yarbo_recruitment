import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function fetchJobs() {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('id, title, department')
      .order('created_at', { ascending: false })

    if (error) throw error

    const jobs = data || []
    const jobsWithDepartment = jobs.filter(job => job.department)
    const jobsWithoutDepartment = jobs.filter(job => !job.department)

    console.log('=== 职位部门关联情况 ===')
    console.log(`总职位数: ${jobs.length}`)
    console.log(`有部门的职位数: ${jobsWithDepartment.length}`)
    console.log(`无部门的职位数: ${jobsWithoutDepartment.length}`)
    
    if (jobsWithoutDepartment.length > 0) {
      console.log('\n=== 无部门的职位列表 ===')
      jobsWithoutDepartment.forEach(job => {
        console.log(`- ${job.title} (ID: ${job.id})`)
      })
    }

    // 选择第一个无部门的职位进行测试
    if (jobsWithoutDepartment.length > 0) {
      const testJob = jobsWithoutDepartment[0]
      console.log(`\n测试职位详情页: http://localhost:3000/jobs/${testJob.id}`)
      console.log(`职位名称: ${testJob.title}`)
    }

  } catch (err) {
    console.error('错误:', err.message)
  }
}

fetchJobs()