import { Page, Locator } from '@playwright/test';

/**
 * 登录页面对象模型
 */
export class LoginPage {
  readonly page: Page;

  // 表单元素
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly backToHomeButton: Locator;

  // 链接
  readonly registerLink: Locator;
  readonly forgotPasswordLink: Locator;

  // 状态提示
  readonly statusMessage: Locator;
  readonly demoAccountInfo: Locator;

  // 页面标题
  readonly pageTitle: Locator;

  constructor(page: Page) {
    this.page = page;

    // 表单元素
    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.loginButton = page.locator('button[type="submit"]').getByText('登录');
    this.backToHomeButton = page.getByRole('button', { name: '返回首页' });

    // 链接
    this.registerLink = page.getByText('还没有账号？立即注册');
    this.forgotPasswordLink = page.getByText('忘记密码？');

    // 状态提示
    this.statusMessage = page.locator('[data-testid="status-message"]');
    this.demoAccountInfo = page.locator('[data-testid="demo-account"]');

    // 页面标题 - 使用更灵活的选择器
    this.pageTitle = page.locator('h1, h2, [data-testid="page-title"]').first();
  }

  /**
   * 导航到登录页面
   */
  async goto() {
    await this.page.goto('/auth/login');
  }

  /**
   * 验证页面加载
   */
  async verifyPageLoaded() {
    await this.page.waitForLoadState('networkidle');
    await this.pageTitle.waitFor({ state: 'visible' });
  }

  /**
   * 执行登录
   */
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /**
   * 使用HR账号登录
   */
  async loginAsHR() {
    await this.login('hr@yarbo.com', 'password123');
  }

  /**
   * 使用管理员账号登录
   */
  async loginAsAdmin() {
    await this.login('admin@yarbo.com', 'password123');
  }

  /**
   * 使用候选人账号登录
   */
  async loginAsCandidate() {
    await this.login('test.candidate@gmail.com', 'password123');
  }

  /**
   * 验证表单元素
   */
  async verifyFormElements() {
    await this.emailInput.isVisible();
    await this.passwordInput.isVisible();
    await this.loginButton.isVisible();
  }

  /**
   * 验证链接
   */
  async verifyLinks() {
    await this.registerLink.isVisible();
    await this.forgotPasswordLink.isVisible();
    await this.backToHomeButton.isVisible();
  }

  /**
   * 点击注册链接
   */
  async clickRegisterLink() {
    await this.registerLink.click();
  }

  /**
   * 点击忘记密码链接
   */
  async clickForgotPasswordLink() {
    await this.forgotPasswordLink.click();
  }

  /**
   * 点击返回首页按钮
   */
  async clickBackToHome() {
    await this.backToHomeButton.click();
  }

  /**
   * 验证登录成功
   */
  async verifyLoginSuccess() {
    await this.page.waitForURL(/\/(dashboard|hr\/dashboard)/);
  }

  /**
   * 验证登录失败
   */
  async verifyLoginFailure() {
    await this.statusMessage.waitFor({ state: 'visible' });
  }

  /**
   * 验证演示账号信息显示
   */
  async verifyDemoAccountInfo() {
    await this.demoAccountInfo.isVisible();
  }

  /**
   * 测试表单验证
   */
  async testFormValidation() {
    // 测试空邮箱
    await this.passwordInput.fill('password123');
    await this.loginButton.click();

    // 测试无效邮箱格式
    await this.emailInput.fill('invalid-email');
    await this.loginButton.click();

    // 测试空密码
    await this.emailInput.fill('test@example.com');
    await this.passwordInput.clear();
    await this.loginButton.click();
  }

  /**
   * 测试加载状态
   */
  async testLoadingState() {
    await this.emailInput.fill('hr@yarbo.com');
    await this.passwordInput.fill('password123');

    // 点击登录按钮并检查加载状态
    await this.loginButton.click();

    // 验证按钮状态变化
    const isDisabled = await this.loginButton.isDisabled();
    return isDisabled;
  }

  /**
   * 获取错误消息
   */
  async getErrorMessage() {
    if (await this.statusMessage.isVisible()) {
      return await this.statusMessage.textContent();
    }
    return null;
  }

  /**
   * 清空表单
   */
  async clearForm() {
    await this.emailInput.clear();
    await this.passwordInput.clear();
  }

  /**
   * 验证页面标题
   */
  async verifyPageTitle() {
    await this.pageTitle.isVisible();
  }
}
