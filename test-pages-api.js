#!/usr/bin/env node

// 简单的 Cloudflare Pages Functions API 测试脚本
const BASE_URL = 'http://localhost:8788';

async function testAPI() {
  console.log('🧪 开始测试 Cloudflare Pages Functions API...\n');

  // 测试职位列表 API
  try {
    console.log('📋 测试职位列表 API...');
    const response = await fetch(`${BASE_URL}/api/jobs`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ 职位列表 API 正常');
      console.log(`   返回 ${data.data?.length || 0} 个职位\n`);
    } else {
      console.log('❌ 职位列表 API 失败:', data.error);
    }
  } catch (error) {
    console.log('❌ 职位列表 API 连接失败:', error.message);
  }

  // 测试申请提交 API
  try {
    console.log('📝 测试申请提交 API...');
    const response = await fetch(`${BASE_URL}/api/applications/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobId: 'test-job-id',
        candidateId: 'test-candidate-id',
        coverLetter: '这是一个测试申请',
        resumeUrl: 'https://example.com/resume.pdf'
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ 申请提交 API 正常');
      console.log(`   返回消息: ${data.message}\n`);
    } else {
      console.log('⚠️  申请提交 API 返回错误 (这是正常的，因为是测试数据):', data.error);
    }
  } catch (error) {
    console.log('❌ 申请提交 API 连接失败:', error.message);
  }

  console.log('🎉 API 测试完成！');
}

// 检查是否有 fetch 函数（Node.js 18+）
if (typeof fetch === 'undefined') {
  console.log('❌ 需要 Node.js 18+ 或安装 node-fetch');
  console.log('   请运行: npm install node-fetch');
  process.exit(1);
}

testAPI().catch(console.error);
