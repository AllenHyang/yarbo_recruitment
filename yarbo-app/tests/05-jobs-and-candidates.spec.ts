import { test, expect } from '@playwright/test';
import { TestHelpers, PAGES } from './utils/test-helpers';

test.describe('工作职位和候选人系统测试 - Jobs & Candidates (3个页面)', () => {
  let testHelpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    testHelpers = new TestHelpers(page);
  });

  test('5.1 职位列表 (/jobs) - 公开职位浏览', async ({ page }) => {
    await page.goto(PAGES.JOBS);
    await testHelpers.waitForPageLoad();

    // 验证页面标题
    await testHelpers.verifyTextContent('h1', '探索我们的工作机会');

    // 验证搜索框
    await testHelpers.verifyElementVisible('input[type="search"], input[placeholder*="搜索"]');

    // 验证筛选器
    const filters = [
      'select[name="department"], [data-testid="department-filter"]',
      'select[name="location"], [data-testid="location-filter"]',
      'select[name="type"], [data-testid="type-filter"]'
    ];

    for (const filter of filters) {
      const filterExists = await page.locator(filter).count() > 0;
      if (filterExists) {
        await testHelpers.verifyElementVisible(filter);
      }
    }

    // 验证职位卡片
    await testHelpers.verifyElementVisible('[data-testid="job-card"], .job-card');

    // 验证职位卡片内容
    const jobCards = page.locator('[data-testid="job-card"], .job-card');
    const cardCount = await jobCards.count();
    
    if (cardCount > 0) {
      const firstCard = jobCards.first();
      
      // 验证职位信息
      await testHelpers.verifyElementVisible('h3, .job-title', firstCard);
      await testHelpers.verifyElementVisible('.job-department, [data-testid="department"]', firstCard);
      await testHelpers.verifyElementVisible('.job-location, [data-testid="location"]', firstCard);
      
      // 验证申请按钮
      await testHelpers.verifyElementVisible('button:has-text("申请职位"), a:has-text("申请职位")', firstCard);
      await testHelpers.verifyElementVisible('button:has-text("查看详情"), a:has-text("查看详情")', firstCard);
    }

    // 验证分页组件
    const pagination = page.locator('[data-testid="pagination"], .pagination');
    if (await pagination.count() > 0) {
      await testHelpers.verifyElementVisible('[data-testid="pagination"]');
    }

    // 测试搜索功能
    const searchInput = page.locator('input[type="search"], input[placeholder*="搜索"]');
    if (await searchInput.count() > 0) {
      await searchInput.fill('前端开发');
      await page.keyboard.press('Enter');
      await testHelpers.waitForPageLoad();
      
      // 验证搜索结果
      await testHelpers.verifyElementVisible('[data-testid="search-results"]');
    }

    // 测试筛选功能
    const departmentFilter = page.locator('select[name="department"], [data-testid="department-filter"]');
    if (await departmentFilter.count() > 0) {
      await departmentFilter.selectOption({ index: 1 });
      await testHelpers.waitForPageLoad();
    }

    // 测试职位详情查看
    const detailButton = page.locator('button:has-text("查看详情"), a:has-text("查看详情")').first();
    if (await detailButton.count() > 0) {
      await detailButton.click();
      await testHelpers.verifyURL(/\/jobs\/\d+/);
    }
  });

  test('5.2 职位详情 (/jobs/[id]) - 单个职位详细信息', async ({ page }) => {
    // 先访问职位列表
    await page.goto(PAGES.JOBS);
    await testHelpers.waitForPageLoad();

    // 点击第一个职位的详情按钮
    const detailButton = page.locator('button:has-text("查看详情"), a:has-text("查看详情")').first();
    if (await detailButton.count() > 0) {
      await detailButton.click();
      await testHelpers.waitForPageLoad();

      // 验证职位详情页面元素
      await testHelpers.verifyElementVisible('[data-testid="job-title"], h1');
      await testHelpers.verifyElementVisible('[data-testid="job-description"]');
      await testHelpers.verifyElementVisible('[data-testid="job-requirements"]');
      await testHelpers.verifyElementVisible('[data-testid="job-benefits"]');

      // 验证职位信息
      const jobInfoElements = [
        '[data-testid="salary"]',
        '[data-testid="location"]',
        '[data-testid="department"]',
        '[data-testid="work-type"]',
        '[data-testid="experience-level"]'
      ];

      for (const element of jobInfoElements) {
        const elementExists = await page.locator(element).count() > 0;
        if (elementExists) {
          await testHelpers.verifyElementVisible(element);
        }
      }

      // 验证操作按钮
      const actionButtons = [
        'button:has-text("立即申请")',
        'button:has-text("收藏职位")',
        'button:has-text("分享职位")'
      ];

      for (const button of actionButtons) {
        const buttonExists = await page.locator(button).count() > 0;
        if (buttonExists) {
          await testHelpers.verifyElementVisible(button);
        }
      }

      // 验证相关职位推荐
      await testHelpers.verifyElementVisible('[data-testid="related-jobs"]');

      // 测试立即申请功能
      const applyButton = page.locator('button:has-text("立即申请")');
      if (await applyButton.count() > 0) {
        await applyButton.click();
        await testHelpers.verifyURL(/\/apply/);
        
        // 验证职位信息已预填
        const positionSelect = page.locator('select[name="position"]');
        if (await positionSelect.count() > 0) {
          const selectedValue = await positionSelect.inputValue();
          expect(selectedValue).toBeTruthy();
        }
      }

      // 返回职位详情页测试其他功能
      await page.goBack();
      
      // 测试收藏功能
      const favoriteButton = page.locator('button:has-text("收藏职位")');
      if (await favoriteButton.count() > 0) {
        await favoriteButton.click();
        await testHelpers.waitForPageLoad();
        
        // 验证收藏状态变化
        await testHelpers.verifyElementVisible('button:has-text("已收藏")');
      }

      // 测试分享功能
      const shareButton = page.locator('button:has-text("分享职位")');
      if (await shareButton.count() > 0) {
        await shareButton.click();
        
        // 验证分享弹窗
        await testHelpers.verifyElementVisible('[data-testid="share-modal"]');
      }
    } else {
      // 如果没有职位详情按钮，直接访问一个职位详情页面
      await page.goto('/jobs/1');
      await testHelpers.waitForPageLoad();
      
      // 验证页面加载
      await testHelpers.verifyElementVisible('main');
    }
  });

  test('5.3 候选人面试时间选择 (/candidates/interview/[token]) - 面试时间自选', async ({ page }) => {
    // 模拟候选人收到的面试邀请链接
    await page.goto('/candidates/interview/token_abc123');
    await testHelpers.waitForPageLoad();

    // 验证页面标题
    await testHelpers.verifyTextContent('h1', '选择面试时间');

    // 验证日历组件
    await testHelpers.verifyElementVisible('[data-testid="calendar"], .calendar');

    // 验证时间段选择
    await testHelpers.verifyElementVisible('[data-testid="time-slots"]');

    // 验证候选人信息
    await testHelpers.verifyElementVisible('[data-testid="candidate-info"]');

    // 验证职位信息
    await testHelpers.verifyElementVisible('[data-testid="position-info"]');

    // 验证操作按钮
    const actionButtons = [
      'button:has-text("确认选择")',
      'button:has-text("重新选择")',
      'button:has-text("取消面试")'
    ];

    for (const button of actionButtons) {
      const buttonExists = await page.locator(button).count() > 0;
      if (buttonExists) {
        await testHelpers.verifyElementVisible(button);
      }
    }

    // 测试日期选择
    const availableDates = page.locator('[data-testid="available-date"]');
    if (await availableDates.count() > 0) {
      await availableDates.first().click();
      await testHelpers.waitForPageLoad();
      
      // 验证时间段显示
      await testHelpers.verifyElementVisible('[data-testid="time-slot"]');
    }

    // 测试时间段选择
    const timeSlots = page.locator('[data-testid="time-slot"]');
    if (await timeSlots.count() > 0) {
      await timeSlots.first().click();
      
      // 验证选择状态
      await testHelpers.verifyElementVisible('[data-testid="selected-time"]');
    }

    // 验证面试确认信息表单
    await testHelpers.verifyElementVisible('form, [data-testid="confirmation-form"]');

    // 验证确认信息字段
    const confirmationFields = [
      'input[name="name"]',
      'input[name="email"]',
      'input[name="phone"]',
      'textarea[name="notes"]'
    ];

    for (const field of confirmationFields) {
      const fieldExists = await page.locator(field).count() > 0;
      if (fieldExists) {
        await testHelpers.verifyElementVisible(field);
      }
    }

    // 测试确认选择
    const confirmButton = page.locator('button:has-text("确认选择")');
    if (await confirmButton.count() > 0) {
      // 填写确认信息
      await testHelpers.fillForm({
        'input[name="name"]': '张三',
        'input[name="email"]': 'zhangsan@example.com',
        'input[name="phone"]': '13800138000'
      });

      const notesField = page.locator('textarea[name="notes"]');
      if (await notesField.count() > 0) {
        await notesField.fill('期待面试机会，谢谢！');
      }

      await confirmButton.click();
      await testHelpers.waitForPageLoad();

      // 验证确认成功页面
      await testHelpers.verifySuccessMessage('面试时间确认成功');
      await testHelpers.verifyElementVisible('[data-testid="interview-details"]');
    }
  });

  test('5.4 职位搜索和筛选功能测试', async ({ page }) => {
    await page.goto(PAGES.JOBS);
    await testHelpers.waitForPageLoad();

    // 测试关键词搜索
    const searchTerms = ['前端', 'Java', '产品经理', '设计师'];
    
    for (const term of searchTerms) {
      const searchInput = page.locator('input[type="search"]');
      if (await searchInput.count() > 0) {
        await searchInput.clear();
        await searchInput.fill(term);
        await page.keyboard.press('Enter');
        await testHelpers.waitForPageLoad();
        
        // 验证搜索结果
        const jobCards = page.locator('[data-testid="job-card"]');
        const cardCount = await jobCards.count();
        
        if (cardCount > 0) {
          // 验证搜索结果包含关键词
          const firstCardText = await jobCards.first().textContent();
          expect(firstCardText?.toLowerCase()).toContain(term.toLowerCase());
        }
      }
    }

    // 测试组合筛选
    const departmentFilter = page.locator('select[name="department"]');
    const locationFilter = page.locator('select[name="location"]');
    const typeFilter = page.locator('select[name="type"]');

    if (await departmentFilter.count() > 0) {
      await departmentFilter.selectOption({ index: 1 });
    }

    if (await locationFilter.count() > 0) {
      await locationFilter.selectOption({ index: 1 });
    }

    if (await typeFilter.count() > 0) {
      await typeFilter.selectOption({ index: 1 });
    }

    await testHelpers.waitForPageLoad();

    // 验证筛选结果
    await testHelpers.verifyElementVisible('[data-testid="filter-results"]');
  });

  test('5.5 职位申请流程集成测试', async ({ page }) => {
    // 完整的职位申请流程
    
    // 1. 浏览职位列表
    await page.goto(PAGES.JOBS);
    await testHelpers.waitForPageLoad();

    // 2. 搜索感兴趣的职位
    const searchInput = page.locator('input[type="search"]');
    if (await searchInput.count() > 0) {
      await searchInput.fill('前端开发');
      await page.keyboard.press('Enter');
      await testHelpers.waitForPageLoad();
    }

    // 3. 查看职位详情
    const detailButton = page.locator('button:has-text("查看详情"), a:has-text("查看详情")').first();
    if (await detailButton.count() > 0) {
      await detailButton.click();
      await testHelpers.waitForPageLoad();
    }

    // 4. 点击申请职位
    const applyButton = page.locator('button:has-text("立即申请")');
    if (await applyButton.count() > 0) {
      await applyButton.click();
      await testHelpers.verifyURL(/\/apply/);
    }

    // 5. 填写申请表单
    await testHelpers.fillForm({
      'input[name="name"]': '李四',
      'input[type="email"]': 'lisi@example.com',
      'input[name="phone"]': '13900139000'
    });

    // 6. 提交申请
    await testHelpers.clickButtonAndWait('提交申请');

    // 7. 验证申请成功
    await testHelpers.verifySuccessMessage('申请提交成功');
  });

  test('5.6 响应式设计测试', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080 }, // 桌面端
      { width: 768, height: 1024 },  // 平板端
      { width: 375, height: 667 }    // 移动端
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      
      // 测试职位列表页面响应式
      await page.goto(PAGES.JOBS);
      await testHelpers.waitForPageLoad();
      await testHelpers.verifyElementVisible('[data-testid="job-card"]');
      
      // 测试搜索和筛选在移动端的表现
      await testHelpers.verifyElementVisible('input[type="search"]');
      
      // 测试职位详情页面响应式
      const detailButton = page.locator('button:has-text("查看详情")').first();
      if (await detailButton.count() > 0) {
        await detailButton.click();
        await testHelpers.waitForPageLoad();
        await testHelpers.verifyElementVisible('[data-testid="job-title"]');
      }
    }

    // 恢复桌面端
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test('5.7 性能和用户体验测试', async ({ page }) => {
    // 测试职位列表加载性能
    const startTime = Date.now();
    await page.goto(PAGES.JOBS);
    await testHelpers.waitForPageLoad();
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000); // 3秒内加载完成

    // 测试搜索响应性能
    const searchStartTime = Date.now();
    const searchInput = page.locator('input[type="search"]');
    if (await searchInput.count() > 0) {
      await searchInput.fill('测试');
      await page.keyboard.press('Enter');
      await testHelpers.waitForPageLoad();
    }
    const searchTime = Date.now() - searchStartTime;
    
    expect(searchTime).toBeLessThan(2000); // 搜索响应时间

    // 测试分页性能
    const pagination = page.locator('[data-testid="pagination"] button');
    if (await pagination.count() > 1) {
      const pageStartTime = Date.now();
      await pagination.nth(1).click();
      await testHelpers.waitForPageLoad();
      const pageTime = Date.now() - pageStartTime;
      
      expect(pageTime).toBeLessThan(2000); // 分页响应时间
    }

    // 测试职位详情页面加载性能
    const detailStartTime = Date.now();
    const detailButton = page.locator('button:has-text("查看详情")').first();
    if (await detailButton.count() > 0) {
      await detailButton.click();
      await testHelpers.waitForPageLoad();
    }
    const detailTime = Date.now() - detailStartTime;
    
    expect(detailTime).toBeLessThan(2000); // 详情页加载时间
  });
});
