"use client";

import { useAuth } from "@/contexts/AuthContext";
import { withProtected } from "@/components/withProtected";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Shield } from "lucide-react";

function ProfilePage() {
  const { user, userProfile, userRole } = useAuth();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">个人资料</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <User className="h-6 w-6 text-gray-500" />
              <div>
                <p className="font-medium">姓名</p>
                <p className="text-gray-700">{userProfile?.user_profiles?.first_name || '未设置'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Mail className="h-6 w-6 text-gray-500" />
              <div>
                <p className="font-medium">邮箱</p>
                <p className="text-gray-700">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Shield className="h-6 w-6 text-gray-500" />
              <div>
                <p className="font-medium">角色</p>
                <p className="text-gray-700 capitalize">{userRole}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withProtected(ProfilePage, ["admin", "hr", "candidate"]); 