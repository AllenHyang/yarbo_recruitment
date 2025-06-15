-- =====================================================
-- 求职申请表扩展 - 添加求职信字段
-- 创建日期: 2024年12月
-- 版本: v1.1
-- 用途: 为applications表添加cover_letter字段以支持求职信功能
-- =====================================================

-- 1. 为applications表添加cover_letter字段
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS cover_letter TEXT;

-- 2. 添加字段注释
COMMENT ON COLUMN applications.cover_letter IS '求职信内容，可选字段，允许候选人为特定职位撰写个性化申请信息';

-- 3. 创建索引以支持求职信内容搜索（如果需要）
-- CREATE INDEX IF NOT EXISTS idx_applications_cover_letter_search ON applications USING gin(to_tsvector('chinese', cover_letter));

-- =====================================================
-- 验证迁移结果
-- =====================================================

-- 检查字段是否成功添加
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'applications' 
AND column_name = 'cover_letter';

-- 显示applications表的完整结构
\d applications;
