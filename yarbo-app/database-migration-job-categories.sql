-- 数据库迁移：添加职位分类字段
-- 用于区分普通职位、校园招聘和实习职位

-- 1. 添加职位分类字段
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS job_category VARCHAR(50) DEFAULT 'regular' 
CHECK (job_category IN ('regular', 'campus', 'internship'));

-- 2. 添加校园招聘特有字段
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS graduation_year VARCHAR(10),  -- 面向毕业年份，如 "2024", "2025"
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,  -- 是否为推荐职位
ADD COLUMN IF NOT EXISTS campus_specific BOOLEAN DEFAULT false;  -- 是否为校园专属

-- 3. 添加实习职位特有字段
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS internship_duration VARCHAR(50),  -- 实习时长，如 "3-6个月"
ADD COLUMN IF NOT EXISTS internship_type VARCHAR(50),  -- 实习类型，如 "技术实习", "设计实习"
ADD COLUMN IF NOT EXISTS start_date DATE,  -- 实习开始日期
ADD COLUMN IF NOT EXISTS stipend_amount INTEGER,  -- 实习津贴金额
ADD COLUMN IF NOT EXISTS stipend_period VARCHAR(20) DEFAULT 'daily',  -- 津贴周期：daily, weekly, monthly
ADD COLUMN IF NOT EXISTS skills_gained TEXT[],  -- 可获得技能数组
ADD COLUMN IF NOT EXISTS is_remote_internship BOOLEAN DEFAULT false;  -- 是否支持远程实习

-- 4. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(job_category);
CREATE INDEX IF NOT EXISTS idx_jobs_graduation_year ON jobs(graduation_year);
CREATE INDEX IF NOT EXISTS idx_jobs_featured ON jobs(is_featured);
CREATE INDEX IF NOT EXISTS idx_jobs_internship_type ON jobs(internship_type);

-- 5. 插入一些示例数据

-- 校园招聘职位示例
INSERT INTO jobs (
  title, department, location, job_category, graduation_year, 
  is_featured, campus_specific, salary_min, salary_max, salary_display,
  description, requirements, status, employment_type, experience_level,
  deadline, created_at
) VALUES 
(
  '2025届软件工程师校招', '技术部', '北京', 'campus', '2025',
  true, true, 15000, 25000, '15-25K',
  '面向2025届计算机相关专业毕业生，加入我们的技术团队，参与核心产品开发。',
  ARRAY['计算机相关专业本科及以上学历', '熟悉至少一门编程语言', '有良好的学习能力和团队合作精神'],
  'active', 'full_time', 'entry',
  '2024-03-15', NOW()
),
(
  '2025届产品经理校招', '产品部', '上海', 'campus', '2025',
  false, true, 12000, 20000, '12-20K',
  '寻找有创新思维的应届毕业生，参与产品规划和设计工作。',
  ARRAY['本科及以上学历', '对产品设计有浓厚兴趣', '具备良好的沟通能力'],
  'active', 'full_time', 'entry',
  '2024-03-10', NOW()
),
(
  '2025届数据分析师校招', '数据部', '深圳', 'campus', '2025',
  true, true, 14000, 22000, '14-22K',
  '面向统计学、数学、计算机等相关专业毕业生，参与数据分析和挖掘工作。',
  ARRAY['统计学、数学、计算机相关专业', '熟悉Python或R', '有数据分析项目经验优先'],
  'active', 'full_time', 'entry',
  '2024-03-12', NOW()
);

-- 实习职位示例
INSERT INTO jobs (
  title, department, location, job_category, internship_duration, internship_type,
  start_date, stipend_amount, stipend_period, is_featured, is_remote_internship,
  salary_display, description, requirements, skills_gained, status, employment_type,
  deadline, created_at
) VALUES 
(
  '前端开发实习生', '技术部', '北京', 'internship', '3-6个月', '技术实习',
  '2024-03-01', 150, 'daily', true, false,
  '150-200/天', '参与前端项目开发，学习现代前端技术栈，与资深工程师一起工作。',
  ARRAY['计算机相关专业在读', '熟悉HTML/CSS/JavaScript', '了解React或Vue框架'],
  ARRAY['React开发', '前端工程化', '团队协作', '代码规范'],
  'active', 'internship',
  '2024-02-15', NOW()
),
(
  '产品设计实习生', '产品部', '上海', 'internship', '2-4个月', '设计实习',
  '2024-02-26', 120, 'daily', false, true,
  '120-180/天', '参与产品设计工作，学习用户体验设计和产品思维。',
  ARRAY['设计相关专业在读', '熟悉Figma或Sketch', '有设计作品集'],
  ARRAY['UI/UX设计', '用户研究', '原型设计', '设计思维'],
  'active', 'internship',
  '2024-02-12', NOW()
),
(
  '数据分析实习生', '数据部', '深圳', 'internship', '4-6个月', '分析实习',
  '2024-02-20', 130, 'daily', true, false,
  '130-200/天', '参与数据分析项目，学习数据挖掘和机器学习技术。',
  ARRAY['统计学、数学相关专业', '熟悉Python或R', '有数据分析基础'],
  ARRAY['数据分析', '机器学习', '数据可视化', '业务理解'],
  'active', 'internship',
  '2024-02-10', NOW()
),
(
  '市场营销实习生', '市场部', '北京', 'internship', '3-5个月', '市场实习',
  '2024-02-15', 100, 'daily', false, true,
  '100-150/天', '参与市场活动策划和执行，学习数字营销和品牌推广。',
  ARRAY['市场营销相关专业', '有创意思维', '良好的沟通能力'],
  ARRAY['营销策划', '活动执行', '数据分析', '品牌管理'],
  'active', 'internship',
  '2024-02-08', NOW()
);

-- 6. 更新现有职位为普通职位类型（如果有的话）
UPDATE jobs 
SET job_category = 'regular' 
WHERE job_category IS NULL;

COMMENT ON COLUMN jobs.job_category IS '职位分类：regular(普通职位), campus(校园招聘), internship(实习职位)';
COMMENT ON COLUMN jobs.graduation_year IS '面向毕业年份，仅校园招聘职位使用';
COMMENT ON COLUMN jobs.is_featured IS '是否为推荐/热门职位';
COMMENT ON COLUMN jobs.campus_specific IS '是否为校园专属职位';
COMMENT ON COLUMN jobs.internship_duration IS '实习时长，如"3-6个月"';
COMMENT ON COLUMN jobs.internship_type IS '实习类型，如"技术实习"、"设计实习"';
COMMENT ON COLUMN jobs.start_date IS '实习开始日期';
COMMENT ON COLUMN jobs.stipend_amount IS '实习津贴金额';
COMMENT ON COLUMN jobs.stipend_period IS '津贴周期：daily(日), weekly(周), monthly(月)';
COMMENT ON COLUMN jobs.skills_gained IS '实习期间可获得的技能数组';
COMMENT ON COLUMN jobs.is_remote_internship IS '是否支持远程实习';
