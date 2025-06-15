"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshCw, Shield } from "lucide-react";

interface AdvancedCaptchaProps {
  onValidationChange: (isValid: boolean, sessionToken?: string) => void;
  className?: string;
  disabled?: boolean;
}

// 验证码会话缓存键
const CAPTCHA_CACHE_KEY = 'captcha_session_cache';

// 验证码会话接口
interface CaptchaSession {
  sessionToken: string;
  captchaCode: string;
  expiresAt: string;
  timestamp: number;
}

// 高级抗OCR图形验证码组件
function AntiOCRCaptcha({ onValidationChange, disabled }: { onValidationChange: (isValid: boolean, sessionToken?: string) => void; disabled: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [captchaCode, setCaptchaCode] = useState("");
  const [userInput, setUserInput] = useState("");
  const [sessionToken, setSessionToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const lastFetchTime = useRef<number>(0);
  const minFetchInterval = 3000; // 增加到3秒间隔

  // 缓存管理函数
  const saveCaptchaSession = useCallback((session: CaptchaSession) => {
    try {
      localStorage.setItem(CAPTCHA_CACHE_KEY, JSON.stringify(session));
    } catch (error) {
      console.warn('无法保存验证码会话到本地存储:', error);
    }
  }, []);

  const loadCaptchaSession = useCallback((): CaptchaSession | null => {
    try {
      const cached = localStorage.getItem(CAPTCHA_CACHE_KEY);
      if (!cached) return null;

      const session: CaptchaSession = JSON.parse(cached);
      const now = new Date();
      const expiresAt = new Date(session.expiresAt);

      // 检查是否过期（提前30秒过期以确保安全）
      if (expiresAt.getTime() - 30000 < now.getTime()) {
        localStorage.removeItem(CAPTCHA_CACHE_KEY);
        return null;
      }

      return session;
    } catch (error) {
      console.warn('无法加载验证码会话:', error);
      localStorage.removeItem(CAPTCHA_CACHE_KEY);
      return null;
    }
  }, []);

  const clearCaptchaSession = useCallback(() => {
    try {
      localStorage.removeItem(CAPTCHA_CACHE_KEY);
    } catch (error) {
      console.warn('无法清除验证码会话:', error);
    }
  }, []);

  // 绘制高级抗OCR验证码
  const drawAntiOCRCaptcha = useCallback((code: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 200;
    canvas.height = 80;

    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. 复杂背景纹理 - 降低对比度
    const gradient = ctx.createRadialGradient(100, 40, 0, 100, 40, 100);
    gradient.addColorStop(0, "#f8fafc");
    gradient.addColorStop(0.3, "#f1f5f9");
    gradient.addColorStop(0.6, "#e2e8f0");
    gradient.addColorStop(1, "#cbd5e1");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. 添加细密的背景纹理
    for (let i = 0; i < 1500; i++) {
      const gray = Math.floor(Math.random() * 60) + 180; // 浅灰色范围
      ctx.fillStyle = `rgba(${gray}, ${gray}, ${gray}, ${Math.random() * 0.15 + 0.05})`;
      ctx.fillRect(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 1.5 + 0.5,
        Math.random() * 1.5 + 0.5
      );
    }

    // 3. 添加网格状干扰
    ctx.strokeStyle = "rgba(200, 200, 200, 0.1)";
    ctx.lineWidth = 0.5;
    for (let i = 0; i < canvas.width; i += 8) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 6) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // 4. 绘制低对比度干扰线条
    for (let i = 0; i < 12; i++) {
      const gray = Math.floor(Math.random() * 80) + 120; // 中等灰色
      ctx.strokeStyle = `rgba(${gray}, ${gray}, ${gray}, ${Math.random() * 0.2 + 0.1})`;
      ctx.lineWidth = Math.random() * 2 + 0.5;
      ctx.beginPath();

      // 绘制更复杂的曲线
      const startX = Math.random() * canvas.width;
      const startY = Math.random() * canvas.height;
      const cp1X = Math.random() * canvas.width;
      const cp1Y = Math.random() * canvas.height;
      const cp2X = Math.random() * canvas.width;
      const cp2Y = Math.random() * canvas.height;
      const endX = Math.random() * canvas.width;
      const endY = Math.random() * canvas.height;

      ctx.moveTo(startX, startY);
      ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, endX, endY);
      ctx.stroke();
    }

    // 5. 添加波浪形干扰
    for (let i = 0; i < 6; i++) {
      ctx.strokeStyle = `rgba(${Math.floor(Math.random() * 60) + 140}, ${Math.floor(Math.random() * 60) + 140}, ${Math.floor(Math.random() * 60) + 140}, 0.15)`;
      ctx.lineWidth = Math.random() * 1.5 + 0.5;
      ctx.beginPath();

      const amplitude = Math.random() * 15 + 5;
      const frequency = Math.random() * 0.02 + 0.01;
      const phase = Math.random() * Math.PI * 2;

      for (let x = 0; x < canvas.width; x += 2) {
        const y = canvas.height / 2 + Math.sin(x * frequency + phase) * amplitude + (Math.random() - 0.5) * 10;
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }

    // 6. 绘制低对比度扭曲文字
    const charWidth = canvas.width / code.length;

    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      const x = charWidth * i + charWidth / 2;
      const y = canvas.height / 2 + (Math.random() - 0.5) * 8;

      ctx.save();

      // 更强的变换
      const scaleX = 0.7 + Math.random() * 0.6; // 0.7-1.3
      const scaleY = 0.7 + Math.random() * 0.6; // 0.7-1.3
      const rotation = (Math.random() - 0.5) * 0.8; // -0.4 到 0.4 弧度
      const skewX = (Math.random() - 0.5) * 0.6; // 更强的倾斜
      const skewY = (Math.random() - 0.5) * 0.3; // 垂直倾斜

      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.scale(scaleX, scaleY);
      ctx.transform(1, skewY, skewX, 1, 0, 0); // 双向倾斜变换

      // 字体设置
      const fontSize = 22 + Math.random() * 10;
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // 降低对比度的颜色 - 使用更接近背景的颜色
      const baseColors = [
        [80, 90, 120],   // 深蓝灰
        [90, 80, 80],    // 深红灰
        [80, 100, 90],   // 深绿灰
        [100, 85, 70],   // 深棕灰
        [85, 80, 110],   // 深紫灰
        [95, 80, 95],    // 深粉灰
        [80, 95, 110],   // 深青灰
        [100, 90, 70]    // 深橙灰
      ];

      const colorSet = baseColors[Math.floor(Math.random() * baseColors.length)];
      const [r, g, b] = colorSet;

      // 主文字颜色 - 低对比度
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.8)`;

      // 绘制多层字符以增加复杂度
      for (let layer = 0; layer < 3; layer++) {
        const offsetX = (Math.random() - 0.5) * 2;
        const offsetY = (Math.random() - 0.5) * 2;
        const alpha = 0.3 - layer * 0.1;

        ctx.fillStyle = `rgba(${r + layer * 10}, ${g + layer * 10}, ${b + layer * 10}, ${alpha})`;
        ctx.fillText(char, offsetX, offsetY);
      }

      // 添加非常淡的描边
      ctx.strokeStyle = `rgba(${r - 20}, ${g - 20}, ${b - 20}, 0.3)`;
      ctx.lineWidth = 0.5;
      ctx.strokeText(char, 0, 0);

      ctx.restore();
    }

    // 7. 添加细微的干扰元素
    for (let i = 0; i < 25; i++) {
      const gray = Math.floor(Math.random() * 40) + 160; // 浅灰色
      ctx.fillStyle = `rgba(${gray}, ${gray}, ${gray}, ${Math.random() * 0.2 + 0.05})`;
      const size = Math.random() * 3 + 1;
      ctx.fillRect(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        size,
        size
      );
    }

    // 8. 添加字符间的连接线干扰
    for (let i = 0; i < code.length - 1; i++) {
      const x1 = charWidth * i + charWidth / 2;
      const x2 = charWidth * (i + 1) + charWidth / 2;
      const y1 = canvas.height / 2 + (Math.random() - 0.5) * 20;
      const y2 = canvas.height / 2 + (Math.random() - 0.5) * 20;

      ctx.strokeStyle = `rgba(${Math.floor(Math.random() * 60) + 150}, ${Math.floor(Math.random() * 60) + 150}, ${Math.floor(Math.random() * 60) + 150}, 0.1)`;
      ctx.lineWidth = Math.random() * 1 + 0.5;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(
        (x1 + x2) / 2 + (Math.random() - 0.5) * 20,
        (y1 + y2) / 2 + (Math.random() - 0.5) * 20,
        x2, y2
      );
      ctx.stroke();
    }

    // 9. 添加轻微的模糊效果
    ctx.globalAlpha = 0.05;
    for (let i = 0; i < 2; i++) {
      ctx.drawImage(canvas, Math.random() * 1 - 0.5, Math.random() * 1 - 0.5);
    }
    ctx.globalAlpha = 1;

  }, []);

  // 从后端获取验证码
  const fetchCaptcha = useCallback(async (forceRefresh = false) => {
    // 如果不是强制刷新，先尝试从缓存加载
    if (!forceRefresh) {
      const cachedSession = loadCaptchaSession();
      if (cachedSession) {
        setSessionToken(cachedSession.sessionToken);
        setCaptchaCode(cachedSession.captchaCode);
        drawAntiOCRCaptcha(cachedSession.captchaCode);
        setUserInput("");
        setIsInitialized(true);
        onValidationChange(false);
        return;
      }
    }

    // 客户端速率限制检查
    const now = Date.now();
    if (now - lastFetchTime.current < minFetchInterval) {
      setError(`请等待 ${Math.ceil((minFetchInterval - (now - lastFetchTime.current)) / 1000)} 秒后再试`);
      return;
    }
    lastFetchTime.current = now;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/captcha/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '获取验证码失败');
      }

      const data = await response.json();

      // 保存到缓存
      const session: CaptchaSession = {
        sessionToken: data.sessionToken,
        captchaCode: data.captchaCode,
        expiresAt: data.expiresAt,
        timestamp: Date.now()
      };
      saveCaptchaSession(session);

      setSessionToken(data.sessionToken);
      setCaptchaCode(data.captchaCode);
      drawAntiOCRCaptcha(data.captchaCode);
      setUserInput("");
      setIsInitialized(true);
      onValidationChange(false);

    } catch (error) {
      console.error('获取验证码失败:', error);
      setError(error instanceof Error ? error.message : '获取验证码失败');
    } finally {
      setIsLoading(false);
    }
  }, [drawAntiOCRCaptcha, onValidationChange, loadCaptchaSession, saveCaptchaSession]);

  // 刷新验证码
  const refreshCaptcha = useCallback(() => {
    clearCaptchaSession();
    fetchCaptcha(true); // 强制刷新
  }, [fetchCaptcha, clearCaptchaSession]);

  // 验证输入
  const handleInputChange = (value: string) => {
    setUserInput(value);
    setError(null);

    // 只在输入长度变化时重置验证状态，不立即验证
    if (value.length !== 5) {
      onValidationChange(false);
    }
  };

  // 验证验证码
  const verifyCode = async (code: string) => {
    if (!sessionToken || code.length !== 5) {
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/captcha/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionToken,
          captchaCode: code
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onValidationChange(true, sessionToken);
        return true;
      } else {
        setError(data.error || '验证失败');
        onValidationChange(false);

        // 如果验证码过期或尝试次数过多，自动刷新
        if (data.error?.includes('过期') || data.error?.includes('次数过多')) {
          setTimeout(() => {
            refreshCaptcha();
          }, 1000);
        }
        return false;
      }
    } catch (error) {
      console.error('验证验证码失败:', error);
      setError('验证失败，请重试');
      onValidationChange(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 处理输入框失去焦点时验证
  const handleBlur = () => {
    if (userInput.length === 5) {
      verifyCode(userInput);
    }
  };

  // 处理回车键验证
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && userInput.length === 5) {
      verifyCode(userInput);
    }
  };

  // 初始化时尝试从缓存加载，但不自动请求新验证码
  useEffect(() => {
    const cachedSession = loadCaptchaSession();
    if (cachedSession) {
      setSessionToken(cachedSession.sessionToken);
      setCaptchaCode(cachedSession.captchaCode);
      drawAntiOCRCaptcha(cachedSession.captchaCode);
      setIsInitialized(true);
    }
  }, [loadCaptchaSession, drawAntiOCRCaptcha]);

  return (
    <div className="space-y-3">
      {!isInitialized ? (
        // 未初始化状态 - 显示获取验证码按钮
        <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-center space-y-3">
            <Shield className="h-8 w-8 text-gray-400 mx-auto" />
            <p className="text-sm text-gray-600">点击获取安全验证码</p>
            <Button
              type="button"
              onClick={() => fetchCaptcha(false)}
              disabled={disabled || isLoading}
              className="h-10 px-6"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  获取中...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  获取验证码
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        // 已初始化状态 - 显示验证码
        <div className="flex items-center space-x-3">
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="border border-gray-300 rounded-md cursor-pointer hover:border-gray-400 transition-colors"
              onClick={refreshCaptcha}
              title="点击刷新验证码"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-5 transition-all rounded-md pointer-events-none" />
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={refreshCaptcha}
            disabled={disabled || isLoading}
            className="h-10 px-3"
            title="刷新验证码"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      )}

      {isInitialized && (
        <div className="space-y-2">
          <div className="flex space-x-2">
            <Input
              type="text"
              value={userInput}
              onChange={(e) => handleInputChange(e.target.value)}
              onBlur={handleBlur}
              onKeyPress={handleKeyPress}
              placeholder="请输入验证码（不区分大小写）"
              className="h-11 flex-1"
              maxLength={5}
              disabled={disabled || isLoading}
              autoComplete="off"
            />
            <Button
              type="button"
              onClick={() => verifyCode(userInput)}
              disabled={disabled || isLoading || userInput.length !== 5}
              className="h-11 px-4"
            >
              验证
            </Button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {isLoading && isInitialized && (
        <p className="text-sm text-gray-500">验证中...</p>
      )}
    </div>
  );
}

export function AdvancedCaptcha({
  onValidationChange,
  className = "",
  disabled = false
}: AdvancedCaptchaProps) {
  const [isValid, setIsValid] = useState(false);

  const handleValidationChange = (valid: boolean, sessionToken?: string) => {
    setIsValid(valid);
    onValidationChange(valid, sessionToken);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Label className="flex items-center space-x-2 text-gray-700 font-medium">
        <Shield className="h-4 w-4" />
        <span>安全验证</span>
      </Label>

      <AntiOCRCaptcha onValidationChange={handleValidationChange} disabled={disabled} />

      {isValid && (
        <div className="flex items-center space-x-2 text-green-600 text-sm">
          <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <span>验证成功</span>
        </div>
      )}
    </div>
  );
}


