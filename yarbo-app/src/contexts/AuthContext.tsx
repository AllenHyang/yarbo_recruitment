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
  signOut: async () => {},
  refreshUser: async () => {},
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
      // 获取用户详细信息和角色
      const [profile, role] = await Promise.all([
        getUserByEmail(user.email),
        getUserRole(user.email),
      ]);

      setUserProfile(profile);
      setUserRole(role);
    } catch (error) {
      console.error("获取用户信息失败:", error);
      setUserProfile(null);
      setUserRole(null);
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
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await refreshUser();
        }
      } catch (error) {
        console.error("获取会话失败:", error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("认证状态变化:", event, session?.user?.email);
        
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