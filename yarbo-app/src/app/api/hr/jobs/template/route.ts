import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

// Excel模板字段定义
const TEMPLATE_HEADERS = [
  '职位名称*',
  '部门*', 
  '工作地点*',
  '薪资最低值',
  '薪资最高值',
  '薪资显示文本',
  '是否远程工作',
  '职位状态*',
  '优先级*',
  '过期日期*',
  '职位描述*',
  '职位要求',
  '福利待遇',
  '工作类型',
  '经验要求',
  '学历要求'
]

// 示例数据
const EXAMPLE_DATA = [
  [
    '高级前端工程师',
    '技术部',
    '深圳市华南数字谷L栋',
    '15000',
    '25000',
    '15K-25K',
    '否',
    'published',
    '2',
    '2024-12-31',
    '负责前端产品的开发和维护，参与产品需求分析和技术方案设计。',
    '3年以上前端开发经验；熟练掌握React、Vue等前端框架；熟悉TypeScript、JavaScript等编程语言。',
    '五险一金、带薪年假、弹性工作时间、技能培训、团队建设活动。',
    '全职',
    '3-5年',
    '本科'
  ],
  [
    '产品经理',
    '产品部',
    '深圳市华南数字谷L栋',
    '18000',
    '30000',
    '18K-30K',
    '是',
    'published',
    '1',
    '2024-12-31',
    '负责产品规划、需求分析、产品设计和项目管理等工作。',
    '3年以上产品经理经验；具备良好的逻辑思维和沟通能力；熟悉互联网产品设计流程。',
    '五险一金、股票期权、带薪年假、健身房、免费午餐。',
    '全职',
    '3-5年',
    '本科'
  ]
]

// 字段说明
const FIELD_DESCRIPTIONS = [
  ['字段说明', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['职位名称*', '必填，职位的标题名称', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['部门*', '必填，所属部门名称', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['工作地点*', '必填，工作地点地址', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['薪资最低值', '选填，薪资范围最低值（数字）', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['薪资最高值', '选填，薪资范围最高值（数字）', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['薪资显示文本', '选填，薪资显示文本，如"15K-25K"', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['是否远程工作', '选填，填写"是"或"否"', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['职位状态*', '必填，published(已发布)/draft(草稿)/paused(暂停)/closed(关闭)', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['优先级*', '必填，1(极紧急)/2(紧急)/3(普通)/4(不急)/5(储备)', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['过期日期*', '必填，格式：YYYY-MM-DD', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['职位描述*', '必填，详细的职位描述', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['职位要求', '选填，职位技能和经验要求', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['福利待遇', '选填，公司提供的福利待遇', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['工作类型', '选填，全职/兼职/实习/合同工', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['经验要求', '选填，如"3-5年"', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['学历要求', '选填，如"本科"', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']
]

export async function GET(request: NextRequest) {
  try {
    // 验证用户权限
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    // 创建工作簿
    const workbook = XLSX.utils.book_new()

    // 创建模板工作表
    const templateData = [
      TEMPLATE_HEADERS,
      ...EXAMPLE_DATA
    ]
    
    const templateSheet = XLSX.utils.aoa_to_sheet(templateData)
    
    // 设置列宽
    const colWidths = [
      { wch: 20 }, // 职位名称
      { wch: 12 }, // 部门
      { wch: 25 }, // 工作地点
      { wch: 12 }, // 薪资最低值
      { wch: 12 }, // 薪资最高值
      { wch: 15 }, // 薪资显示文本
      { wch: 12 }, // 是否远程工作
      { wch: 12 }, // 职位状态
      { wch: 10 }, // 优先级
      { wch: 12 }, // 过期日期
      { wch: 40 }, // 职位描述
      { wch: 40 }, // 职位要求
      { wch: 30 }, // 福利待遇
      { wch: 12 }, // 工作类型
      { wch: 12 }, // 经验要求
      { wch: 12 }  // 学历要求
    ]
    templateSheet['!cols'] = colWidths

    // 添加模板工作表
    XLSX.utils.book_append_sheet(workbook, templateSheet, '职位数据')

    // 创建说明工作表
    const descriptionSheet = XLSX.utils.aoa_to_sheet(FIELD_DESCRIPTIONS)
    descriptionSheet['!cols'] = [{ wch: 20 }, { wch: 50 }]
    XLSX.utils.book_append_sheet(workbook, descriptionSheet, '字段说明')

    // 生成Excel文件
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx' 
    })

    // 返回文件
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="job_template.xlsx"',
        'Content-Length': excelBuffer.length.toString()
      }
    })

  } catch (error) {
    console.error('生成Excel模板失败:', error)
    return NextResponse.json(
      { error: '生成Excel模板失败' },
      { status: 500 }
    )
  }
}
