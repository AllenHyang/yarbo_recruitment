// 页面级别的 ISR 配置
// 在页面文件中导入并使用这些配置

// 首页：每 10 分钟重新验证
export const homePageRevalidate = 600;

// 职位列表页：每 5 分钟重新验证
export const jobsPageRevalidate = 300;

// 职位详情页：每 30 分钟重新验证
export const jobDetailRevalidate = 1800;

// 公司介绍等静态页面：每 24 小时重新验证
export const staticPageRevalidate = 86400;