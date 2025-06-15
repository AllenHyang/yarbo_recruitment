// 简单的调试脚本来测试简历上传逻辑
const { createClient } = require('@supabase/supabase-js');

// 直接设置Supabase配置
const supabaseUrl = 'https://eipqxgdqittupttmpiud.supabase.co';
const supabaseKey = '***REMOVED***';

if (!supabaseUrl || !supabaseKey) {
  console.error('请确保设置了 NEXT_PUBLIC_SUPABASE_URL 和 ***REMOVED*** 环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUserLookup(userId) {
  console.log(`\n=== 测试用户查找: ${userId} ===`);

  try {
    // 1. 查找用户基本信息
    console.log('1. 查找用户基本信息...');
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('用户查找失败:', userError);
      return;
    }

    console.log('用户信息:', user);

    // 2. 查找用户资料
    console.log('2. 查找用户资料...');
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('first_name, last_name, phone')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.log('用户资料查找失败 (这是正常的，如果用户还没有创建资料):', profileError.message);
    } else {
      console.log('用户资料:', profile);
    }

    // 3. 查找申请者记录
    console.log('3. 查找申请者记录...');
    const { data: applicant, error: applicantError } = await supabase
      .from('applicants')
      .select('id, name, email, phone')
      .eq('user_id', userId)
      .single();

    if (applicantError) {
      console.log('申请者记录不存在 (这是正常的，如果用户还没有申请过职位):', applicantError.message);

      // 4. 模拟创建申请者记录
      console.log('4. 模拟创建申请者记录...');

      let userName = user.email.split('@')[0]; // 默认使用邮箱前缀
      if (profile?.first_name || profile?.last_name) {
        userName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
      }

      console.log('将要创建的申请者信息:', {
        user_id: userId,
        email: user.email,
        name: userName,
        phone: profile?.phone || ''
      });

      // 注意：这里只是模拟，不实际创建记录
      console.log('✓ 申请者记录创建逻辑验证通过');
    } else {
      console.log('申请者记录:', applicant);
    }

    // 5. 查找简历记录
    if (applicant) {
      console.log('5. 查找简历记录...');
      const { data: resumes, error: resumeError } = await supabase
        .from('resumes')
        .select('*')
        .eq('applicant_id', applicant.id)
        .order('created_at', { ascending: false });

      if (resumeError) {
        console.error('简历查找失败:', resumeError);
      } else {
        console.log('简历记录:', resumes);
      }
    }

  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

async function listAllUsers() {
  console.log('\n=== 列出所有用户 ===');

  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, role')
      .limit(10);

    if (error) {
      console.error('获取用户列表失败:', error);
      return;
    }

    console.log('用户列表:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}, Email: ${user.email}, Role: ${user.role}`);
    });

    return users;
  } catch (error) {
    console.error('列出用户时发生错误:', error);
    return [];
  }
}

async function main() {
  console.log('开始调试简历上传逻辑...\n');

  // 首先列出所有用户
  const users = await listAllUsers();

  if (users && users.length > 0) {
    // 测试第一个用户
    const testUser = users.find(u => u.role === 'candidate') || users[0];
    await testUserLookup(testUser.id);
  } else {
    console.log('没有找到用户进行测试');
  }

  console.log('\n调试完成!');
}

// 运行主函数
main().catch(console.error);
