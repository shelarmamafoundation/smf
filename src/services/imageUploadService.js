// src/services/imageUploadService.js

// ==========================================
// IMGBB FREE IMAGE UPLOAD SERVICE
// ==========================================
export const uploadToImgBB = async (file) => {
  const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
  if (!apiKey) {
    throw new Error('ImgBB API Key मिळालेली नाही. कृपया .env फाईल तपासा (VITE_IMGBB_API_KEY).');
  }

  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (data.success) {
    return {
      url: data.data.url,             // हाय-रिझोल्युशन मूळ इमेज URL
      displayUrl: data.data.display_url,
      thumbUrl: data.data.thumb?.url  // फास्ट लोडिंग थंबनेल
    };
  } else {
    throw new Error(data.error?.message || 'ImgBB वर फोटो अपलोड करताना त्रुटी आली.');
  }
};