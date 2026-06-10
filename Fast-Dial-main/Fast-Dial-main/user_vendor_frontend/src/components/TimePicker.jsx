import { useState, useRef, useEffect } from 'react';

const generateTimes = () => {
    const times = [];
    const pad = (n) => String(n).padStart(2, '0');
    for (let h = 0; h < 24; h++) {
        for (let m of [0, 30]) {
            const hour12 = h % 12 === 0 ? 12 : h % 12;
            const ampm = h < 12 ? 'AM' : 'PM';
            times.push(`${hour12}:${pad(m)} ${ampm}`);
        }
    }
    return times;
};

export default function TimePicker({
    name,
    value,
    onChange,
    onBlur,
    placeholder = '',
    error,
    touched,
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef();
    const times = generateTimes();

    // close dropdown on outside click
    useEffect(() => {
        const onClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, []);

    const handleSelect = (time) => {
        onChange({ target: { name, value: time } });
        setOpen(false);
    };

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                onBlur={(e) => {
                    // allow onBlur to bubble for your touched logic
                    typeof onBlur === 'function' && onBlur(e);
                }}
                className={`
          w-full text-left p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4]
          ${error && touched ? 'border-red-500' : 'border-gray-300'}
        `}
            >
                {value || placeholder}
            </button>
            {error && touched && (
                <p className="text-red-400 text-sm mt-1">{error}</p>
            )}
            {open && (
                <ul
                    className="absolute z-10 w-full max-h-60 overflow-auto bg-white border border-gray-200 rounded-md shadow-lg mt-1"
                >
                    {times.map((t) => (
                        <li
                            key={t}
                            onMouseDown={() => handleSelect(t)}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        >
                            {t}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
