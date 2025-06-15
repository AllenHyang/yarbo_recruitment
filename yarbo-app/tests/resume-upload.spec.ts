import { test, expect } from '@playwright/test';

test.describe('Resume Upload Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到登录页面
    await page.goto('http://localhost:3000/auth/login');
  });

  test('should allow user to upload resume in profile page', async ({ page }) => {
    // 1. 登录为候选人用户
    await page.fill('input[type="email"]', 'candidate@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // 等待登录完成
    await page.waitForURL('**/dashboard');
    
    // 2. 导航到个人设置页面
    await page.goto('http://localhost:3000/profile');
    
    // 等待页面加载
    await page.waitForSelector('h1:has-text("个人资料")');
    
    // 3. 检查简历管理部分是否存在
    await expect(page.locator('text=简历管理')).toBeVisible();
    
    // 4. 检查初始状态 - 应该显示"还未上传简历"
    await expect(page.locator('text=还未上传简历')).toBeVisible();
    
    // 5. 创建一个测试PDF文件
    const testPdfContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n174\n%%EOF';
    
    // 6. 上传简历文件
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test-resume.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from(testPdfContent)
    });
    
    // 7. 等待上传完成
    await expect(page.locator('text=简历上传成功')).toBeVisible({ timeout: 10000 });
    
    // 8. 验证简历状态已更新
    await expect(page.locator('text=test-resume.pdf')).toBeVisible();
    await expect(page.locator('text=已上传')).toBeVisible();
    
    // 9. 测试简历预览功能
    await page.click('button:has-text("预览")');
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // 关闭预览
    await page.click('button:has-text("×")');
    
    // 10. 测试简历下载功能
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("下载")');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('test-resume.pdf');
  });

  test('should show resume status in job application form', async ({ page }) => {
    // 1. 登录为候选人用户（假设已有简历）
    await page.fill('input[type="email"]', 'candidate@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/dashboard');
    
    // 2. 导航到职位申请页面
    await page.goto('http://localhost:3000/apply');
    
    // 等待页面加载
    await page.waitForSelector('form');
    
    // 3. 检查简历状态显示
    const resumeStatus = page.locator('text=简历状态');
    await expect(resumeStatus).toBeVisible();
    
    // 4. 如果有简历，应该显示绿色状态
    const hasResume = await page.locator('text=已上传').isVisible();
    
    if (hasResume) {
      await expect(page.locator('text=已上传')).toBeVisible();
      await expect(page.locator('button[type="submit"]:not([disabled])')).toBeVisible();
    } else {
      // 如果没有简历，应该显示警告
      await expect(page.locator('text=未上传简历')).toBeVisible();
      await expect(page.locator('button[type="submit"][disabled]')).toBeVisible();
    }
  });

  test('should handle resume upload errors gracefully', async ({ page }) => {
    // 1. 登录
    await page.fill('input[type="email"]', 'candidate@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/dashboard');
    
    // 2. 导航到个人设置页面
    await page.goto('http://localhost:3000/profile');
    await page.waitForSelector('text=简历管理');
    
    // 3. 尝试上传不支持的文件格式
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test-image.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake image content')
    });
    
    // 4. 应该显示错误信息
    await expect(page.locator('text=支持 PDF、DOC、DOCX 格式')).toBeVisible();
  });

  test('should allow resume replacement', async ({ page }) => {
    // 1. 登录
    await page.fill('input[type="email"]', 'candidate@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/dashboard');
    
    // 2. 导航到个人设置页面
    await page.goto('http://localhost:3000/profile');
    await page.waitForSelector('text=简历管理');
    
    // 3. 如果已有简历，测试替换功能
    const hasExistingResume = await page.locator('text=已上传').isVisible();
    
    if (hasExistingResume) {
      // 上传新简历
      const testPdfContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n174\n%%EOF';
      
      const fileInput = page.locator('input[type="file"]').last();
      await fileInput.setInputFiles({
        name: 'updated-resume.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from(testPdfContent)
      });
      
      // 验证简历已更新
      await expect(page.locator('text=简历上传成功')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('text=updated-resume.pdf')).toBeVisible();
    }
  });

  test('should allow resume deletion', async ({ page }) => {
    // 1. 登录
    await page.fill('input[type="email"]', 'candidate@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/dashboard');
    
    // 2. 导航到个人设置页面
    await page.goto('http://localhost:3000/profile');
    await page.waitForSelector('text=简历管理');
    
    // 3. 如果有简历，测试删除功能
    const hasExistingResume = await page.locator('text=已上传').isVisible();
    
    if (hasExistingResume) {
      // 点击删除按钮
      await page.click('button:has-text("删除")');
      
      // 验证简历已删除
      await expect(page.locator('text=简历删除成功')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('text=还未上传简历')).toBeVisible();
    }
  });

  test('should integrate with job application flow', async ({ page }) => {
    // 1. 登录
    await page.fill('input[type="email"]', 'candidate@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/dashboard');
    
    // 2. 确保用户有简历
    await page.goto('http://localhost:3000/profile');
    await page.waitForSelector('text=简历管理');
    
    const hasResume = await page.locator('text=已上传').isVisible();
    
    if (!hasResume) {
      // 上传简历
      const testPdfContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n174\n%%EOF';
      
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles({
        name: 'test-resume.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from(testPdfContent)
      });
      
      await expect(page.locator('text=简历上传成功')).toBeVisible({ timeout: 10000 });
    }
    
    // 3. 导航到申请页面
    await page.goto('http://localhost:3000/apply');
    await page.waitForSelector('form');
    
    // 4. 填写申请表单
    await page.fill('input[name="name"]', '测试用户');
    await page.fill('input[name="email"]', 'candidate@test.com');
    await page.fill('input[name="phone"]', '13800138000');
    
    // 5. 填写求职信
    await page.fill('textarea[name="coverLetter"]', '我对这个职位非常感兴趣，希望能够加入贵公司...');
    
    // 6. 选择职位（如果有选择器）
    const jobSelector = page.locator('select[name="jobId"]');
    if (await jobSelector.isVisible()) {
      await jobSelector.selectOption({ index: 1 });
    }
    
    // 7. 验证简历状态显示正确
    await expect(page.locator('text=已上传')).toBeVisible();
    
    // 8. 提交申请
    await page.click('button[type="submit"]');
    
    // 9. 验证提交成功
    await expect(page.locator('text=申请提交成功')).toBeVisible({ timeout: 15000 });
  });
});
