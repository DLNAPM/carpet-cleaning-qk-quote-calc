
import React from 'react';

interface IconProps {
    name: 'mic' | 'micOff' | 'trash' | 'plus';
    size?: number;
    className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 24, className }) => {
    const icons: { [key in IconProps['name']]: JSX.Element } = {
        mic: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
        ),
        micOff: (
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.586 15.586a7 7 0 01-8.172 0l-5.414-5.414A7 7 0 0115.586 15.586z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 00-7-7m0 0a7 7 0 00-7 7m7-7v4m0 0H8m4 0h4m-4-8a3 3 0 00-3-3V5a3 3 0 116 0v6a3 3 0 00-3 3z" />
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
            </svg>
        ),
        trash: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
        ),
        plus: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
        )
    };

    return (
        <div style={{ width: size, height: size }} className={className}>
            {icons[name]}
        </div>
    );
};
