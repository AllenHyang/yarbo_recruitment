import jsPDF from 'jspdf';

export interface AssessmentResult {
  id: string;
  type: string;
  score: number;
  result: string;
  description: string;
  date: string;
  candidate_name?: string;
  candidate_email?: string;
  detailed_scores?: Record<string, number>;
}

export async function generateAssessmentPDF(result: AssessmentResult): Promise<Blob> {
  const doc = new jsPDF();
  let yPosition = 20;

  // 标题
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('测评报告', 105, yPosition, { align: 'center' });
  yPosition += 15;

  // 测评类型
  doc.setFontSize(16);
  const typeNames = {
    mbti: 'MBTI 性格测试',
    bigFive: '大五人格测试', 
    disc: 'DISC 行为测试',
    eq: '情商测试'
  };
  doc.text(typeNames[result.type as keyof typeof typeNames] || result.type, 105, yPosition, { align: 'center' });
  yPosition += 20;

  // 基本信息
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  if (result.candidate_name) {
    doc.text(`姓名: ${result.candidate_name}`, 20, yPosition);
    yPosition += 8;
  }
  
  if (result.candidate_email) {
    doc.text(`邮箱: ${result.candidate_email}`, 20, yPosition);
    yPosition += 8;
  }
  
  doc.text(`测试日期: ${new Date(result.date).toLocaleDateString('zh-CN')}`, 20, yPosition);
  yPosition += 8;
  
  doc.text(`得分: ${result.score}`, 20, yPosition);
  yPosition += 8;
  
  doc.text(`结果: ${result.result}`, 20, yPosition);
  yPosition += 15;

  // 描述
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('测评结果分析:', 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const lines = doc.splitTextToSize(result.description, 170);
  doc.text(lines, 20, yPosition);
  yPosition += lines.length * 5 + 10;

  // 详细得分
  if (result.detailed_scores) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('详细分析:', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    Object.entries(result.detailed_scores).forEach(([key, value]) => {
      doc.text(`${key}: ${value}`, 25, yPosition);
      yPosition += 7;
    });
  }

  // 页脚
  doc.setFontSize(10);
  doc.setTextColor(128);
  doc.text('Yarbo 招聘平台生成', 105, 280, { align: 'center' });

  return doc.output('blob');
}

export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function generateAndDownloadReport(result: AssessmentResult): Promise<void> {
  try {
    const blob = await generateAssessmentPDF(result);
    const filename = `${result.candidate_name || '测评者'}_${result.type}_报告_${new Date().toISOString().split('T')[0]}.pdf`;
    downloadPDF(blob, filename);
  } catch (error) {
    console.error('PDF生成失败:', error);
    throw error;
  }
} 