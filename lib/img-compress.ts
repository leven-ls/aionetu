export function compressImage(file: File, targetSize: number): Promise<File> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = URL.createObjectURL(file);
      image.onload = function () {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = image.width;
        canvas.height = image.height;
        ctx?.drawImage(image, 0, 0, image.width, image.height);
        let quality = 1;
        canvas.toBlob(function (blob) {
          if (!blob) {
            reject(new Error('Compression failed'));
            return;
          }
          if (blob.size < targetSize) {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          } else {
            while (blob.size > targetSize && quality > 0) {
              quality -= 0.1;
              canvas.toBlob(function (blob) {
                if (!blob) {
                  reject(new Error('Compression failed'));
                  return;
                }
                if (blob.size < targetSize) {
                  resolve(new File([blob], file.name, { type: 'image/jpeg' }));
                }
              }, 'image/jpeg', quality);
            }
          }
        }, 'image/jpeg', quality);
      };
    });
  }