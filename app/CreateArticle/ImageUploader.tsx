import React, { useEffect } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../hooks/firebaseConfig';

interface ImageUploaderProps {
  image: File | string | null; // Update type to support URLs
  setImageUrl: (url: string | null) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ image, setImageUrl }) => {
  const uploadImage = async (file: File): Promise<string | null> => {
    const storageRef = ref(storage, `images/${file.name}`);
    try {
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error('画像のアップロード中にエラーが発生しました:', error);
      return null;
    }
  };

  const fetchAndUploadImageFromUrl = async (url: string): Promise<string | null> => {
    try {
      const response = await fetch(url, { mode: 'cors' });
      if (!response.ok) {
        throw new Error(`HTTPエラー: ${response.status} ${response.statusText}`);
      }
      const blob = await response.blob();
      const file = new File([blob], 'remote-image', { type: blob.type });
      return await uploadImage(file);
    } catch (error) {
      console.error('URLから画像を取得中にエラーが発生しました:', error);
      return null;
    }
  };

  useEffect(() => {
    const upload = async () => {
      if (image) {
        let imageUrl: string | null = null;

        if (typeof image === 'string') {
          // If image is a URL, fetch and upload it
          imageUrl = await fetchAndUploadImageFromUrl(image);
        } else if (image instanceof File) {
          // If image is a File, upload it directly
          imageUrl = await uploadImage(image);
        }

        setImageUrl(imageUrl);
      } else {
        setImageUrl(null);
      }
    };

    upload();
  }, [image, setImageUrl]);

  return null;
};

export default ImageUploader;