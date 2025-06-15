import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';

test.describe('导出报告功能Bug测试 - Export Report Bug Tests', () => {
  let testHelpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    testHelpers = new TestHelpers(page);
  });

  test('10.1 HR管理中心导出报告按钮测试', async ({ page }) => {
    // 访问HR管理中心
    await page.goto('/hr/dashboard');
    await testHelpers.waitForPageLoad();

    // 验证页面加载
    await expect(page.locator('main, body').first()).toBeVisible();

    // 查找导出报告按钮
    const exportButtons = [
      'button:has-text("导出报告")',
      'button:has-text("导出")',
      '[data-testid="export-report"]',
      '.export-button',
      'button[title*="导出"]'
    ];

    let exportButtonFound = false;
    let exportButton = null;

    for (const buttonSelector of exportButtons) {
      const button = page.locator(buttonSelector);
      if (await button.count() > 0) {
        exportButtonFound = true;
        exportButton = button.first();
        console.log(`✅ 找到导出报告按钮: ${buttonSelector}`);
        break;
      }
    }

    if (exportButtonFound && exportButton) {
      // 测试按钮点击
      console.log('🔍 测试导出报告按钮功能...');
      
      // 监听下载事件
      const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
      
      // 监听新页面/标签页
      const newPagePromise = page.waitForEvent('popup', { timeout: 5000 }).catch(() => null);
      
      // 监听网络请求
      const requestPromise = page.waitForRequest(request => 
        request.url().includes('export') || 
        request.url().includes('download') ||
        request.url().includes('report')
      , { timeout: 5000 }).catch(() => null);

      // 点击导出按钮
      await exportButton.click();
      await page.waitForTimeout(2000);

      // 检查各种可能的响应
      const download = await downloadPromise;
      const newPage = await newPagePromise;
      const request = await requestPromise;

      if (download) {
        console.log('✅ 导出功能正常 - 触发了文件下载');
        console.log(`下载文件名: ${download.suggestedFilename()}`);
      } else if (newPage) {
        console.log('✅ 导出功能正常 - 打开了新页面');
        console.log(`新页面URL: ${newPage.url()}`);
      } else if (request) {
        console.log('✅ 导出功能正常 - 发送了网络请求');
        console.log(`请求URL: ${request.url()}`);
      } else {
        console.log('❌ 导出报告功能未实现 - 没有任何响应');
        
        // 检查是否有错误提示
        const errorMessages = [
          'text=功能暂未实现',
          'text=敬请期待',
          'text=开发中',
          'text=Coming Soon'
        ];

        let hasErrorMessage = false;
        for (const errorMsg of errorMessages) {
          if (await page.locator(errorMsg).count() > 0) {
            hasErrorMessage = true;
            console.log(`ℹ️ 发现提示信息: ${errorMsg}`);
          }
        }

        if (!hasErrorMessage) {
          console.log('⚠️ 建议添加功能状态提示');
        }
      }

      // 检查控制台错误
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      if (consoleErrors.length > 0) {
        console.log(`❌ 发现 ${consoleErrors.length} 个控制台错误`);
        consoleErrors.forEach(error => console.log(`  - ${error}`));
      }

    } else {
      console.log('❌ 未找到导出报告按钮');
    }

    console.log('✅ HR管理中心导出报告按钮测试完成');
  });

  test('10.2 导出报告功能期望行为测试', async ({ page }) => {
    // 测试导出报告功能应该有的行为
    
    await page.goto('/hr/dashboard');
    await testHelpers.waitForPageLoad();

    // 检查数据概览
    const dataCards = page.locator('[data-testid="statistics-card"], .stat-card');
    const cardCount = await dataCards.count();
    console.log(`✅ 找到 ${cardCount} 个数据统计卡片`);

    // 检查是否有数据可以导出
    const dataElements = [
      'text=待处理申请',
      'text=本月收到',
      'text=已安排面试',
      'text=本月录用',
      'table',
      '.data-table'
    ];

    let hasExportableData = false;
    for (const element of dataElements) {
      if (await page.locator(element).count() > 0) {
        hasExportableData = true;
        console.log(`✅ 发现可导出数据: ${element}`);
      }
    }

    if (hasExportableData) {
      console.log('✅ 页面有可导出的数据');
      console.log('💡 建议实现以下导出功能:');
      console.log('  - 申请数据导出 (Excel/CSV)');
      console.log('  - 候选人信息导出');
      console.log('  - 面试安排导出');
      console.log('  - 统计报告导出 (PDF)');
    } else {
      console.log('ℹ️ 页面数据较少，可考虑简化导出功能');
    }

    console.log('✅ 导出报告功能期望行为测试完成');
  });

  test('10.3 其他页面导出功能测试', async ({ page }) => {
    // 测试其他HR页面的导出功能
    
    const hrPages = [
      { url: '/hr/applications', name: 'HR申请管理' },
      { url: '/hr/candidates', name: 'HR候选人管理' },
      { url: '/hr/jobs', name: 'HR职位管理' },
      { url: '/hr/interviews', name: 'HR面试管理' }
    ];

    for (const hrPage of hrPages) {
      await page.goto(hrPage.url);
      await testHelpers.waitForPageLoad();

      const currentUrl = page.url();
      if (currentUrl.includes('/hr/')) {
        // 查找导出相关按钮
        const exportElements = [
          'button:has-text("导出")',
          'button:has-text("下载")',
          'button:has-text("Export")',
          '[data-testid="export"]'
        ];

        let hasExportButton = false;
        for (const element of exportElements) {
          if (await page.locator(element).count() > 0) {
            hasExportButton = true;
            console.log(`✅ ${hrPage.name} 有导出按钮: ${element}`);
          }
        }

        if (!hasExportButton) {
          console.log(`ℹ️ ${hrPage.name} 没有导出功能`);
        }

        // 检查是否有表格数据
        const tables = page.locator('table');
        const tableCount = await tables.count();
        if (tableCount > 0) {
          console.log(`✅ ${hrPage.name} 有 ${tableCount} 个数据表格`);
        }
      } else {
        console.log(`ℹ️ ${hrPage.name} 重定向到其他页面`);
      }
    }

    console.log('✅ 其他页面导出功能测试完成');
  });

  test('10.4 导出功能用户体验测试', async ({ page }) => {
    // 测试导出功能的用户体验
    
    await page.goto('/hr/dashboard');
    await testHelpers.waitForPageLoad();

    // 检查导出按钮的用户体验
    const exportButton = page.locator('button:has-text("导出报告")');
    
    if (await exportButton.count() > 0) {
      // 检查按钮状态
      const isEnabled = await exportButton.isEnabled();
      const isVisible = await exportButton.isVisible();
      
      console.log(`✅ 导出按钮可见: ${isVisible}, 可用: ${isEnabled}`);

      // 检查按钮样式和提示
      const buttonText = await exportButton.textContent();
      console.log(`✅ 按钮文本: ${buttonText}`);

      // 检查是否有loading状态
      await exportButton.click();
      await page.waitForTimeout(1000);
      
      const hasLoadingState = await page.locator('.loading, .spinner, [data-loading="true"]').count() > 0;
      if (hasLoadingState) {
        console.log('✅ 有loading状态指示');
      } else {
        console.log('ℹ️ 建议添加loading状态指示');
      }

      // 检查是否有进度提示
      const progressIndicators = [
        'text=正在生成报告',
        'text=导出中',
        'text=准备下载',
        '.progress-bar'
      ];

      let hasProgress = false;
      for (const indicator of progressIndicators) {
        if (await page.locator(indicator).count() > 0) {
          hasProgress = true;
          console.log(`✅ 发现进度提示: ${indicator}`);
        }
      }

      if (!hasProgress) {
        console.log('ℹ️ 建议添加导出进度提示');
      }
    }

    console.log('✅ 导出功能用户体验测试完成');
  });

  test('10.5 导出功能实现建议测试', async ({ page }) => {
    // 分析当前页面数据，提供实现建议
    
    await page.goto('/hr/dashboard');
    await testHelpers.waitForPageLoad();

    // 分析页面数据结构
    const pageAnalysis = {
      statistics: await page.locator('[data-testid="statistics-card"], .stat-card').count(),
      tables: await page.locator('table').count(),
      charts: await page.locator('canvas, svg, .chart').count(),
      buttons: await page.locator('button').count(),
      forms: await page.locator('form').count()
    };

    console.log('📊 页面数据分析:');
    console.log(`  - 统计卡片: ${pageAnalysis.statistics} 个`);
    console.log(`  - 数据表格: ${pageAnalysis.tables} 个`);
    console.log(`  - 图表元素: ${pageAnalysis.charts} 个`);
    console.log(`  - 按钮元素: ${pageAnalysis.buttons} 个`);
    console.log(`  - 表单元素: ${pageAnalysis.forms} 个`);

    // 基于分析提供实现建议
    console.log('💡 导出功能实现建议:');
    
    if (pageAnalysis.statistics > 0) {
      console.log('  ✅ 可实现统计数据导出 (Excel/CSV)');
    }
    
    if (pageAnalysis.tables > 0) {
      console.log('  ✅ 可实现表格数据导出 (Excel/CSV)');
    }
    
    if (pageAnalysis.charts > 0) {
      console.log('  ✅ 可实现图表导出 (PNG/PDF)');
    }

    console.log('  📋 推荐导出格式:');
    console.log('    - Excel (.xlsx) - 适合数据分析');
    console.log('    - CSV (.csv) - 适合数据导入');
    console.log('    - PDF (.pdf) - 适合报告分享');
    console.log('    - PNG (.png) - 适合图表截图');

    console.log('✅ 导出功能实现建议测试完成');
  });
});
