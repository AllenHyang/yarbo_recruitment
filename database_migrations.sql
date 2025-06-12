-- =====================================================
-- HR后台管理系统 - 数据库扩展迁移脚本
-- 创建日期: 2024年12月
-- 版本: v1.0
-- 用途: 扩展Yarbo招聘平台数据库以支持HR后台管理功能
-- =====================================================

-- 1. 扩展现有jobs表，添加HR管理所需字段
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS department VARCHAR(100),
ADD COLUMN IF NOT EXISTS salary_min INTEGER,
ADD COLUMN IF NOT EXISTS salary_max INTEGER,
ADD COLUMN IF NOT EXISTS salary_currency VARCHAR(10) DEFAULT 'CNY',
ADD COLUMN IF NOT EXISTS employment_type VARCHAR(50) DEFAULT 'full_time',
ADD COLUMN IF NOT EXISTS experience_level VARCHAR(50) DEFAULT 'mid',
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
ADD COLUMN IF NOT EXISTS deadline TIMESTAMP,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS is_remote_allowed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS travel_required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS benefits TEXT[],
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS application_count INTEGER DEFAULT 0;

-- 2. 扩展现有applications表，添加HR管理所需字段
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
ADD COLUMN IF NOT EXISTS source VARCHAR(100) DEFAULT 'website',
ADD COLUMN IF NOT EXISTS last_updated_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5),
ADD COLUMN IF NOT EXISTS evaluation_scores JSONB,
ADD COLUMN IF NOT EXISTS next_action VARCHAR(100),
ADD COLUMN IF NOT EXISTS follow_up_date TIMESTAMP;

-- 3. 创建面试管理表
CREATE TABLE IF NOT EXISTS interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  interviewer_id UUID NOT NULL REFERENCES users(id),
  interview_type VARCHAR(50) NOT NULL CHECK (interview_type IN ('phone_screen', 'video_interview', 'onsite_interview', 'technical_test', 'panel_interview')),
  scheduled_at TIMESTAMP NOT NULL,
  duration INTEGER DEFAULT 60 CHECK (duration > 0),
  location VARCHAR(255),
  meeting_link VARCHAR(500),
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show', 'rescheduled')),
  feedback TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  technical_score INTEGER CHECK (technical_score >= 1 AND technical_score <= 5),
  communication_score INTEGER CHECK (communication_score >= 1 AND communication_score <= 5),
  culture_fit_score INTEGER CHECK (culture_fit_score >= 1 AND culture_fit_score <= 5),
  recommendation VARCHAR(50) CHECK (recommendation IN ('strong_hire', 'hire', 'maybe', 'no_hire', 'strong_no_hire')),
  next_steps TEXT,
  interviewer_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. 创建候选人池表
CREATE TABLE IF NOT EXISTS candidate_pools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  pool_type VARCHAR(50) DEFAULT 'custom' CHECK (pool_type IN ('active', 'passive', 'qualified', 'campus', 'referral', 'custom')),
  created_by UUID NOT NULL REFERENCES users(id),
  is_public BOOLEAN DEFAULT false,
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. 创建候选人池成员关联表
CREATE TABLE IF NOT EXISTS candidate_pool_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pool_id UUID NOT NULL REFERENCES candidate_pools(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  added_by UUID NOT NULL REFERENCES users(id),
  added_at TIMESTAMP DEFAULT NOW(),
  notes TEXT,
  tags TEXT[],
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'contacted', 'interested', 'not_interested')),
  last_contact_date TIMESTAMP,
  UNIQUE(pool_id, candidate_id)
);

-- 6. 创建HR活动日志表
CREATE TABLE IF NOT EXISTS hr_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('job', 'application', 'interview', 'candidate', 'candidate_pool')),
  entity_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 创建索引以提高查询性能
-- =====================================================

-- jobs表索引
CREATE INDEX IF NOT EXISTS idx_jobs_department ON jobs(department);
CREATE INDEX IF NOT EXISTS idx_jobs_employment_type ON jobs(employment_type);
CREATE INDEX IF NOT EXISTS idx_jobs_priority ON jobs(priority);
CREATE INDEX IF NOT EXISTS idx_jobs_created_by ON jobs(created_by);
CREATE INDEX IF NOT EXISTS idx_jobs_status_priority ON jobs(status, priority);

-- applications表索引
CREATE INDEX IF NOT EXISTS idx_applications_priority ON applications(priority);
CREATE INDEX IF NOT EXISTS idx_applications_source ON applications(source);
CREATE INDEX IF NOT EXISTS idx_applications_rating ON applications(rating);
CREATE INDEX IF NOT EXISTS idx_applications_tags ON applications USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_applications_status_priority ON applications(status, priority);

-- interviews表索引
CREATE INDEX IF NOT EXISTS idx_interviews_application_id ON interviews(application_id);
CREATE INDEX IF NOT EXISTS idx_interviews_interviewer_id ON interviews(interviewer_id);
CREATE INDEX IF NOT EXISTS idx_interviews_scheduled_at ON interviews(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(status);
CREATE INDEX IF NOT EXISTS idx_interviews_type_status ON interviews(interview_type, status);

-- =====================================================
-- 创建触发器和函数
-- =====================================================

-- 1. 更新updated_at字段的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. 为需要的表添加updated_at触发器
CREATE TRIGGER update_interviews_updated_at 
  BEFORE UPDATE ON interviews 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidate_pools_updated_at 
  BEFORE UPDATE ON candidate_pools 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Row Level Security (RLS) 策略
-- =====================================================

-- 启用RLS
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_pool_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_activity_logs ENABLE ROW LEVEL SECURITY;

-- HR人员可以查看和管理面试
CREATE POLICY "HR can manage interviews" ON interviews
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('hr', 'admin')
    )
  );

-- 面试官可以查看自己的面试
CREATE POLICY "Interviewers can view their interviews" ON interviews
  FOR SELECT USING (interviewer_id = auth.uid());

-- HR人员可以管理候选人池
CREATE POLICY "HR can manage candidate pools" ON candidate_pools
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('hr', 'admin')
    )
  );

-- HR人员可以管理候选人池成员
CREATE POLICY "HR can manage candidate pool members" ON candidate_pool_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('hr', 'admin')
    )
  );

-- HR活动日志只有管理员可以查看
CREATE POLICY "Admin can view HR activity logs" ON hr_activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- =====================================================
-- 插入默认数据
-- =====================================================

-- 默认候选人池
INSERT INTO candidate_pools (name, description, pool_type, created_by, is_public) 
SELECT 
  '主动求职者',
  '当前正在积极寻找工作机会的候选人',
  'active',
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
  true
WHERE NOT EXISTS (SELECT 1 FROM candidate_pools WHERE name = '主动求职者');

INSERT INTO candidate_pools (name, description, pool_type, created_by, is_public) 
SELECT 
  '优质人才库',
  '经过筛选的高质量候选人',
  'qualified',
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
  true
WHERE NOT EXISTS (SELECT 1 FROM candidate_pools WHERE name = '优质人才库');

-- =====================================================
-- 完成提示
-- =====================================================
-- 数据库扩展完成！HR后台管理系统数据库基础已就绪。 