/**
 * Notifications Page
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, AlertTriangle, CheckCircle2, CalendarCheck, Info, CheckCheck, Clock, User, Filter, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../services/api';

// Helpers
const timeAgo = (date) => {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60)    return `${s}s ago`;
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

const getErrorMessage = (err) => {
  if (!err || !err.response) return 'Network connection lost. Please try again.';
  const status = err.response.status;
  if (status === 401) return 'Session expired.';
  if (status === 403) return 'Permission denied.';
  if (status >= 500) return 'Internal server error.';
  return err.response?.data?.message || 'Unexpected error occurred.';
};

const TYPE_META = {
  allocation:  { Icon: CheckCircle2,  cls: 'text-teal', bg: 'bg-teal/10' },
  transfer:    { Icon: CalendarCheck, cls: 'text-blue-400', bg: 'bg-blue-400/10' },
  booking:     { Icon: CalendarCheck, cls: 'text-purple-400', bg: 'bg-purple-400/10' },
  maintenance: { Icon: CheckCircle2,  cls: 'text-success', bg: 'bg-success/10' },
  audit:       { Icon: AlertTriangle, cls: 'text-danger', bg: 'bg-danger/10' },
  system:      { Icon: Info,          cls: 'text-white/50', bg: 'bg-white/5' },
};

const TABS = ['All', 'Audit', 'Maintenance', 'Bookings', 'Other'];
const TAB_TYPE = { All: null, Audit: 'audit', Maintenance: 'maintenance', Bookings: 'booking', Other: 'system' };

// Notification row
function NotifRow({ notif, onMarkRead }) {
  const meta = TYPE_META[notif.type] || TYPE_META.system;
  return (
    <div className={`group flex items-start gap-4 px-5 py-4 border-b border-white/5 transition-all hover:bg-white/[0.04] ${!notif.isRead ? 'bg-teal/5 relative' : ''}`}>
      {!notif.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal" />}
      
      <div className={`mt-1 flex-none p-2 rounded-lg ${meta.bg} ${meta.cls}`}>
        <meta.Icon size={16} />
      </div>
      
      <div className="flex-1 min-w-0 pr-4">
        <p className={`text-sm leading-relaxed ${notif.isRead ? 'text-white/60' : 'text-white font-medium'}`}>{notif.message}</p>
        <p className={`text-xs mt-1.5 flex items-center gap-1.5 ${notif.isRead ? 'text-white/30' : 'text-teal/70'}`}>
          <Clock size={12} /> {timeAgo(notif.createdAt)}
        </p>
      </div>
      
      {!notif.isRead ? (
        <div className="flex items-center gap-3 flex-none pt-2">
          <div className="w-2 h-2 rounded-full bg-teal animate-pulse" />
          <button 
            onClick={() => onMarkRead(notif._id)} 
            className="opacity-30 group-hover:opacity-100 text-teal hover:text-white bg-teal/10 hover:bg-teal transition-all p-1.5 rounded-full" 
            title="Mark as read"
          >
            <CheckCheck size={14} />
          </button>
        </div>
      ) : (
        <div className="flex-none pt-2">
          <CheckCheck size={16} className="text-white/20" />
        </div>
      )}
    </div>
  );
}

// Activity row
function ActivityRow({ log, isLast }) {
  return (
    <div className="relative flex gap-5 px-6 py-2 group">
      {/* Timeline line */}
      {!isLast && <div className="absolute left-[41px] top-10 bottom-0 w-0.5 bg-white/10 group-hover:bg-white/20 transition-colors" />}
      
      <div className="flex-none mt-1 z-10">
        <div className="w-9 h-9 rounded-full bg-[#2a2d36] border-2 border-[#1a1c23] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
          <User size={16} className="text-teal" />
        </div>
      </div>
      
      <div className="flex-1 min-w-0 pb-6">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 hover:bg-white/[0.04] transition-colors">
          <p className="text-sm text-white/80 leading-relaxed">
            <span className="font-semibold text-white">{log.user?.name || 'System'}</span>
            {' '}<span className="text-white/80 font-medium">{log.action || 'performed an action'}</span>
            {log.metadata?.assetTag && <> — <span className="asset-tag font-mono text-xs ml-1">{log.metadata.assetTag}</span></>}
            {log.metadata?.cycleName && <span className="text-white/50 italic ml-1">({log.metadata.cycleName})</span>}
          </p>
          <div className="flex items-center gap-3 mt-3">
            <p className="text-xs text-white/40 flex items-center gap-1.5">
              <Clock size={12} className="text-white/30" />
              {new Date(log.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
            {log.user?.role && (
              <>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className="badge badge-gray text-[10px] uppercase tracking-wider bg-white/5 border-none">{(log.user.role || '').replace('_', ' ')}</span>
              </>
            )}
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="text-xs text-white/40 capitalize">{log.entity || 'System'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main
export default function NotificationsPage() {
  const [notifs,      setNotifs]      = useState([]);
  const [activity,    setActivity]    = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab,   setActiveTab]   = useState('All');
  const [view,        setView]        = useState('notifications');
  const [markingAll,  setMarkingAll]  = useState(false);
  const [loading,     setLoading]     = useState(true);
  
  const [toastMsg, setToastMsg] = useState({ text: '', type: 'success' });
  const [isOffline, setIsOffline] = useState(false);

  const prevNotifsRef = useRef([]);

  const showToast = useCallback((text, type = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg({ text: '', type: 'success' }), 4000);
  }, []);

  const fetchNotifs = useCallback(async () => {
    try {
      const r = await api.get('/notifications');
      if (r.data?.success) {
        setNotifs(r.data.data?.notifications || []);
        setUnreadCount(r.data.data?.unreadCount || 0);
        setIsOffline(false);
      }
    } catch { 
      // Fail silently on polling, but mark offline to show indicator
      setIsOffline(true);
    }
  }, []);

  const fetchActivity = useCallback(async () => {
    try {
      const r = await api.get('/activity-logs');
      if (r.data?.success) setActivity(r.data.data || []);
    } catch { 
      // Fail silently
    }
  }, []);

  // Initial load
  useEffect(() => {
    Promise.all([fetchNotifs(), fetchActivity()]).finally(() => setLoading(false));
  }, [fetchNotifs, fetchActivity]);

  // 15s polling for notifications
  useEffect(() => {
    const id = setInterval(fetchNotifs, 15000);
    return () => clearInterval(id);
  }, [fetchNotifs]);

  const markRead = async (id) => {
    // Snapshot for rollback
    prevNotifsRef.current = notifs;
    
    // Optimistic UI update
    setNotifs((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
    setUnreadCount((c) => Math.max(0, c - 1));
    
    try {
      await api.patch(`/notifications/${id}/read`);
    } catch (err) {
      // Rollback
      setNotifs(prevNotifsRef.current);
      setUnreadCount((prevNotifsRef.current.filter(n => !n.isRead) || []).length);
      showToast(getErrorMessage(err), 'error');
    }
  };

  const markAllRead = async () => {
    if (unreadCount === 0 || markingAll) return;
    setMarkingAll(true);
    
    // Snapshot for rollback
    prevNotifsRef.current = notifs;

    // Optimistic UI update
    setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    
    try {
      await api.patch('/notifications/read-all');
    } catch (err) { 
      // Rollback
      setNotifs(prevNotifsRef.current);
      setUnreadCount((prevNotifsRef.current.filter(n => !n.isRead) || []).length);
      showToast(getErrorMessage(err), 'error');
    } finally { 
      setMarkingAll(false); 
    }
  };

  const filtered = notifs.filter((n) =>
    TAB_TYPE[activeTab] === null || n.type === TAB_TYPE[activeTab]
  );

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      {toastMsg.text && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-xl font-medium text-sm flex items-center gap-2 animate-in slide-in-from-bottom-5 ${toastMsg.type === 'error' ? 'bg-danger text-white' : 'bg-teal text-black'}`}>
          {toastMsg.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
          {toastMsg.text}
        </div>
      )}

      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-teal/10 rounded-xl relative">
              <Bell size={24} className="text-teal" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-danger rounded-full border-2 border-[#1a1c23]" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Inbox & Activity</h1>
            {isOffline && (
              <span className="badge badge-red ml-3 px-2 py-0.5 text-xs flex items-center gap-1">
                <AlertCircle size={10} /> Disconnected
              </span>
            )}
          </div>
          <p className="text-sm text-white/50 max-w-xl leading-relaxed">
            Stay updated on your assigned tasks, system alerts, and team activity.
          </p>
        </div>
        {view === 'notifications' && unreadCount > 0 && (
          <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" onClick={markAllRead} disabled={markingAll || isOffline}>
            <CheckCheck size={16} className={markingAll ? 'opacity-50' : 'text-teal'} />
            {markingAll ? 'Marking…' : `Mark all as read (${unreadCount})`}
          </button>
        )}
      </div>

      {/* View toggle */}
      <div className="flex gap-4 mb-6 border-b border-white/10">
        <button 
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${view === 'notifications' ? 'border-teal text-teal bg-teal/5' : 'border-transparent text-white/50 hover:text-white/80 hover:border-white/20'}`}
          onClick={() => setView('notifications')}
        >
          <Bell size={16} /> Notifications
          {unreadCount > 0 && <span className="bg-teal text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1">{unreadCount}</span>}
        </button>
        <button 
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${view === 'activity' ? 'border-teal text-teal bg-teal/5' : 'border-transparent text-white/50 hover:text-white/80 hover:border-white/20'}`}
          onClick={() => setView('activity')}
        >
          <Clock size={16} /> Activity Log
        </button>
      </div>

      {view === 'notifications' ? (
        <div className="bg-[#1a1c23] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
          {/* Filter tabs */}
          <div className="flex items-center gap-2 px-5 py-3 border-b border-white/10 bg-white/[0.02] overflow-x-auto custom-scrollbar">
            <Filter size={14} className="text-white/30 mr-2 flex-none" />
            {TABS.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeTab === tab ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}>
                {tab}
              </button>
            ))}
          </div>
          
          <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="py-20 flex flex-col items-center text-white/40">
                <RefreshCw size={32} className="animate-spin text-teal/30 mb-4" />
                <p className="text-sm">Loading notifications...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-24 text-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell size={28} className="text-white/20" />
                </div>
                <h3 className="text-lg font-medium text-white/80 mb-1">All caught up!</h3>
                <p className="text-sm text-white/40">No {activeTab !== 'All' ? activeTab.toLowerCase() : ''} notifications right now.</p>
              </div>
            ) : (
              filtered.map((n) => <NotifRow key={n._id} notif={n} onMarkRead={markRead} />)
            )}
          </div>
        </div>
      ) : (
        <div className="bg-[#1a1c23] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">System Activity Feed</h2>
            <span className="badge badge-gray text-xs">{activity.length} recent actions</span>
          </div>
          
          <div className="max-h-[600px] overflow-y-auto custom-scrollbar p-6">
            {loading ? (
              <div className="py-16 flex flex-col items-center text-white/40">
                <RefreshCw size={32} className="animate-spin text-teal/30 mb-4" />
                <p className="text-sm">Loading activity logs...</p>
              </div>
            ) : activity.length === 0 ? (
              <div className="py-20 text-center">
                <Clock size={32} className="text-white/20 mx-auto mb-4" />
                <p className="text-white/60 font-medium">No activity logged yet.</p>
                <p className="text-sm text-white/40 mt-1">Actions performed by users will appear here.</p>
              </div>
            ) : (
              <div className="pt-2 pb-6">
                {activity.map((log, i) => (
                  <ActivityRow key={log._id} log={log} isLast={i === activity.length - 1} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
