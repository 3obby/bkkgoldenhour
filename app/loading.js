'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

export default function Loading() {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFadeOut(true);
    }, 3000); // Adjust the timing as needed

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className={`loading-container ${fadeOut ? 'fade-out' : 'fade-in'}`}>
      <Image
        src="/images/euphoria.avif"
        alt="Euphoria Logo"
        width={200}
        height={50}
        priority={true}
        className="main-title"
        style={{
          width: '200px',
          height: 'auto',
          filter:
            'invert(39%) sepia(60%) saturate(2163%) hue-rotate(312deg) brightness(100%) contrast(101%)',
        }}
      />
    </div>
  );
}
