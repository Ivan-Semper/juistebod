"use client";

import { useState, useEffect } from "react";
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
  const imageFilenames = [
    'artists-eyes-tHV0jeh_Yd4-unsplash.jpg',
    'anya-chernik-LXHbMXfFrhw-unsplash.jpg',
    'jw-2_nt_J35jKE-unsplash.jpg',
    'margaret-polinder-3DsMhQF9aB0-unsplash.jpg',
    'margaret-polinder-NzCVjuMW6ww-unsplash.jpg',
    'nick-G7nq4FIFo_M-unsplash.jpg',
    'ries-bosch-jXHaV2nBYEE-unsplash.jpg'
  ];

  return imageFilenames.map((filename, index) => ({
    src: `/landing_page_photos/${filename}`,
    alt: `Beautiful property ${index + 1}`
  }));
};

const heroImages = generateHeroImages();

export default function Home() {
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(() =>
    Math.floor(Math.random() * heroImages.length)
  );
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
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

  // Scroll-based navigation visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
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
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

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
        className="fixed top-0 w-full z-50 bg-white shadow-sm"
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
              <nav className="hidden md:flex items-center space-x-8">
                <a href="#hoe-werkt-het" className="text-gray-700 hover:text-gray-900 transition-colors">
                  Hoe werkt het
                </a>
                <a href="#persoonlijk-biedadvies" className="text-gray-700 hover:text-gray-900 transition-colors">
                  Persoonlijk biedadvies
                </a>
                <a href="#missie-visie" className="text-gray-700 hover:text-gray-900 transition-colors">
                  Missie & visie
                </a>
                <a href="#waarom-juistebod" className="text-gray-700 hover:text-gray-900 transition-colors">
                  Waarom JuisteBod
                </a>
                <a href="#contact" className="text-gray-700 hover:text-gray-900 transition-colors">
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
                <a href="#hoe-werkt-het" className="text-gray-700 hover:text-gray-900 transition-colors">
                  Hoe werkt het
                </a>
                <a href="#persoonlijk-biedadvies" className="text-gray-700 hover:text-gray-900 transition-colors">
                  Persoonlijk biedadvies
                </a>
                <a href="#missie-visie" className="text-gray-700 hover:text-gray-900 transition-colors">
                  Missie & visie
                </a>
                <a href="#waarom-juistebod" className="text-gray-700 hover:text-gray-900 transition-colors">
                  Waarom JuisteBod
                </a>
                <a href="#contact" className="text-gray-700 hover:text-gray-900 transition-colors">
                  Contact
                </a>
              </div>
            </nav>
          )}
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image Carousel */}
        <div className="absolute inset-0 z-0">
          {heroImages.map((image, index) => (
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
                className="object-cover"
                priority={index === 0}
              />
            </div>
          ))}
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
      <section id="hoe-werkt-het" className="py-24 px-6" style={{ backgroundColor: '#FAF9F6' }}>
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
                {c('step3_text', 'Binnen 24 uur krijg je een uitgebreid bodadvies in je mailbox')}
              </p>
              <div className="text-xs text-gray-500 bg-white rounded-lg p-3 mx-auto max-w-xs min-h-[56px] flex items-center justify-center mt-auto">
                ⚡ <strong>Snel:</strong> {c('step3_tip', 'Gemiddeld binnen 12 uur geleverd')}
              </div>
            </motion.div>
          </motion.div>

          {/* Extra info */}
          <motion.div 
            className="bg-white rounded-xl p-8 shadow-lg max-w-4xl mx-auto"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Wat krijg je precies?</h3>
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">📊 Marktanalyse</h4>
                <ul className="text-gray-600 space-y-2">
                  <li>• Vergelijking met soortgelijke woningen</li>
                  <li>• Prijsontwikkeling in de buurt</li>
                  <li>• Marktcondities en vraag/aanbod</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">💡 Persoonlijk advies</h4>
                <ul className="text-gray-600 space-y-2">
                  <li>• Optimaal bodbedrag op basis van markt</li>
                  <li>• Onderhandelingsstrategie</li>
                  <li>• Tips voor het biedingsproces</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-lg font-semibold" style={{ color: '#1F3C88' }}>
                <span className="line-through text-gray-400">€{c('price_old', '75')}</span>{' '}Nu slechts €{c('price_excl_btw', '49,95')} excl. BTW (€{c('price_incl_btw', '60,44')} incl. BTW) - Geen verborgen kosten
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Persoonlijk Biedadvies Section */}
      <section id="persoonlijk-biedadvies" className="py-24 px-6" style={{ backgroundColor: '#FAF9F6' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            viewport={{ once: true, margin: "-100px" }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-gray-800">
              {c('personal_advice_title', 'Persoonlijk biedadvies')}
            </h2>
            <p className="text-lg leading-relaxed text-gray-700 max-w-3xl mx-auto">
              {c('personal_advice_intro', 'Bij Juiste bod krijg je persoonlijk biedadvies van een ervaren vastgoedprofesional. Geen algoritme, maar menselijk inzicht. Op basis van kennis van de markt, vergelijkbare woningen én strategieën die echt werken.')}
            </p>
          </motion.div>

          <motion.div 
            className="prose prose-lg max-w-none text-gray-700 space-y-6 mb-12"
            viewport={{ once: true, margin: "-100px" }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-lg leading-relaxed text-center">
              {c('personal_advice_subtext', 'Ontvang binnen 24 uur een onderbouwd advies dat je helpt slim te bieden zonder honderden euro\'s uit te geven aan een aankoopmakelaar. Geen gok, geen koude data. Gewoon het juiste bod.')}
            </p>
          </motion.div>

          <motion.div 
            className="bg-white rounded-xl p-8 shadow-lg"
            viewport={{ once: true, margin: "-100px" }}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl font-bold mb-8 text-center text-gray-800">
              Wat je krijgt met persoonlijk advies van JuisteBod.nl:
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-gray-400 font-bold text-lg">•</span>
                  <div>
                    <h4 className="font-semibold text-gray-800">{c('benefit_1_title', 'Menselijk inzicht')}</h4>
                    <p className="text-gray-600">{c('benefit_1_text', 'Geen AI, maar advies van een vastgoedprofessional')}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="text-gray-400 font-bold text-lg">•</span>
                  <div>
                    <h4 className="font-semibold text-gray-800">{c('benefit_2_title', 'Afgestemd op jouw woning')}</h4>
                    <p className="text-gray-600">{c('benefit_2_text', 'We kijken naar afwerking, ligging, populariteit van de buurt en meer')}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="text-gray-400 font-bold text-lg">•</span>
                  <div>
                    <h4 className="font-semibold text-gray-800">{c('benefit_3_title', 'Slimme biedstrategie')}</h4>
                    <p className="text-gray-600">{c('benefit_3_text', 'Niet alleen wat je moet bieden, maar ook hoe je het aanpakt')}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="text-gray-400 font-bold text-lg">•</span>
                  <div>
                    <h4 className="font-semibold text-gray-800">{c('benefit_4_title', 'Snelle levering')}</h4>
                    <p className="text-gray-600">{c('benefit_4_text', 'Binnen 24 uur jouw persoonlijke biedadvies in je mailbox')}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-gray-400 font-bold text-lg">•</span>
                  <div>
                    <h4 className="font-semibold text-gray-800">{c('benefit_5_title', 'Betaalbaar')}</h4>
                    <p className="text-gray-600">{c('benefit_5_text', 'Een fractie van de kosten van een aankoopmakelaar')}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="text-gray-400 font-bold text-lg">•</span>
                  <div>
                    <h4 className="font-semibold text-gray-800">{c('benefit_6_title', 'Onafhankelijk advies')}</h4>
                    <p className="text-gray-600">{c('benefit_6_text', 'Geen verkooppraatjes, geen belangen, alleen eerlijke informatie')}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="text-gray-400 font-bold text-lg">•</span>
                  <div>
                    <h4 className="font-semibold text-gray-800">{c('benefit_7_title', 'Meer kans op succes')}</h4>
                    <p className="text-gray-600">{c('benefit_7_text', 'Vergroot je kans om niet alleen een bod te doen, maar ook te winnen')}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Missie & Visie Section */}
      <section id="missie-visie" className="py-24 px-6" style={{ backgroundColor: '#FAF9F6' }}>
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
              <p className="text-lg leading-relaxed">
                {c('mission_text1', 'Wij geloven dat iedereen recht heeft op eerlijk en deskundig advies bij het kopen van een woning zonder dat daar hoge makelaarskosten bij komen kijken.')}
              </p>
              <p className="text-lg leading-relaxed">
                {c('mission_text2', 'Onze missie is om woningzoekers snel, helder en betaalbaar te helpen bij het bepalen van een bod. Zodat je met vertrouwen en kennis van de markt je volgende stap kan zetten!')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why JuisteBod Section */}
      <section id="waarom-juistebod" className="py-12 px-6" style={{ backgroundColor: '#FAF9F6' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="text-center"
            viewport={{ once: true, margin: "-100px" }}
            initial={{ opacity: 0, y: 30 }}
whileInView={{ opacity: 1, y: 0 }}
transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-16 text-gray-800">
              {c('why_title', 'Waarom JuisteBod.nl?')}
            </h2>
          </motion.div>
          
          <motion.div 
            className="prose prose-lg max-w-none text-gray-700 space-y-6"
            viewport={{ once: true, margin: "-100px" }}
            initial={{ opacity: 0, y: 30 }}
whileInView={{ opacity: 1, y: 0 }}
transition={{ duration: 0.6 }}
          >
            <p className="text-lg leading-relaxed">
              {c('why_text1', 'De woningmarkt is de afgelopen jaren volledig op z\'n kop gezet. Waar huizen vroeger maanden te koop stonden, is er nu amper tijd om adem te halen. Je bezichtigt een woning, en voor je het weet moet je een bod doen van tienduizenden euro\'s boven de vraagprijs — vaak zonder te weten of dat wel verstandig is.')}
            </p>
            
            <p className="text-lg leading-relaxed">
              {c('why_text2', 'Voor veel mensen, zeker starters, voelt het alsof ze constant achter het net vissen. Steeds wéér misgegrepen. Steeds te laat. Of nét niet hoog genoeg. In deze hectische markt kreeg ik steeds vaker dezelfde vraag van vrienden, kennissen en uiteindelijk vrienden van vrienden:')}
            </p>
            
            <motion.div 
              className="text-center my-12"
              viewport={{ once: true, margin: "-100px" }}
              initial={{ opacity: 0, scale: 0.8 }}
whileInView={{ opacity: 1, scale: 1 }}
transition={{ duration: 0.6 }}
            >
              <p className="text-2xl md:text-3xl font-semibold text-gray-800 italic">
                &ldquo;{c('why_quote', 'Wat moet ik bieden op dit huis?')}&rdquo;
              </p>
            </motion.div>
            
            <p className="text-lg leading-relaxed">
              {c('why_text3', 'Het viel me op hoeveel mensen, vooral starters, compleet vastlopen in het biedproces. Daarom ben ik JuisteBod.nl gestart. Geen AI-gegenereerde schatting, maar persoonlijk advies van een vastgoeddeskundige met actuele marktkennis en ervaring in het makelaarsvak.')}
            </p>
            
            <motion.div 
              className="bg-white rounded-xl p-8 shadow-lg my-12"
              viewport={{ once: true, margin: "-100px" }}
              initial={{ opacity: 0, scale: 0.8 }}
whileInView={{ opacity: 1, scale: 1 }}
transition={{ duration: 0.6 }}
            >
              <h3 className="text-2xl font-bold mb-6 text-center text-gray-800">
                {c('why_highlight_title', 'En het mooiste?')}
              </h3>
              <div className="text-center space-y-4">
                <p className="text-lg text-gray-700">
                  {c('why_highlight_text1', 'Een gemiddelde aankoopmakelaar kost al snel tussen de €1.500 en €3.000.')}
                </p>
                <p className="text-xl font-semibold" style={{ color: '#1F3C88' }}>
                  Bij JuisteBod.nl krijg je persoonlijk en professioneel advies voor slechts €{c('price_excl_btw', '49,95')} excl. BTW (€{c('price_incl_btw', '60,44')} incl. BTW).
                </p>
                <p className="text-lg font-medium" style={{ color: '#7C8471' }}>
                  {c('why_highlight_text2', 'Dezelfde kennis maar een fractie van de prijs.')}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-16 px-6" style={{ backgroundColor: '#FAF9F6', borderTop: '1px solid rgba(124, 132, 113, 0.2)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 mb-12 items-center">
            {/* Company Info */}
            <div className="text-center md:text-left">
              <div className="mb-4">
                <Image
                  src="/Juiste bod logo boven.png"
                  alt="JuisteBod.nl Logo"
                  width={250}
                  height={80}
                  className="object-contain mx-auto md:mx-0"
                />
              </div>
              <p className="text-lg underline" style={{ color: '#7C8471' }}>
                {c('footer_tagline', 'Het juiste bod op elke woning')}
              </p>
            </div>

            {/* Contact Info */}
            <div className="text-center md:text-center">
              <h3 className="text-2xl font-bold mb-4 text-gray-800">
                Neem contact op
              </h3>
              <p className="text-lg text-gray-800 mb-2">
                {c('contact_name', 'Netraam Kremer')}
              </p>
              <p className="text-lg text-gray-600">
                Email: {c('contact_email', 'info@juistebod.nl')}
              </p>
            </div>

            {/* Contact Photo */}
            <div className="flex justify-center md:justify-end">
              <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden shadow-md">
                <Image
                  src="/images/Netraam_foto.jpeg"
                  alt="Contactpersoon JuisteBod"
                  width={192}
                  height={192}
                  className="w-full h-full object-cover grayscale"
                />
              </div>
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
                className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-colors hover:scale-105 transform"
                style={{ backgroundColor: '#7C8471' }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#6b7562'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#7C8471'}
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
