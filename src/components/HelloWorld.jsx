// src/components/HelloWorld.js
import React, { useEffect, useState } from 'react';

const HelloWorld = () => {
  const translations = [
    'Hello',       // English
    'Hola',        // Spanish
    'Bonjour',     // French
    'Ciao',        // Italian
    'Hallo',       // German
    'Привет',      // Russian
    'こんにちは',   // Japanese
    '안녕하세요',    // Korean
    'Merhaba',     // Turkish
    'مرحبا'        // Arabic
  ];

  const [currentTranslation, setCurrentTranslation] = useState(translations[0]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % translations.length;
        setCurrentTranslation(translations[nextIndex]);
        return nextIndex;
      });
    }, 150); // Change every 1000 milliseconds (1 second)

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, [translations]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <h1 className="text-white text-6xl font-thin">{currentTranslation}</h1>
    </div>
  );
};

export default HelloWorld;
