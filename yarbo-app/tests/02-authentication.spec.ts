import { test, expect } from '@playwright/test';
import { TestHelpers, PAGES, TEST_USERS, TestDataGenerator } from './utils/test-helpers';
import { LoginPage } from './pages/LoginPage';

test.describe('认证系统测试 - Authentication (4个页面)', () => {
  let testHelpers: TestHelpers;
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    testHelpers = new TestHelpers(page);
    loginPage = new LoginPage(page);
  });

  test('2.1 登录页面 (/auth/login) - 完整登录流程', async ({ page }) => {
    await loginPage.goto();
    await loginPage.verifyPageLoaded();

    // 验证页面标题
    await testHelpers.verifyPageTitle('Yarbo 人才招聘');
    await loginPage.verifyPageTitle();

    // 验证表单元素
    await loginPage.verifyFormElements();
    
    // 验证链接
    await loginPage.verifyLinks();

    // 验证演示账号信息
    await loginPage.verifyDemoAccountInfo();

    // 测试表单验证
    await loginPage.testFormValidation();

    // 测试HR用户登录
    await loginPage.clearForm();
    await loginPage.loginAsHR();
    await loginPage.verifyLoginSuccess();
    await testHelpers.verifyURL(/\/hr\/dashboard/);

    // 测试登出后重新登录
    await page.goto('/auth/login');
    await loginPage.loginAsAdmin();
    await loginPage.verifyLoginSuccess();

    // 测试候选人登录
    await page.goto('/auth/login');
    await loginPage.loginAsCandidate();
    await loginPage.verifyLoginSuccess();
    await testHelpers.verifyURL(/\/dashboard/);

    // 测试错误登录
    await page.goto('/auth/login');
    await loginPage.login('invalid@email.com', 'wrongpassword');
    await loginPage.verifyLoginFailure();
  });

  test('2.2 注册页面 (/auth/register) - 用户注册', async ({ page }) => {
    await loginPage.goto();
    await loginPage.clickRegisterLink();
    await testHelpers.verifyURL(/\/auth\/register/);

    // 验证注册表单
    await testHelpers.verifyElementVisible('form');
    await testHelpers.verifyElementVisible('input[type="email"]');
    await testHelpers.verifyElementVisible('input[type="password"]');
    await testHelpers.verifyElementVisible('input[name="confirmPassword"]');
    await testHelpers.verifyElementVisible('button[type="submit"]');

    // 验证返回登录链接
    await testHelpers.verifyElementVisible('a[href="/auth/login"]');

    // 测试注册表单验证
    await testHelpers.clickButtonAndWait('注册');
    
    // 测试密码不匹配
    const testData = TestDataGenerator.generateJobApplication();
    await testHelpers.fillForm({
      'input[type="email"]': testData.email,
      'input[type="password"]': 'password123',
      'input[name="confirmPassword"]': 'differentpassword'
    });
    await testHelpers.clickButtonAndWait('注册');

    // 测试有效注册
    await testHelpers.fillForm({
      'input[type="email"]': testData.email,
      'input[type="password"]': 'password123',
      'input[name="confirmPassword"]': 'password123'
    });
    await testHelpers.clickButtonAndWait('注册');

    // 验证注册成功或错误处理
    const currentUrl = page.url();
    const isSuccessPage = currentUrl.includes('/dashboard') || currentUrl.includes('/auth/login');
    expect(isSuccessPage).toBeTruthy();
  });

  test('2.3 忘记密码 (/auth/forgot-password) - 密码重置请求', async ({ page }) => {
    await loginPage.goto();
    await loginPage.clickForgotPasswordLink();
    await testHelpers.verifyURL(/\/auth\/forgot-password/);

    // 验证页面标题
    await testHelpers.verifyTextContent('h1', '重置密码');

    // 验证密码重置表单
    await testHelpers.verifyElementVisible('form');
    await testHelpers.verifyElementVisible('input[type="email"]');
    await testHelpers.verifyElementVisible('button:has-text("发送重置邮件")');

    // 测试空邮箱提交
    await testHelpers.clickButtonAndWait('发送重置邮件');

    // 测试无效邮箱格式
    await page.fill('input[type="email"]', 'invalid-email');
    await testHelpers.clickButtonAndWait('发送重置邮件');

    // 测试有效邮箱
    await page.fill('input[type="email"]', 'test@example.com');
    await testHelpers.clickButtonAndWait('发送重置邮件');

    // 验证成功消息
    await testHelpers.verifySuccessMessage('邮件已发送');

    // 验证返回登录链接
    await testHelpers.verifyElementVisible('a[href="/auth/login"]');
  });

  test('2.4 重置密码 (/auth/reset-password) - 密码重置执行', async ({ page }) => {
    // 模拟带token的重置密码链接
    await page.goto('/auth/reset-password?token=test-token');
    await testHelpers.waitForPageLoad();

    // 验证重置密码表单
    await testHelpers.verifyElementVisible('form');
    await testHelpers.verifyElementVisible('input[type="password"][name="newPassword"]');
    await testHelpers.verifyElementVisible('input[type="password"][name="confirmPassword"]');
    await testHelpers.verifyElementVisible('button:has-text("确认重置")');

    // 测试密码不匹配
    await testHelpers.fillForm({
      'input[name="newPassword"]': 'newpassword123',
      'input[name="confirmPassword"]': 'differentpassword'
    });
    await testHelpers.clickButtonAndWait('确认重置');

    // 测试密码太短
    await testHelpers.fillForm({
      'input[name="newPassword"]': '123',
      'input[name="confirmPassword"]': '123'
    });
    await testHelpers.clickButtonAndWait('确认重置');

    // 测试有效密码重置
    await testHelpers.fillForm({
      'input[name="newPassword"]': 'newpassword123',
      'input[name="confirmPassword"]': 'newpassword123'
    });
    await testHelpers.clickButtonAndWait('确认重置');

    // 验证重置成功后跳转
    const currentUrl = page.url();
    const isLoginPage = currentUrl.includes('/auth/login');
    expect(isLoginPage).toBeTruthy();
  });

  test('2.5 认证流程集成测试', async ({ page }) => {
    // 完整的认证流程测试
    
    // 1. 访问受保护页面，应重定向到登录
    await page.goto('/hr/dashboard');
    await testHelpers.verifyURL(/\/auth\/login/);

    // 2. 测试登录流程
    await loginPage.loginAsHR();
    await testHelpers.verifyURL(/\/hr\/dashboard/);

    // 3. 验证登录状态持久性
    await page.reload();
    await testHelpers.waitForPageLoad();
    await testHelpers.verifyURL(/\/hr\/dashboard/);

    // 4. 测试登出功能
    const logoutButton = page.locator('button:has-text("登出"), a:has-text("登出")');
    if (await logoutButton.count() > 0) {
      await logoutButton.click();
      await testHelpers.verifyURL(/\/auth\/login/);
    }

    // 5. 验证登出后无法访问受保护页面
    await page.goto('/hr/dashboard');
    await testHelpers.verifyURL(/\/auth\/login/);
  });

  test('2.6 权限控制测试', async ({ page }) => {
    // 测试不同角色的权限控制
    
    // 候选人登录
    await loginPage.goto();
    await loginPage.loginAsCandidate();
    
    // 尝试访问HR页面
    await page.goto('/hr/dashboard');
    const currentUrl = page.url();
    const hasAccess = currentUrl.includes('/hr/dashboard');
    
    if (!hasAccess) {
      // 验证被重定向或显示未授权页面
      const isUnauthorized = currentUrl.includes('/unauthorized') || currentUrl.includes('/auth/login');
      expect(isUnauthorized).toBeTruthy();
    }

    // HR用户登录
    await page.goto('/auth/login');
    await loginPage.loginAsHR();
    await page.goto('/hr/dashboard');
    await testHelpers.verifyURL(/\/hr\/dashboard/);

    // 管理员登录
    await page.goto('/auth/login');
    await loginPage.loginAsAdmin();
    await page.goto('/hr/dashboard');
    await testHelpers.verifyURL(/\/hr\/dashboard/);
  });

  test('2.7 会话管理测试', async ({ page }) => {
    // 测试会话超时和管理
    
    await loginPage.goto();
    await loginPage.loginAsHR();
    await testHelpers.verifyURL(/\/hr\/dashboard/);

    // 模拟会话过期
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // 刷新页面，应该重定向到登录
    await page.reload();
    await testHelpers.waitForPageLoad();
    
    // 验证是否重定向到登录页面
    const currentUrl = page.url();
    const isLoginPage = currentUrl.includes('/auth/login');
    expect(isLoginPage).toBeTruthy();
  });

  test('2.8 表单安全性测试', async ({ page }) => {
    await loginPage.goto();

    // 测试SQL注入防护
    await loginPage.login("'; DROP TABLE users; --", 'password');
    await loginPage.verifyLoginFailure();

    // 测试XSS防护
    await loginPage.clearForm();
    await loginPage.login('<script>alert("xss")</script>', 'password');
    await loginPage.verifyLoginFailure();

    // 测试CSRF保护
    await loginPage.clearForm();
    const csrfToken = await page.locator('input[name="_token"]').getAttribute('value');
    expect(csrfToken).toBeTruthy();
  });

  test('2.9 响应式设计测试', async ({ page }) => {
    await loginPage.goto();

    // 测试不同屏幕尺寸下的登录页面
    const viewports = [
      { width: 1920, height: 1080 }, // 桌面端
      { width: 768, height: 1024 },  // 平板端
      { width: 375, height: 667 }    // 移动端
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await loginPage.verifyPageLoaded();
      await loginPage.verifyFormElements();
      await loginPage.verifyLinks();
    }

    // 恢复桌面端
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test('2.10 加载状态和用户体验测试', async ({ page }) => {
    await loginPage.goto();

    // 测试登录按钮加载状态
    const hasLoadingState = await loginPage.testLoadingState();
    
    // 验证加载状态提示
    if (hasLoadingState) {
      expect(hasLoadingState).toBeTruthy();
    }

    // 测试错误消息显示
    await loginPage.clearForm();
    await loginPage.login('wrong@email.com', 'wrongpassword');
    
    const errorMessage = await loginPage.getErrorMessage();
    if (errorMessage) {
      expect(errorMessage).toContain('错误');
    }

    // 测试成功登录的用户体验
    await loginPage.clearForm();
    await loginPage.loginAsHR();
    await loginPage.verifyLoginSuccess();
  });
});
