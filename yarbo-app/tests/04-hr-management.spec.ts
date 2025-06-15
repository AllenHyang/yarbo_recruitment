import { test, expect } from '@playwright/test';
import { TestHelpers, PAGES } from './utils/test-helpers';

test.describe('HR管理系统测试 - HR Management System (22个页面)', () => {
  let testHelpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    testHelpers = new TestHelpers(page);
    // 每个测试前都以HR身份登录
    await testHelpers.loginAsHR();
  });

  test('4.1 HR仪表板 (/hr/dashboard) - 管理中心主页', async ({ page }) => {
    await page.goto('/hr/dashboard');
    await testHelpers.waitForPageLoad();

    // 验证页面标题
    await testHelpers.verifyTextContent('h1', 'HR 管理仪表板');

    // 验证统计卡片 (4个)
    const statisticsCards = [
      '[data-testid="pending-applications"]',
      '[data-testid="monthly-received"]', 
      '[data-testid="interview-passed"]',
      '[data-testid="monthly-hired"]'
    ];

    for (const card of statisticsCards) {
      await testHelpers.verifyElementVisible(card);
    }

    // 验证快捷操作卡片 (7个)
    const quickActionCards = [
      'a[href="/hr/jobs"]',           // 职位管理
      'a[href="/hr/campus-recruitment"]', // 校园招聘
      'a[href="/hr/internship"]',     // 实习管理
      'a[href="/hr/psychological-assessment"]', // 心理测评
      'a[href="/hr/candidates"]',     // 查看简历库
      'a[href="/hr/interviews"]',     // 面试安排
      'a[href="/hr/reports"]'         // 数据报告
    ];

    for (const card of quickActionCards) {
      await testHelpers.verifyElementVisible(card);
    }

    // 验证操作按钮
    const actionButtons = [
      'button:has-text("刷新数据")',
      'button:has-text("导出报告")',
      'button:has-text("发送批量邮件")',
      'button:has-text("设置")'
    ];

    for (const button of actionButtons) {
      const buttonExists = await page.locator(button).count() > 0;
      if (buttonExists) {
        await testHelpers.verifyElementVisible(button);
      }
    }

    // 测试刷新数据功能
    await testHelpers.clickButtonAndWait('刷新数据');
    await testHelpers.verifyDataLoading();

    // 测试快捷操作导航
    await page.click('a[href="/hr/jobs"]');
    await testHelpers.verifyURL(/\/hr\/jobs/);

    // 返回仪表板
    await page.goto('/hr/dashboard');
    await page.click('a[href="/hr/candidates"]');
    await testHelpers.verifyURL(/\/hr\/candidates/);
  });

  test('4.2 申请管理 (/hr/applications) - 申请查看和管理', async ({ page }) => {
    await page.goto('/hr/applications');
    await testHelpers.waitForPageLoad();

    // 验证页面元素
    await testHelpers.verifyElementVisible('table, [data-testid="applications-table"]');
    
    // 验证搜索功能
    await testHelpers.verifyElementVisible('input[type="search"], input[placeholder*="搜索"]');
    
    // 验证筛选器
    await testHelpers.verifyElementVisible('select[name="status"], [data-testid="status-filter"]');

    // 验证操作按钮
    const actionButtons = [
      'button:has-text("导出数据")',
      'button:has-text("刷新")',
      'button:has-text("批量审核")',
      'button:has-text("批量拒绝")'
    ];

    for (const button of actionButtons) {
      const buttonExists = await page.locator(button).count() > 0;
      if (buttonExists) {
        await testHelpers.verifyElementVisible(button);
      }
    }

    // 测试搜索功能
    const searchInput = page.locator('input[type="search"], input[placeholder*="搜索"]');
    if (await searchInput.count() > 0) {
      await searchInput.fill('测试候选人');
      await page.keyboard.press('Enter');
      await testHelpers.waitForPageLoad();
    }

    // 测试状态筛选
    const statusFilter = page.locator('select[name="status"], [data-testid="status-filter"]');
    if (await statusFilter.count() > 0) {
      await statusFilter.selectOption('pending');
      await testHelpers.waitForPageLoad();
    }

    // 测试批量选择
    const selectAllCheckbox = page.locator('input[type="checkbox"][data-testid="select-all"]');
    if (await selectAllCheckbox.count() > 0) {
      await selectAllCheckbox.check();
      
      // 验证批量操作工具栏显示
      await testHelpers.verifyElementVisible('[data-testid="bulk-actions"]');
    }

    // 测试单个申请查看
    const viewButtons = page.locator('button:has-text("查看"), a:has-text("查看")');
    if (await viewButtons.count() > 0) {
      await viewButtons.first().click();
      await testHelpers.verifyURL(/\/hr\/applications\/\d+/);
    }
  });

  test('4.3 申请详情 (/hr/applications/[id]) - 单个申请详情', async ({ page }) => {
    // 先访问申请列表
    await page.goto('/hr/applications');
    await testHelpers.waitForPageLoad();

    // 点击第一个申请的查看按钮
    const viewButton = page.locator('button:has-text("查看"), a:has-text("查看")').first();
    if (await viewButton.count() > 0) {
      await viewButton.click();
      await testHelpers.waitForPageLoad();

      // 验证申请详情页面元素
      await testHelpers.verifyElementVisible('[data-testid="candidate-info"]');
      
      // 验证操作按钮
      const actionButtons = [
        'button:has-text("返回")',
        'button:has-text("下载简历")',
        'button:has-text("发送邮件")',
        'button:has-text("安排面试")',
        'button:has-text("更新状态")',
        'button:has-text("添加备注")'
      ];

      for (const button of actionButtons) {
        const buttonExists = await page.locator(button).count() > 0;
        if (buttonExists) {
          await testHelpers.verifyElementVisible(button);
        }
      }

      // 验证状态更新下拉框
      await testHelpers.verifyElementVisible('select[name="status"], [data-testid="status-select"]');

      // 验证备注输入框
      await testHelpers.verifyElementVisible('textarea[name="notes"], [data-testid="notes-input"]');

      // 测试状态更新
      const statusSelect = page.locator('select[name="status"], [data-testid="status-select"]');
      if (await statusSelect.count() > 0) {
        await statusSelect.selectOption('interview');
        await testHelpers.clickButtonAndWait('更新状态');
      }

      // 测试添加备注
      const notesInput = page.locator('textarea[name="notes"], [data-testid="notes-input"]');
      if (await notesInput.count() > 0) {
        await notesInput.fill('候选人表现良好，推荐进入面试环节');
        await testHelpers.clickButtonAndWait('添加备注');
      }

      // 测试返回按钮
      await testHelpers.clickButtonAndWait('返回');
      await testHelpers.verifyURL(/\/hr\/applications/);
    }
  });

  test('4.4 候选人管理 (/hr/candidates) - 简历库管理', async ({ page }) => {
    await page.goto('/hr/candidates');
    await testHelpers.waitForPageLoad();

    // 验证候选人列表
    await testHelpers.verifyElementVisible('table, [data-testid="candidates-table"]');

    // 验证搜索和筛选
    await testHelpers.verifyElementVisible('input[type="search"], input[placeholder*="搜索"]');
    
    // 验证筛选器
    const filters = [
      '[data-testid="skill-filter"]',
      '[data-testid="experience-filter"]',
      '[data-testid="status-filter"]'
    ];

    for (const filter of filters) {
      const filterExists = await page.locator(filter).count() > 0;
      if (filterExists) {
        await testHelpers.verifyElementVisible(filter);
      }
    }

    // 验证操作按钮
    const actionButtons = [
      'button:has-text("批量导出")',
      'button:has-text("添加候选人")',
      'button:has-text("批量操作")'
    ];

    for (const button of actionButtons) {
      const buttonExists = await page.locator(button).count() > 0;
      if (buttonExists) {
        await testHelpers.verifyElementVisible(button);
      }
    }

    // 测试搜索功能
    const searchInput = page.locator('input[type="search"]');
    if (await searchInput.count() > 0) {
      await searchInput.fill('Java开发');
      await page.keyboard.press('Enter');
      await testHelpers.waitForPageLoad();
    }

    // 测试候选人详情查看
    const candidateLinks = page.locator('a[href*="/hr/candidates/"]');
    if (await candidateLinks.count() > 0) {
      await candidateLinks.first().click();
      await testHelpers.verifyURL(/\/hr\/candidates\/\d+/);
    }
  });

  test('4.5 职位管理 (/hr/jobs) - 职位信息管理', async ({ page }) => {
    await page.goto('/hr/jobs');
    await testHelpers.waitForPageLoad();

    // 验证职位列表
    await testHelpers.verifyElementVisible('table, [data-testid="jobs-table"]');

    // 验证创建职位按钮
    await testHelpers.verifyElementVisible('button:has-text("创建职位"), a:has-text("创建职位")');

    // 验证搜索和筛选
    await testHelpers.verifyElementVisible('input[type="search"]');

    // 验证筛选器
    const filters = [
      'select[name="department"]',
      'select[name="status"]',
      'select[name="type"]'
    ];

    for (const filter of filters) {
      const filterExists = await page.locator(filter).count() > 0;
      if (filterExists) {
        await testHelpers.verifyElementVisible(filter);
      }
    }

    // 测试创建职位
    const createButton = page.locator('button:has-text("创建职位"), a:has-text("创建职位")');
    if (await createButton.count() > 0) {
      await createButton.click();
      await testHelpers.verifyURL(/\/hr\/jobs\/create/);
    }

    // 返回职位列表测试其他功能
    await page.goto('/hr/jobs');
    
    // 测试职位编辑
    const editButtons = page.locator('button:has-text("编辑"), a:has-text("编辑")');
    if (await editButtons.count() > 0) {
      await editButtons.first().click();
      await testHelpers.verifyURL(/\/hr\/jobs\/\d+\/edit/);
    }
  });

  test('4.6 创建职位 (/hr/jobs/create) - 新职位创建', async ({ page }) => {
    await page.goto('/hr/jobs/create');
    await testHelpers.waitForPageLoad();

    // 验证职位创建表单
    await testHelpers.verifyElementVisible('form');

    // 验证表单字段
    const formFields = [
      'input[name="title"]',          // 职位标题
      'input[name="salary"]',         // 薪资范围
      'input[name="location"]',       // 工作地点
      'textarea[name="description"]', // 职位描述
      'textarea[name="requirements"]', // 任职要求
      'select[name="department"]',    // 部门
      'select[name="type"]',          // 职位类型
      'select[name="workType"]'       // 工作性质
    ];

    for (const field of formFields) {
      const fieldExists = await page.locator(field).count() > 0;
      if (fieldExists) {
        await testHelpers.verifyElementVisible(field);
      }
    }

    // 验证操作按钮
    const actionButtons = [
      'button:has-text("保存")',
      'button:has-text("预览")',
      'button:has-text("发布")'
    ];

    for (const button of actionButtons) {
      const buttonExists = await page.locator(button).count() > 0;
      if (buttonExists) {
        await testHelpers.verifyElementVisible(button);
      }
    }

    // 测试表单填写
    await testHelpers.fillForm({
      'input[name="title"]': '高级前端开发工程师',
      'input[name="salary"]': '15000-25000',
      'input[name="location"]': '北京'
    });

    // 填写职位描述
    const descriptionField = page.locator('textarea[name="description"]');
    if (await descriptionField.count() > 0) {
      await descriptionField.fill('负责前端开发工作，使用React、Vue等技术栈');
    }

    // 选择部门
    const departmentSelect = page.locator('select[name="department"]');
    if (await departmentSelect.count() > 0) {
      await departmentSelect.selectOption({ index: 1 });
    }

    // 测试保存功能
    const saveButton = page.locator('button:has-text("保存")');
    if (await saveButton.count() > 0) {
      await saveButton.click();
      await testHelpers.waitForPageLoad();
    }
  });

  test('4.7 面试管理 (/hr/interviews) - 面试安排', async ({ page }) => {
    await page.goto('/hr/interviews');
    await testHelpers.waitForPageLoad();

    // 验证面试列表
    await testHelpers.verifyElementVisible('table, [data-testid="interviews-table"]');

    // 验证日历组件
    await testHelpers.verifyElementVisible('[data-testid="calendar"], .calendar');

    // 验证操作按钮
    const actionButtons = [
      'button:has-text("安排面试")',
      'button:has-text("取消面试")',
      'button:has-text("重新安排")'
    ];

    for (const button of actionButtons) {
      const buttonExists = await page.locator(button).count() > 0;
      if (buttonExists) {
        await testHelpers.verifyElementVisible(button);
      }
    }

    // 验证筛选器
    const filters = [
      'input[type="date"]',
      'select[name="interviewer"]',
      'select[name="status"]'
    ];

    for (const filter of filters) {
      const filterExists = await page.locator(filter).count() > 0;
      if (filterExists) {
        await testHelpers.verifyElementVisible(filter);
      }
    }

    // 测试安排面试
    const scheduleButton = page.locator('button:has-text("安排面试")');
    if (await scheduleButton.count() > 0) {
      await scheduleButton.click();
      
      // 验证面试安排表单
      await testHelpers.verifyElementVisible('[data-testid="interview-form"]');
    }
  });

  test('4.8 面试反馈 (/hr/interviews/feedback) - 反馈收集', async ({ page }) => {
    await page.goto('/hr/interviews/feedback');
    await testHelpers.waitForPageLoad();

    // 验证面试反馈表单
    await testHelpers.verifyElementVisible('form');

    // 验证评分组件
    await testHelpers.verifyElementVisible('[data-testid="rating-component"]');

    // 验证反馈字段
    const feedbackFields = [
      'textarea[name="technical"]',    // 技术能力评价
      'textarea[name="communication"]', // 沟通能力评价
      'textarea[name="overall"]',      // 综合评价
      'textarea[name="suggestion"]'    // 建议
    ];

    for (const field of feedbackFields) {
      const fieldExists = await page.locator(field).count() > 0;
      if (fieldExists) {
        await testHelpers.verifyElementVisible(field);
      }
    }

    // 验证操作按钮
    const actionButtons = [
      'button:has-text("提交反馈")',
      'button:has-text("保存草稿")'
    ];

    for (const button of actionButtons) {
      const buttonExists = await page.locator(button).count() > 0;
      if (buttonExists) {
        await testHelpers.verifyElementVisible(button);
      }
    }

    // 测试评分功能
    const ratingStars = page.locator('[data-testid="rating-star"]');
    if (await ratingStars.count() > 0) {
      await ratingStars.nth(3).click(); // 点击第4颗星
    }

    // 测试反馈填写
    const overallField = page.locator('textarea[name="overall"]');
    if (await overallField.count() > 0) {
      await overallField.fill('候选人表现优秀，技术能力强，推荐录用');
    }

    // 测试提交反馈
    const submitButton = page.locator('button:has-text("提交反馈")');
    if (await submitButton.count() > 0) {
      await submitButton.click();
      await testHelpers.waitForPageLoad();
    }
  });

  test('4.9 数据分析 (/hr/analytics) - 招聘数据分析', async ({ page }) => {
    await page.goto('/hr/analytics');
    await testHelpers.waitForPageLoad();

    // 验证图表组件
    await testHelpers.verifyElementVisible('[data-testid="chart"], .recharts-wrapper');

    // 验证日期选择器
    await testHelpers.verifyElementVisible('input[type="date"], [data-testid="date-picker"]');

    // 验证筛选器
    const filters = [
      'select[name="department"]',
      'select[name="position"]'
    ];

    for (const filter of filters) {
      const filterExists = await page.locator(filter).count() > 0;
      if (filterExists) {
        await testHelpers.verifyElementVisible(filter);
      }
    }

    // 验证导出按钮
    await testHelpers.verifyElementVisible('button:has-text("导出分析报告")');

    // 测试图表交互
    const chartElement = page.locator('[data-testid="chart"], .recharts-wrapper');
    if (await chartElement.count() > 0) {
      await chartElement.hover();
      // 验证图表工具提示
      await testHelpers.verifyElementVisible('[data-testid="chart-tooltip"]');
    }

    // 测试日期筛选
    const dateInput = page.locator('input[type="date"]');
    if (await dateInput.count() > 0) {
      await dateInput.fill('2024-01-01');
      await testHelpers.waitForPageLoad();
    }

    // 测试导出功能
    const exportButton = page.locator('button:has-text("导出分析报告")');
    if (await exportButton.count() > 0) {
      await exportButton.click();
      await testHelpers.waitForPageLoad();
    }
  });

  test('4.10 HR系统集成测试', async ({ page }) => {
    // 完整的HR工作流程测试
    
    // 1. 从仪表板开始
    await page.goto('/hr/dashboard');
    await testHelpers.waitForPageLoad();

    // 2. 查看申请列表
    await page.click('a[href="/hr/applications"]');
    await testHelpers.verifyURL(/\/hr\/applications/);

    // 3. 查看申请详情
    const viewButton = page.locator('button:has-text("查看"), a:has-text("查看")').first();
    if (await viewButton.count() > 0) {
      await viewButton.click();
      await testHelpers.waitForPageLoad();
    }

    // 4. 安排面试
    const scheduleButton = page.locator('button:has-text("安排面试")');
    if (await scheduleButton.count() > 0) {
      await scheduleButton.click();
      await testHelpers.waitForPageLoad();
    }

    // 5. 查看面试管理
    await page.goto('/hr/interviews');
    await testHelpers.waitForPageLoad();

    // 6. 查看数据分析
    await page.goto('/hr/analytics');
    await testHelpers.waitForPageLoad();

    // 验证整个流程的一致性
    await testHelpers.verifyElementVisible('nav, [data-testid="navigation"]');
  });
});
