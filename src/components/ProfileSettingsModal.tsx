import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  User,
  Settings,
  Shield,
  Bell,
  Palette,
  Key,
  Monitor,
  Smartphone,
  Globe,
  LogOut,
  ChevronRight,
  Save,
  Camera,
  Mail,
  Building2,
  MapPin,
  Clock,
  RefreshCw,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { ArchitectProfile } from '../types/auth';
import { useToast } from './ui/Toast';

interface Session {
  id: string;
  deviceName: string | null;
  ip: string | null;
  userAgent: string | null;
  lastSeenAt: string;
  createdAt: string;
  isCurrent?: boolean;
}

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  architectProfile: ArchitectProfile;
  onProfileUpdate: (profile: Partial<ArchitectProfile>) => void;
  onSignOut: () => void;
}

type TabId = 'profile' | 'account' | 'sessions' | 'notifications' | 'appearance';

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  onClose,
  architectProfile,
  onProfileUpdate,
  onSignOut,
}) => {
  const { addToast, showFeatureToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabId>('profile');

  // Profile form state
  const [fullName, setFullName] = useState(architectProfile.fullName || '');
  const [studioName, setStudioName] = useState(architectProfile.studioName || '');
  const [country, setCountry] = useState(architectProfile.country || '');
  const [isSaving, setIsSaving] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Sessions state
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isRevokingAll, setIsRevokingAll] = useState(false);

  // Load sessions when tab changes
  useEffect(() => {
    if (activeTab === 'sessions' && isOpen) {
      loadSessions();
    }
  }, [activeTab, isOpen]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFullName(architectProfile.fullName || '');
      setStudioName(architectProfile.studioName || '');
      setCountry(architectProfile.country || '');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  }, [isOpen, architectProfile]);

  const loadSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const response = await fetch('/api/auth/sessions', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/auth/sessions/${sessionId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        addToast({ type: 'success', title: 'Session revoked', message: 'The session has been terminated.' });
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Failed to revoke session' });
    }
  };

  const handleRevokeAllOtherSessions = async () => {
    setIsRevokingAll(true);
    try {
      const response = await fetch('/api/auth/sessions/revoke-all', {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        addToast({
          type: 'success',
          title: 'Sessions revoked',
          message: `${data.revokedCount} other session(s) have been terminated.`,
        });
        loadSessions();
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Failed to revoke sessions' });
    } finally {
      setIsRevokingAll(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ fullName, studioName }),
      });
      if (response.ok) {
        onProfileUpdate({ fullName, studioName });
        addToast({ type: 'success', title: 'Profile updated', message: 'Your profile has been saved.' });
      } else {
        const data = await response.json();
        addToast({ type: 'error', title: 'Update failed', message: data.error });
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Failed to save profile' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      addToast({ type: 'error', title: 'Passwords do not match' });
      return;
    }
    if (newPassword.length < 8) {
      addToast({ type: 'error', title: 'Password too short', message: 'Password must be at least 8 characters.' });
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (response.ok) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        addToast({ type: 'success', title: 'Password changed', message: 'Your password has been updated.' });
      } else {
        const data = await response.json();
        addToast({ type: 'error', title: 'Password change failed', message: data.error });
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Failed to change password' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDeviceIcon = (userAgent: string | null) => {
    if (!userAgent) return <Monitor className="w-4 h-4" />;
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return <Smartphone className="w-4 h-4" />;
    }
    return <Monitor className="w-4 h-4" />;
  };

  const getDeviceName = (session: Session) => {
    if (session.deviceName) return session.deviceName;
    if (!session.userAgent) return 'Unknown Device';
    const ua = session.userAgent;
    if (ua.includes('Chrome')) return 'Chrome Browser';
    if (ua.includes('Firefox')) return 'Firefox Browser';
    if (ua.includes('Safari')) return 'Safari Browser';
    if (ua.includes('Edge')) return 'Edge Browser';
    return 'Web Browser';
  };

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'account', label: 'Account', icon: <Key className="w-4 h-4" /> },
    { id: 'sessions', label: 'Sessions', icon: <Shield className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="w-4 h-4" /> },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-3xl max-h-[85vh] bg-gradient-to-b from-[#0A0A0A] to-[#050507] border border-[#1E1E1E] rounded-xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E1E1E] bg-[#0A0A0A]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2DD4BF] to-[#0D9488] flex items-center justify-center text-black font-bold text-lg">
                {(architectProfile.fullName || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">{architectProfile.fullName || 'User'}</h2>
                <p className="text-xs text-gray-500">{architectProfile.email}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[#1A1A1A] text-gray-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex h-[calc(85vh-80px)]">
            {/* Sidebar */}
            <div className="w-48 border-r border-[#1E1E1E] bg-[#080808] p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition mb-1 ${
                    activeTab === tab.id
                      ? 'bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/30'
                      : 'text-gray-400 hover:text-white hover:bg-[#1A1A1A]'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}

              <div className="mt-4 pt-4 border-t border-[#1E1E1E]">
                <button
                  onClick={onSignOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Profile Information</h3>
                    <p className="text-sm text-gray-500">Update your personal details and studio information.</p>
                  </div>

                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#2DD4BF] to-[#0D9488] flex items-center justify-center text-black font-bold text-3xl">
                      {(fullName || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <button
                        onClick={() => showFeatureToast('Avatar upload')}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] hover:bg-[#252525] border border-[#2E2E2E] rounded-lg text-sm text-white transition"
                      >
                        <Camera className="w-4 h-4" />
                        Change Avatar
                      </button>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG. Max 2MB.</p>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#0F0F0F] border border-[#2E2E2E] rounded-lg text-white placeholder-gray-500 focus:border-[#2DD4BF] focus:ring-1 focus:ring-[#2DD4BF] outline-none transition"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                      <div className="relative">
                        <input
                          type="email"
                          value={architectProfile.email}
                          disabled
                          className="w-full px-4 py-2.5 bg-[#080808] border border-[#1E1E1E] rounded-lg text-gray-500 cursor-not-allowed"
                        />
                        <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">Studio Name</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={studioName}
                          onChange={(e) => setStudioName(e.target.value)}
                          className="w-full px-4 py-2.5 bg-[#0F0F0F] border border-[#2E2E2E] rounded-lg text-white placeholder-gray-500 focus:border-[#2DD4BF] focus:ring-1 focus:ring-[#2DD4BF] outline-none transition"
                          placeholder="Your studio or company"
                        />
                        <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">Country</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="w-full px-4 py-2.5 bg-[#0F0F0F] border border-[#2E2E2E] rounded-lg text-white placeholder-gray-500 focus:border-[#2DD4BF] focus:ring-1 focus:ring-[#2DD4BF] outline-none transition"
                          placeholder="Your country"
                        />
                        <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-[#1E1E1E]">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#2DD4BF] hover:bg-[#26B8A5] text-black font-semibold rounded-lg transition disabled:opacity-50"
                    >
                      {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              {/* Account Tab */}
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Account Security</h3>
                    <p className="text-sm text-gray-500">Manage your password and account settings.</p>
                  </div>

                  {/* Change Password */}
                  <div className="p-5 bg-[#0C0C0C] border border-[#1E1E1E] rounded-xl">
                    <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                      <Key className="w-4 h-4 text-[#2DD4BF]" />
                      Change Password
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1.5">Current Password</label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-4 py-2.5 pr-10 bg-[#0F0F0F] border border-[#2E2E2E] rounded-lg text-white placeholder-gray-500 focus:border-[#2DD4BF] focus:ring-1 focus:ring-[#2DD4BF] outline-none transition"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                          >
                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1.5">New Password</label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-2.5 pr-10 bg-[#0F0F0F] border border-[#2E2E2E] rounded-lg text-white placeholder-gray-500 focus:border-[#2DD4BF] focus:ring-1 focus:ring-[#2DD4BF] outline-none transition"
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1.5">Confirm New Password</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-2.5 bg-[#0F0F0F] border border-[#2E2E2E] rounded-lg text-white placeholder-gray-500 focus:border-[#2DD4BF] focus:ring-1 focus:ring-[#2DD4BF] outline-none transition"
                          placeholder="Confirm new password"
                        />
                      </div>
                      <button
                        onClick={handleChangePassword}
                        disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] hover:bg-[#252525] border border-[#2E2E2E] rounded-lg text-sm text-white transition disabled:opacity-50"
                      >
                        {isChangingPassword ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Key className="w-4 h-4" />
                        )}
                        Update Password
                      </button>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="p-5 bg-rose-950/20 border border-rose-500/20 rounded-xl">
                    <h4 className="text-sm font-semibold text-rose-400 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Danger Zone
                    </h4>
                    <p className="text-sm text-gray-400 mb-4">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <button
                      onClick={() => showFeatureToast('Account deletion')}
                      className="flex items-center gap-2 px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 rounded-lg text-sm text-rose-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Account
                    </button>
                  </div>
                </div>
              )}

              {/* Sessions Tab */}
              {activeTab === 'sessions' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">Active Sessions</h3>
                      <p className="text-sm text-gray-500">Manage devices where you're currently signed in.</p>
                    </div>
                    <button
                      onClick={loadSessions}
                      disabled={isLoadingSessions}
                      className="p-2 rounded-lg hover:bg-[#1A1A1A] text-gray-400 hover:text-white transition"
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoadingSessions ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  {isLoadingSessions ? (
                    <div className="flex items-center justify-center py-12">
                      <RefreshCw className="w-6 h-6 text-[#2DD4BF] animate-spin" />
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>No active sessions found</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        {sessions.map((session) => (
                          <div
                            key={session.id}
                            className={`p-4 rounded-xl border transition ${
                              session.isCurrent
                                ? 'bg-[#2DD4BF]/5 border-[#2DD4BF]/30'
                                : 'bg-[#0C0C0C] border-[#1E1E1E] hover:border-[#2E2E2E]'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                    session.isCurrent ? 'bg-[#2DD4BF]/20 text-[#2DD4BF]' : 'bg-[#1A1A1A] text-gray-400'
                                  }`}
                                >
                                  {getDeviceIcon(session.userAgent)}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-white">{getDeviceName(session)}</span>
                                    {session.isCurrent && (
                                      <span className="px-1.5 py-0.5 bg-[#2DD4BF]/20 text-[#2DD4BF] text-[10px] font-semibold rounded">
                                        Current
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                                    {session.ip && (
                                      <span className="flex items-center gap-1">
                                        <Globe className="w-3 h-3" />
                                        {session.ip}
                                      </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      Last active {formatDate(session.lastSeenAt)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {!session.isCurrent && (
                                <button
                                  onClick={() => handleRevokeSession(session.id)}
                                  className="px-3 py-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition"
                                >
                                  Revoke
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {sessions.filter((s) => !s.isCurrent).length > 0 && (
                        <div className="pt-4 border-t border-[#1E1E1E]">
                          <button
                            onClick={handleRevokeAllOtherSessions}
                            disabled={isRevokingAll}
                            className="flex items-center gap-2 px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 rounded-lg text-sm text-rose-400 transition disabled:opacity-50"
                          >
                            {isRevokingAll ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <LogOut className="w-4 h-4" />
                            )}
                            Sign out all other sessions
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Notification Preferences</h3>
                    <p className="text-sm text-gray-500">Choose what notifications you receive.</p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { id: 'project_updates', label: 'Project Updates', desc: 'When collaborators make changes to shared projects' },
                      { id: 'comments', label: 'Comments & Mentions', desc: 'When someone comments or mentions you' },
                      { id: 'sharing', label: 'Sharing Notifications', desc: 'When projects are shared with you' },
                      { id: 'system', label: 'System Updates', desc: 'Important updates about LORA Edge' },
                    ].map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 bg-[#0C0C0C] border border-[#1E1E1E] rounded-xl"
                      >
                        <div>
                          <span className="text-sm font-medium text-white">{item.label}</span>
                          <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                        </div>
                        <button
                          onClick={() => showFeatureToast('Notification settings')}
                          className="relative w-11 h-6 bg-[#2DD4BF] rounded-full transition"
                        >
                          <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Appearance</h3>
                    <p className="text-sm text-gray-500">Customize how LORA Edge looks for you.</p>
                  </div>

                  <div className="p-5 bg-[#0C0C0C] border border-[#1E1E1E] rounded-xl">
                    <h4 className="text-sm font-semibold text-white mb-4">Theme</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'dark', label: 'Dark', active: true },
                        { id: 'light', label: 'Light', active: false },
                        { id: 'system', label: 'System', active: false },
                      ].map((theme) => (
                        <button
                          key={theme.id}
                          onClick={() => {
                            if (theme.id !== 'dark') showFeatureToast('Theme switching');
                          }}
                          className={`p-4 rounded-xl border text-center transition ${
                            theme.active
                              ? 'bg-[#2DD4BF]/10 border-[#2DD4BF]/50 text-[#2DD4BF]'
                              : 'bg-[#0A0A0A] border-[#2E2E2E] text-gray-400 hover:border-[#3E3E3E]'
                          }`}
                        >
                          <div
                            className={`w-8 h-8 mx-auto mb-2 rounded-lg ${
                              theme.id === 'dark' ? 'bg-[#1A1A1A]' : theme.id === 'light' ? 'bg-gray-200' : 'bg-gradient-to-r from-[#1A1A1A] to-gray-200'
                            }`}
                          />
                          <span className="text-sm font-medium">{theme.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-5 bg-[#0C0C0C] border border-[#1E1E1E] rounded-xl">
                    <h4 className="text-sm font-semibold text-white mb-4">Accent Color</h4>
                    <div className="flex gap-3">
                      {[
                        { color: '#2DD4BF', active: true },
                        { color: '#D4AF37', active: false },
                        { color: '#8B5CF6', active: false },
                        { color: '#EC4899', active: false },
                        { color: '#3B82F6', active: false },
                      ].map((accent, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            if (!accent.active) showFeatureToast('Accent color');
                          }}
                          className={`w-10 h-10 rounded-full transition ${
                            accent.active ? 'ring-2 ring-offset-2 ring-offset-[#0C0C0C]' : 'hover:scale-110'
                          }`}
                          style={{ backgroundColor: accent.color, ringColor: accent.active ? accent.color : undefined }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
