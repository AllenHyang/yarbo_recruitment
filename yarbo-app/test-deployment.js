#!/usr/bin/env node

/**
 * 部署后功能测试脚本
 * 用于验证 AWS Amplify SSR 部署后的所有功能是否正常
 */

const https = require('https');
const http = require('http');

// 配置部署的 URL
const DEPLOYMENT_URL = process.argv[2] || 'https://your-app.amplifyapp.com';
const IS_LOCAL = DEPLOYMENT_URL.includes('localhost');

console.log('🚀 开始测试部署后的应用功能');
console.log(`📍 测试 URL: ${DEPLOYMENT_URL}\n`);

// 测试结果统计
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

// HTTP 请求工具函数
async function request(path, options = {}) {
  const url = new URL(path, DEPLOYMENT_URL);
  const protocol = url.protocol === 'https:' ? https : http;
  
  return new Promise((resolve, reject) => {
    const req = protocol.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = {
            status: res.statusCode,
            headers: res.headers,
            data: data
          };
          
          // 尝试解析 JSON
          try {
            result.json = JSON.parse(data);
          } catch (e) {
            // 不是 JSON 响应
          }
          
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// 测试函数
async function testEndpoint(name, testFn) {
  process.stdout.write(`📋 测试 ${name}... `);
  
  try {
    await testFn();
    console.log('✅ 通过');
    results.passed++;
    results.tests.push({ name, status: 'passed' });
  } catch (error) {
    console.log(`❌ 失败: ${error.message}`);
    results.failed++;
    results.tests.push({ name, status: 'failed', error: error.message });
  }
}

// 主测试函数
async function runTests() {
  console.log('=== 基础功能测试 ===\n');
  
  // 1. 测试首页访问
  await testEndpoint('首页访问', async () => {
    const res = await request('/');
    if (res.status !== 200) {
      throw new Error(`状态码 ${res.status}`);
    }
    if (!res.data.includes('<!DOCTYPE html>')) {
      throw new Error('响应不是有效的 HTML');
    }
  });
  
  // 2. 测试静态资源
  await testEndpoint('静态资源加载', async () => {
    const res = await request('/favicon.ico');
    if (res.status !== 200 && res.status !== 304) {
      throw new Error(`状态码 ${res.status}`);
    }
  });
  
  console.log('\n=== API Routes 测试 ===\n');
  
  // 3. 测试验证码生成 API
  let sessionToken = null;
  let captchaCode = null;
  
  await testEndpoint('验证码生成 API', async () => {
    const res = await request('/api/captcha/generate', {
      method: 'POST'
    });
    
    if (res.status !== 200) {
      throw new Error(`状态码 ${res.status}`);
    }
    
    if (!res.json || !res.json.sessionToken || !res.json.captchaCode) {
      throw new Error('响应格式不正确');
    }
    
    sessionToken = res.json.sessionToken;
    captchaCode = res.json.captchaCode;
    console.log(`    验证码: ${captchaCode}`);
  });
  
  // 4. 测试验证码验证 API
  await testEndpoint('验证码验证 API (正确)', async () => {
    if (!sessionToken || !captchaCode) {
      throw new Error('需要先生成验证码');
    }
    
    const res = await request('/api/captcha/verify', {
      method: 'POST',
      body: { sessionToken, captchaCode }
    });
    
    if (res.status !== 200) {
      throw new Error(`状态码 ${res.status}`);
    }
    
    if (!res.json || !res.json.success) {
      throw new Error('验证失败');
    }
  });
  
  // 5. 测试验证码验证 API（错误）
  await testEndpoint('验证码验证 API (错误)', async () => {
    const res = await request('/api/captcha/verify', {
      method: 'POST',
      body: { 
        sessionToken: 'invalid-token', 
        captchaCode: 'WRONG' 
      }
    });
    
    if (res.status !== 400) {
      throw new Error(`期望状态码 400，实际 ${res.status}`);
    }
  });
  
  console.log('\n=== 页面路由测试 ===\n');
  
  // 6. 测试主要页面
  const pages = [
    { path: '/jobs', name: '职位列表页' },
    { path: '/auth/login', name: '登录页' },
    { path: '/auth/register', name: '注册页' },
    { path: '/privacy', name: '隐私政策页' },
    { path: '/terms', name: '服务条款页' }
  ];
  
  for (const page of pages) {
    await testEndpoint(page.name, async () => {
      const res = await request(page.path);
      if (res.status !== 200) {
        throw new Error(`状态码 ${res.status}`);
      }
      if (!res.data.includes('<!DOCTYPE html>')) {
        throw new Error('响应不是有效的 HTML');
      }
    });
  }
  
  console.log('\n=== 性能测试 ===\n');
  
  // 7. 测试响应时间
  await testEndpoint('首页响应时间', async () => {
    const start = Date.now();
    await request('/');
    const duration = Date.now() - start;
    
    console.log(`    响应时间: ${duration}ms`);
    
    if (duration > 3000) {
      throw new Error(`响应时间过长: ${duration}ms`);
    }
  });
  
  // 8. 测试缓存头
  await testEndpoint('静态资源缓存', async () => {
    const res = await request('/favicon.ico');
    const cacheControl = res.headers['cache-control'];
    
    if (!cacheControl || !cacheControl.includes('max-age')) {
      throw new Error('缺少缓存控制头');
    }
    
    console.log(`    Cache-Control: ${cacheControl}`);
  });
  
  console.log('\n=== 安全测试 ===\n');
  
  // 9. 测试安全头
  await testEndpoint('安全响应头', async () => {
    const res = await request('/');
    const headers = res.headers;
    
    const securityHeaders = {
      'x-frame-options': 'SAMEORIGIN',
      'x-content-type-options': 'nosniff'
    };
    
    for (const [header, expected] of Object.entries(securityHeaders)) {
      if (!headers[header]) {
        console.log(`    警告: 缺少 ${header} 头`);
      }
    }
  });
  
  // 10. 测试环境变量泄露
  await testEndpoint('环境变量安全', async () => {
    const res = await request('/');
    
    // 检查不应该暴露的环境变量
    const sensitiveKeys = [
      'SUPABASE_SERVICE_ROLE_KEY',
      'SMTP_PASS',
      'AWS_SECRET_ACCESS_KEY'
    ];
    
    for (const key of sensitiveKeys) {
      if (res.data.includes(key)) {
        throw new Error(`发现敏感环境变量: ${key}`);
      }
    }
  });
}

// 生成测试报告
function generateReport() {
  console.log('\n' + '='.repeat(50));
  console.log('📊 测试报告\n');
  console.log(`总测试数: ${results.passed + results.failed}`);
  console.log(`✅ 通过: ${results.passed}`);
  console.log(`❌ 失败: ${results.failed}`);
  console.log(`成功率: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  
  if (results.failed > 0) {
    console.log('\n失败的测试:');
    results.tests
      .filter(t => t.status === 'failed')
      .forEach(t => {
        console.log(`  - ${t.name}: ${t.error}`);
      });
  }
  
  console.log('\n' + '='.repeat(50));
  
  // 返回退出码
  process.exit(results.failed > 0 ? 1 : 0);
}

// 运行测试
runTests()
  .then(() => {
    generateReport();
  })
  .catch(error => {
    console.error('\n❌ 测试运行失败:', error);
    process.exit(1);
  });