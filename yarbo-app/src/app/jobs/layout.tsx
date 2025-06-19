import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '职位列表 - Yarbo 招聘',
  description: '探索 Yarbo 的职位机会，找到适合您的岗位',
};

// ISR 配置：每 5 分钟重新验证一次
export const revalidate = 300;

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}