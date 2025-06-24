// 验证码会话存储接口
interface CaptchaSession {
  captchaCode: string;
  expiresAt: Date;
  attempts: number;
  verified?: boolean;
}

// 内存存储验证码会话（生产环境应使用 Redis 或数据库）
class CaptchaStore {
  private sessions = new Map<string, CaptchaSession>();
  
  constructor() {
    // 定期清理过期会话
    setInterval(() => {
      this.cleanExpiredSessions();
    }, 60000); // 每分钟清理一次
  }
  
  // 存储会话
  set(token: string, session: CaptchaSession): void {
    this.sessions.set(token, session);
  }
  
  // 获取会话
  get(token: string): CaptchaSession | undefined {
    return this.sessions.get(token);
  }
  
  // 删除会话
  delete(token: string): void {
    this.sessions.delete(token);
  }
  
  // 清理过期会话
  private cleanExpiredSessions(): void {
    const now = new Date();
    for (const [token, session] of this.sessions.entries()) {
      if (session.expiresAt < now) {
        this.sessions.delete(token);
      }
    }
  }
}

// 导出单例实例
export const captchaStore = new CaptchaStore();