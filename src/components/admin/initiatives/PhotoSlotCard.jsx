// src/components/admin/initiatives/PhotoSlotCard.jsx
import React, { useState } from 'react';
import { UploadCloud, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import { uploadToImgBB } from '../../../services/imageUploadService';

export default function PhotoSlotCard({ slotNo, slotData, onUpdate, onRemove }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadToImgBB(file);
      onUpdate(slotNo, {
        slotNo,
        url: result.url,
        thumbUrl: result.thumbUrl,
        caption: slotData?.caption || `फोटो ${slotNo}`
      });
    } catch (err) {
      alert(err.message || 'फोटो अपलोड अयशस्वी');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative border border-dashed border-gray-300 rounded-2xl p-3 bg-gray-50 flex flex-col justify-between aspect-square group hover:border-heritage-burgundy transition">
      
      {/* स्लॉट नंबर बॅज */}
      <span className="absolute top-2 left-2 z-10 text-[10px] font-black px-2 py-0.5 rounded-md bg-heritage-burgundy text-white shadow">
        स्लॉट {slotNo}
      </span>

      {/* फोटो एरिया किंवा अपलोड बटण */}
      {uploading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-heritage-burgundy">
          <Loader2 className="w-6 h-6 animate-spin mb-1" />
          <span className="text-[10px] font-bold">ImgBB वर अपलोड होत आहे...</span>
        </div>
      ) : slotData?.url ? (
        <div className="relative w-full h-full rounded-xl overflow-hidden">
          <img 
            src={slotData.thumbUrl || slotData.url} 
            alt={`स्लॉट ${slotNo}`} 
            className="w-full h-full object-cover" 
          />
          <button 
            type="button"
            onClick={() => onRemove(slotNo)}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-600 text-white opacity-0 group-hover:opacity-100 transition shadow hover:bg-red-700 cursor-pointer"
            title="फोटो काढा"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <label className="flex-1 flex flex-col items-center justify-center cursor-pointer text-gray-400 hover:text-heritage-burgundy transition">
          <UploadCloud className="w-7 h-7 mb-1" />
          <span className="text-[11px] font-bold">फोटो निवडा</span>
          <span className="text-[9px] text-gray-400">JPG, PNG (Max 5MB)</span>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            className="hidden" 
          />
        </label>
      )}

      {/* कॅप्शन इनपुट (जर फोटो अपलोड असेल तर) */}
      {slotData?.url && (
        <input 
          type="text"
          placeholder="कॅप्शन / शीर्षक लिहा..."
          value={slotData.caption || ''}
          onChange={(e) => onUpdate(slotNo, { ...slotData, caption: e.target.value })}
          className="mt-2 w-full text-[11px] px-2 py-1 border rounded-lg bg-white outline-none focus:border-heritage-burgundy"
        />
      )}
    </div>
  );
}