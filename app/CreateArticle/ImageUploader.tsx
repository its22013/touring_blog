import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../hooks/firebaseConfig";
import { useEffect } from "react";

const ImageUploader: React.FC<{ image: File | null; setImageUrl: (url: string | null) => void }> = ({ image, setImageUrl }) => {
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

    useEffect(() => {
        const upload = async () => {
            if (image) {
                const imageUrl = await uploadImage(image);
                setImageUrl(imageUrl);
            }
        };
        upload();
    }, [image, setImageUrl]);

    return null;
};

export default ImageUploader;
