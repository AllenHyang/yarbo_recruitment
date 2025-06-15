-- =====================================================
-- 通知和消息系统 - 数据库迁移脚本
-- 创建日期: 2024年12月
-- 版本: v1.0
-- 用途: 为Yarbo招聘平台添加通知和消息系统数据库支持
-- =====================================================

-- 1. 创建通知表
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50) NOT NULL CHECK (type IN ('application_status', 'new_application', 'interview_scheduled', 'system_update', 'message_received')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_role VARCHAR(20) NOT NULL CHECK (user_role IN ('candidate', 'hr', 'admin')),
  metadata JSONB DEFAULT '{}',
  action_url VARCHAR(500),
  action_type VARCHAR(20) DEFAULT 'internal' CHECK (action_type IN ('internal', 'external')),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. 创建消息表
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_name VARCHAR(100) NOT NULL,
  sender_role VARCHAR(20) NOT NULL CHECK (sender_role IN ('candidate', 'hr', 'admin', 'system')),
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_name VARCHAR(100) NOT NULL,
  receiver_role VARCHAR(20) NOT NULL CHECK (receiver_role IN ('candidate', 'hr', 'admin')),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('system', 'status_update', 'interview_notification', 'general', 'urgent')),
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status VARCHAR(20) DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived', 'deleted')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP,
  archived_at TIMESTAMP,
  deleted_at TIMESTAMP
);

-- 3. 创建通知订阅设置表（用户可以自定义通知偏好）
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL,
  email_enabled BOOLEAN DEFAULT true,
  browser_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, notification_type)
);

-- =====================================================
-- 创建索引以提高查询性能
-- =====================================================

-- notifications表索引
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read) WHERE read = false;

-- messages表索引
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(type);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_unread ON messages(receiver_id, status) WHERE status = 'unread';

-- notification_preferences表索引
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);

-- =====================================================
-- 创建触发器和函数
-- =====================================================

-- 1. 更新updated_at字段的触发器
CREATE TRIGGER update_notifications_updated_at 
  BEFORE UPDATE ON notifications 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at 
  BEFORE UPDATE ON notification_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. 消息状态更新触发器
CREATE OR REPLACE FUNCTION update_message_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  -- 当状态变为已读时，设置read_at时间戳
  IF OLD.status != 'read' AND NEW.status = 'read' THEN
    NEW.read_at = NOW();
  END IF;
  
  -- 当状态变为已归档时，设置archived_at时间戳
  IF OLD.status != 'archived' AND NEW.status = 'archived' THEN
    NEW.archived_at = NOW();
  END IF;
  
  -- 当状态变为已删除时，设置deleted_at时间戳
  IF OLD.status != 'deleted' AND NEW.status = 'deleted' THEN
    NEW.deleted_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_message_status_timestamps 
  BEFORE UPDATE ON messages 
  FOR EACH ROW EXECUTE FUNCTION update_message_timestamps();

-- =====================================================
-- Row Level Security (RLS) 策略
-- =====================================================

-- 启用RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- 通知表RLS策略
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- HR和管理员可以创建通知
CREATE POLICY "HR and admin can create notifications" ON notifications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('hr', 'admin')
    )
  );

-- 消息表RLS策略
CREATE POLICY "Users can view their own messages" ON messages
  FOR SELECT USING (
    receiver_id = auth.uid() OR sender_id = auth.uid()
  );

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update their received messages" ON messages
  FOR UPDATE USING (receiver_id = auth.uid());

-- 通知偏好RLS策略
CREATE POLICY "Users can manage their notification preferences" ON notification_preferences
  FOR ALL USING (user_id = auth.uid());

-- =====================================================
-- 插入默认通知偏好
-- =====================================================

-- 为现有用户创建默认通知偏好
INSERT INTO notification_preferences (user_id, notification_type, email_enabled, browser_enabled)
SELECT 
  u.id,
  unnest(ARRAY['application_status', 'new_application', 'interview_scheduled', 'system_update', 'message_received']),
  true,
  true
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM notification_preferences np 
  WHERE np.user_id = u.id
);

-- =====================================================
-- 创建实用函数
-- =====================================================

-- 1. 获取用户未读通知数量
CREATE OR REPLACE FUNCTION get_unread_notification_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER 
    FROM notifications 
    WHERE user_id = user_uuid AND read = false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. 获取用户未读消息数量
CREATE OR REPLACE FUNCTION get_unread_message_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER 
    FROM messages 
    WHERE receiver_id = user_uuid AND status = 'unread'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 标记所有通知为已读
CREATE OR REPLACE FUNCTION mark_all_notifications_read(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE notifications 
  SET read = true, updated_at = NOW()
  WHERE user_id = user_uuid AND read = false;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 完成提示
-- =====================================================
-- 通知和消息系统数据库迁移完成！
-- 
-- 创建的表：
-- - notifications: 系统通知
-- - messages: 用户消息
-- - notification_preferences: 通知偏好设置
--
-- 创建的函数：
-- - get_unread_notification_count(): 获取未读通知数量
-- - get_unread_message_count(): 获取未读消息数量  
-- - mark_all_notifications_read(): 标记所有通知为已读
--
-- 下一步：更新应用代码以使用这些表
