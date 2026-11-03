// src/services/imageUploadService.js

/**
 * १. इमेज कॉम्प्रेस करून लहान साईझची Base64 स्ट्रिंग तयार करणे
 * रुंदी आणि उंची १२००px च्या आत मर्यादित ठेवून ७०% क्वालिटीवर कॉम्प्रेस करते
 */
export const compressImageToBase64 = (file, maxDimension = 1200, quality = 0.70) => {
  return new Promise((resolve, reject) => {
    // इमेज फाईल नसल्यास सरळ Base64 द्या
    if (!file.type.match(/image.*/)) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // रुंदी किंवा उंची १२००px पेक्षा जास्त असल्यास प्रोपोर्शन राखून लहान करणे
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        // गुळगुळीत स्केलिंगसाठी इमेज स्मूथिंग
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // JPEG फॉरमॅटमध्ये कॉम्प्रेस करून Base64 स्ट्रिंग मिळवणे
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const base64Data = dataUrl.split(',')[1];
        resolve(base64Data);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

/**
 * २. ImgBB वर कॉम्प्रेस केलेला हलका फोटो अपलोड करणे
 */
export const uploadToImgBB = async (file) => {
  const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
  if (!apiKey) {
    throw new Error('ImgBB API Key मिळालेली नाही. कृपया .env मधील VITE_IMGBB_API_KEY तपासा.');
  }

  // कमाल १२००px आणि ७०% क्वालिटीवर कॉम्प्रेस करणे (साईट लोड एकदम फास्ट होईल)
  const base64Image = await compressImageToBase64(file, 1200, 0.70);

  const formData = new FormData();
  formData.append('image', base64Image);

  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return {
        url: data.data.url,
        displayUrl: data.data.display_url,
        thumbUrl: data.data.thumb?.url || data.data.display_url,
        deleteUrl: data.data.delete_url,
      };
    } else {
      const errorMsg = data.error?.message || `ImgBB त्रुटी (${response.status})`;
      throw new Error(errorMsg);
    }
  } catch (err) {
    console.error('ImgBB अपलोड त्रुटी:', err);
    throw new Error(err.message || 'फोटो अपलोड करताना तांत्रिक अडचण आली.');
  }
};