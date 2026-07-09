"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import PropertyForm from "./components/PropertyForm";
import GoogleMap from "./components/GoogleMap";
import AnimatedWeegschaal from "./components/AnimatedWeegschaal";
import { PropertyData } from "@/lib/types/PropertyTypes";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useContent } from "@/lib/hooks/useContent";

// Hero carousel images - automatisch gegenereerd uit folder
const generateHeroImages = () => {
  // Alleen de afbeeldingen die echt bestaan in de landing_page_photos folder
  const images = [
    { file: 'artists-eyes-tHV0jeh_Yd4-unsplash.jpg', alt: 'Sfeervolle Nederlandse woning met karakter' },
    { file: 'anya-chernik-LXHbMXfFrhw-unsplash.jpg', alt: 'Moderne woning in een groene woonwijk' },
    { file: 'jw-2_nt_J35jKE-unsplash.jpg', alt: 'Karakteristiek huis aan een rustige straat' },
    { file: 'margaret-polinder-3DsMhQF9aB0-unsplash.jpg', alt: 'Sfeervol rijtjeshuis in een Nederlandse buurt' },
    { file: 'margaret-polinder-NzCVjuMW6ww-unsplash.jpg', alt: 'Gezellig Nederlands woonhuis met tuin' },
    { file: 'nick-G7nq4FIFo_M-unsplash.jpg', alt: 'Ruime eengezinswoning in een kindvriendelijke wijk' },
    { file: 'ries-bosch-jXHaV2nBYEE-unsplash.jpg', alt: 'Klassieke Nederlandse woning met rode dakpannen' },
  ];

  return images.map(({ file, alt }) => ({
    src: `/landing_page_photos/${file}`,
    alt,
  }));
};

const heroImages = generateHeroImages();

