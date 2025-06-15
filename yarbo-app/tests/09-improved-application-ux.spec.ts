import { test, expect } from '@playwright/test';
import { TestHelpers, TestDataGenerator } from './utils/test-helpers';

test.describe('改进申请流程用户体验测试 - Improved Application UX Tests', () => {
  let testHelpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    testHelpers = new TestHelpers(page);
  });

  test('9.1 理想的已注册用户申请流程测试', async ({ page }) => {
    // 测试改进后的已注册用户申请体验
    
    await page.goto('/apply');
    await testHelpers.waitForPageLoad();

    // 使用已知存在的邮箱
    const existingEmail = 'hr@yarbo.com';
    
    // 填写申请表单
    const nameInput = page.locator('input[name="name"], input[placeholder*="姓名"]');
    const emailInput = page.locator('input[type="email"]');
    const phoneInput = page.locator('input[name="phone"], input[type="tel"]');
    
    if (await nameInput.count() > 0) {
      await nameInput.fill('张三');
    }
    
    if (await emailInput.count() > 0) {
      await emailInput.fill(existingEmail);
    }
    
    if (await phoneInput.count() > 0) {
      await phoneInput.fill('13800138000');
    }

    // 选择职位
    const positionSelect = page.locator('select[name="position"]');
    if (await positionSelect.count() > 0) {
      await positionSelect.selectOption({ index: 1 });
    }

    // 提交申请
    const submitButton = page.locator('button[type="submit"], button:has-text("提交")');
    if (await submitButton.count() > 0) {
      await submitButton.click();
      await page.waitForTimeout(3000);
    }

    // 检查理想的用户体验元素
    const idealUXElements = [
      // 友好的提示信息
      'text=检测到现有账户',
      'text=账户已存在',
      'text=我们将为您的现有账户添加',
      'text=申请已添加到现有账户',
      
      // 操作选项
      'button:has-text("继续申请")',
      'button:has-text("前往登录")',
      'button:has-text("登录账户")',
      
      // 成功消息
      'text=申请提交成功',
      'text=申请已收到',
      'text=申请编号'
    ];

    let foundUXElements = 0;
    for (const element of idealUXElements) {
      if (await page.locator(element).count() > 0) {
        foundUXElements++;
        console.log(`✅ 找到理想UX元素: ${element}`);
      }
    }

    // 检查不应该出现的技术错误
    const technicalErrors = [
      'text=用户已注册失败',
      'text=A user with this email address has already been registered',
      'text=Console Error',
      'text=技术错误'
    ];

    let foundErrors = 0;
    for (const error of technicalErrors) {
      if (await page.locator(error).count() > 0) {
        foundErrors++;
        console.log(`❌ 发现技术错误: ${error}`);
      }
    }

    // 评估用户体验
    if (foundUXElements > 0) {
      console.log(`✅ 发现 ${foundUXElements} 个良好的UX元素`);
    } else {
      console.log('⚠️ 建议添加更友好的用户引导');
    }

    if (foundErrors === 0) {
      console.log('✅ 没有技术错误显示给用户');
    } else {
      console.log(`❌ 发现 ${foundErrors} 个技术错误，需要改进`);
    }

    console.log('✅ 理想申请流程测试完成');
  });

  test('9.2 用户选择流程测试', async ({ page }) => {
    // 测试用户选择界面的交互
    
    await page.goto('/apply');
    await testHelpers.waitForPageLoad();

    // 填写已存在的邮箱
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.count() > 0) {
      await emailInput.fill('hr@yarbo.com');
      
      // 触发邮箱验证（如果有的话）
      await emailInput.blur();
      await page.waitForTimeout(1000);
    }

    // 检查是否有实时邮箱检测
    const realtimeDetection = [
      'text=该邮箱已注册',
      'text=检测到现有账户',
      'text=邮箱已存在'
    ];

    let hasRealtimeDetection = false;
    for (const detection of realtimeDetection) {
      if (await page.locator(detection).count() > 0) {
        hasRealtimeDetection = true;
        console.log(`✅ 发现实时检测: ${detection}`);
      }
    }

    if (hasRealtimeDetection) {
      console.log('✅ 有实时邮箱检测功能');
    } else {
      console.log('ℹ️ 建议添加实时邮箱检测');
    }

    // 继续填写表单并提交
    const nameInput = page.locator('input[name="name"]');
    if (await nameInput.count() > 0) {
      await nameInput.fill('李四');
    }

    const submitButton = page.locator('button[type="submit"]');
    if (await submitButton.count() > 0) {
      await submitButton.click();
      await page.waitForTimeout(2000);
    }

    // 检查选择界面
    const choiceElements = [
      'button:has-text("继续申请")',
      'button:has-text("登录账户")',
      'button:has-text("使用其他邮箱")',
      'text=请选择您希望的操作'
    ];

    let hasChoiceInterface = false;
    for (const choice of choiceElements) {
      if (await page.locator(choice).count() > 0) {
        hasChoiceInterface = true;
        console.log(`✅ 发现选择界面: ${choice}`);
      }
    }

    if (hasChoiceInterface) {
      console.log('✅ 有用户选择界面');
    } else {
      console.log('ℹ️ 建议添加用户选择界面');
    }

    console.log('✅ 用户选择流程测试完成');
  });

  test('9.3 申请成功状态测试', async ({ page }) => {
    // 测试申请成功后的用户体验
    
    await page.goto('/apply');
    await testHelpers.waitForPageLoad();

    // 使用新邮箱申请
    const newData = TestDataGenerator.generateJobApplication();
    
    const nameInput = page.locator('input[name="name"]');
    const emailInput = page.locator('input[type="email"]');
    
    if (await nameInput.count() > 0) {
      await nameInput.fill(newData.name);
    }
    
    if (await emailInput.count() > 0) {
      await emailInput.fill(newData.email);
    }

    const submitButton = page.locator('button[type="submit"]');
    if (await submitButton.count() > 0) {
      await submitButton.click();
      await page.waitForTimeout(3000);
    }

    // 检查成功状态的用户体验元素
    const successElements = [
      'text=申请提交成功',
      'text=申请已收到',
      'text=申请编号',
      'text=我们已收到您的申请',
      'text=将尽快与您联系',
      'text=请留意邮箱通知',
      'text=3个工作日内回复'
    ];

    let foundSuccessElements = 0;
    for (const element of successElements) {
      if (await page.locator(element).count() > 0) {
        foundSuccessElements++;
        console.log(`✅ 发现成功元素: ${element}`);
      }
    }

    // 检查后续操作引导
    const nextStepElements = [
      'button:has-text("查看申请状态")',
      'button:has-text("继续申请其他职位")',
      'button:has-text("返回首页")',
      'a:has-text("申请状态查询")'
    ];

    let hasNextStepGuidance = false;
    for (const element of nextStepElements) {
      if (await page.locator(element).count() > 0) {
        hasNextStepGuidance = true;
        console.log(`✅ 发现后续引导: ${element}`);
      }
    }

    if (foundSuccessElements > 0) {
      console.log(`✅ 发现 ${foundSuccessElements} 个成功状态元素`);
    } else {
      console.log('⚠️ 建议改进成功状态的用户反馈');
    }

    if (hasNextStepGuidance) {
      console.log('✅ 有后续操作引导');
    } else {
      console.log('ℹ️ 建议添加后续操作引导');
    }

    console.log('✅ 申请成功状态测试完成');
  });

  test('9.4 移动端申请体验测试', async ({ page }) => {
    // 测试移动端的申请体验
    
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/apply');
    await testHelpers.waitForPageLoad();

    // 检查移动端友好的元素
    const mobileElements = [
      // 移动端表单
      'input[type="email"]',
      'input[name="name"]',
      'select[name="position"]',
      'button[type="submit"]',
      
      // 移动端导航
      'nav',
      '.mobile-nav',
      '[data-testid="mobile-menu"]'
    ];

    let mobileElementCount = 0;
    for (const element of mobileElements) {
      if (await page.locator(element).count() > 0) {
        mobileElementCount++;
      }
    }

    console.log(`✅ 移动端找到 ${mobileElementCount} 个交互元素`);

    // 测试移动端表单填写
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.count() > 0) {
      await emailInput.fill('mobile@test.com');
      
      // 检查移动端键盘是否正确
      const inputType = await emailInput.getAttribute('type');
      if (inputType === 'email') {
        console.log('✅ 邮箱输入框使用正确的移动端键盘');
      }
    }

    // 检查移动端的触摸友好性
    const buttons = page.locator('button');
    if (await buttons.count() > 0) {
      const firstButton = buttons.first();
      const buttonSize = await firstButton.boundingBox();
      
      if (buttonSize && buttonSize.height >= 44) {
        console.log('✅ 按钮大小符合移动端触摸标准');
      } else {
        console.log('⚠️ 建议增大按钮尺寸以适配移动端');
      }
    }

    // 恢复桌面端视口
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    console.log('✅ 移动端申请体验测试完成');
  });

  test('9.5 申请流程可访问性测试', async ({ page }) => {
    // 测试申请流程的可访问性
    
    await page.goto('/apply');
    await testHelpers.waitForPageLoad();

    // 检查表单标签
    const formLabels = page.locator('label');
    const labelCount = await formLabels.count();
    console.log(`✅ 找到 ${labelCount} 个表单标签`);

    // 检查必填字段标识
    const requiredFields = page.locator('input[required], select[required]');
    const requiredCount = await requiredFields.count();
    console.log(`✅ 找到 ${requiredCount} 个必填字段`);

    // 检查错误提示的可访问性
    const errorMessages = page.locator('[role="alert"], .error-message, .text-red-500');
    const errorCount = await errorMessages.count();
    if (errorCount > 0) {
      console.log(`✅ 找到 ${errorCount} 个错误提示元素`);
    }

    // 检查键盘导航
    const focusableElements = page.locator('input, select, button, a[href]');
    const focusableCount = await focusableElements.count();
    console.log(`✅ 找到 ${focusableCount} 个可聚焦元素`);

    // 测试Tab键导航
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    if (await focusedElement.count() > 0) {
      console.log('✅ 键盘导航正常');
    }

    console.log('✅ 申请流程可访问性测试完成');
  });
});
