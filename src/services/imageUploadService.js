// src/services/imageUploadService.js

/**
 * 1. Image Compression to Base64
 * कोणत्याही लायब्ररीशिवाय इमेज कॉम्प्रेस करून थेट Base64 स्ट्रिंग तयार करते
 */
export const compressImageToBase64 = (file, maxWidth = 1600, quality = 0.75) => {
  return new Promise((resolve, reject) => {
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

        // प्रमाणाशीर आकार कमी करणे (Resize)
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // JPEG Base64 डेटा मिळवणे
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        // "data:image/jpeg;base64," हा प्रीफिक्स काढून केवळ Base64 स्ट्रिंग ImgBB ला देणे
        const base64Data = dataUrl.split(',')[1];
        resolve(base64Data);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

/**
 * 2. ImgBB Upload using Base64 Payload
 */
export const uploadToImgBB = async (file) => {
  const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
  if (!apiKey) {
    throw new Error('ImgBB API Key मिळालेली नाही. कृपया .env मधील VITE_IMGBB_API_KEY तपासा.');
  }

  // इमेज कॉम्प्रेस करून Base64 मिळवा
  const base64Image = await compressImageToBase64(file, 1600, 0.75);

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
      };
    } else {
      // API कडून आलेला खरा एरर मेसेज दाखवणे
      const errorMsg = data.error?.message || `ImgBB Error (${response.status})`;
      throw new Error(errorMsg);
    }
  } catch (err) {
    console.error('ImgBB Upload Error:', err);
    throw new Error(err.message || 'फोटो अपलोड करताना त्रुटी आली.');
  }
};