export default function Home() {
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const lastScrollYRef = useRef(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const c = useContent();

  // Automatische carousel wisseling
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 15000); // Wissel elke 15 seconden

    return () => clearInterval(interval);
  }, []);

  // Scroll-based navigation visibility (ref i.p.v. state zodat de listener niet
  // bij elke scroll-tick opnieuw geregistreerd wordt)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const lastScrollY = lastScrollYRef.current;

      // Toon navigatie als we helemaal bovenaan zijn (eerste 50px)
      if (currentScrollY < 50) {
        setIsNavVisible(true);
      }
      // Verberg navigatie als we naar beneden scrollen
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsNavVisible(false);
      }
      // Toon navigatie als we naar boven scrollen
      else if (currentScrollY < lastScrollY) {
        setIsNavVisible(true);
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const normalizeAddress = (value?: string) => {
    const cleaned = (value || '').trim();
    if (!cleaned) return '';
    const lowered = cleaned.toLowerCase();
    if (lowered === 'address not found' || lowered === 'not found') return '';
    return cleaned;
  };

  const handlePropertyFound = (data: PropertyData) => {
    const cleanedAddress = normalizeAddress(data.address);
    setPropertyData({ ...data, address: cleanedAddress });
    // Scroll to results section
    setTimeout(() => {
      const resultsSection = document.getElementById('property-results');
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleProceedToCheckout = () => {
    if (propertyData) {
      if (!normalizeAddress(propertyData.address)) {
        return;
      }
      // Store property data in session storage for checkout page
      sessionStorage.setItem('propertyData', JSON.stringify(propertyData));
      router.push('/checkout');
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF9F6' }}>
      {/* Header Navigation */}
      <motion.header 
        className="fixed top-0 w-full z-50 bg-white shadow-md"
        initial={{ y: 0, opacity: 1 }}
        animate={{ 
          y: isNavVisible ? 0 : -100,
          opacity: isNavVisible ? 1 : 0
        }}
        transition={{ 
          duration: 0.3,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center w-full">
            {/* Logo helemaal links, nooit kleiner */}
            <div className="flex-shrink-0">
              <a href="/" className="cursor-pointer">
                <Image
                  src="/Juistebod logo voorkant.png"
                  alt="JuisteBod.nl Logo"
                  width={200}
                  height={50}
                  className="object-contain hover:opacity-80 transition-opacity"
                  priority
                />
              </a>
            </div>
            {/* Navigation + mobile button helemaal rechts */}
            <div className="flex flex-1 items-center justify-end">
              <nav className="hidden md:flex items-center space-x-2">
                <a href="#hoe-werkt-het" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors">
                  Hoe werkt het
                </a>
                <a href="#missie-visie" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors">
                  Missie & visie
                </a>
                <a href="#contact" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors">
                  Contact
                </a>
              </nav>
              <button
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="md:hidden p-2 rounded-md text-gray-700 hover:text-gray-900 transition-colors ml-4"
                aria-label="Menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
          {isMenuOpen && (
            <nav className="md:hidden mt-4 border-t border-gray-200 pt-4">
              <div className="flex flex-col space-y-3 text-center">
                <a href="#hoe-werkt-het" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors">
                  Hoe werkt het
                </a>
                <a href="#missie-visie" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors">
                  Missie & visie
                </a>
                <a href="#contact" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors">
                  Contact
                </a>
              </div>
            </nav>
          )}
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image Carousel — alleen de huidige, vorige en volgende foto
            worden gemount zodat niet alle 7 foto's tegelijk laden */}
        <div className="absolute inset-0 z-0">
          {heroImages.map((image, index) => {
            const total = heroImages.length;
            const prevIndex = (currentImageIndex + total - 1) % total;
            const nextIndex = (currentImageIndex + 1) % total;
            const shouldMount =
              index === currentImageIndex || index === prevIndex || index === nextIndex;
            if (!shouldMount) return null;

            return (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="100vw"
                  quality={70}
                  className="object-cover"
                  priority={index === 0}
                />
              </div>
            );
          })}
          <div className="absolute inset-0 hero-overlay"></div>
        </div>



        {/* Hero Content */}
        <div className="relative z-10 text-center text-white max-w-2xl px-6">
          <motion.p 
            className="text-lg md:text-xl font-light mb-4 opacity-90"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <span className="underline">{c('hero_subtitle', 'Het juiste bod op elke woning')}</span>
          </motion.p>
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-12 leading-tight"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {c('hero_title', 'Persoonlijk woningbodadvies')}
          </motion.h1>
          
          {/* Property Form */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <PropertyForm onPropertyFound={handlePropertyFound} />
          </motion.div>
        </div>

        <a
          href="#hoe-werkt-het"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/90 hover:text-white transition-colors"
          aria-label="Scroll naar beneden"
        >
          <span className="text-xs uppercase tracking-[0.2em]">Scroll</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center"
          >
            <span className="block h-8 w-px bg-white/70 mb-2"></span>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
        </a>
      </section>

      {/* Expertise Section */}
      <section id="expertise">
        <motion.div
          className="grid md:grid-cols-2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center p-12 md:p-20" style={{ backgroundColor: '#1F3C88' }}>
            <h2 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              Geen AI,<br />maar<br />ervaring
            </h2>
          </div>
          <div className="p-12 md:p-20 text-white space-y-6" style={{ backgroundColor: '#1F3C88' }}>
            <p className="text-base md:text-lg leading-relaxed opacity-90">
              Onze makelaars stellen ieder rapport zorgvuldig samen op basis van uitgebreide en exclusieve
              marktdata, opgebouwd uit meer dan 100.000+ woningtransacties per jaar. Deze datagrondslag geeft
              een zeer compleet, actueel en op de meest recente data gebaseerd beeld van de woningmarkt en
              vormt de basis voor een nauwkeurige waardebepaling.
            </p>
            <p className="text-base md:text-lg leading-relaxed opacity-90">
              Elk rapport wordt handmatig opgesteld en gecontroleerd door ervaren makelaars. Zij analyseren de
              marktdata, wegen alle relevante factoren en vertalen dit naar een onderbouwd en realistisch advies.
            </p>
            <p className="text-base md:text-lg leading-relaxed opacity-90">
              Zo ben je verzekerd van een professioneel en betrouwbaar rapport waarop je met vertrouwen je
              volgende stap kunt baseren.
            </p>
          </div>
        </motion.div>
      </section>

      {/* USP Section */}
      <section className="py-16 px-6" style={{ backgroundColor: '#FAF9F6' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <motion.div
              className="flex flex-col items-center space-y-4"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0 }}
            >
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1F3C88' }}>
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 leading-snug">
                Binnen 48 uur ontvang je een volledig en onderbouwd adviesrapport
              </h3>
            </motion.div>

            <motion.div
              className="flex flex-col items-center space-y-4"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1F3C88' }}>
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 leading-snug">
                Inclusief 7 slimme biedtips om je positie op de woningmarkt te versterken
              </h3>
            </motion.div>

            <motion.div
              className="flex flex-col items-center space-y-4"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1F3C88' }}>
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 leading-snug">
                Altijd samengesteld door ervaren makelaars op basis van menselijk inzicht, geen AI
              </h3>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Property Results Section */}
      {propertyData && (
        <section id="property-results" className="py-24 px-6" style={{ backgroundColor: '#FAF9F6' }}>
          <div className="max-w-4xl mx-auto">
            <motion.div 
              className="bg-white rounded-lg shadow-lg p-8 mb-8"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <h2 className="text-3xl font-bold mb-6 text-gray-800">
                Woning Overzicht
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Property Details */}
                <div>
                  {propertyData.title &&
                    propertyData.title.trim() !== propertyData.address?.trim() && (
                      <h3 className="text-xl font-semibold mb-4" style={{ color: '#7C8471' }}>
                        {propertyData.title}
                      </h3>
                    )}
                  <div className="space-y-3">
                    <p className="text-gray-800">
                      <strong>Adres:</strong> {normalizeAddress(propertyData.address) || 'Vul adres aan'}
                    </p>
                  </div>
                </div>

                {/* Google Map with Location */}
                <div>
                  <GoogleMap 
                    address={normalizeAddress(propertyData.address)}
                    propertyTitle={propertyData.title}
                  />
                </div>
              </div>

              {/* Data Confirmation Section */}
              <div className="mt-8 p-6 rounded-lg border-2 border-gray-200">
                <h4 className="text-xl font-semibold mb-4 text-gray-800">Kloppen deze gegevens?</h4>
                <p className="text-gray-700 mb-6">
                  Controleer of de bovenstaande informatie correct is. Op basis van deze gegevens stellen wij ons professionele bodadvies op.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button 
                    onClick={handleProceedToCheckout}
                    className="text-white px-8 py-3 rounded-full font-medium transition-all"
                    style={{ backgroundColor: '#1F3C88' }}
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: "0 10px 25px rgba(31, 60, 136, 0.3)",
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ 
                      scale: 0.98,
                      transition: { duration: 0.1 }
                    }}
                    animate={{
                      boxShadow: "0 4px 15px rgba(31, 60, 136, 0.2)"
                    }}
                  >
                    ✓ Ja, ga verder
                  </motion.button>
                  <motion.button 
                    onClick={() => setPropertyData(null)}
                    className="text-gray-700 border-2 border-gray-300 px-8 py-3 rounded-full font-medium transition-all"
                    whileHover={{ 
                      scale: 1.02,
                      backgroundColor: "#f9fafb",
                      borderColor: "#9ca3af",
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ 
                      scale: 0.98,
                      transition: { duration: 0.1 }
                    }}
                  >
                    Nee, opnieuw zoeken
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* How It Works Section */}
      <section id="hoe-werkt-het" className="py-24 px-6 scroll-mt-20" style={{ backgroundColor: '#FAF9F6' }}>
        <div className="max-w-6xl mx-auto text-center">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold mb-20 text-gray-800"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            {c('how_it_works_title', 'Zo werkt het')}
          </motion.h2>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-12 mb-16 items-stretch"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, staggerChildren: 0.2 }}
          >
            {/* Stap 1 */}
            <motion.div className="relative text-center flex flex-col items-center h-full" initial={{ opacity: 0, y: 30 }}
whileInView={{ opacity: 1, y: 0 }}
transition={{ duration: 0.6 }}>
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-2xl font-bold"
                style={{ backgroundColor: '#1F3C88' }}
              >
                1
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">{c('step1_title', 'Vul je adres in')}</h3>
              <p className="text-lg text-gray-600 leading-relaxed mb-4">
                {c('step1_text', 'Vul postcode en huisnummer in om de locatie te vinden. Funda-link is verplicht voor het bodadvies.')}
              </p>
              <div className="text-xs text-gray-500 bg-white rounded-lg p-3 mx-auto max-w-xs min-h-[56px] flex items-center justify-center mt-auto">
                💡 <strong>Tip:</strong> {c('step1_tip', 'Funda-link helpt bij persoonlijk advies')}
              </div>
            </motion.div>
            
            {/* Stap 2 */}
            <motion.div className="relative text-center flex flex-col items-center h-full" initial={{ opacity: 0, y: 30 }}
whileInView={{ opacity: 1, y: 0 }}
transition={{ duration: 0.6 }}>
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-2xl font-bold"
                style={{ backgroundColor: '#1F3C88' }}
              >
                2
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">{c('step2_title', 'Vul je gegevens in')}</h3>
              <p className="text-lg text-gray-600 leading-relaxed mb-4">
                {c('step2_text', 'Vul je contactgegevens in zodat we het advies persoonlijk kunnen maken.')}
              </p>
              <div className="text-xs text-gray-500 bg-white rounded-lg p-3 mx-auto max-w-xs min-h-[56px] flex items-center justify-center mt-auto">
                🔒 <strong>Veilig:</strong> {c('step2_tip', 'Al je gegevens worden veilig opgeslagen')}
              </div>
            </motion.div>
            
            {/* Stap 3 */}
            <motion.div className="text-center flex flex-col items-center h-full" initial={{ opacity: 0, y: 30 }}
whileInView={{ opacity: 1, y: 0 }}
transition={{ duration: 0.6 }}>
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-2xl font-bold"
                style={{ backgroundColor: '#7C8471' }}
              >
                3
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">{c('step3_title', 'Ontvang je rapport')}</h3>
              <p className="text-lg text-gray-600 leading-relaxed mb-4">
                {c('step3_text', 'Binnen 48 uur ontvang je een volledig en onderbouwd adviesrapport in je mailbox')}
              </p>
              <div className="text-xs text-gray-500 bg-white rounded-lg p-3 mx-auto max-w-xs min-h-[56px] flex items-center justify-center mt-auto">
                ✓ <strong>Betrouwbaar:</strong> {c('step3_tip', 'Handmatig opgesteld door ervaren makelaars')}
              </div>
            </motion.div>
          </motion.div>

          {/* Prijs */}
          <motion.div
            className="text-center mt-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xl font-bold" style={{ color: '#1F3C88' }}>
              Slechts €199,95 excl. BTW — Geen verborgen kosten
            </p>
          </motion.div>
        </div>
      </section>

      {/* Missie & Visie Section */}
      <section id="missie-visie" className="py-24 px-6 scroll-mt-20" style={{ backgroundColor: '#FAF9F6' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-end">
            {/* Weegschaal - neemt 5 kolommen links */}
            <div className="lg:col-span-5 flex justify-center lg:justify-start h-full self-end">
              <AnimatedWeegschaal 
                animationType="slideFromLeft"
                size={500}
                showOnView={true}
                showRefreshButton={false}
              />
            </div>

            {/* Text Content - neemt 7 kolommen rechts */}
            <motion.div 
              className="lg:col-span-7 text-gray-800 space-y-6 flex flex-col justify-start min-h-[400px]"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Over ons</h2>
              <p className="text-lg leading-relaxed">
                {c('mission_text1', 'Wij geloven dat iedereen recht heeft op eerlijk en deskundig advies bij het kopen van een woning, zonder onnodig hoge makelaarskosten.')}
              </p>
              <p className="text-lg leading-relaxed">
                {c('mission_text2', 'Onze missie is om woningzoekers snel, duidelijk en betaalbaar te ondersteunen bij het bepalen van een passend bod. Zo krijg je helder inzicht in de markt en kun je met vertrouwen de juiste keuze maken voor je volgende stap, zodat jij de sleutels van je droomwoning in ontvangst kan nemen.')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-16 px-6 scroll-mt-20" style={{ backgroundColor: '#FAF9F6', borderTop: '1px solid rgba(124, 132, 113, 0.2)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 mb-12 items-center">
            {/* Company Info */}
            <div className="text-center md:text-left">
              <p className="text-2xl font-bold text-gray-800 mb-2">JuisteBod.nl</p>
              <p className="text-lg underline" style={{ color: '#7C8471' }}>
                {c('footer_tagline', 'Het juiste bod op elke woning')}
              </p>
            </div>

            {/* Contact Info */}
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4 text-gray-800">
                Neem contact op met ons team
              </h3>
              <p className="text-lg text-gray-600">
                Email: {c('contact_email', 'info@juistebod.nl')}
              </p>
            </div>
          </div>

          {/* Social Media */}
          <div className="text-center pt-8" style={{ borderTop: '1px solid rgba(124, 132, 113, 0.2)' }}>
            <h4 className="text-xl font-semibold mb-6 text-gray-800">
              Volg ons op Instagram
            </h4>
            <div className="flex justify-center">
              <a 
                href={c('instagram_url', 'https://www.instagram.com/juistebod?igsh=MXBxZXNpbDRmbXRx')} 
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-all hover:scale-105 transform"
                style={{ backgroundColor: '#7C8471' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#6b7562'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7C8471'; }}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
            <p className="text-sm text-gray-600 mt-6">
              KvK: {c('kvk_number', '97900443')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
