// 测试申请统计API
const testJobId = '660849fe-fdd2-42a5-bb01-4c0f86875a72';

async function testAPI() {
  try {
    console.log('测试职位ID:', testJobId);
    
    // 测试stats API
    const statsResponse = await fetch(`http://localhost:3004/api/jobs/${testJobId}/stats`);
    console.log('Stats API状态:', statsResponse.status);
    
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log('Stats API返回:', JSON.stringify(statsData, null, 2));
    } else {
      const errorData = await statsResponse.text();
      console.log('Stats API错误:', errorData);
    }
    
    // 测试applications API
    const appsResponse = await fetch(`http://localhost:3004/api/jobs/${testJobId}/applications`);
    console.log('Applications API状态:', appsResponse.status);
    
    if (appsResponse.ok) {
      const appsData = await appsResponse.json();
      console.log('Applications API返回:', JSON.stringify(appsData, null, 2));
    } else {
      const errorData = await appsResponse.text();
      console.log('Applications API错误:', errorData);
    }
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testAPI();
