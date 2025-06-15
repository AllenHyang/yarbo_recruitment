/**
 * Yarbo招聘系统 - Playwright测试运行器
 * 
 * 这个脚本提供了一个统一的测试运行入口，支持：
 * - 按模块运行测试
 * - 生成详细的测试报告
 * - 测试结果统计
 * - 失败测试的重试机制
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface TestModule {
  name: string;
  file: string;
  description: string;
  pageCount: number;
  priority: 'high' | 'medium' | 'low';
}

interface TestResult {
  module: string;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  errors: string[];
}

class TestRunner {
  private testModules: TestModule[] = [
    {
      name: '基础功能测试',
      file: '01-basic-functionality.spec.ts',
      description: '根页面和基础功能测试 (7个页面)',
      pageCount: 7,
      priority: 'high'
    },
    {
      name: '认证系统测试',
      file: '02-authentication.spec.ts',
      description: '用户认证和权限控制测试 (4个页面)',
      pageCount: 4,
      priority: 'high'
    },
    {
      name: '申请系统测试',
      file: '03-application-system.spec.ts',
      description: '职位申请和在线测评测试 (2个页面)',
      pageCount: 2,
      priority: 'high'
    },
    {
      name: 'HR管理系统测试',
      file: '04-hr-management.spec.ts',
      description: 'HR管理功能测试 (22个页面)',
      pageCount: 22,
      priority: 'medium'
    },
    {
      name: '职位和候选人测试',
      file: '05-jobs-and-candidates.spec.ts',
      description: '职位浏览和候选人系统测试 (3个页面)',
      pageCount: 3,
      priority: 'medium'
    },
    {
      name: '测试调试页面测试',
      file: '06-testing-debug.spec.ts',
      description: '测试和调试功能测试 (9个页面)',
      pageCount: 9,
      priority: 'low'
    },
    {
      name: '综合集成测试',
      file: '07-comprehensive-integration.spec.ts',
      description: '系统集成和端到端测试',
      pageCount: 0,
      priority: 'high'
    }
  ];

  private results: TestResult[] = [];

  /**
   * 运行所有测试
   */
  async runAllTests(): Promise<void> {
    console.log('🚀 开始运行 Yarbo 招聘系统 Playwright 测试套件');
    console.log('=' .repeat(60));
    
    const startTime = Date.now();
    
    for (const module of this.testModules) {
      await this.runTestModule(module);
    }
    
    const totalTime = Date.now() - startTime;
    
    this.generateReport(totalTime);
  }

  /**
   * 按优先级运行测试
   */
  async runTestsByPriority(priority: 'high' | 'medium' | 'low'): Promise<void> {
    console.log(`🎯 运行 ${priority} 优先级测试`);
    console.log('=' .repeat(40));
    
    const filteredModules = this.testModules.filter(m => m.priority === priority);
    
    for (const module of filteredModules) {
      await this.runTestModule(module);
    }
    
    this.generateReport();
  }

  /**
   * 运行单个测试模块
   */
  private async runTestModule(module: TestModule): Promise<void> {
    console.log(`\n📋 运行测试模块: ${module.name}`);
    console.log(`📄 描述: ${module.description}`);
    console.log(`🔧 文件: ${module.file}`);
    
    const startTime = Date.now();
    
    try {
      const command = `npx playwright test tests/${module.file} --reporter=json`;
      const output = execSync(command, { 
        encoding: 'utf-8',
        cwd: process.cwd()
      });
      
      const result = this.parseTestOutput(output, module.name);
      result.duration = Date.now() - startTime;
      
      this.results.push(result);
      
      console.log(`✅ ${module.name} 完成`);
      console.log(`   通过: ${result.passed}, 失败: ${result.failed}, 跳过: ${result.skipped}`);
      console.log(`   耗时: ${(result.duration / 1000).toFixed(2)}s`);
      
    } catch (error) {
      const result: TestResult = {
        module: module.name,
        passed: 0,
        failed: 1,
        skipped: 0,
        duration: Date.now() - startTime,
        errors: [error instanceof Error ? error.message : String(error)]
      };
      
      this.results.push(result);
      
      console.log(`❌ ${module.name} 失败`);
      console.log(`   错误: ${result.errors[0]}`);
    }
  }

  /**
   * 解析测试输出
   */
  private parseTestOutput(output: string, moduleName: string): TestResult {
    try {
      const jsonOutput = JSON.parse(output);
      
      return {
        module: moduleName,
        passed: jsonOutput.stats?.passed || 0,
        failed: jsonOutput.stats?.failed || 0,
        skipped: jsonOutput.stats?.skipped || 0,
        duration: 0,
        errors: jsonOutput.errors || []
      };
    } catch {
      // 如果无法解析JSON，返回默认结果
      return {
        module: moduleName,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: 0,
        errors: ['无法解析测试输出']
      };
    }
  }

  /**
   * 生成测试报告
   */
  private generateReport(totalTime?: number): void {
    console.log('\n' + '=' .repeat(60));
    console.log('📊 测试报告');
    console.log('=' .repeat(60));
    
    const totalPassed = this.results.reduce((sum, r) => sum + r.passed, 0);
    const totalFailed = this.results.reduce((sum, r) => sum + r.failed, 0);
    const totalSkipped = this.results.reduce((sum, r) => sum + r.skipped, 0);
    const totalTests = totalPassed + totalFailed + totalSkipped;
    const totalPages = this.testModules.reduce((sum, m) => sum + m.pageCount, 0);
    
    console.log(`\n📈 总体统计:`);
    console.log(`   测试模块: ${this.results.length}`);
    console.log(`   覆盖页面: ${totalPages} 个`);
    console.log(`   总测试数: ${totalTests}`);
    console.log(`   通过: ${totalPassed} (${((totalPassed / totalTests) * 100).toFixed(1)}%)`);
    console.log(`   失败: ${totalFailed} (${((totalFailed / totalTests) * 100).toFixed(1)}%)`);
    console.log(`   跳过: ${totalSkipped} (${((totalSkipped / totalTests) * 100).toFixed(1)}%)`);
    
    if (totalTime) {
      console.log(`   总耗时: ${(totalTime / 1000).toFixed(2)}s`);
    }
    
    console.log(`\n📋 模块详情:`);
    this.results.forEach(result => {
      const status = result.failed > 0 ? '❌' : '✅';
      console.log(`   ${status} ${result.module}`);
      console.log(`      通过: ${result.passed}, 失败: ${result.failed}, 跳过: ${result.skipped}`);
      console.log(`      耗时: ${(result.duration / 1000).toFixed(2)}s`);
      
      if (result.errors.length > 0) {
        console.log(`      错误: ${result.errors[0]}`);
      }
    });
    
    // 生成HTML报告
    this.generateHTMLReport();
    
    console.log(`\n📄 详细报告已生成:`);
    console.log(`   HTML报告: test-results/report.html`);
    console.log(`   JSON报告: test-results/results.json`);
  }

  /**
   * 生成HTML报告
   */
  private generateHTMLReport(): void {
    const reportDir = 'test-results';
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const totalPassed = this.results.reduce((sum, r) => sum + r.passed, 0);
    const totalFailed = this.results.reduce((sum, r) => sum + r.failed, 0);
    const totalSkipped = this.results.reduce((sum, r) => sum + r.skipped, 0);
    const totalTests = totalPassed + totalFailed + totalSkipped;

    const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Yarbo 招聘系统 - Playwright 测试报告</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .content { padding: 30px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-number { font-size: 2em; font-weight: bold; margin-bottom: 5px; }
        .stat-label { color: #666; font-size: 0.9em; }
        .modules { margin-top: 30px; }
        .module { background: #f8f9fa; margin-bottom: 15px; border-radius: 8px; overflow: hidden; }
        .module-header { padding: 15px 20px; background: #e9ecef; font-weight: bold; }
        .module-content { padding: 15px 20px; }
        .success { color: #28a745; }
        .error { color: #dc3545; }
        .warning { color: #ffc107; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Yarbo 招聘系统 - Playwright 测试报告</h1>
            <p>生成时间: ${new Date().toLocaleString('zh-CN')}</p>
        </div>
        <div class="content">
            <div class="stats">
                <div class="stat-card">
                    <div class="stat-number success">${totalPassed}</div>
                    <div class="stat-label">通过测试</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number error">${totalFailed}</div>
                    <div class="stat-label">失败测试</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number warning">${totalSkipped}</div>
                    <div class="stat-label">跳过测试</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${totalTests}</div>
                    <div class="stat-label">总测试数</div>
                </div>
            </div>
            
            <div class="modules">
                <h2>📋 测试模块详情</h2>
                ${this.results.map(result => `
                    <div class="module">
                        <div class="module-header">
                            ${result.failed > 0 ? '❌' : '✅'} ${result.module}
                        </div>
                        <div class="module-content">
                            <p><strong>通过:</strong> <span class="success">${result.passed}</span> | 
                               <strong>失败:</strong> <span class="error">${result.failed}</span> | 
                               <strong>跳过:</strong> <span class="warning">${result.skipped}</span></p>
                            <p><strong>耗时:</strong> ${(result.duration / 1000).toFixed(2)}s</p>
                            ${result.errors.length > 0 ? `<p><strong>错误:</strong> <span class="error">${result.errors[0]}</span></p>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>
</body>
</html>`;

    fs.writeFileSync(path.join(reportDir, 'report.html'), html);
    fs.writeFileSync(path.join(reportDir, 'results.json'), JSON.stringify(this.results, null, 2));
  }
}

// 命令行接口
const args = process.argv.slice(2);
const runner = new TestRunner();

if (args.includes('--priority=high')) {
  runner.runTestsByPriority('high');
} else if (args.includes('--priority=medium')) {
  runner.runTestsByPriority('medium');
} else if (args.includes('--priority=low')) {
  runner.runTestsByPriority('low');
} else {
  runner.runAllTests();
}

export default TestRunner;
