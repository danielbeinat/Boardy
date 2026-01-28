import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { useUIStore } from "../../store";
import type { Notification } from "../../types";
import { cn } from "../../utils";

const TOAST_DURATION = 5000;

export const NotificationToast: React.FC<{ notification: Notification }> = ({
  notification,
}) => {
  const { removeNotification } = useUIStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      removeNotification(notification.id);
    }, TOAST_DURATION);

    return () => clearTimeout(timer);
  }, [notification.id, removeNotification]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
  };

  const colors = {
    success: "border-green-100 bg-green-50",
    error: "border-red-100 bg-red-50",
    info: "border-blue-100 bg-blue-50",
    warning: "border-yellow-100 bg-yellow-50",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.9 }}
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl border shadow-lg max-w-md w-full bg-white transition-all",
        colors[notification.type],
      )}
    >
      <div className="flex-shrink-0 mt-0.5">{icons[notification.type]}</div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-gray-900 truncate">
          {notification.title}
        </h4>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
          {notification.message}
        </p>
      </div>
      <button
        onClick={() => removeNotification(notification.id)}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export const NotificationCenter: React.FC = () => {
  const { notifications } = useUIStore();

  const activeNotifications = notifications.slice(0, 3);

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {activeNotifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <NotificationToast notification={notification} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};
