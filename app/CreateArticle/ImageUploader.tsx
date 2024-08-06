import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../hooks/firebaseConfig";
import { useEffect } from "react";

const ImageUploader: React.FC<{ image: File | null; imageUrl: string | null; setImageUrl: (url: string | null) => void }> = ({ image, imageUrl, setImageUrl }) => {
    
    const uploadImage = async (file: File) => {
        const storageRef = ref(storage, `images/${file.name}`);
        try {
            await uploadBytes(storageRef, file);
            return await getDownloadURL(storageRef);
        } catch (error) {
            console.error("画像のアップロード中にエラーが発生しました:", error);
            return null;
        }
    };

    const fetchImageFromUrl = async (url: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const file = new File([blob], "uploaded-image.jpg", { type: blob.type });
            return uploadImage(file);
        } catch (error) {
            console.error("URLから画像をフェッチ中にエラーが発生しました:", error);
            return null;
        }
    };

    useEffect(() => {
        const upload = async () => {
            if (image) {
                const imageUrl = await uploadImage(image);
                setImageUrl(imageUrl);
            } else if (imageUrl) {
                const uploadedUrl = await fetchImageFromUrl(imageUrl);
                setImageUrl(uploadedUrl);
            }
        };
        upload();
    }, [image, imageUrl, setImageUrl]);

    return null;
};

export default ImageUploader;