// src/pages/admin/UserManagementPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, ShieldAlert, ShieldCheck, 
  Trash2, Edit3, Mail, Phone, X, Loader2, RefreshCw, Ticket
} from 'lucide-react';
import { userService } from '../../services/userService';
import { INITIATIVES_DATA } from '../../data/initiativesData';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const defaultFormData = {
    name: '',
    email: '',
    phone: '',
    isSuperAdmin: false,
    permissions: {
      events: { canView: true, canEdit: false, scope: [] },
      finance: { canView: false, canEdit: false, scope: [] },
      dandiyaDesk: { canAccess: false },
      userManagement: { canView: false, canEdit: false }
    }
  };

  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async (force = false) => {
    setLoading(true);
    try {
      const data = await userService.getUsers(force);
      setUsers(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingUserId(null);
    setFormData(defaultFormData);
    setErrorMsg('');
    setShowModal(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUserId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      isSuperAdmin: Boolean(user.isSuperAdmin),
      permissions: {
        ...defaultFormData.permissions,
        ...(user.permissions || {}),
        dandiyaDesk: user.permissions?.dandiyaDesk || { canAccess: false }
      }
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handlePermChange = (moduleKey, field, val) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [moduleKey]: {
          ...prev.permissions[moduleKey],
          [field]: val
        }
      }
    }));
  };

  const handleScopeToggle = (moduleKey, eventId) => {
    setFormData(prev => {
      const currentScope = prev.permissions[moduleKey]?.scope || [];
      const updatedScope = currentScope.includes(eventId)
        ? currentScope.filter(id => id !== eventId)
        : [...currentScope, eventId];

      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [moduleKey]: {
            ...prev.permissions[moduleKey],
            scope: updatedScope
          }
        }
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setErrorMsg('नाव आणि Google ईमेल आवश्यक आहेत!');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      if (editingUserId) {
        await userService.updateUser(editingUserId, formData);
      } else {
        await userService.createUser(formData);
      }
      setShowModal(false);
      await loadUsers(false);
    } catch (err) {
      setErrorMsg(err.message || 'डेटाबेसमध्ये सेव्ह करताना त्रुटी आली.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('हा प्रतिनिधी नक्की काढून टाकायचा आहे का?')) {
      try {
        await userService.deleteUser(id);
        await loadUsers(false);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="p-2.5 sm:p-5 max-w-7xl mx-auto space-y-3 font-sans">
      
      {/* 1. Ultra-Compact Header */}
      <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-sm sm:text-base font-black text-slate-800 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-amber-600" />
            <span>युजर व ॲक्सेस व्यवस्थापन</span>
          </h1>
          <p className="text-[11px] text-slate-400">कार्यकर्त्यांच्या परवानग्या व मॉड्युल अधिकार</p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => loadUsers(true)}
            title="रिफ्रेश करा"
            className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 active:scale-95 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-600' : ''}`} />
          </button>

          <button 
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 bg-[#4A0E17] hover:bg-[#681420] text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-xs transition active:scale-95"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>नवीन प्रतिनिधी</span>
          </button>
        </div>
      </div>

      {/* 2. Compact Users Grid */}
      {loading && users.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-slate-400 gap-2 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
          <span className="text-xs">माहिती लोड होत आहे...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {users.map((user) => (
            <div 
              key={user.id}
              className={`bg-white border rounded-2xl p-3 shadow-xs flex flex-col justify-between transition hover:border-slate-300 ${
                user.isSuperAdmin ? 'border-amber-300/80 bg-amber-50/15' : 'border-slate-200'
              }`}
            >
              <div>
                {/* User Info Header */}
                <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
                  <div className="min-w-0">
                    <h3 className="font-bold text-xs text-slate-900 truncate">{user.name}</h3>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5 font-mono">
                      <Mail className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[170px]">{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                        <Phone className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                  </div>

                  {user.isSuperAdmin ? (
                    <span className="bg-red-600 text-white px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider shrink-0 flex items-center gap-1">
                      <ShieldAlert className="w-2.5 h-2.5" /> सुपर ॲडमिन
                    </span>
                  ) : (
                    <span className="bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded-md text-[9px] font-bold shrink-0">
                      कस्टम रोल
                    </span>
                  )}
                </div>

                {/* Permissions Snapshot (Ultra Thin Rows) */}
                <div className="space-y-1">
                  {user.isSuperAdmin ? (
                    <div className="text-[10px] bg-emerald-50 text-emerald-800 p-1.5 rounded-lg border border-emerald-200 font-medium flex items-center gap-1.5">
                      <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>सर्व मॉड्युल्सचे अमर्याद अधिकार</span>
                    </div>
                  ) : (
                    <div className="space-y-1 text-[10px]">
                      {/* Events */}
                      <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-slate-600">इव्हेंट्स:</span>
                        <span className="font-semibold text-slate-800">
                          {user.permissions?.events?.canEdit ? 'Edit + View' : user.permissions?.events?.canView ? 'फक्त View' : '—'}
                        </span>
                      </div>

                      {/* Finance */}
                      <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-slate-600">जमा-खर्च:</span>
                        <span className="font-semibold text-slate-800">
                          {user.permissions?.finance?.canEdit ? 'Edit + View' : user.permissions?.finance?.canView ? 'फक्त View' : '—'}
                        </span>
                      </div>

                      {/* Dandiya Desk */}
                      <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-amber-50/60 border border-amber-200/60 text-amber-900">
                        <span className="flex items-center gap-1">
                          <Ticket className="w-3 h-3 text-amber-600" />
                          <span>दांडिया डेस्क:</span>
                        </span>
                        <span className={`font-bold ${user.permissions?.dandiyaDesk?.canAccess ? 'text-emerald-700' : 'text-slate-400'}`}>
                          {user.permissions?.dandiyaDesk?.canAccess ? 'मंजूर ✓' : '—'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 mt-2 flex items-center justify-end gap-1.5 border-t border-slate-100">
                <button 
                  onClick={() => handleOpenEdit(user)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:text-black bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>बदला</span>
                </button>
                <button 
                  onClick={() => handleDelete(user.id)}
                  className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Modal - Ultra-Compact & Tight Builder */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-5 shadow-2xl border border-slate-200 space-y-3.5 max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-2.5">
              <div>
                <h2 className="text-base font-black text-slate-800">
                  {editingUserId ? 'प्रतिनिधीचे अधिकार बदला' : 'नवीन प्रतिनिधी जोडा'}
                </h2>
                <p className="text-[10px] text-slate-400">माहिती थेट Firestore डेटाबेसमध्ये सेव्ह होईल</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-black p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              
              {/* Name & Email Row */}
              <div className="grid sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">नाव *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="उदा. विशाल मगर"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs outline-none focus:border-amber-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Google Email (Login) *</label>
                  <input 
                    type="email" 
                    required
                    placeholder="vishal@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              {/* Super Admin Checkbox Box */}
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-amber-900">सुपर ॲडमिन (Super Admin)</h4>
                  <p className="text-[10px] text-amber-700">सर्व मॉड्युल्सचे अमर्याद अधिकार मिळतील</p>
                </div>
                <input 
                  type="checkbox"
                  checked={formData.isSuperAdmin}
                  onChange={(e) => setFormData({ ...formData, isSuperAdmin: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-0"
                />
              </div>

              {/* Custom Modular Permissions */}
              {!formData.isSuperAdmin && (
                <div className="space-y-2 pt-1">
                  <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    मॉड्यूल व अधिकार वाटप (Permissions)
                  </h3>

                  {/* 1. दांडिया डेस्क Module (First & Highlighted) */}
                  <div className="p-2.5 rounded-xl border border-amber-300 bg-amber-50/50 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                        <Ticket className="w-3.5 h-3.5 text-amber-600" />
                        <span>दांडिया रिस्टबँड डेस्क</span>
                      </span>
                      <p className="text-[9px] text-amber-800">गेटवर टोकन शोधणे व बँड वाटप</p>
                    </div>
                    <label className="flex items-center gap-1 text-[11px] font-bold text-amber-900 cursor-pointer bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300">
                      <input 
                        type="checkbox" 
                        checked={formData.permissions.dandiyaDesk?.canAccess || false}
                        onChange={(e) => handlePermChange('dandiyaDesk', 'canAccess', e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-0"
                      />
                      <span>प्रवेश द्या</span>
                    </label>
                  </div>

                  {/* 2. Events Module */}
                  <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800">इव्हेंट्स व फोटो गॅलरी</span>
                      <div className="flex items-center gap-3 text-[11px] font-semibold">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={formData.permissions.events.canView}
                            onChange={(e) => handlePermChange('events', 'canView', e.target.checked)}
                            className="w-3.5 h-3.5"
                          />
                          <span>View</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={formData.permissions.events.canEdit}
                            onChange={(e) => handlePermChange('events', 'canEdit', e.target.checked)}
                            className="w-3.5 h-3.5"
                          />
                          <span>Edit</span>
                        </label>
                      </div>
                    </div>

                    {(formData.permissions.events.canView || formData.permissions.events.canEdit) && (
                      <div className="pt-1">
                        <span className="text-[9px] font-bold text-slate-500 block mb-1">कोणत्या इव्हेंटचे अधिकार?</span>
                        <div className="grid grid-cols-2 gap-1 max-h-24 overflow-y-auto p-1.5 bg-white rounded-lg border border-slate-200 text-[10px]">
                          {INITIATIVES_DATA.map((item) => (
                            <label key={item.id} className="flex items-center gap-1 cursor-pointer truncate">
                              <input 
                                type="checkbox"
                                checked={formData.permissions.events.scope?.includes(item.id)}
                                onChange={() => handleScopeToggle('events', item.id)}
                                className="w-3 h-3"
                              />
                              <span className="truncate">{item.titleMr}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. Finance Module */}
                  <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800">जमा-खर्च (हिशोब)</span>
                      <div className="flex items-center gap-3 text-[11px] font-semibold">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={formData.permissions.finance.canView}
                            onChange={(e) => handlePermChange('finance', 'canView', e.target.checked)}
                            className="w-3.5 h-3.5"
                          />
                          <span>View</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={formData.permissions.finance.canEdit}
                            onChange={(e) => handlePermChange('finance', 'canEdit', e.target.checked)}
                            className="w-3.5 h-3.5"
                          />
                          <span>Edit</span>
                        </label>
                      </div>
                    </div>

                    {(formData.permissions.finance.canView || formData.permissions.finance.canEdit) && (
                      <div className="pt-1">
                        <span className="text-[9px] font-bold text-slate-500 block mb-1">कोणत्या इव्हेंटचे अधिकार?</span>
                        <div className="grid grid-cols-2 gap-1 max-h-24 overflow-y-auto p-1.5 bg-white rounded-lg border border-slate-200 text-[10px]">
                          {INITIATIVES_DATA.map((item) => (
                            <label key={item.id} className="flex items-center gap-1 cursor-pointer truncate">
                              <input 
                                type="checkbox"
                                checked={formData.permissions.finance.scope?.includes(item.id)}
                                onChange={() => handleScopeToggle('finance', item.id)}
                                className="w-3 h-3"
                              />
                              <span className="truncate">{item.titleMr}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2.5 border-t">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                >
                  रद्द करा
                </button>
                <button 
                  type="submit" 
                  disabled={submitting} 
                  className="px-4 py-1.5 rounded-xl bg-[#4A0E17] hover:bg-[#681420] text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 disabled:opacity-60"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingUserId ? 'बदल सेव्ह करा' : 'प्रतिनिधी जोडा'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}