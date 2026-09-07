import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Drawer } from '../ui/Drawer';
import { Bell, Menu, LayoutDashboard, Target, Briefcase, FileText, Award, LogOut, Bot, Sparkles, User, Star, ClipboardList, Send, Loader2, Compass, Building2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { NotificationDropdown } from '../notifications/NotificationDropdown';
import { aiService } from '../../services/aiService';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
  actions?: string[];
}

export const StudentLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: `Hello ${user?.name || 'there'}! I'm your AI Career Copilot. I analyze your verified skills, gaps, and target roles to provide personalized guidance. How can I help you today?`,
      time: 'Just now',
      actions: [
        'What careers fit my verified skills?',
        'What should I learn next?',
        'Explain my top skill gaps',
        'Recommend top matching internships',
      ],
    },
  ]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputMessage).trim();
    if (!textToSend || isSending) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsSending(true);

    try {
      const response = await aiService.getCareerCopilot(textToSend);
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: response.reply || 'Here are my recommendations based on your current skill profile.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: response.suggestedActions?.length ? response.suggestedActions : undefined,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const fallbackMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: 'Based on your verified skills, continuing to complete platform assessments and closing high-priority gaps will maximize your match scores for open industry positions.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: ['View Skill Gap Analysis', 'Browse Assessments'],
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Profile', href: '/student/profile', icon: User },
    { name: 'My Skills', href: '/student/skills', icon: Star },
    { name: 'Assessments', href: '/student/assessments', icon: ClipboardList },
    { name: 'Skill Gap Analysis', href: '/student/skill-gap', icon: Target },
    { name: 'Career & Roadmap', href: '/student/career', icon: Compass },
    { name: 'Opportunities', href: '/student/jobs', icon: Briefcase },
    { name: 'Applications', href: '/student/applications', icon: FileText },
    { name: 'Portfolio', href: '/student/portfolio', icon: Sparkles },
    { name: 'Affiliation', href: '/student/affiliation', icon: Building2 },
  ];

  return (
    <div className="min-h-screen bg-transparent flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 transition-all duration-300">
        <div className="h-16 flex items-center px-6 bg-slate-950">
          <Link to="/" className="text-xl font-bold text-white flex items-center gap-2">
            <img src="/logo.jpg" alt="Logo" className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-lg" />
            Skill Intelligence
          </Link>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  isActive ? "bg-indigo-600 text-white" : "hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <Avatar fallback={user?.name} className="bg-slate-700 text-white" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">Student</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800" onClick={logout}>
            <LogOut size={18} className="mr-2" /> Logout
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 z-10">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-slate-500" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-semibold text-slate-800 hidden sm:block">
              {navigation.find(n => location.pathname.startsWith(n.href))?.name || 'Portal'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <NotificationDropdown />
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 pb-24">
          <Outlet />
        </main>

        {/* AI Copilot FAB */}
        <button 
          onClick={() => setCopilotOpen(true)}
          className="absolute bottom-8 right-8 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 z-20"
          title="Open AI Career Copilot"
        >
          <Bot size={24} />
        </button>
      </div>

      {/* AI Copilot Drawer */}
      <Drawer
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        title="AI Career Copilot"
        position="right"
      >
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex items-start gap-2.5",
                  m.sender === 'user' ? "flex-row-reverse" : "flex-row"
                )}
              >
                {m.sender === 'assistant' ? (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot size={16} />
                  </div>
                ) : (
                  <Avatar fallback={user?.name || 'U'} className="w-8 h-8 flex-shrink-0 text-xs mt-0.5" />
                )}
                <div className="max-w-[85%] space-y-2">
                  <div
                    className={cn(
                      "rounded-2xl p-3 text-sm leading-relaxed shadow-sm",
                      m.sender === 'user'
                        ? "bg-indigo-600 text-white rounded-tr-none"
                        : "bg-slate-100 text-slate-800 rounded-tl-none"
                    )}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>
                    <span className={cn(
                      "text-[10px] block mt-1",
                      m.sender === 'user' ? "text-indigo-200 text-right" : "text-slate-400 text-left"
                    )}>
                      {m.time}
                    </span>
                  </div>

                  {/* Suggestion Chips */}
                  {m.actions && m.actions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {m.actions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(act)}
                          disabled={isSending}
                          className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-full text-left transition-colors flex items-center gap-1"
                        >
                          <Sparkles size={11} className="shrink-0 text-indigo-500" />
                          <span>{act}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isSending && (
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                  <Bot size={16} />
                </div>
                <div className="bg-slate-100 rounded-2xl rounded-tl-none p-3 text-sm text-slate-500 flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-indigo-600" />
                  <span>Thinking & analyzing your profile...</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-slate-200 mt-auto bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="relative flex items-center gap-2"
            >
              <input 
                type="text" 
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about careers, skills, or internships..."
                disabled={isSending}
                className="flex-1 pl-4 pr-10 py-2 border border-slate-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
              />
              <button 
                type="submit"
                disabled={!inputMessage.trim() || isSending}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-full flex items-center justify-center transition-colors shadow-sm"
              >
                <Send size={13} />
              </button>
            </form>
          </div>
        </div>
      </Drawer>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-slate-900 text-slate-300 flex flex-col h-full animate-in slide-in-from-left">
            <div className="h-16 flex items-center px-6 bg-slate-950">
              <span className="text-xl font-bold text-white">Skill Intelligence</span>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium",
                    location.pathname.startsWith(item.href) ? "bg-indigo-600 text-white" : "hover:bg-slate-800"
                  )}
                >
                  <item.icon size={18} />
                  {item.name}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
};
