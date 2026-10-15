// src/pages/admin/UserManagementPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, ShieldAlert, ShieldCheck, 
  Trash2, Edit3, Mail, Phone, X, CheckCircle, Loader2, RefreshCw
} from 'lucide-react';
import { userService, SYSTEM_MODULES } from '../../services/userService';
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
      setUsers(data);
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
      permissions: user.permissions || defaultFormData.permissions
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
      await loadUsers(false); // कॅशमधून लगेच रिफ्रेश
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
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-heritage-crimson text-xs font-bold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>परवानग्या व अधिकार नियंत्रण</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-heritage-burgundy">
            युजर व ॲक्सेस व्यवस्थापन
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            प्रत्येक कार्यकर्त्याला हवे ते मॉड्युल (Events, Finance) आणि ठरावीक अधिकार (View / Edit) द्या.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Read वाचवणारे मॅन्युअल सिंक बटण */}
          <button
            onClick={() => loadUsers(true)}
            title="डेटाबेसमधून ताजी माहिती आणा"
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-600 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-heritage-burgundy' : ''}`} />
          </button>

          <button 
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-2 bg-heritage-burgundy hover:bg-heritage-crimson text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-md transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>नवीन प्रतिनिधी जोडा</span>
          </button>
        </div>
      </div>

      {/* Users Grid */}
      {loading && users.length === 0 ? (
        <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-heritage-burgundy" />
          <span>प्रतिनिधींची माहिती लोड होत आहे...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <div 
              key={user.id}
              className={`bg-white border rounded-3xl p-6 shadow-sm flex flex-col justify-between ${
                user.isSuperAdmin ? 'border-red-300 bg-red-50/20 ring-1 ring-red-200' : 'border-gray-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div>
                    <h3 className="font-extrabold text-lg text-gray-900">{user.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-1">
                      <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate max-w-[190px]">{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                  </div>
                  {user.isSuperAdmin ? (
                    <span className="bg-red-600 text-white px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> सुपर ॲडमिन
                    </span>
                  ) : (
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-[11px] font-bold">
                      कस्टम परवानग्या
                    </span>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 space-y-2.5">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                    दिलेले मॉड्युल्स व अधिकार:
                  </span>

                  {user.isSuperAdmin ? (
                    <div className="text-xs bg-emerald-50 text-emerald-800 p-2.5 rounded-xl border border-emerald-200 font-semibold flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>सर्व मॉड्युल्स, इव्हेंट्स व जमा-खर्चाचे पूर्ण अधिकार</span>
                    </div>
                  ) : (
                    <div className="space-y-2 text-xs">
                      {/* Events Perm */}
                      <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200">
                        <div className="flex items-center justify-between font-bold text-gray-800">
                          <span>इव्हेंट्स व फोटो</span>
                          <span className="text-[10px] text-gray-500">
                            {user.permissions?.events?.canEdit ? 'Edit + View' : user.permissions?.events?.canView ? 'फक्त View' : 'अधिकार नाही'}
                          </span>
                        </div>
                        {user.permissions?.events?.scope && user.permissions.events.scope !== 'all' && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {user.permissions.events.scope.map(sId => (
                              <span key={sId} className="text-[10px] bg-white border border-gray-300 px-1.5 py-0.5 rounded text-gray-600">
                                {INITIATIVES_DATA.find(i => i.id === sId)?.titleMr || sId}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Finance Perm */}
                      <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200">
                        <div className="flex items-center justify-between font-bold text-gray-800">
                          <span>जमा-खर्च (हिशोब)</span>
                          <span className="text-[10px] text-gray-500">
                            {user.permissions?.finance?.canEdit ? 'Edit + View' : user.permissions?.finance?.canView ? 'फक्त View' : 'अधिकार नाही'}
                          </span>
                        </div>
                        {user.permissions?.finance?.scope && user.permissions.finance.scope !== 'all' && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {user.permissions.finance.scope.map(sId => (
                              <span key={sId} className="text-[10px] bg-white border border-gray-300 px-1.5 py-0.5 rounded text-gray-600">
                                {INITIATIVES_DATA.find(i => i.id === sId)?.titleMr || sId}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-4 flex items-center justify-end gap-2 border-t border-gray-100">
                <button 
                  onClick={() => handleOpenEdit(user)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-gray-700 hover:text-heritage-burgundy bg-gray-100 rounded-lg transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>अधिकार बदला</span>
                </button>
                <button 
                  onClick={() => handleDelete(user.id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>डिलीट</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal - Flexible Permission Builder */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-black text-heritage-burgundy">
                  {editingUserId ? 'प्रतिनिधीचे अधिकार बदला' : 'नवीन प्रतिनिधी जोडा'}
                </h2>
                <p className="text-xs text-gray-500">माहिती थेट Firestore डेटाबेसमध्ये सेव्ह होईल</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">नाव</label>
                  <input 
                    type="text" 
                    required
                    placeholder="उदा. विशाल मगर"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-heritage-burgundy outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Google Email (Login)</label>
                  <input 
                    type="email" 
                    required
                    placeholder="vishal@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-heritage-burgundy outline-none"
                  />
                </div>
              </div>

              {/* Super Admin Checkbox */}
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-amber-900">सुपर ॲडमिन (Super Admin)</h4>
                  <p className="text-[11px] text-amber-700">सर्व मॉड्युल्स, इव्हेंट्स व जमा-खर्चाचे अमर्याद अधिकार</p>
                </div>
                <input 
                  type="checkbox"
                  checked={formData.isSuperAdmin}
                  onChange={(e) => setFormData({ ...formData, isSuperAdmin: e.target.checked })}
                  className="w-5 h-5 rounded text-amber-600 focus:ring-0"
                />
              </div>

              {/* Custom Modular Permissions */}
              {!formData.isSuperAdmin && (
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-extrabold uppercase text-gray-500 tracking-wider">
                    मॉड्युल व अधिकार वाटप (Permissions Matrix)
                  </h3>

                  {/* 1. Events Module */}
                  <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-gray-900">इव्हेंट्स व फोटो गॅलरी</span>
                      <div className="flex items-center gap-4 text-xs font-semibold">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={formData.permissions.events.canView}
                            onChange={(e) => handlePermChange('events', 'canView', e.target.checked)}
                          />
                          <span>View (पाहणे)</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={formData.permissions.events.canEdit}
                            onChange={(e) => handlePermChange('events', 'canEdit', e.target.checked)}
                          />
                          <span>Edit (बदलणे)</span>
                        </label>
                      </div>
                    </div>

                    {(formData.permissions.events.canView || formData.permissions.events.canEdit) && (
                      <div>
                        <span className="text-[11px] font-bold text-gray-500 block mb-1.5">कोणत्या इव्हेंटचे अधिकार?</span>
                        <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto p-2 bg-white rounded-xl border">
                          {INITIATIVES_DATA.map((item) => (
                            <label key={item.id} className="flex items-center gap-1.5 text-xs cursor-pointer">
                              <input 
                                type="checkbox"
                                checked={formData.permissions.events.scope?.includes(item.id)}
                                onChange={() => handleScopeToggle('events', item.id)}
                              />
                              <span className="truncate">{item.titleMr}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. Finance Module */}
                  <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-gray-900">जमा-खर्च (Income & Expenses)</span>
                      <div className="flex items-center gap-4 text-xs font-semibold">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={formData.permissions.finance.canView}
                            onChange={(e) => handlePermChange('finance', 'canView', e.target.checked)}
                          />
                          <span>View (पाहणे)</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={formData.permissions.finance.canEdit}
                            onChange={(e) => handlePermChange('finance', 'canEdit', e.target.checked)}
                          />
                          <span>Edit (नोंदी करणे)</span>
                        </label>
                      </div>
                    </div>

                    {(formData.permissions.finance.canView || formData.permissions.finance.canEdit) && (
                      <div>
                        <span className="text-[11px] font-bold text-gray-500 block mb-1.5">कोणत्या इव्हेंटच्या जमाखर्चाचे अधिकार?</span>
                        <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto p-2 bg-white rounded-xl border">
                          {INITIATIVES_DATA.map((item) => (
                            <label key={item.id} className="flex items-center gap-1.5 text-xs cursor-pointer">
                              <input 
                                type="checkbox"
                                checked={formData.permissions.finance.scope?.includes(item.id)}
                                onChange={() => handleScopeToggle('finance', item.id)}
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

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border text-sm font-semibold text-gray-600"
                >
                  रद्द करा
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-heritage-burgundy text-white text-sm font-bold shadow-md hover:bg-heritage-crimson transition flex items-center gap-2 disabled:opacity-60"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
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