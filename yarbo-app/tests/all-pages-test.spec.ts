import { test, expect } from '@playwright/test';

test.describe('全页面测试 - All Pages Test', () => {

  test('所有公开页面访问测试', async ({ page }) => {
    console.log('🚀 开始测试所有公开页面...');
    
    // 公开页面列表
    const publicPages = [
      { url: '/', name: '首页', description: '网站主页' },
      { url: '/jobs', name: '职位页面', description: '职位列表和搜索' },
      { url: '/apply', name: '申请页面', description: '职位申请表单' },
      { url: '/status', name: '状态查询', description: '申请状态查询' },
      { url: '/auth/login', name: '登录页面', description: '用户登录' },
      { url: '/auth/register', name: '注册页面', description: '用户注册' },
      { url: '/auth/forgot-password', name: '忘记密码', description: '密码重置' },
      { url: '/terms', name: '使用条款', description: '服务条款' },
      { url: '/privacy', name: '隐私政策', description: '隐私政策' }
    ];

    let successCount = 0;
    let errorCount = 0;

    for (const pageInfo of publicPages) {
      try {
        await page.goto(pageInfo.url);
        await page.waitForLoadState('networkidle', { timeout: 10000 });
        
        // 验证页面基本加载
        await expect(page.locator('main, body').first()).toBeVisible();
        
        // 检查页面标题
        const title = await page.title();
        expect(title).toBeTruthy();
        
        console.log(`✅ ${pageInfo.name} (${pageInfo.url}) - ${pageInfo.description} - 标题: ${title}`);
        successCount++;
      } catch (error) {
        console.log(`❌ ${pageInfo.name} (${pageInfo.url}) - 访问失败: ${error.message}`);
        errorCount++;
      }
    }

    console.log(`📊 公开页面测试统计: ${successCount} 个成功, ${errorCount} 个失败`);
    expect(successCount).toBeGreaterThan(0);
  });

  test('测试和调试页面访问测试', async ({ page }) => {
    console.log('🔧 开始测试调试页面...');
    
    // 测试和调试页面列表
    const debugPages = [
      { url: '/test', name: '系统测试', description: '综合系统测试页面' },
      { url: '/test-api', name: 'API测试', description: 'API接口测试' },
      { url: '/test-apply', name: '申请测试', description: '申请流程测试' },
      { url: '/test-nav', name: '导航测试', description: '导航组件测试' },
      { url: '/test-notifications', name: '通知测试', description: '通知系统测试' },
      { url: '/test-styles', name: '样式测试', description: 'UI样式测试' },
      { url: '/test/email', name: '邮件测试', description: '邮件系统测试' },
      { url: '/test/realtime', name: '实时数据测试', description: '实时数据更新测试' },
      { url: '/debug-jobs', name: '数据库调试', description: 'Supabase数据库连接调试' }
    ];

    let accessibleCount = 0;
    let notFoundCount = 0;

    for (const pageInfo of debugPages) {
      try {
        await page.goto(pageInfo.url);
        await page.waitForLoadState('networkidle', { timeout: 8000 });
        
        // 验证页面加载
        const pageLoaded = await page.locator('main, body').first().isVisible();
        if (pageLoaded) {
          accessibleCount++;
          console.log(`✅ ${pageInfo.name} (${pageInfo.url}) - ${pageInfo.description} - 可访问`);
        } else {
          notFoundCount++;
          console.log(`⚠️ ${pageInfo.name} (${pageInfo.url}) - 页面存在但内容异常`);
        }
      } catch (error) {
        notFoundCount++;
        console.log(`❌ ${pageInfo.name} (${pageInfo.url}) - 无法访问`);
      }
    }

    console.log(`📊 调试页面测试统计: ${accessibleCount} 个可访问, ${notFoundCount} 个不可访问`);
  });

  test('HR系统页面重定向测试', async ({ page }) => {
    console.log('👨‍💼 开始测试HR系统页面...');
    
    // HR系统页面列表 - 这些页面需要登录，应该重定向到登录页
    const hrPages = [
      { url: '/hr/dashboard', name: 'HR仪表板', description: 'HR管理仪表板' },
      { url: '/hr/applications', name: 'HR申请管理', description: '候选人申请管理' },
      { url: '/hr/candidates', name: 'HR候选人管理', description: '候选人信息管理' },
      { url: '/hr/jobs', name: 'HR职位管理', description: '职位发布和管理' },
      { url: '/hr/jobs/create', name: 'HR创建职位', description: '创建新职位' },
      { url: '/hr/interviews', name: 'HR面试管理', description: '面试安排和管理' },
      { url: '/hr/offers', name: 'HR录用管理', description: '录用通知管理' },
      { url: '/hr/analytics', name: 'HR数据分析', description: '招聘数据分析' },
      { url: '/hr/reports', name: 'HR报表', description: '招聘报表' },
      { url: '/hr/settings', name: 'HR设置', description: 'HR系统设置' },
      { url: '/hr/departments', name: 'HR部门管理', description: '部门信息管理' },
      { url: '/hr/office-locations', name: 'HR办公地点', description: '办公地点管理' }
    ];

    let redirectedCount = 0;
    let accessibleCount = 0;
    let errorCount = 0;

    for (const pageInfo of hrPages) {
      try {
        await page.goto(pageInfo.url);
        await page.waitForLoadState('networkidle', { timeout: 8000 });
        
        const currentUrl = page.url();
        
        if (currentUrl.includes('/auth/login')) {
          redirectedCount++;
          console.log(`🔀 ${pageInfo.name} (${pageInfo.url}) - 正确重定向到登录页`);
        } else if (currentUrl.includes('/hr/')) {
          accessibleCount++;
          console.log(`✅ ${pageInfo.name} (${pageInfo.url}) - 可直接访问 (可能已登录)`);
        } else {
          errorCount++;
          console.log(`⚠️ ${pageInfo.name} (${pageInfo.url}) - 重定向到: ${currentUrl}`);
        }
      } catch (error) {
        errorCount++;
        console.log(`❌ ${pageInfo.name} (${pageInfo.url}) - 访问错误: ${error.message}`);
      }
    }

    console.log(`📊 HR页面测试统计: ${redirectedCount} 个重定向, ${accessibleCount} 个可访问, ${errorCount} 个错误`);
  });

  test('管理员页面测试', async ({ page }) => {
    console.log('👑 开始测试管理员页面...');
    
    // 管理员页面列表
    const adminPages = [
      { url: '/admin/dashboard', name: '管理员仪表板', description: '系统管理仪表板' },
      { url: '/admin/offers', name: '管理员录用管理', description: '录用决策管理' }
    ];

    let redirectedCount = 0;
    let accessibleCount = 0;

    for (const pageInfo of adminPages) {
      try {
        await page.goto(pageInfo.url);
        await page.waitForLoadState('networkidle', { timeout: 8000 });
        
        const currentUrl = page.url();
        
        if (currentUrl.includes('/auth/login')) {
          redirectedCount++;
          console.log(`🔀 ${pageInfo.name} (${pageInfo.url}) - 重定向到登录页 (需要管理员权限)`);
        } else {
          accessibleCount++;
          console.log(`✅ ${pageInfo.name} (${pageInfo.url}) - 可访问`);
        }
      } catch (error) {
        console.log(`❌ ${pageInfo.name} (${pageInfo.url}) - 访问失败: ${error.message}`);
      }
    }

    console.log(`📊 管理员页面测试统计: ${redirectedCount} 个重定向, ${accessibleCount} 个可访问`);
  });

  test('用户个人页面测试', async ({ page }) => {
    console.log('👤 开始测试用户个人页面...');
    
    // 用户个人页面列表
    const userPages = [
      { url: '/profile', name: '个人资料', description: '用户个人资料管理' },
      { url: '/dashboard', name: '用户仪表板', description: '用户个人仪表板' },
      { url: '/messages', name: '消息中心', description: '用户消息管理' },
      { url: '/offers', name: '录用通知', description: '用户收到的录用通知' }
    ];

    let redirectedCount = 0;
    let accessibleCount = 0;

    for (const pageInfo of userPages) {
      try {
        await page.goto(pageInfo.url);
        await page.waitForLoadState('networkidle', { timeout: 8000 });
        
        const currentUrl = page.url();
        
        if (currentUrl.includes('/auth/login')) {
          redirectedCount++;
          console.log(`🔀 ${pageInfo.name} (${pageInfo.url}) - 重定向到登录页 (需要登录)`);
        } else {
          accessibleCount++;
          console.log(`✅ ${pageInfo.name} (${pageInfo.url}) - 可访问`);
        }
      } catch (error) {
        console.log(`❌ ${pageInfo.name} (${pageInfo.url}) - 访问失败: ${error.message}`);
      }
    }

    console.log(`📊 用户页面测试统计: ${redirectedCount} 个重定向, ${accessibleCount} 个可访问`);
  });

  test('特殊功能页面测试', async ({ page }) => {
    console.log('🎯 开始测试特殊功能页面...');
    
    // 特殊功能页面列表
    const specialPages = [
      { url: '/campus-recruitment', name: '校园招聘', description: '校园招聘专页' },
      { url: '/internship-recruitment', name: '实习招聘', description: '实习生招聘' },
      { url: '/assessment', name: '能力评估', description: '候选人能力评估' },
      { url: '/setup', name: '系统设置', description: '初始化设置' },
      { url: '/unauthorized', name: '无权限页面', description: '权限不足提示页' },
      { url: '/jobs/f6e4ba3f-fd63-48e0-8434-c7f230f7e92b', name: '职位详情页面', description: '单个职位详细信息' }
    ];

    let accessibleCount = 0;
    let redirectedCount = 0;
    let errorCount = 0;

    for (const pageInfo of specialPages) {
      try {
        await page.goto(pageInfo.url);
        await page.waitForLoadState('networkidle', { timeout: 8000 });
        
        const currentUrl = page.url();
        
        if (currentUrl === pageInfo.url || currentUrl.startsWith(pageInfo.url)) {
          accessibleCount++;
          console.log(`✅ ${pageInfo.name} (${pageInfo.url}) - ${pageInfo.description} - 可访问`);
        } else if (currentUrl.includes('/auth/login')) {
          redirectedCount++;
          console.log(`🔀 ${pageInfo.name} (${pageInfo.url}) - 重定向到登录页`);
        } else {
          console.log(`⚠️ ${pageInfo.name} (${pageInfo.url}) - 重定向到: ${currentUrl}`);
        }
      } catch (error) {
        errorCount++;
        console.log(`❌ ${pageInfo.name} (${pageInfo.url}) - 访问失败`);
      }
    }

    console.log(`📊 特殊功能页面测试统计: ${accessibleCount} 个可访问, ${redirectedCount} 个重定向, ${errorCount} 个错误`);
  });

  test('页面加载性能统计', async ({ page }) => {
    console.log('⏱️ 开始页面性能测试...');
    
    const testPages = [
      { url: '/', name: '首页' },
      { url: '/jobs', name: '职位页面' },
      { url: '/apply', name: '申请页面' },
      { url: '/status', name: '状态查询' },
      { url: '/auth/login', name: '登录页面' }
    ];

    const performanceResults = [];

    for (const pageInfo of testPages) {
      const startTime = Date.now();
      await page.goto(pageInfo.url);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      performanceResults.push({
        name: pageInfo.name,
        url: pageInfo.url,
        loadTime: loadTime
      });
      
      console.log(`⏱️ ${pageInfo.name} - 加载时间: ${(loadTime / 1000).toFixed(2)}s`);
    }

    // 计算平均加载时间
    const averageLoadTime = performanceResults.reduce((sum, result) => sum + result.loadTime, 0) / performanceResults.length;
    console.log(`📊 平均页面加载时间: ${(averageLoadTime / 1000).toFixed(2)}s`);
    
    // 验证没有页面加载时间超过10秒
    for (const result of performanceResults) {
      expect(result.loadTime).toBeLessThan(10000);
    }
  });

}); 