// src/components/admin/finance/FinanceTransactionModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Loader2, Search, UserPlus, Check, UserCheck } from 'lucide-react';
import Swal from 'sweetalert2';
import { financeService } from '../../../services/financeService';

export default function FinanceTransactionModal({ 
  onClose, 
  onSave, 
  existingCategories = [], 
  existingEvents = [],
  usersList = [],
  currentUser = null,
  initialData = null // एडिट करण्यासाठीचा जुना डेटा
}) {
  const users = Array.isArray(usersList) ? usersList : [];
  const isAdminOrSuper = !currentUser?.role || currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN';

  // फॉर्म स्टेट्स
  const [type, setType] = useState('EXPENSE');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [eventId, setEventId] = useState(existingEvents[0]?.id || 'general');
  const [isCustomEvent, setIsCustomEvent] = useState(false);
  const [customEventName, setCustomEventName] = useState('');

  const [category, setCategory] = useState(existingCategories[0] || 'मंडप व डेकोरेशन');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');

  const [mode, setMode] = useState('CASH');
  const [status, setStatus] = useState('PAID');

  const [userSearchText, setUserSearchText] = useState(currentUser?.name || '');
  const [selectedUserObj, setSelectedUserObj] = useState(currentUser || (users.length > 0 ? users[0] : null));
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isAddingNewUser, setIsAddingNewUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserContact, setNewUserContact] = useState('');

  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // =========================================================
  // FIX १: जर एडिट करायचे असेल तर जुना डेटा आपोआप Pre-fill करा
  // =========================================================
  useEffect(() => {
    if (initialData) {
      setType(initialData.type || 'EXPENSE');
      setAmount(initialData.amount ? String(initialData.amount) : '');
      setDate(initialData.date || new Date().toISOString().split('T')[0]);
      
      // Event Pre-fill
      const isPredefinedEvent = existingEvents.some(ev => ev.id === initialData.eventId);
      if (isPredefinedEvent || initialData.eventId === 'general') {
        setEventId(initialData.eventId || 'general');
        setIsCustomEvent(false);
      } else {
        setIsCustomEvent(true);
        setCustomEventName(initialData.eventName || '');
      }

      // Category Pre-fill
      const isPredefinedCat = existingCategories.includes(initialData.category);
      if (isPredefinedCat) {
        setCategory(initialData.category);
        setIsCustomCategory(false);
      } else {
        setIsCustomCategory(true);
        setCustomCategoryName(initialData.category || '');
      }

      setMode(initialData.mode || 'CASH');
      setStatus(initialData.status || 'PAID');

      // User Pre-fill
      setUserSearchText(initialData.assignedUserName || '');
      const matchedUser = users.find(u => u.id === initialData.assignedUserId);
      if (matchedUser) {
        setSelectedUserObj(matchedUser);
      } else if (initialData.assignedUserName) {
        setSelectedUserObj({
          id: initialData.assignedUserId,
          name: initialData.assignedUserName,
          email: initialData.assignedUserEmail || '',
          phone: initialData.assignedUserPhone || ''
        });
      }

      setDescription(initialData.description || '');
      setNotes(initialData.notes || '');
    }
  }, [initialData]);

  const matchingUsers = users.filter(u => 
    (u.name || '').toLowerCase().includes(userSearchText.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(userSearchText.toLowerCase()) ||
    (u.phone || '').includes(userSearchText)
  );

  const handleSelectUser = (u) => {
    setSelectedUserObj(u);
    setUserSearchText(u.name);
    setShowUserDropdown(false);
  };

  const handleQuickAddUser = () => {
    if (!newUserName.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'नाव आवश्यक!',
        text: 'कृपया प्रतिनिधीचे पूर्ण नाव प्रविष्ट करा.',
        confirmButtonColor: '#580A1A'
      });
      return;
    }

    const tempUser = {
      id: `user_${Date.now()}`,
      name: newUserName.trim(),
      email: newUserContact.includes('@') ? newUserContact.trim() : '',
      phone: !newUserContact.includes('@') ? newUserContact.trim() : ''
    };

    setSelectedUserObj(tempUser);
    setUserSearchText(tempUser.name);
    setIsAddingNewUser(false);
    setNewUserName('');
    setNewUserContact('');

    Swal.fire({
      icon: 'success',
      title: 'प्रतिनिधी जोडला!',
      text: `${tempUser.name} यांना निवडले गेले आहे.`,
      confirmButtonColor: '#580A1A',
      timer: 1500,
      showConfirmButton: false
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    const numAmt = Number(amount);
    if (!amount || isNaN(numAmt) || numAmt <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'अवैध रक्कम!',
        text: 'कृपया ० पेक्षा जास्त योग्य रक्कम भरा.',
        confirmButtonColor: '#580A1A'
      });
      return;
    }

    const finalEventId = isCustomEvent 
      ? (customEventName.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'custom-event')
      : eventId;

    const finalEventName = isCustomEvent 
      ? customEventName.trim() 
      : (existingEvents.find(ev => ev.id === eventId)?.titleMr || 'सामान्य संस्था निधी');

    const finalCategory = isCustomCategory ? customCategoryName.trim() : category;

    setSubmitting(true);

    try {
      // एडिट करताना जुनाच txnId ठेवणे किंवा नवीन बनवणे
      const txnId = initialData?.txnId || financeService.generateTransactionId(type, finalEventId, finalEventName, date);

      await onSave({
        txnId,
        type,
        amount: numAmt,
        date,
        eventId: finalEventId,
        eventName: finalEventName,
        category: finalCategory || 'इतर',
        mode: (type === 'EXPENSE' && mode === 'FROM_ADVANCE') ? 'FROM_ADVANCE' : mode,
        status,
        
        assignedUserId: selectedUserObj?.id || null,
        assignedUserName: selectedUserObj?.name || userSearchText.trim() || 'संस्था थेट (General)',
        assignedUserEmail: selectedUserObj?.email || '',
        assignedUserPhone: selectedUserObj?.phone || '',

        description: description.trim(),
        notes: notes.trim()
      });

      onClose();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'नोंद सेव्ह झाली नाही!',
        text: err.message || 'तांत्रिक अडचण आली आहे, कृपया पुन्हा प्रयत्न करा.',
        confirmButtonColor: '#580A1A'
      });
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-gray-200 space-y-3.5 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
          <div>
            <h2 className="text-sm sm:text-base font-black text-heritage-burgundy">
              {initialData ? 'नोंदीमध्ये बदल करा (Edit Record)' : (
                type === 'INCOME' ? 'नवीन जमा नोंद (Income)' : type === 'EXPENSE' ? 'नवीन खर्च नोंद (Expense)' : 'नवीन ॲडव्हान्स वाटप (Advance Given)'
              )}
            </h2>
            <p className="text-[10px] text-gray-500 font-medium">
              {initialData?.txnId ? `पावती क्र: ${initialData.txnId}` : 'हिशोब लेजरमध्ये थेट नोंद होईल'}
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1 rounded-full text-gray-400 hover:text-black hover:bg-gray-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Transaction Type Toggle */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-gray-100/80 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => setType('EXPENSE')}
            className={`py-1.5 rounded-lg font-bold transition cursor-pointer text-center ${
              type === 'EXPENSE' ? 'bg-rose-600 text-white shadow-xs' : 'text-gray-600 hover:text-black'
            }`}
          >
            खर्च
          </button>

          <button
            type="button"
            onClick={() => { setType('INCOME'); if (mode === 'FROM_ADVANCE') setMode('CASH'); }}
            className={`py-1.5 rounded-lg font-bold transition cursor-pointer text-center ${
              type === 'INCOME' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-600 hover:text-black'
            }`}
          >
            जमा
          </button>

          <button
            type="button"
            onClick={() => { setType('ADVANCE_GIVEN'); if (mode === 'FROM_ADVANCE') setMode('CASH'); }}
            className={`py-1.5 rounded-lg font-bold transition cursor-pointer text-center ${
              type === 'ADVANCE_GIVEN' ? 'bg-amber-600 text-white shadow-xs' : 'text-gray-600 hover:text-black'
            }`}
          >
            ॲडव्हान्स दिला
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          
          {/* Amount & Date */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-bold text-gray-600 uppercase mb-0.5">रक्कम (₹)*</label>
              <input 
                type="number"
                required
                min="1"
                placeholder="उदा. ५०००"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-gray-300 text-sm font-black focus:border-heritage-burgundy outline-none bg-white"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-600 uppercase mb-0.5">तारीख*</label>
              <input 
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-9 px-2.5 rounded-xl border border-gray-300 text-xs font-bold focus:border-heritage-burgundy outline-none bg-white"
              />
            </div>
          </div>

          {/* Event Selection */}
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <label className="text-[10px] font-bold text-gray-600 uppercase">संबंधित उपक्रम / इव्हेंट*</label>
              <button 
                type="button"
                onClick={() => setIsCustomEvent(!isCustomEvent)}
                className="text-[10px] text-heritage-burgundy font-bold hover:underline cursor-pointer"
              >
                {isCustomEvent ? 'यादीतून निवडा' : '+ नवीन इव्हेंट नाव'}
              </button>
            </div>

            {isCustomEvent ? (
              <input 
                type="text"
                placeholder="नवीन इव्हेंटचे नाव लिहा..."
                value={customEventName}
                onChange={(e) => setCustomEventName(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-gray-300 font-medium focus:border-heritage-burgundy outline-none"
              />
            ) : (
              <select 
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="w-full h-9 px-2.5 rounded-xl border border-gray-300 font-semibold focus:border-heritage-burgundy outline-none bg-white cursor-pointer"
              >
                <option value="general">सामान्य संस्था निधी (General / Admin)</option>
                {existingEvents.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.titleMr}</option>
                ))}
              </select>
            )}
          </div>

          {/* Category Selection */}
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <label className="text-[10px] font-bold text-gray-600 uppercase">वर्गवारी (Category)*</label>
              <button 
                type="button"
                onClick={() => setIsCustomCategory(!isCustomCategory)}
                className="text-[10px] text-heritage-burgundy font-bold hover:underline cursor-pointer"
              >
                {isCustomCategory ? 'यादीतून निवडा' : '+ नवीन वर्गवारी'}
              </button>
            </div>

            {isCustomCategory ? (
              <input 
                type="text"
                placeholder="उदा. जनरेटर डिझेल, बॅनर्स, पारितोषिक..."
                value={customCategoryName}
                onChange={(e) => setCustomCategoryName(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-gray-300 font-medium focus:border-heritage-burgundy outline-none"
              />
            ) : (
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-9 px-2.5 rounded-xl border border-gray-300 font-semibold focus:border-heritage-burgundy outline-none bg-white cursor-pointer"
              >
                {existingCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            )}
          </div>

          {/* Mode & Status */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-bold text-gray-600 uppercase mb-0.5">पेमेंट मोड*</label>
              <select 
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full h-9 px-2 rounded-xl border border-gray-300 font-bold focus:border-heritage-burgundy outline-none bg-white cursor-pointer"
              >
                <option value="CASH">रोख (Cash)</option>
                <option value="ONLINE">ऑनलाइन / UPI / बँक</option>
                {type === 'EXPENSE' && (
                  <option value="FROM_ADVANCE">ॲडव्हान्समधून (From Advance)</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-600 uppercase mb-0.5">स्थिती (Status)*</label>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-9 px-2 rounded-xl border border-gray-300 font-bold focus:border-heritage-burgundy outline-none bg-white cursor-pointer"
              >
                <option value="PAID">पूर्ण पेड (Paid)</option>
                <option value="PENDING">प्रलंबित (Pending / देणे बाकी)</option>
              </select>
            </div>
          </div>

          {/* Searchable User / Quick Add Component */}
          <div className="relative">
            <div className="flex items-center justify-between mb-0.5">
              <label className="text-[10px] font-bold text-gray-600 uppercase">
                {type === 'ADVANCE_GIVEN' ? 'रक्कम कोणाला दिली? (जबाबदार प्रतिनिधी)*' : 'खर्च / जमा करणारा प्रतिनिधी*'}
              </label>

              {isAdminOrSuper && (
                <button
                  type="button"
                  onClick={() => setIsAddingNewUser(!isAddingNewUser)}
                  className="text-[10px] text-heritage-crimson font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <UserPlus className="w-3 h-3" />
                  <span>{isAddingNewUser ? 'यादीतून शोधा' : '+ नवीन प्रतिनिधी जोडा'}</span>
                </button>
              )}
            </div>

            {isAddingNewUser ? (
              <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 space-y-2">
                <input 
                  type="text"
                  placeholder="प्रतिनिधीचे पूर्ण नाव..."
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-lg border border-amber-300 text-xs bg-white outline-none font-semibold"
                />
                <div className="flex items-center gap-2">
                  <input 
                    type="text"
                    placeholder="मोबाईल किंवा ईमेल (पर्यायी)..."
                    value={newUserContact}
                    onChange={(e) => setNewUserContact(e.target.value)}
                    className="w-full h-8 px-2.5 rounded-lg border border-amber-300 text-xs bg-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleQuickAddUser}
                    className="h-8 px-3 rounded-lg bg-amber-600 text-white font-bold text-xs shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" /> निवडा
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
                  <input 
                    type="text"
                    disabled={!isAdminOrSuper}
                    placeholder="प्रतिनिधीचे नाव किंवा ईमेल टाइप करा..."
                    value={userSearchText}
                    onChange={(e) => {
                      setUserSearchText(e.target.value);
                      setShowUserDropdown(true);
                    }}
                    onFocus={() => setShowUserDropdown(true)}
                    className="w-full h-9 pl-8 pr-8 rounded-xl border border-gray-300 font-semibold focus:border-heritage-burgundy outline-none bg-white text-xs disabled:bg-gray-100"
                  />
                  {selectedUserObj && (
                    <UserCheck className="w-4 h-4 text-emerald-600 absolute right-2.5 top-2.5" />
                  )}
                </div>

                {showUserDropdown && isAdminOrSuper && matchingUsers.length > 0 && (
                  <div className="absolute top-10 inset-x-0 z-20 bg-white border border-gray-200 rounded-xl shadow-xl max-h-44 overflow-y-auto divide-y divide-gray-100">
                    {matchingUsers.map((u) => (
                      <div 
                        key={u.id}
                        onClick={() => handleSelectUser(u)}
                        className="p-2 hover:bg-amber-50/60 cursor-pointer flex items-center justify-between transition"
                      >
                        <div>
                          <div className="font-bold text-gray-900 text-xs">{u.name}</div>
                          <div className="text-[10px] text-gray-400">{u.email || u.phone || 'नोंदणीकृत प्रतिनिधी'}</div>
                        </div>
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                          निवडा
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-bold text-gray-600 uppercase mb-0.5">तपशील (Description)*</label>
            <input 
              type="text"
              required
              placeholder="उदा. राज मंडप डेकोरेटर्स ॲडव्हान्स दिला..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-gray-300 font-medium focus:border-heritage-burgundy outline-none"
            />
          </div>

          {/* Notes / Receipt No */}
          <div>
            <label className="block text-[10px] font-bold text-gray-600 uppercase mb-0.5">पावती / बिल क्र. (Notes)</label>
            <input 
              type="text"
              placeholder="उदा. पावती क्र. १२४, रोख सही घेतली..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-gray-300 font-medium focus:border-heritage-burgundy outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <button 
              type="button" 
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition cursor-pointer"
            >
              रद्द करा
            </button>
            <button 
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-heritage-burgundy hover:bg-heritage-crimson text-white font-bold shadow-xs transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{initialData ? 'अपडेट होत आहे...' : 'नोंद होत आहे...'}</span>
                </>
              ) : (
                <span>{initialData ? 'बदल सेव्ह करा' : 'नोंद सेव्ह करा'}</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}