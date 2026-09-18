import React from 'react';
import { useOutletContext } from 'react-router-dom';
import HeroSection from '../../sections/home/HeroSection';
import InitiativesSection from '../../sections/home/InitiativesSection';

export default function HomePage() {
  const { lang } = useOutletContext();

  return (
    <div>
      {/* १. लक्झरी हिरो विभाग */}
      <HeroSection lang={lang} />

      {/* २. प्रमुख उपक्रम विभाग (चैत्र नवरात्र क्रमांक १ वर) */}
      <InitiativesSection lang={lang} />
    </div>
  );
}