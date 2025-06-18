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

async function checkTableStructure() {
  try {
    // 获取一条记录来查看所有字段
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .limit(1)

    if (error) throw error

    if (data && data.length > 0) {
      console.log('=== Jobs表字段结构 ===')
      const fields = Object.keys(data[0])
      fields.forEach(field => {
        const value = data[0][field]
        const type = value === null ? 'null' : typeof value
        console.log(`- ${field}: ${type}`)
      })

      // 获取前5个职位
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      if (!jobsError && jobs) {
        console.log('\n=== 最新的5个职位 ===')
        jobs.forEach((job, index) => {
          console.log(`\n${index + 1}. ${job.title}`)
          console.log(`   ID: ${job.id}`)
          console.log(`   部门: ${job.department}`)
          console.log(`   地点: ${job.location}`)
          console.log(`   详情页: http://localhost:3000/jobs/${job.id}`)
        })

        console.log('\n建议测试第一个职位的详情页:')
        console.log(`http://localhost:3000/jobs/${jobs[0].id}`)
      }
    }

  } catch (err) {
    console.error('错误:', err.message)
  }
}

checkTableStructure()