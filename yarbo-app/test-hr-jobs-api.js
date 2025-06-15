// 测试HR职位管理API的脚本
// 运行方式: node test-hr-jobs-api.js

const BASE_URL = 'http://localhost:3004';

async function testHRJobsAPI() {
  console.log('🧪 开始测试HR职位管理API...\n');

  try {
    // 测试1: 获取职位统计
    console.log('📊 测试职位统计API...');
    const statsResponse = await fetch(`${BASE_URL}/api/hr/jobs/stats`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log('✅ 职位统计API响应:', JSON.stringify(statsData, null, 2));
    } else {
      console.log('❌ 职位统计API失败:', statsResponse.status, await statsResponse.text());
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // 测试2: 获取职位列表
    console.log('📋 测试职位列表API...');
    const jobsResponse = await fetch(`${BASE_URL}/api/hr/jobs`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (jobsResponse.ok) {
      const jobsData = await jobsResponse.json();
      console.log('✅ 职位列表API响应:');
      console.log(`- 成功: ${jobsData.success}`);
      console.log(`- 职位数量: ${jobsData.count}`);
      console.log(`- 职位列表: ${jobsData.jobs?.length || 0} 个职位`);
      
      if (jobsData.jobs && jobsData.jobs.length > 0) {
        console.log('\n📝 第一个职位详情:');
        const firstJob = jobsData.jobs[0];
        console.log(`- ID: ${firstJob.id}`);
        console.log(`- 标题: ${firstJob.title}`);
        console.log(`- 部门: ${firstJob.department}`);
        console.log(`- 状态: ${firstJob.status}`);
        console.log(`- 申请数: ${firstJob.application_count}`);
        console.log(`- 浏览数: ${firstJob.views_count}`);
      }
    } else {
      console.log('❌ 职位列表API失败:', jobsResponse.status, await jobsResponse.text());
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // 测试3: 测试筛选功能
    console.log('🔍 测试职位筛选API...');
    const filterResponse = await fetch(`${BASE_URL}/api/hr/jobs?status=published&search=工程师`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (filterResponse.ok) {
      const filterData = await filterResponse.json();
      console.log('✅ 筛选API响应:');
      console.log(`- 筛选结果数量: ${filterData.count}`);
      console.log(`- 筛选条件: status=published, search=工程师`);
    } else {
      console.log('❌ 筛选API失败:', filterResponse.status, await filterResponse.text());
    }

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  }

  console.log('\n🏁 测试完成!');
}

// 运行测试
testHRJobsAPI();
