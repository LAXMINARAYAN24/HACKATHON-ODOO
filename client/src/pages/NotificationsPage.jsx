/**
 * Notifications Page
 */
import { useState, useEffect, useCallback } from 'react';
import { Bell, AlertTriangle, CheckCircle2, CalendarCheck, Info, CheckCheck, Clock, User } from 'lucide-react';
import api from '../services/api';

// Helpers
const timeAgo = (date) => {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60)    return `${s}s ago`;
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

const TYPE_META = {
  allocation:  { Icon: CheckCircle2,  cls: 'text-teal' },
  transfer:    { Icon: CalendarCheck, cls: 'text-white/50' },
  booking:     { Icon: CalendarCheck, cls: 'text-teal' },
  maintenance: { Icon: CheckCircle2,  cls: 'text-success' },
  audit:       { Icon: AlertTriangle, cls: 'text-danger' },
  system:      { Icon: Info,          cls: 'text-white/50' },
};

const TABS = ['All', 'Audit', 'Maintenance', 'Bookings', 'Other'];
const TAB_TYPE = { All: null, Audit: 'audit', Maintenance: 'maintenance', Bookings: 'booking', Other: 'system' };

// Demo fallback data
const DEMO_NOTIFS = [
  { _id: 'n1', type: 'allocation',  message: 'Laptop AF-0079 assigned to Priya Shah', isRead: false, createdAt: new Date(Date.now() - 120000) },
  { _id: 'n2', type: 'maintenance', message: 'Maintenance request AF-0056 approved',  isRead: false, createdAt: new Date(Date.now() - 600000) },
  { _id: 'n3', type: 'booking',     message: 'Booking confirmed: Room B2 – 2:00 to 5:00 PM', isRead: true, createdAt: new Date(Date.now() - 86400000) },
  { _id: 'n4', type: 'transfer',    message: 'Transfer approved: Projector to Facilities dept', isRead: true, createdAt: new Date(Date.now() - 172800000) },
  { _id: 'n5', type: 'system',      message: 'Overdue return: AF-0021 was due 30 days ago', isRead: false, createdAt: new Date(Date.now() - 259200000) },
  { _id: 'n6', type: 'audit',       message: 'Audit discrepancy flagged: AF-0098 damaged',  isRead: false, createdAt: new Date(Date.now() - 172800000) },
];
const DEMO_ACTIVITY = [
  { _id: 'a1', user: { name: 'Priya Shah',   role: 'employee'       }, action: 'created audit cycle', entity: 'AuditCycle', metadata: { cycleName: 'Q3 Audit: Engineering dept' }, createdAt: new Date(Date.now() - 864000000) },
  { _id: 'a2', user: { name: 'Nisha Verma',  role: 'employee'       }, action: 'marked verified',     entity: 'AuditItem',  metadata: { assetTag: 'AF-0112' }, createdAt: new Date(Date.now() - 86400000) },
  { _id: 'a3', user: { name: 'Nisha Verma',  role: 'employee'       }, action: 'marked missing',      entity: 'AuditItem',  metadata: { assetTag: 'AF-0021' }, createdAt: new Date(Date.now() - 86400000 + 3000) },
  { _id: 'a4', user: { name: 'Nisha Verma',  role: 'employee'       }, action: 'marked damaged',      entity: 'AuditItem',  metadata: { assetTag: 'AF-9935' }, createdAt: new Date(Date.now() - 86400000 + 6000) },
  { _id: 'a5', user: { name: 'Ravi Kumar',   role: 'asset_manager'  }, action: 'assigned auditors',   entity: 'AuditCycle', metadata: { count: 2 }, createdAt: new Date(Date.now() - 777600000) },
];

