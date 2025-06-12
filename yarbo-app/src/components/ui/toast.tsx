"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

export interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
  onClose?: () => void;
}

interface ToastContextType {
  toasts: ToastProps[];
  addToast: (toast: Omit<ToastProps, "id">) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  const addToast = React.useCallback((toast: Omit<ToastProps, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    
    setToasts((prev) => [...prev, newToast]);

    // 自动移除toast
    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 5000);
    }
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearToasts = React.useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ 
  toasts, 
  onRemove 
}: { 
  toasts: ToastProps[]; 
  onRemove: (id: string) => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={() => onRemove(toast.id)} />
      ))}
    </div>
  );
}

function Toast({ 
  title, 
  description, 
  type = "info", 
  onClose 
}: ToastProps) {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  const colors = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };

  const iconColors = {
    success: "text-green-600",
    error: "text-red-600",
    warning: "text-yellow-600",
    info: "text-blue-600",
  };

  const Icon = icons[type];

  return (
    <div
      className={cn(
        "relative flex items-start space-x-3 rounded-lg border p-4 shadow-lg transition-all duration-300 ease-in-out",
        colors[type]
      )}
    >
      <Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", iconColors[type])} />
      <div className="flex-1 min-w-0">
        {title && (
          <p className="text-sm font-medium">{title}</p>
        )}
        {description && (
          <p className={cn("text-sm", title ? "mt-1" : "")}>{description}</p>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-2 p-1 rounded-md hover:bg-black/5 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// 便捷的toast函数
export const toast = {
  success: (message: string, title?: string) => {
    // 这个函数需要在ToastProvider内部使用
    console.log("Success toast:", title, message);
  },
  error: (message: string, title?: string) => {
    console.log("Error toast:", title, message);
  },
  warning: (message: string, title?: string) => {
    console.log("Warning toast:", title, message);
  },
  info: (message: string, title?: string) => {
    console.log("Info toast:", title, message);
  },
};

// Hook for creating toast functions
export function useToastActions() {
  const { addToast } = useToast();

  return React.useMemo(() => ({
    success: (description: string, title?: string) => {
      addToast({ type: "success", title, description });
    },
    error: (description: string, title?: string) => {
      addToast({ type: "error", title, description });
    },
    warning: (description: string, title?: string) => {
      addToast({ type: "warning", title, description });
    },
    info: (description: string, title?: string) => {
      addToast({ type: "info", title, description });
    },
  }), [addToast]);
}
