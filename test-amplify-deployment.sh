#!/bin/bash

# AWS Amplify 部署测试脚本
# 使用 AWS CLI 检查和测试 Amplify 应用状态

set -e

echo "🔍 AWS Amplify 部署状态检查"
echo "=============================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查 AWS 凭证
echo -e "\n${YELLOW}1. 检查 AWS 配置${NC}"
if aws sts get-caller-identity > /dev/null 2>&1; then
    echo -e "${GREEN}✓ AWS 凭证已配置${NC}"
    aws sts get-caller-identity --output table
else
    echo -e "${RED}✗ AWS 凭证未配置，请运行 'aws configure'${NC}"
    exit 1
fi

# 获取 Amplify 应用列表
echo -e "\n${YELLOW}2. 获取 Amplify 应用列表${NC}"
apps=$(aws amplify list-apps --query 'apps[*].[appId,name,defaultDomain]' --output json)

if [ -z "$apps" ] || [ "$apps" == "[]" ]; then
    echo -e "${RED}✗ 未找到任何 Amplify 应用${NC}"
    exit 1
fi

echo -e "${GREEN}✓ 找到以下 Amplify 应用：${NC}"
echo "$apps" | jq -r '.[] | "App ID: \(.[0]), Name: \(.[1]), Domain: \(.[2])"'

# 让用户选择应用
echo -e "\n请输入要测试的 App ID（或直接按回车使用第一个）："
read -r APP_ID

if [ -z "$APP_ID" ]; then
    APP_ID=$(echo "$apps" | jq -r '.[0][0]')
fi

echo -e "\n${YELLOW}3. 获取应用详情${NC}"
app_details=$(aws amplify get-app --app-id "$APP_ID" --output json)

echo "应用信息："
echo "$app_details" | jq -r '.app | "
名称: \(.name)
平台: \(.platform)
仓库: \(.repository)
默认域名: \(.defaultDomain)
创建时间: \(.createTime)
更新时间: \(.updateTime)"'

# 检查构建设置
echo -e "\n${YELLOW}4. 检查构建设置${NC}"
build_spec=$(echo "$app_details" | jq -r '.app.buildSpec // empty')
if [ -n "$build_spec" ]; then
    echo "Build Spec:"
    echo "$build_spec"
else
    echo "使用项目中的 amplify.yml"
fi

# 获取分支信息
echo -e "\n${YELLOW}5. 获取分支信息${NC}"
branches=$(aws amplify list-branches --app-id "$APP_ID" --output json)

