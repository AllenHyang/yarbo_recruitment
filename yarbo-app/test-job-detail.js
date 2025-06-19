const { chromium } = require('playwright');

(async () => {
  console.log('启动 Playwright 测试...');
  
  // 启动浏览器
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('1. 访问职位列表页面...');
    await page.goto('http://localhost:3000/jobs');
    await page.waitForSelector('[class*="Card"]', { timeout: 30000 });
    
    // 获取第一个职位信息
    const jobInfo = await page.evaluate(() => {
      const firstLink = document.querySelector('a[href*="/job-detail"]');
      const container = firstLink?.closest('div');
      return {
        href: firstLink?.href,
        title: container?.querySelector('strong')?.nextSibling?.textContent?.trim(),
        id: container?.querySelector('p:nth-child(1)')?.textContent?.replace('ID: ', '')
      };
    });
    
    console.log('找到职位卡片');
    
    console.log('2. 点击查看详情按钮...');
    const detailButton = await page.locator('text=查看详情').first();
    await detailButton.click();
    
    console.log('3. 等待页面跳转到职位详情页...');
    await page.waitForURL(/\/job-detail\?id=/, { timeout: 10000 });
    
    console.log('当前URL:', page.url());
    
    console.log('4. 等待页面内容加载...');
    await page.waitForSelector('h1', { timeout: 10000 });
    
    // 获取页面信息
    const pageInfo = await page.evaluate(() => {
      return {
        title: document.querySelector('h1')?.textContent,
        hasJobDescription: !!document.querySelector('text=职位描述'),
        hasRequirements: !!document.querySelector('text=职位要求'),
        hasBenefits: !!document.querySelector('text=福利待遇'),
        hasBasicInfo: !!document.querySelector('text=基本信息'),
        hasSalary: !!document.querySelector('text=薪资范围'),
        bodyText: document.body.innerText.substring(0, 500)
      };
    });
    
    console.log('5. 页面信息:', pageInfo);
    
    // 检查是否显示错误
    const hasError = await page.locator('text=职位未找到').isVisible().catch(() => false);
    if (hasError) {
      console.error('❌ 页面显示"职位未找到"错误');
    } else {
      console.log('✅ 职位详情页正常显示');
    }
    
    // 截图
    console.log('6. 保存截图...');
    await page.screenshot({ 
      path: 'job-detail-test.png', 
      fullPage: true 
    });
    console.log('截图已保存为 job-detail-test.png');
    
    // 检查关键元素
    const elements = [
      { selector: 'h1', name: '职位标题' },
      { selector: 'text=职位描述', name: '职位描述' },
      { selector: 'text=基本信息', name: '基本信息' },
      { selector: 'text=薪资范围', name: '薪资范围' },
      { selector: 'button:has-text("立即申请"), button:has-text("暂停招聘")', name: '申请按钮' }
    ];
    
    console.log('\n7. 检查页面元素:');
    for (const elem of elements) {
      const isVisible = await page.locator(elem.selector).isVisible().catch(() => false);
      console.log(`   ${elem.name}: ${isVisible ? '✅ 存在' : '❌ 不存在'}`);
    }
    
  } catch (error) {
    console.error('测试失败:', error);
  } finally {
    console.log('\n测试完成，5秒后关闭浏览器...');
    await page.waitForTimeout(5000);
    await browser.close();
  }
})();