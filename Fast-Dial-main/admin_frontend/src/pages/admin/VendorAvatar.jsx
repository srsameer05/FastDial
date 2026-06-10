import React, { useState } from 'react';
import { useEffect } from 'react';

const VendorAvatar = ({ vendor }) => {
    const [imageError, setImageError] = useState(false);
    useEffect(() => {
        setImageError(false);
    }, [vendor?.image_url?.[0]]);

    if (!vendor) {
        return <span className="text-red-600 font-semibold">V</span>;
    }

    const imageUrl = vendor.image_url?.[0];
    const fallbackLetter = vendor.vendor_name?.charAt(0) || "V";

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

export default VendorAvatar;