// Notification row
function NotifRow({ notif, onMarkRead }) {
  const meta = TYPE_META[notif.type] || TYPE_META.info;
  return (
    <div className={`flex items-start gap-4 px-4 py-3 border-b border-white/5 transition-colors hover:bg-white/[0.025] ${!notif.isRead ? 'bg-teal/5' : ''}`}>
      <div className={`mt-0.5 flex-none ${meta.cls}`}><meta.Icon size={15} /></div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${notif.isRead ? 'text-white/50' : 'text-white/90'}`}>{notif.message}</p>
        <p className="text-xs text-white/30 mt-0.5">{timeAgo(notif.createdAt)}</p>
      </div>
      {!notif.isRead && (
        <div className="flex items-center gap-2 flex-none">
          <div className="w-1.5 h-1.5 rounded-full bg-teal" />
          <button onClick={() => onMarkRead(notif._id)} className="text-white/30 hover:text-teal transition-colors" title="Mark as read">
            <CheckCheck size={13} />
          </button>
        </div>
      )}
    </div>
  );
}

// Activity row
function ActivityRow({ log }) {
  return (
    <div className="flex items-start gap-4 px-4 py-3 border-b border-white/5 hover:bg-white/[0.025] transition-colors">
      <div className="flex-none mt-0.5">
        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
          <User size={11} className="text-white/50" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white/80">
          <span className="font-medium text-white">{log.user?.name || 'System'}</span>
          {' '}<span className="text-white/50">{log.action}</span>
          {log.metadata?.assetTag && <> — <span className="asset-tag">{log.metadata.assetTag}</span></>}
          {log.metadata?.cycleName && <span className="text-white/40 text-xs"> ({log.metadata.cycleName})</span>}
        </p>
        <p className="text-xs text-white/30 mt-0.5 flex items-center gap-1">
          <Clock size={10} />
          {timeAgo(log.createdAt)}
          {log.user?.role && <span className="ml-2 badge badge-gray text-[10px]">{log.user.role}</span>}
        </p>
      </div>
    </div>
  );
}

// Main
export default function NotificationsPage() {
  const [notifs,      setNotifs]      = useState(DEMO_NOTIFS);
  const [activity,    setActivity]    = useState(DEMO_ACTIVITY);
  const [unreadCount, setUnreadCount] = useState(3);
  const [activeTab,   setActiveTab]   = useState('All');
  const [view,        setView]        = useState('notifications');
  const [markingAll,  setMarkingAll]  = useState(false);

  const fetchNotifs = useCallback(async () => {
    try {
      const r = await api.get('/notifications');
      if (r.data?.success && r.data.data?.notifications?.length) {
        setNotifs(r.data.data.notifications);
        setUnreadCount(r.data.data.unreadCount || 0);
      }
    } catch { /* keep demo */ }
  }, []);

  const fetchActivity = useCallback(async () => {
    try {
      const r = await api.get('/activity-logs');
      if (r.data?.success && r.data.data?.length) setActivity(r.data.data);
    } catch { /* keep demo */ }
  }, []);

  // 10s polling for notifications
  useEffect(() => {
    fetchNotifs();
    const id = setInterval(fetchNotifs, 10000);
    return () => clearInterval(id);
  }, [fetchNotifs]);

  useEffect(() => { fetchActivity(); }, [fetchActivity]);

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifs((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch { fetchNotifs(); }
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      await api.patch('/notifications/read-all');
      setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch { fetchNotifs(); }
    finally { setMarkingAll(false); }
  };

  const filtered = notifs.filter((n) =>
    TAB_TYPE[activeTab] === null || n.type === TAB_TYPE[activeTab]
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Bell size={20} className="text-teal" />
            Notifications
            {unreadCount > 0 && <span className="badge badge-teal ml-1">{unreadCount} new</span>}
          </h1>
          <p className="text-sm text-white/40 mt-0.5">Updates refresh every 10 seconds</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn-ghost text-xs" onClick={markAllRead} disabled={markingAll}>
            <CheckCheck size={13} />
            {markingAll ? 'Marking…' : 'Mark all read'}
          </button>
        )}
      </div>

      {/* View toggle */}
      <div className="flex gap-2 mb-4 border-b border-white/10 pb-3">
        <button className={`btn-ghost text-xs px-4 ${view === 'notifications' ? 'bg-teal/20 text-teal' : ''}`}
          onClick={() => setView('notifications')}>
          <Bell size={13} /> Notifications
        </button>
        <button className={`btn-ghost text-xs px-4 ${view === 'activity' ? 'bg-teal/20 text-teal' : ''}`}
          onClick={() => setView('activity')}>
          <Clock size={13} /> Activity Log
        </button>
      </div>

      {view === 'notifications' ? (
        <div className="af-card p-0 overflow-hidden">
          {/* Filter tabs */}
          <div className="flex gap-1 px-4 py-3 border-b border-white/10 bg-white/[0.02]">
            {TABS.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}>
                {tab}
                {tab === 'All' && unreadCount > 0 && (
                  <span className="ml-1 badge badge-teal text-[10px] px-1.5 py-0">{unreadCount}</span>
                )}
              </button>
            ))}
          </div>
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <Bell size={28} className="text-white/15 mx-auto mb-2" />
              <p className="text-sm text-white/30">No {activeTab.toLowerCase()} notifications</p>
            </div>
          ) : filtered.map((n) => <NotifRow key={n._id} notif={n} onMarkRead={markRead} />)}
        </div>
      ) : (
        <div className="af-card p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white/80">Activity Feed</h2>
            <span className="text-xs text-white/30">Most recent 50 actions</span>
          </div>
          {activity.length === 0
            ? <div className="py-12 text-center text-sm text-white/30">No activity logged yet.</div>
            : activity.map((log) => <ActivityRow key={log._id} log={log} />)}
        </div>
      )}
    </div>
  );
}
