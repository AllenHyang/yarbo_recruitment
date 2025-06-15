import { Page, Locator } from '@playwright/test';

/**
 * 首页页面对象模型
 */
export class HomePage {
  readonly page: Page;
  
  // 导航元素
  readonly logoLink: Locator;
  readonly homeLink: Locator;
  readonly jobsLink: Locator;
  readonly hrManagementLink: Locator;
  
  // 主要按钮
  readonly browseJobsButton: Locator;
  readonly quickApplyButton: Locator;
  readonly managementBackendButton: Locator;
  readonly campusRecruitmentButton: Locator;
  readonly internshipManagementButton: Locator;
  readonly applyNowButton: Locator;
  
  // 职位类别卡片
  readonly jobCategoryCards: Locator;
  readonly viewJobButtons: Locator;
  
  // 统计卡片
  readonly statisticsCards: Locator;
  
  constructor(page: Page) {
    this.page = page;
    
    // 导航元素
    this.logoLink = page.getByRole('link', { name: 'Yarbo Inc.' });
    this.homeLink = page.getByRole('link', { name: '首页' });
    this.jobsLink = page.getByRole('link', { name: '所有职位' });
    this.hrManagementLink = page.getByRole('link', { name: 'HR管理' });
    
    // 主要按钮
    this.browseJobsButton = page.getByRole('button', { name: '浏览职位' });
    this.quickApplyButton = page.getByRole('button', { name: '快速申请' });
    this.managementBackendButton = page.getByRole('button', { name: '管理后台' });
    this.campusRecruitmentButton = page.getByRole('button', { name: '校园招聘' });
    this.internshipManagementButton = page.getByRole('button', { name: '实习管理' });
    this.applyNowButton = page.getByRole('button', { name: '立即申请' });
    
    // 职位类别和统计
    this.jobCategoryCards = page.locator('[data-testid="job-category-card"]');
    this.viewJobButtons = page.getByRole('button', { name: '查看职位' });
    this.statisticsCards = page.locator('[data-testid="statistics-card"]');
  }

  /**
   * 导航到首页
   */
  async goto() {
    await this.page.goto('/');
  }

  /**
   * 验证页面加载
   */
  async verifyPageLoaded() {
    await this.page.waitForLoadState('networkidle');
    await this.logoLink.waitFor({ state: 'visible' });
  }

  /**
   * 验证导航栏
   */
  async verifyNavigation() {
    await this.logoLink.isVisible();
    await this.homeLink.isVisible();
    await this.jobsLink.isVisible();
  }

  /**
   * 验证主要按钮
   */
  async verifyMainButtons() {
    await this.browseJobsButton.isVisible();
    await this.quickApplyButton.isVisible();
    await this.applyNowButton.isVisible();
  }

  /**
   * 点击浏览职位按钮
   */
  async clickBrowseJobs() {
    await this.browseJobsButton.click();
  }

  /**
   * 点击快速申请按钮
   */
  async clickQuickApply() {
    await this.quickApplyButton.click();
  }

  /**
   * 点击管理后台按钮
   */
  async clickManagementBackend() {
    await this.managementBackendButton.click();
  }

  /**
   * 点击职位类别卡片
   */
  async clickJobCategory(index: number = 0) {
    await this.jobCategoryCards.nth(index).click();
  }

  /**
   * 验证统计数据加载
   */
  async verifyStatisticsLoaded() {
    await this.statisticsCards.first().waitFor({ state: 'visible' });
    const count = await this.statisticsCards.count();
    return count > 0;
  }

  /**
   * 验证权限控制显示
   */
  async verifyPermissionBasedDisplay(userRole: string) {
    if (userRole === 'hr' || userRole === 'admin') {
      await this.managementBackendButton.isVisible();
    } else {
      await this.managementBackendButton.isHidden();
    }
  }

  /**
   * 获取统计数据
   */
  async getStatisticsData() {
    const stats = [];
    const count = await this.statisticsCards.count();
    
    for (let i = 0; i < count; i++) {
      const card = this.statisticsCards.nth(i);
      const text = await card.textContent();
      stats.push(text);
    }
    
    return stats;
  }

  /**
   * 验证响应式设计
   */
  async verifyResponsiveDesign() {
    // 桌面端
    await this.page.setViewportSize({ width: 1920, height: 1080 });
    await this.verifyPageLoaded();
    
    // 平板端
    await this.page.setViewportSize({ width: 768, height: 1024 });
    await this.verifyPageLoaded();
    
    // 移动端
    await this.page.setViewportSize({ width: 375, height: 667 });
    await this.verifyPageLoaded();
    
    // 恢复桌面端
    await this.page.setViewportSize({ width: 1920, height: 1080 });
  }
}
