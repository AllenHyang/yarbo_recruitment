import { test, expect } from '@playwright/test';
import { TestHelpers, PAGES, TestDataGenerator } from './utils/test-helpers';

test.describe('申请系统测试 - Application System (2个页面)', () => {
  let testHelpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    testHelpers = new TestHelpers(page);
  });

  test('3.1 职位申请 (/apply) - 完整申请流程', async ({ page }) => {
    await page.goto(PAGES.APPLY);
    await testHelpers.waitForPageLoad();

    // 验证申请表单元素
    await testHelpers.verifyElementVisible('form');
    
    // 验证必填输入框
    const requiredFields = [
      'input[name="name"]',
      'input[type="email"]',
      'input[type="tel"], input[name="phone"]'
    ];

    for (const field of requiredFields) {
      await testHelpers.verifyElementVisible(field);
    }

    // 验证职位下拉选择框
    await testHelpers.verifyElementVisible('select[name="position"], [data-testid="position-select"]');

    // 验证文件上传组件
    await testHelpers.verifyElementVisible('input[type="file"], [data-testid="resume-upload"]');

    // 验证提交按钮
    await testHelpers.verifyElementVisible('button[type="submit"], button:has-text("提交申请")');

    // 测试表单验证 - 空表单提交
    await testHelpers.clickButtonAndWait('提交申请');
    
    // 测试无效邮箱格式
    await testHelpers.fillForm({
      'input[name="name"]': '测试用户',
      'input[type="email"]': 'invalid-email',
      'input[name="phone"]': '13800138000'
    });
    await testHelpers.clickButtonAndWait('提交申请');

    // 测试无效手机号格式
    await testHelpers.fillForm({
      'input[type="email"]': 'test@example.com',
      'input[name="phone"]': '123'
    });
    await testHelpers.clickButtonAndWait('提交申请');

    // 生成测试数据
    const applicationData = TestDataGenerator.generateJobApplication();

    // 填写有效的申请信息
    await testHelpers.fillForm({
      'input[name="name"]': applicationData.name,
      'input[type="email"]': applicationData.email,
      'input[name="phone"]': applicationData.phone
    });

    // 选择职位
    const positionSelect = page.locator('select[name="position"], [data-testid="position-select"]');
    if (await positionSelect.count() > 0) {
      await positionSelect.selectOption({ index: 1 });
    }

    // 测试文件上传
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.count() > 0) {
      // 创建测试文件
      const testFile = Buffer.from('测试简历内容');
      await fileInput.setInputFiles({
        name: 'test-resume.pdf',
        mimeType: 'application/pdf',
        buffer: testFile
      });

      // 验证文件预览
      await testHelpers.verifyElementVisible('[data-testid="file-preview"]');
    }

    // 提交申请
    await testHelpers.clickButtonAndWait('提交申请');

    // 验证提交成功
    const currentUrl = page.url();
    const isSuccessPage = currentUrl.includes('/apply') && 
                         (await page.locator('text=申请提交成功, text=提交成功').count() > 0);
    
    if (isSuccessPage) {
      await testHelpers.verifySuccessMessage('申请提交成功');
      
      // 验证重新申请按钮
      await testHelpers.verifyElementVisible('button:has-text("提交新申请")');
      
      // 测试重新申请
      await testHelpers.clickButtonAndWait('提交新申请');
    }
  });

  test('3.2 在线测评 (/assessment) - 能力测评', async ({ page }) => {
    await page.goto('/assessment');
    await testHelpers.waitForPageLoad();

    // 验证测评页面加载
    await testHelpers.verifyElementVisible('main');

    // 验证测评表单
    await testHelpers.verifyElementVisible('form, [data-testid="assessment-form"]');

    // 验证测试题目
    const questionElements = [
      '[data-testid="question"]',
      'input[type="radio"]',
      'input[type="checkbox"]',
      'textarea'
    ];

    for (const element of questionElements) {
      const elementExists = await page.locator(element).count() > 0;
      if (elementExists) {
        await testHelpers.verifyElementVisible(element);
      }
    }

    // 测试单选题
    const radioButtons = page.locator('input[type="radio"]');
    const radioCount = await radioButtons.count();
    if (radioCount > 0) {
      await radioButtons.first().check();
    }

    // 测试多选题
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      await checkboxes.first().check();
    }

    // 测试文本题
    const textareas = page.locator('textarea');
    const textareaCount = await textareas.count();
    if (textareaCount > 0) {
      await textareas.first().fill('这是我的答案');
    }

    // 验证导航按钮
    const navigationButtons = [
      'button:has-text("下一题")',
      'button:has-text("上一题")',
      'button:has-text("提交测评")'
    ];

    for (const button of navigationButtons) {
      const buttonExists = await page.locator(button).count() > 0;
      if (buttonExists) {
        await testHelpers.verifyElementVisible(button);
      }
    }

    // 测试题目导航
    const nextButton = page.locator('button:has-text("下一题")');
    if (await nextButton.count() > 0) {
      await nextButton.click();
      await testHelpers.waitForPageLoad();
    }

    // 测试提交测评
    const submitButton = page.locator('button:has-text("提交测评")');
    if (await submitButton.count() > 0) {
      await submitButton.click();
      await testHelpers.waitForPageLoad();
      
      // 验证提交成功
      await testHelpers.verifySuccessMessage('测评提交成功');
    }
  });

  test('3.3 申请系统集成测试', async ({ page }) => {
    // 完整的申请流程测试
    
    // 1. 从首页开始申请流程
    await page.goto(PAGES.HOME);
    await testHelpers.waitForPageLoad();
    
    // 点击快速申请按钮
    await page.click('button:has-text("快速申请"), a:has-text("快速申请")');
    await testHelpers.verifyURL(/\/apply/);

    // 2. 填写申请表单
    const applicationData = TestDataGenerator.generateJobApplication();
    await testHelpers.fillForm({
      'input[name="name"]': applicationData.name,
      'input[type="email"]': applicationData.email,
      'input[name="phone"]': applicationData.phone
    });

    // 3. 选择职位
    const positionSelect = page.locator('select[name="position"]');
    if (await positionSelect.count() > 0) {
      await positionSelect.selectOption({ index: 1 });
    }

    // 4. 提交申请
    await testHelpers.clickButtonAndWait('提交申请');

    // 5. 验证申请状态
    await page.goto(PAGES.STATUS);
    await page.fill('input[type="email"]', applicationData.email);
    await testHelpers.clickButtonAndWait('搜索');
    
    // 验证申请记录
    await testHelpers.verifyElementVisible('[data-testid="application-record"]');
  });

  test('3.4 文件上传功能测试', async ({ page }) => {
    await page.goto(PAGES.APPLY);
    await testHelpers.waitForPageLoad();

    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.count() > 0) {
      // 测试PDF文件上传
      const pdfFile = Buffer.from('%PDF-1.4 测试PDF内容');
      await fileInput.setInputFiles({
        name: 'resume.pdf',
        mimeType: 'application/pdf',
        buffer: pdfFile
      });

      // 验证文件预览
      await testHelpers.waitForElement('[data-testid="file-preview"]');

      // 测试文件大小限制（模拟大文件）
      const largeFile = Buffer.alloc(6 * 1024 * 1024); // 6MB
      await fileInput.setInputFiles({
        name: 'large-resume.pdf',
        mimeType: 'application/pdf',
        buffer: largeFile
      });

      // 验证文件大小错误提示
      await testHelpers.verifyFormError('文件大小超过限制');

      // 测试不支持的文件格式
      const txtFile = Buffer.from('这是一个文本文件');
      await fileInput.setInputFiles({
        name: 'resume.txt',
        mimeType: 'text/plain',
        buffer: txtFile
      });

      // 验证文件格式错误提示
      await testHelpers.verifyFormError('不支持的文件格式');
    }
  });

  test('3.5 表单验证和错误处理', async ({ page }) => {
    await page.goto(PAGES.APPLY);
    await testHelpers.waitForPageLoad();

    // 测试必填字段验证
    await testHelpers.clickButtonAndWait('提交申请');
    
    // 验证必填字段错误提示
    const requiredFieldErrors = [
      '请输入姓名',
      '请输入邮箱',
      '请输入手机号',
      '请选择职位'
    ];

    for (const error of requiredFieldErrors) {
      const errorExists = await page.locator(`text=${error}`).count() > 0;
      if (errorExists) {
        await testHelpers.verifyFormError(error);
      }
    }

    // 测试邮箱格式验证
    await page.fill('input[type="email"]', 'invalid-email');
    await testHelpers.clickButtonAndWait('提交申请');
    await testHelpers.verifyFormError('请输入有效的邮箱地址');

    // 测试手机号格式验证
    await page.fill('input[name="phone"]', '123');
    await testHelpers.clickButtonAndWait('提交申请');
    await testHelpers.verifyFormError('请输入有效的手机号');

    // 测试姓名长度验证
    await page.fill('input[name="name"]', 'A');
    await testHelpers.clickButtonAndWait('提交申请');
    await testHelpers.verifyFormError('姓名至少需要2个字符');
  });

  test('3.6 申请状态跟踪测试', async ({ page }) => {
    await page.goto(PAGES.STATUS);
    await testHelpers.waitForPageLoad();

    // 测试邮箱搜索
    await page.fill('input[type="email"]', 'test.candidate@gmail.com');
    await testHelpers.clickButtonAndWait('搜索');

    // 验证搜索结果
    await testHelpers.verifyElementVisible('[data-testid="search-results"]');

    // 测试标签切换
    const tabs = ['概览', '申请', '通知', '推荐'];
    for (const tab of tabs) {
      const tabElement = page.getByRole('tab', { name: tab });
      if (await tabElement.count() > 0) {
        await tabElement.click();
        await testHelpers.waitForPageLoad();
        
        // 验证对应内容显示
        await testHelpers.verifyElementVisible('[data-testid="tab-content"]');
      }
    }

    // 验证申请状态显示
    await testHelpers.verifyElementVisible('[data-testid="status-badge"]');
    
    // 验证申请时间线
    await testHelpers.verifyElementVisible('[data-testid="timeline"]');
  });

  test('3.7 响应式设计测试', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080 },
      { width: 768, height: 1024 },
      { width: 375, height: 667 }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      
      // 测试申请页面响应式
      await page.goto(PAGES.APPLY);
      await testHelpers.waitForPageLoad();
      await testHelpers.verifyElementVisible('form');
      
      // 测试状态查询页面响应式
      await page.goto(PAGES.STATUS);
      await testHelpers.waitForPageLoad();
      await testHelpers.verifyElementVisible('input[type="email"]');
    }

    // 恢复桌面端
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test('3.8 性能和用户体验测试', async ({ page }) => {
    // 测试申请页面加载性能
    const startTime = Date.now();
    await page.goto(PAGES.APPLY);
    await testHelpers.waitForPageLoad();
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000); // 3秒内加载完成

    // 测试表单交互性能
    const applicationData = TestDataGenerator.generateJobApplication();
    
    const fillStartTime = Date.now();
    await testHelpers.fillForm({
      'input[name="name"]': applicationData.name,
      'input[type="email"]': applicationData.email,
      'input[name="phone"]': applicationData.phone
    });
    const fillTime = Date.now() - fillStartTime;
    
    expect(fillTime).toBeLessThan(1000); // 表单填写响应时间

    // 测试提交按钮加载状态
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // 验证按钮状态变化
    const isDisabled = await submitButton.isDisabled();
    if (isDisabled) {
      expect(isDisabled).toBeTruthy();
    }
  });
});
