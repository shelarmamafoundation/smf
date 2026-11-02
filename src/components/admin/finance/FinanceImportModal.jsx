// src/components/admin/finance/FinanceImportModal.jsx
import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, AlertTriangle, X, Loader2, FileSpreadsheet } from 'lucide-react';
import { transformAndValidateRows } from '../../../utils/financeImportParser';
import { db } from '../../../config/firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';

export default function FinanceImportModal({ onClose, onSuccess, existingUsers }) {
  const [dataToUpload, setDataToUpload] = useState([]);
  const [warningsList, setWarningsList] = useState([]);
  const [stats, setStats] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Parse CSV File directly in browser without heavy library
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessing(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split(/\r\n|\n/).filter(line => line.trim().length > 0);
        if (lines.length < 2) {
          alert('CSV file rikami ahe!');
          setProcessing(false);
          return;
        }

        // Header parsing
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const rawJson = [];

        for (let i = 1; i < lines.length; i++) {
          // Regex to properly handle commas inside quotes
          const values = lines[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
          const rowObj = {};
          headers.forEach((h, idx) => {
            let val = values[idx] ? values[idx].trim() : '';
            if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
            rowObj[h] = val;
          });
          rawJson.push(rowObj);
        }

        // Run Auto-Transformation
        const { parsedRecords, warnings } = transformAndValidateRows(rawJson, existingUsers);
        
        setDataToUpload(parsedRecords);
        setWarningsList(warnings);

        // Stats summary
        const totalAmt = parsedRecords.reduce((sum, r) => sum + r.amount, 0);
        const advCount = parsedRecords.filter(r => r.type === 'ADVANCE_GIVEN').length;
        const expCount = parsedRecords.filter(r => r.type === 'EXPENSE').length;

        setStats({
          totalRecords: parsedRecords.length,
          totalAmount: totalAmt,
          advanceCount: advCount,
          expenseCount: expCount
        });
      } catch (err) {
        console.error('CSV Parsing error:', err);
        alert('File format madhe problem ahe. Krupaya standard CSV file nivada.');
      } finally {
        setProcessing(false);
      }
    };

    reader.readAsText(file);
  };

  // Batch Write to Firestore in chunks of 250 (Firestore single batch limit is 500)
  const handleCommitImport = async () => {
    if (dataToUpload.length === 0) return;

    setUploading(true);
    try {
      const recordsCol = collection(db, 'finance_records');
      const batch = writeBatch(db);

      dataToUpload.forEach(record => {
        const docRef = doc(recordsCol); // New Doc ID
        batch.set(docRef, {
          ...record,
          createdAt: new Date().toISOString()
        });
      });

      await batch.commit();

      // Clear local cache so fresh data loads
      localStorage.removeItem('smf_finance_records_cache');
      localStorage.removeItem('smf_finance_last_sync');

      alert(`${dataToUpload.length} Nondi यशस्वीरीत्या Import zhalya!`);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Firestore batch write error:', err);
      alert('Database import fail jhala: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-gray-200 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-black text-heritage-burgundy flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <span>जुन्या ॲपचा जमा-खर्च डेटा Import करा (Auto-Convert)</span>
            </h2>
            <p className="text-[11px] text-gray-400">
              Excel Sheet (.CSV) निवडा; सिस्टीम आपोआप ॲडव्हान्स, तारखा व फॉरमॅट शुद्ध करेल.
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Zone */}
        {!stats && (
          <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl m-4 bg-gray-50/50">
            <UploadCloud className="w-12 h-12 text-gray-400 mb-2" />
            <span className="text-xs font-bold text-gray-700 mb-1">तुमची जुनी CSV फाईल निवडा</span>
            <span className="text-[10px] text-gray-400 mb-4">Google Sheet वरून File -&gt; Download -&gt; Comma-separated values (.csv) निवडा</span>
            
            <label className="px-5 py-2.5 rounded-xl bg-heritage-burgundy hover:bg-heritage-crimson text-white font-bold text-xs cursor-pointer shadow-md transition">
              <span>{processing ? 'डेटा तपासत आहे...' : 'CSV फाईल सिलेक्ट करा'}</span>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" disabled={processing} />
            </label>
          </div>
        )}

        {/* Validation & Preview Summary */}
        {stats && (
          <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1">
            {/* Quick Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">एकूण नोंदी</span>
                <span className="text-base font-black text-gray-900">{stats.totalRecords}</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-amber-800 block text-[10px] uppercase font-bold">ओळखलेले ॲडव्हान्स</span>
                <span className="text-base font-black text-amber-900">{stats.advanceCount} (Type: ADV)</span>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                <span className="text-rose-800 block text-[10px] uppercase font-bold">प्रत्यक्ष खर्च बिलांची संख्या</span>
                <span className="text-base font-black text-rose-900">{stats.expenseCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-emerald-800 block text-[10px] uppercase font-bold">एकूण रक्कम</span>
                <span className="text-base font-black text-emerald-900">₹ {stats.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Warnings Alert Box */}
            {warningsList.length > 0 && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-[11px] text-amber-950 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>सावधानता ({warningsList.length} नोंदींमध्ये त्रुटी आढळल्या):</span>
                </div>
                <div className="max-h-24 overflow-y-auto text-[10px] space-y-0.5">
                  {warningsList.map((w, idx) => <p key={idx}>• {w}</p>)}
                </div>
              </div>
            )}

            {/* Preview Sample Table (Top 10 Rows) */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gray-100 px-3 py-1.5 text-[10px] font-bold text-gray-600 flex justify-between">
                <span>पहिल्या १० नोंदींचा पडताळणी प्रिव्ह्यू:</span>
                <span>(सर्व {dataToUpload.length} नोंदी तयार आहेत)</span>
              </div>
              <table className="w-full text-left text-[10px]">
                <thead className="bg-gray-50 border-b text-gray-500 font-bold">
                  <tr>
                    <th className="p-2">नवीन ID</th>
                    <th className="p-2">तारीख</th>
                    <th className="p-2">प्रकार</th>
                    <th className="p-2">तपशील</th>
                    <th className="p-2">प्रतिनिधी</th>
                    <th className="p-2 text-right">रक्कम</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {dataToUpload.slice(0, 10).map((r, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="p-2 font-mono font-bold text-gray-500">{r.txnId}</td>
                      <td className="p-2">{r.date}</td>
                      <td className="p-2">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black ${
                          r.type === 'ADVANCE_GIVEN' ? 'bg-amber-100 text-amber-800' : 'bg-rose-50 text-rose-800'
                        }`}>
                          {r.type}
                        </span>
                      </td>
                      <td className="p-2 max-w-[180px] truncate">{r.description}</td>
                      <td className="p-2">{r.assignedUserName}</td>
                      <td className="p-2 text-right font-black text-gray-900">₹ {r.amount.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* Footer Actions */}
        <div className="border-t pt-3 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border text-xs font-bold text-gray-600 hover:bg-gray-50"
          >
            रद्द करा
          </button>

          {stats && (
            <button
              type="button"
              disabled={uploading}
              onClick={handleCommitImport}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-heritage-burgundy hover:bg-heritage-crimson text-white font-bold text-xs shadow-md transition disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>{uploading ? 'डेटाबेसमध्ये सेव्ह होत आहे...' : `खात्री आहे - सर्व ${dataToUpload.length} नोंदी Import करा`}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}