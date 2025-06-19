import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '职位详情 - Yarbo 招聘',
  description: '查看职位详细信息和申请要求',
};

// ISR 配置：每 30 分钟重新验证一次
export const revalidate = 1800;

export default function JobDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}