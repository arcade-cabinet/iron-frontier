// Notification Feed - Toast-style notifications
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, type Notification } from '../store/gameStore';
import { cn } from '@/lib/utils';

// Icons for different notification types
function NotificationIcon({ type }: { type: Notification['type'] }) {
  switch (type) {
    case 'item':
      return (
        <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      );
    case 'xp':
      return (
        <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      );
    case 'quest':
      return (
        <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case 'level':
      return (
        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case 'info':
    default:
      return (
        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
}

function NotificationItem({ notification }: { notification: Notification }) {
  const { settings, removeNotification } = useGameStore();
  
  const bgColor = {
    item: 'bg-amber-900/90 border-amber-600/50',
    xp: 'bg-purple-900/90 border-purple-600/50',
    quest: 'bg-yellow-900/90 border-yellow-600/50',
    level: 'bg-green-900/90 border-green-600/50',
    info: 'bg-slate-800/90 border-slate-600/50',
  }[notification.type];
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ 
        duration: settings.reducedMotion ? 0.1 : 0.2,
        type: 'spring',
        stiffness: 500,
        damping: 30,
      }}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg border backdrop-blur-sm shadow-lg',
        bgColor
      )}
      onClick={() => removeNotification(notification.id)}
    >
      <NotificationIcon type={notification.type} />
      <span className="text-white text-sm font-medium">{notification.message}</span>
    </motion.div>
  );
}

export function NotificationFeed() {
  const { notifications } = useGameStore();
  
  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 w-full max-w-xs px-4">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </AnimatePresence>
    </div>
  );
}
