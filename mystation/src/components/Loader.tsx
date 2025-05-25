import React from 'react';
import '../styles/Loader.css';

interface LoaderProps {
    size?: 'small' | 'medium' | 'large';
}

const Loader: React.FC<LoaderProps> = ({ size = 'medium' }) => {
    const getSize = () => {
        switch (size) {
            case 'small':
                return { width: '24px', height: '24px', borderWidth: '3px' };
            case 'large':
                return { width: '64px', height: '64px', borderWidth: '6px' };
            default:
                return { width: '48px', height: '48px', borderWidth: '5px' };
        }
    };

    return (
        <div className="loader" style={getSize()} />
    );
};

export default Loader;
