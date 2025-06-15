// 测试验证码API
async function testCaptcha() {
  console.log('🧪 开始测试验证码API...\n');

  try {
    // 1. 生成验证码
    console.log('📝 步骤1: 生成验证码');
    const generateResponse = await fetch('http://localhost:3000/api/captcha/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!generateResponse.ok) {
      const error = await generateResponse.text();
      console.log('❌ 生成验证码失败:', generateResponse.status, error);
      return;
    }

    const generateData = await generateResponse.json();
    console.log('✅ 生成验证码成功:', generateData);
    
    const { sessionToken, captchaCode } = generateData;
    
    // 2. 验证正确的验证码
    console.log('\n📝 步骤2: 验证正确的验证码');
    console.log('验证码:', captchaCode);
    
    const verifyResponse = await fetch('http://localhost:3000/api/captcha/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionToken,
        captchaCode
      }),
    });

    const verifyData = await verifyResponse.json();
    
    if (verifyResponse.ok) {
      console.log('✅ 验证成功:', verifyData);
    } else {
      console.log('❌ 验证失败:', verifyResponse.status, verifyData);
    }

    // 3. 验证错误的验证码
    console.log('\n📝 步骤3: 验证错误的验证码');
    
    const wrongVerifyResponse = await fetch('http://localhost:3000/api/captcha/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionToken,
        captchaCode: 'WRONG'
      }),
    });

    const wrongVerifyData = await wrongVerifyResponse.json();
    
    if (wrongVerifyResponse.ok) {
      console.log('❌ 错误验证码应该失败，但成功了:', wrongVerifyData);
    } else {
      console.log('✅ 错误验证码正确失败:', wrongVerifyResponse.status, wrongVerifyData);
    }

  } catch (error) {
    console.error('❌ 测试过程中出错:', error);
  }
}

testCaptcha();
