const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('测试 Supabase 连接...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? '已设置' : '未设置');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 环境变量未正确设置');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 测试连接
async function testConnection() {
  try {
    console.log('正在测试数据库连接...');
    
    // 测试简单查询
    const { data, error } = await supabase
      .from('jobs')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ 数据库连接失败:', error.message);
      return false;
    }
    
    console.log('✅ Supabase 连接成功!');
    return true;
  } catch (err) {
    console.error('❌ 连接测试异常:', err.message);
    return false;
  }
}

testConnection().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('❌ 测试失败:', err);
  process.exit(1);
});