echo -e "${GREEN}✓ 分支列表：${NC}"
echo "$branches" | jq -r '.branches[] | "
分支: \(.branchName)
状态: \(.stage)
部署状态: \(.activeJobId // "无活动任务")"'

# 获取主分支
BRANCH_NAME=$(echo "$branches" | jq -r '.branches[0].branchName // "main"')

# 获取最新的部署任务
echo -e "\n${YELLOW}6. 获取最新部署状态${NC}"
jobs=$(aws amplify list-jobs --app-id "$APP_ID" --branch-name "$BRANCH_NAME" --max-results 5 --output json)

if [ "$(echo "$jobs" | jq '.jobSummaries | length')" -gt 0 ]; then
    echo -e "${GREEN}✓ 最近的部署任务：${NC}"
    echo "$jobs" | jq -r '.jobSummaries[] | "
任务 ID: \(.jobId)
状态: \(.status)
类型: \(.jobType)
开始时间: \(.startTime)
结束时间: \(.endTime // "进行中")"'
    
    # 获取最新任务的详情
    latest_job_id=$(echo "$jobs" | jq -r '.jobSummaries[0].jobId')
    latest_job_status=$(echo "$jobs" | jq -r '.jobSummaries[0].status')
    
    if [ "$latest_job_status" == "SUCCEED" ]; then
        echo -e "\n${GREEN}✓ 最新部署成功！${NC}"
    elif [ "$latest_job_status" == "FAILED" ]; then
        echo -e "\n${RED}✗ 最新部署失败！${NC}"
        # 获取错误日志
        echo -e "\n${YELLOW}获取错误日志...${NC}"
        aws amplify get-job --app-id "$APP_ID" --branch-name "$BRANCH_NAME" --job-id "$latest_job_id" --query 'job.steps[?status==`FAILED`]' --output json
    else
        echo -e "\n${YELLOW}⏳ 部署正在进行中...${NC}"
    fi
else
    echo -e "${YELLOW}⚠ 未找到部署任务${NC}"
fi

# 获取域名信息
echo -e "\n${YELLOW}7. 获取域名配置${NC}"
domains=$(aws amplify list-domain-associations --app-id "$APP_ID" --output json 2>/dev/null || echo '{"domainAssociations":[]}')

if [ "$(echo "$domains" | jq '.domainAssociations | length')" -gt 0 ]; then
    echo -e "${GREEN}✓ 自定义域名：${NC}"
    echo "$domains" | jq -r '.domainAssociations[] | "域名: \(.domainName), 状态: \(.domainStatus)"'
else
    echo "使用默认 Amplify 域名"
fi

# 获取环境变量（不显示值）
echo -e "\n${YELLOW}8. 检查环境变量${NC}"
env_vars=$(aws amplify get-app --app-id "$APP_ID" --query 'app.environmentVariables' --output json)

if [ "$env_vars" != "null" ] && [ "$env_vars" != "{}" ]; then
    echo -e "${GREEN}✓ 已配置的环境变量：${NC}"
    echo "$env_vars" | jq -r 'keys[] | "  - \(.)"'
    
    # 检查必需的环境变量
    required_vars=("NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_ANON_KEY" "SUPABASE_SERVICE_ROLE_KEY")
    missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if ! echo "$env_vars" | jq -e "has(\"$var\")" > /dev/null; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        echo -e "\n${RED}✗ 缺少必需的环境变量：${NC}"
        printf '%s\n' "${missing_vars[@]}"
    else
        echo -e "\n${GREEN}✓ 所有必需的环境变量已配置${NC}"
    fi
else
    echo -e "${RED}✗ 未配置任何环境变量${NC}"
fi

# 测试应用访问
echo -e "\n${YELLOW}9. 测试应用访问${NC}"
app_url="https://${BRANCH_NAME}.${APP_ID}.amplifyapp.com"
echo "测试 URL: $app_url"

if curl -s -o /dev/null -w "%{http_code}" "$app_url" | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✓ 应用可以访问${NC}"
    
    # 测试 API 端点
    echo -e "\n${YELLOW}10. 测试 API 端点${NC}"
    
    # 测试验证码 API
    echo -n "测试 /api/captcha/generate ... "
    captcha_response=$(curl -s -X POST "$app_url/api/captcha/generate" -H "Content-Type: application/json")
    
    if echo "$captcha_response" | jq -e '.sessionToken' > /dev/null 2>&1; then
        echo -e "${GREEN}✓ 成功${NC}"
        session_token=$(echo "$captcha_response" | jq -r '.sessionToken')
        captcha_code=$(echo "$captcha_response" | jq -r '.captchaCode')
        echo "  验证码: $captcha_code"
        
        # 测试验证
        echo -n "测试 /api/captcha/verify ... "
        verify_response=$(curl -s -X POST "$app_url/api/captcha/verify" \
            -H "Content-Type: application/json" \
            -d "{\"sessionToken\":\"$session_token\",\"captchaCode\":\"$captcha_code\"}")
        
        if echo "$verify_response" | jq -e '.success' > /dev/null 2>&1; then
            echo -e "${GREEN}✓ 成功${NC}"
        else
            echo -e "${RED}✗ 失败${NC}"
            echo "  响应: $verify_response"
        fi
    else
        echo -e "${RED}✗ 失败${NC}"
        echo "  响应: $captcha_response"
    fi
else
    echo -e "${RED}✗ 应用无法访问${NC}"
fi

# 获取 CloudWatch 日志组
echo -e "\n${YELLOW}11. CloudWatch 日志信息${NC}"
log_group="/aws/amplify/${APP_ID}"
echo "日志组: $log_group"

# 检查是否有错误日志
if aws logs describe-log-streams --log-group-name "$log_group" --limit 1 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ 日志组存在${NC}"
    echo "查看日志命令："
    echo "  aws logs tail $log_group --follow"
else
    echo -e "${YELLOW}⚠ 日志组不存在或无权限访问${NC}"
fi

echo -e "\n${GREEN}测试完成！${NC}"
echo "=============================="

# 生成测试报告
echo -e "\n${YELLOW}生成测试报告...${NC}"
report_file="amplify-test-report-$(date +%Y%m%d-%H%M%S).json"

cat > "$report_file" << EOF
{
  "testTime": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "appId": "$APP_ID",
  "branchName": "$BRANCH_NAME",
  "appUrl": "$app_url",
  "latestDeploymentStatus": "$latest_job_status",
  "apiTestResults": {
    "captchaGenerate": $([ -n "$session_token" ] && echo "true" || echo "false"),
    "captchaVerify": $(echo "$verify_response" | jq -e '.success' > /dev/null 2>&1 && echo "true" || echo "false")
  }
}
EOF

echo -e "${GREEN}✓ 测试报告已保存到: $report_file${NC}"