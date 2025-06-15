// 测试jobs API
const fetch = require('node-fetch');

async function testJobsAPI() {
  try {
    console.log('测试获取职位列表...');
    
    const response = await fetch('http://localhost:3002/api/jobs');
    const data = await response.json();
    
    console.log('响应状态:', response.status);
    console.log('响应数据:', JSON.stringify(data, null, 2));
    
    if (data.success && data.jobs) {
      console.log(`\n成功获取 ${data.jobs.length} 个职位:`);
      data.jobs.forEach((job, index) => {
        console.log(`${index + 1}. ${job.title} (${job.department}) - ID: ${job.id}`);
      });
    }
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testJobsAPI();
