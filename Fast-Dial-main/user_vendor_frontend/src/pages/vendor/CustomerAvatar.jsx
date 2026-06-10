import React, { useState } from 'react';
import { useEffect } from 'react';

const CustomerAvatar = ({ customer }) => {
    const [imageError, setImageError] = useState(false);
    useEffect(() => {
        setImageError(false);
        console.log(customer)
    }, [customer?.customer_image]);

    if (!customer) {
        return <span className="text-red-600 font-semibold">C</span>;
    }

    const imageUrl = customer.customer_image;
    const fallbackLetter = customer.customer_name?.charAt(0) || "V";

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

export default CustomerAvatar;
