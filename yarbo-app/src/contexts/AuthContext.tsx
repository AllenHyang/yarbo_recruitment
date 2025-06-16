"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { getUserRole, getUserByEmail } from "@/lib/api";
import type { UserRole, UserWithProfile } from "@/lib/database.types";

interface AuthContextType {
  user: User | null;
  userProfile: UserWithProfile | null;
  userRole: UserRole | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  userRole: null,
  session: null,
  loading: true,
  signOut: async () => { },
  refreshUser: async () => { },
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserWithProfile | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    if (!user?.email) {
      setUserProfile(null);
      setUserRole(null);
      return;
    }

    try {
      // 直接从 user_profiles 表获取用户资料
      const { data: userProfileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // 从 JWT 中获取用户角色
      let role: UserRole = 'candidate'; // 默认角色

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          // 解析 JWT token 获取 app_role
          const parts = session.access_token.split('.');
          if (parts.length === 3) {
            try {
              // 添加必要的 padding 并处理 URL-safe base64
              let payload = parts[1];
              // 替换 URL-safe 字符
              payload = payload.replace(/-/g, '+').replace(/_/g, '/');
              // 添加 padding
              while (payload.length % 4) {
                payload += '=';
              }
              const decodedPayload = JSON.parse(atob(payload));
              const jwtRole = decodedPayload.app_role || decodedPayload.user_metadata?.role;

              if (jwtRole && ['candidate', 'hr', 'admin'].includes(jwtRole)) {
                role = jwtRole as UserRole;
              }
            } catch (decodeError) {
              console.warn("JWT payload 解码失败:", decodeError);
            }
          }
        }
      } catch (jwtError) {
        console.warn("解析 JWT 角色失败，使用默认角色:", jwtError);

        // 后备方案：基于邮箱判断角色
        if (user.email === 'hr@yarbo.com') {
          role = 'hr';
        } else if (user.email === 'admin@yarbo.com') {
          role = 'admin';
        }
      }

      // 创建用户资料对象
      const profile = {
        id: user.id,
        email: user.email,
        role: role,
        status: 'active' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_profiles: userProfileData || null
      };

      setUserProfile(profile);
      setUserRole(role);
    } catch (error) {
      console.error("获取用户信息失败:", error);

      // 发生错误时，创建临时用户资料作为后备
      let role: UserRole = 'candidate'; // 默认角色

      // 尝试从 JWT 获取角色
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          const parts = session.access_token.split('.');
          if (parts.length === 3) {
            try {
              // 添加必要的 padding 并处理 URL-safe base64
              let payload = parts[1];
              // 替换 URL-safe 字符
              payload = payload.replace(/-/g, '+').replace(/_/g, '/');
              // 添加 padding
              while (payload.length % 4) {
                payload += '=';
              }
              const decodedPayload = JSON.parse(atob(payload));
              const jwtRole = decodedPayload.app_role || decodedPayload.user_metadata?.role;

              if (jwtRole && ['candidate', 'hr', 'admin'].includes(jwtRole)) {
                role = jwtRole as UserRole;
              }
            } catch (decodeError) {
              console.warn("JWT payload 解码失败:", decodeError);
            }
          }
        }
      } catch (jwtError) {
        // 最后的后备方案：基于邮箱判断角色
        if (user.email === 'hr@yarbo.com') {
          role = 'hr';
        } else if (user.email === 'admin@yarbo.com') {
          role = 'admin';
        }
      }

      const profile = {
        id: user.id,
        email: user.email,
        role: role,
        status: 'active' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_profiles: null
      };

      setUserProfile(profile);
      setUserRole(role);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserProfile(null);
      setUserRole(null);
      setSession(null);
    } catch (error) {
      console.error("登出失败:", error);
    }
  };

  useEffect(() => {
    // 获取初始会话
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        // 如果有刷新令牌错误，清除本地存储
        if (error && error.message.includes('refresh_token_not_found')) {
          console.log("刷新令牌失效，清除本地存储");
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          setUserProfile(null);
          setUserRole(null);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await refreshUser();
        }
      } catch (error) {
        console.error("获取会话失败:", error);
        // 发生任何认证错误时，重置状态
        setSession(null);
        setUser(null);
        setUserProfile(null);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("认证状态变化:", event, session?.user?.email);

        // 处理令牌刷新错误
        if (event === 'TOKEN_REFRESHED' && !session) {
          console.log("令牌刷新失败，清除认证状态");
          setSession(null);
          setUser(null);
          setUserProfile(null);
          setUserRole(null);
          setLoading(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await refreshUser();
        } else {
          setUserProfile(null);
          setUserRole(null);
        }

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // 当用户信息变化时，刷新用户详情
  useEffect(() => {
    if (user?.email && !userProfile) {
      refreshUser();
    }
  }, [user]);

  const value = {
    user,
    userProfile,
    userRole,
    session,
    loading,
    signOut,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}