import React, { useState } from 'react';
import { useEffect } from 'react';
import contactImage from "../../assets/Workman.png";

const AdminAvatar = ({ admin }) => {
    const [imageError, setImageError] = useState(false);
    useEffect(() => {
        setImageError(false);
    }, [admin?.image]);

    if (!admin) {
        return <span className="text-red-600 font-semibold">A</span>;
    }

    const imageUrl = admin.image;
    const fallbackLetter = admin.admin_name?.charAt(0) || "V";

    return imageUrl && !imageError ? (
        <img
            src={imageUrl}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover rounded-full"
        />
    ) : (
        <span className="text-red-600 font-semibold">{fallbackLetter}</span>
    );
};

export default AdminAvatar;
