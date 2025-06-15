import { Page, expect } from '@playwright/test';

/**
 * 测试工具类 - 提供通用的测试辅助方法
 */
export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * 等待页面加载完成
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * 登录用户
   */
  async login(email: string, password: string) {
    await this.page.goto('/auth/login');
    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);
    await this.page.click('button[type="submit"]');
    await this.waitForPageLoad();
  }

  /**
   * 登录HR用户
   */
  async loginAsHR() {
    await this.login('hr@yarbo.com', 'password123');
  }

  /**
   * 登录管理员用户
   */
  async loginAsAdmin() {
    await this.login('admin@yarbo.com', 'password123');
  }

  /**
   * 登录候选人用户
   */
  async loginAsCandidate() {
    await this.login('test.candidate@gmail.com', 'password123');
  }

  /**
   * 验证页面标题
   */
  async verifyPageTitle(expectedTitle: string) {
    await expect(this.page).toHaveTitle(expectedTitle);
  }

  /**
   * 验证URL
   */
  async verifyURL(expectedURL: string) {
    await expect(this.page).toHaveURL(expectedURL);
  }

  /**
   * 验证元素可见
   */
  async verifyElementVisible(selector: string) {
    await expect(this.page.locator(selector)).toBeVisible();
  }

  /**
   * 验证文本内容
   */
  async verifyTextContent(selector: string, expectedText: string) {
    await expect(this.page.locator(selector)).toContainText(expectedText);
  }

  /**
   * 点击按钮并等待响应
   */
  async clickButtonAndWait(buttonText: string, waitForSelector?: string) {
    await this.page.getByRole('button', { name: buttonText }).click();
    if (waitForSelector) {
      await this.page.waitForSelector(waitForSelector);
    } else {
      await this.waitForPageLoad();
    }
  }

  /**
   * 填写表单字段
   */
  async fillForm(fields: Record<string, string>) {
    for (const [selector, value] of Object.entries(fields)) {
      await this.page.fill(selector, value);
    }
  }

  /**
   * 验证表单验证错误
   */
  async verifyFormError(errorMessage: string) {
    await expect(this.page.getByText(errorMessage)).toBeVisible();
  }

  /**
   * 验证成功消息
   */
  async verifySuccessMessage(message: string) {
    await expect(this.page.getByText(message)).toBeVisible();
  }

  /**
   * 截图
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `test-results/screenshots/${name}.png` });
  }

  /**
   * 等待元素出现
   */
  async waitForElement(selector: string, timeout = 5000) {
    await this.page.waitForSelector(selector, { timeout });
  }

  /**
   * 验证导航栏
   */
  async verifyNavigation() {
    await this.verifyElementVisible('nav');
    await this.verifyElementVisible('a[href="/"]');
  }

  /**
   * 验证页面响应式设计
   */
  async testResponsiveDesign() {
    // 测试桌面端
    await this.page.setViewportSize({ width: 1920, height: 1080 });
    await this.waitForPageLoad();
    
    // 测试平板端
    await this.page.setViewportSize({ width: 768, height: 1024 });
    await this.waitForPageLoad();
    
    // 测试移动端
    await this.page.setViewportSize({ width: 375, height: 667 });
    await this.waitForPageLoad();
    
    // 恢复桌面端
    await this.page.setViewportSize({ width: 1920, height: 1080 });
  }

  /**
   * 验证数据加载状态
   */
  async verifyDataLoading() {
    // 检查加载状态
    const loadingIndicator = this.page.locator('[data-testid="loading"]');
    if (await loadingIndicator.isVisible()) {
      await loadingIndicator.waitFor({ state: 'hidden', timeout: 10000 });
    }
  }

  /**
   * 验证错误处理
   */
  async verifyErrorHandling() {
    const errorMessage = this.page.locator('[data-testid="error"]');
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toContainText('错误');
    }
  }
}

/**
 * 测试数据生成器
 */
export class TestDataGenerator {
  static generateRandomEmail(): string {
    const timestamp = Date.now();
    return `test${timestamp}@example.com`;
  }

  static generateRandomName(): string {
    const names = ['张三', '李四', '王五', '赵六', '钱七'];
    return names[Math.floor(Math.random() * names.length)];
  }

  static generateRandomPhone(): string {
    return `1${Math.floor(Math.random() * 9) + 3}${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
  }

  static generateJobApplication() {
    return {
      name: this.generateRandomName(),
      email: this.generateRandomEmail(),
      phone: this.generateRandomPhone(),
    };
  }
}

/**
 * 页面URL常量
 */
export const PAGES = {
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  JOBS: '/jobs',
  APPLY: '/apply',
  STATUS: '/status',
  HR_DASHBOARD: '/hr/dashboard',
  HR_APPLICATIONS: '/hr/applications',
  HR_CANDIDATES: '/hr/candidates',
  HR_JOBS: '/hr/jobs',
  HR_INTERVIEWS: '/hr/interviews',
  HR_ANALYTICS: '/hr/analytics',
  ADMIN_DASHBOARD: '/admin/dashboard',
  TEST_API: '/test-api',
  TEST_APPLY: '/test-apply',
} as const;

/**
 * 测试用户数据
 */
export const TEST_USERS = {
  ADMIN: {
    email: 'admin@yarbo.com',
    password: 'password123',
    role: 'admin'
  },
  HR: {
    email: 'hr@yarbo.com',
    password: 'password123',
    role: 'hr'
  },
  CANDIDATE: {
    email: 'test.candidate@gmail.com',
    password: 'password123',
    role: 'candidate'
  }
} as const;
