import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  GraduationCap,
  Users,
  Sparkles,
  ExternalLink,
  Clock,
  X,
} from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { NotificationItem } from '../../types/notification.types';

const formatTimeAgo = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
};

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'APPLICATION_SUBMITTED':
    case 'SHORTLISTED':
    case 'STUDENT_SELECTED':
    case 'INTERVIEW_SCHEDULED':
      return <Briefcase className="w-4 h-4 text-indigo-600" />;
    case 'SKILL_GAP_DETECTED':
      return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    case 'LEARNING_RECOMMENDATION':
      return <GraduationCap className="w-4 h-4 text-emerald-600" />;
    case 'MENTORSHIP_ACCEPTED':
    case 'MENTORSHIP_REQUEST':
      return <Users className="w-4 h-4 text-blue-600" />;
    default:
      return <Sparkles className="w-4 h-4 text-purple-600" />;
  }
};

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Query unread count (poll every 30s)
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationService.getUnreadCount(),
    refetchInterval: 30000,
    staleTime: 15000,
  });

  // Query notifications list
  const { data: notificationData, isLoading } = useQuery({
    queryKey: ['notifications', 'list', activeFilter],
    queryFn: () =>
      notificationService.getMyNotifications({
        page: 1,
        limit: 15,
        isRead: activeFilter === 'UNREAD' ? false : undefined,
      }),
    enabled: isOpen,
    staleTime: 10000,
  });

  // Mark single as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const notifications = notificationData?.notifications || [];

  const handleNotificationClick = (item: NotificationItem) => {
    if (!item.isRead) {
      markAsReadMutation.mutate(item.id);
    }
    // Deep-link routing based on notification type / data
    if (item.data?.path) {
      navigate(item.data.path);
      setIsOpen(false);
    } else if (item.type.includes('APPLICATION') || item.type.includes('SHORTLISTED')) {
      navigate('/student/applications');
      setIsOpen(false);
    } else if (item.type.includes('SKILL_GAP')) {
      navigate('/student/skill-gap');
      setIsOpen(false);
    } else if (item.type.includes('LEARNING')) {
      navigate('/student/career');
      setIsOpen(false);
    } else if (item.type.includes('MENTORSHIP')) {
      navigate('/student/mentorship');
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
        className="relative p-2.5 text-slate-500 hover:text-indigo-600 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/80 z-50 overflow-hidden flex flex-col max-h-[520px]"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900 text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-100 text-indigo-700 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 transition-colors disabled:opacity-50"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center px-4 pt-2 border-b border-slate-100 gap-4 text-xs font-medium text-slate-500">
              <button
                onClick={() => setActiveFilter('ALL')}
                className={`pb-2 transition-colors relative ${
                  activeFilter === 'ALL'
                    ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                    : 'hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilter('UNREAD')}
                className={`pb-2 transition-colors relative ${
                  activeFilter === 'UNREAD'
                    ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                    : 'hover:text-slate-900'
                }`}
              >
                Unread
              </button>
            </div>

            {/* List Body */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="flex gap-3 animate-pulse">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-slate-200 rounded w-3/4" />
                        <div className="h-2.5 bg-slate-100 rounded w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                    <Bell className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">No notifications yet</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {activeFilter === 'UNREAD'
                      ? 'You have caught up with all updates!'
                      : 'We will notify you when meaningful activities occur.'}
                  </p>
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 text-left relative ${
                      !item.isRead ? 'bg-indigo-50/30' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-white shadow-xs border border-slate-200/60 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {getNotificationIcon(item.type)}
                    </div>

                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center justify-between gap-1">
                        <p
                          className={`text-xs truncate ${
                            !item.isRead ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'
                          }`}
                        >
                          {item.title}
                        </p>
                        <span className="text-[10px] text-slate-400 flex items-center gap-0.5 flex-shrink-0">
                          <Clock className="w-2.5 h-2.5" />
                          {formatTimeAgo(item.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{item.message}</p>
                    </div>

                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0 self-center" />
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-2.5 text-center border-t border-slate-100 bg-slate-50/50">
              <span className="text-[11px] text-slate-400">Real-time alerts & activities</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
