import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { AuthProvider } from "@/contexts/AuthContext";
import { RoleBasedNavigation } from "@/components/RoleBasedNavigation";
import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "Yarbo 汉阳科技 人才招聘",
  description: "加入 Yarbo 汉阳科技，与我们一起构建未来",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased flex flex-col"
        )}
      >
        <ToastProvider>
          <AuthProvider>
            <RoleBasedNavigation />
            <main className="flex-grow">{children}</main>
            <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
              <p className="text-xs text-muted-foreground">
                &copy; 2024 Yarbo 汉阳科技. All rights reserved.
              </p>
              <nav className="sm:ml-auto flex gap-4 sm:gap-6">
                <Link href="/terms" className="text-xs hover:underline underline-offset-4">
                  使用条款
                </Link>
                <Link href="/privacy" className="text-xs hover:underline underline-offset-4">
                  隐私政策
                </Link>
              </nav>
            </footer>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
} 