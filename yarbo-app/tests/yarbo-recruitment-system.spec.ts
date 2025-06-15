import { test, expect } from '@playwright/test';

test.describe('Yarbo招聘系统完整功能测试', () => {
  test.beforeEach(async ({ page }) => {
    // 设置基础URL
    await page.goto('http://localhost:3000');
  });

  test('1. 访问首页并验证页面加载', async ({ page }) => {
    // 验证页面标题
    await expect(page).toHaveTitle('Yarbo 人才招聘');

    // 验证导航栏存在
    await expect(page.getByRole('link', { name: 'Yarbo' })).toBeVisible();
    await expect(page.getByRole('link', { name: '首页' })).toBeVisible();
    await expect(page.getByRole('link', { name: '所有职位' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'HR管理' })).toBeVisible();

    // 验证主要内容区域存在
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('2. 导航到数据分析中心页面', async ({ page }) => {
    await page.goto('http://localhost:3000/hr/analytics');

    // 验证页面标题
    await expect(page.getByRole('heading', { name: '数据分析中心' })).toBeVisible();
    await expect(page.getByText('深度洞察招聘数据，优化招聘策略')).toBeVisible();

    // 验证控制面板存在
    await expect(page.getByRole('combobox')).toBeVisible();
    await expect(page.getByRole('button', { name: '刷新数据' })).toBeVisible();
    await expect(page.getByRole('button', { name: '导出报告' })).toBeVisible();
  });

  test('3. 验证实时数据统计卡片显示', async ({ page }) => {
    await page.goto('http://localhost:3000/hr/analytics');

    // 等待数据加载
    await page.waitForTimeout(3000);

    // 验证统计卡片存在
    await expect(page.getByText('总申请数')).toBeVisible();
    await expect(page.getByText('面试转化率')).toBeVisible();
    await expect(page.getByText('平均招聘周期')).toBeVisible();
    await expect(page.getByText('录用成功率')).toBeVisible();

    // 验证实时数据标识
    await expect(page.getByText('实时数据')).toBeVisible();
  });

  test('4. 验证图表组件正常渲染', async ({ page }) => {
    await page.goto('http://localhost:3000/hr/analytics');

    // 等待图表加载
    await page.waitForTimeout(5000);

    // 验证图表标题存在
    await expect(page.getByText('申请趋势分析')).toBeVisible();
    await expect(page.getByText('部门招聘分布')).toBeVisible();
    await expect(page.getByText('招聘转化率')).toBeVisible();
    await expect(page.getByText('招聘效率指标')).toBeVisible();

    // 验证图表图例存在
    await expect(page.getByText('申请数量')).toBeVisible();
    await expect(page.getByText('面试数量')).toBeVisible();
    await expect(page.getByText('录用数量')).toBeVisible();
  });

  test('5. 测试标签页切换功能', async ({ page }) => {
    await page.goto('http://localhost:3000/hr/analytics');
    await page.waitForTimeout(3000);

    // 测试部门分析标签
    await page.getByRole('tab', { name: '部门分析' }).click();
    await expect(page.getByText('部门招聘详情')).toBeVisible();
    await expect(page.getByText('产品研发部')).toBeVisible();
    await expect(page.getByText('机器人系统部')).toBeVisible();

    // 测试趋势分析标签
    await page.getByRole('tab', { name: '趋势分析' }).click();
    await expect(page.getByText('申请趋势分析')).toBeVisible();

    // 测试效率分析标签
    await page.getByRole('tab', { name: '效率分析' }).click();
    await expect(page.getByText('招聘效率指标')).toBeVisible();

    // 回到总览标签
    await page.getByRole('tab', { name: '总览' }).click();
    await expect(page.getByText('申请趋势分析')).toBeVisible();
  });

  test('6. 测试导出报告功能', async ({ page }) => {
    await page.goto('http://localhost:3000/hr/analytics');
    await page.waitForTimeout(3000);

    // 设置下载监听
    const downloadPromise = page.waitForEvent('download');

    // 点击导出报告按钮
    await page.getByRole('button', { name: '导出报告' }).click();

    // 验证文件下载
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/招聘分析报告_complete_\d{4}-\d{2}-\d{2}\.json/);
  });

  test('7. 访问职位页面验证实时数据', async ({ page }) => {
    await page.goto('http://localhost:3000/jobs');

    // 验证页面标题
    await expect(page.getByRole('heading', { name: '探索我们的工作机会' })).toBeVisible();

    // 验证统计卡片
    await expect(page.getByText('招聘职位')).toBeVisible();
    await expect(page.getByText('招聘城市')).toBeVisible();
    await expect(page.getByText('招聘部门')).toBeVisible();
    await expect(page.getByText('团队增长')).toBeVisible();

    // 验证搜索功能
    await expect(page.getByPlaceholder('搜索职位、公司或技能...')).toBeVisible();
    await expect(page.getByRole('button', { name: '搜索' })).toBeVisible();
  });

  test('8. 访问实时数据测试页面', async ({ page }) => {
    await page.goto('http://localhost:3000/test/realtime');

    // 验证页面标题
    await expect(page.getByRole('heading', { name: '实时数据测试' })).toBeVisible();
    await expect(page.getByText('验证Supabase实时数据集成功能')).toBeVisible();

    // 验证控制按钮
    await expect(page.getByRole('button', { name: '运行测试' })).toBeVisible();
    await expect(page.getByRole('button', { name: '刷新统计数据' })).toBeVisible();
    await expect(page.getByRole('button', { name: '刷新职位数据' })).toBeVisible();

    // 验证数据展示区域
    await expect(page.getByText('实时统计数据')).toBeVisible();
    await expect(page.getByText('实时职位数据')).toBeVisible();
  });

  test('9. 运行自动化测试并验证结果', async ({ page }) => {
    await page.goto('http://localhost:3000/test/realtime');

    // 点击运行测试按钮
    await page.getByRole('button', { name: '运行测试' }).click();

    // 等待测试结果
    await page.waitForTimeout(2000);

    // 验证测试结果显示
    await expect(page.getByText('测试结果')).toBeVisible();
    await expect(page.getByText('数据加载状态')).toBeVisible();
    await expect(page.getByText('错误处理')).toBeVisible();
    await expect(page.getByText('招聘统计数据')).toBeVisible();
    await expect(page.getByText('部门统计数据')).toBeVisible();
    await expect(page.getByText('职位数据')).toBeVisible();

    // 验证成功状态
    await expect(page.getByText('success')).toBeVisible();
  });

  test('10. 验证所有核心功能正常工作', async ({ page }) => {
    // 综合测试：从首页开始完整流程
    await page.goto('http://localhost:3000');

    // 1. 导航到职位页面
    await page.getByRole('link', { name: '所有职位' }).click();
    await expect(page.getByRole('heading', { name: '探索我们的工作机会' })).toBeVisible();

    // 2. 导航到数据分析页面
    await page.goto('http://localhost:3000/hr/analytics');
    await page.waitForTimeout(3000);

    // 3. 验证图表渲染
    await expect(page.getByText('申请趋势分析')).toBeVisible();

    // 4. 切换标签页
    await page.getByRole('tab', { name: '部门分析' }).click();
    await expect(page.getByText('部门招聘详情')).toBeVisible();

    // 5. 测试刷新功能
    await page.getByRole('button', { name: '刷新数据' }).click();
    await page.waitForTimeout(1000);

    // 6. 访问测试页面验证实时数据
    await page.goto('http://localhost:3000/test/realtime');
    await page.getByRole('button', { name: '运行测试' }).click();
    await page.waitForTimeout(2000);

    // 验证测试通过
    await expect(page.getByText('数据加载完成')).toBeVisible();
    await expect(page.getByText('无错误')).toBeVisible();

    console.log('✅ 所有核心功能测试通过！');
  });
});
