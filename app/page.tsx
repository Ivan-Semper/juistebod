"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import PropertyForm from "./components/PropertyForm";
import GoogleMap from "./components/GoogleMap";
import AnimatedWeegschaal from "./components/AnimatedWeegschaal";
import { PropertyData } from "@/lib/types/PropertyTypes";
import { useRouter } from "next/navigation";
import { motion, MotionConfig } from "framer-motion";
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
    <MotionConfig reducedMotion="user">
    <div className="min-h-screen" style={{ backgroundColor: '#FAF9F6' }}>
      {/* Header Navigation */}
      <motion.header
        className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-900/5 shadow-[0_1px_3px_rgba(16,24,40,0.06)]"
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
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex items-center w-full">
            {/* Logo helemaal links, nooit kleiner */}
            <div className="flex-shrink-0">
              <a href="/" className="cursor-pointer">
                <Image
                  src="/Juistebod logo voorkant.png"
                  alt="JuisteBod.nl Logo"
                  width={180}
                  height={45}
                  className="object-contain transition-opacity hover:opacity-80"
                  priority
                />
              </a>
            </div>
            {/* Navigation + mobile button helemaal rechts */}
            <div className="flex flex-1 items-center justify-end">
              <nav className="hidden md:flex items-center gap-1">
                <a href="#hoe-werkt-het" className="rounded-full px-4 py-2 text-[15px] font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900">
                  Hoe werkt het
                </a>
                <a href="#missie-visie" className="rounded-full px-4 py-2 text-[15px] font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900">
                  Missie & visie
                </a>
                <a href="#contact" className="rounded-full px-4 py-2 text-[15px] font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900">
                  Contact
                </a>
                <a
                  href="#home"
                  className="ml-3 inline-flex items-center gap-2 rounded-full bg-[#1F3C88] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#162E6B] hover:shadow-md"
                >
                  Start aanvraag
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12l-7.5 7.5M21 12H3" />
                  </svg>
                </a>
              </nav>
              <button
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="md:hidden p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors ml-4"
                aria-label="Menu"
                aria-expanded={isMenuOpen}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
          {isMenuOpen && (
            <nav className="md:hidden mt-3 border-t border-gray-200 pt-3 pb-2">
              <div className="flex flex-col space-y-1 text-center">
                <a href="#hoe-werkt-het" onClick={() => setIsMenuOpen(false)} className="rounded-lg px-3 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900">
                  Hoe werkt het
                </a>
                <a href="#missie-visie" onClick={() => setIsMenuOpen(false)} className="rounded-lg px-3 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900">
                  Missie & visie
                </a>
                <a href="#contact" onClick={() => setIsMenuOpen(false)} className="rounded-lg px-3 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900">
                  Contact
                </a>
              </div>
            </nav>
          )}
        </div>
      </motion.header>

      {/* Hero Section */}
      <section id="home" className="relative flex h-svh min-h-[600px] items-center justify-center overflow-hidden">
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
                  className={`object-cover ${index === currentImageIndex ? 'animate-kenburns' : ''}`}
                  priority={index === 0}
                />
              </div>
            );
          })}
          <div className="absolute inset-0 hero-overlay"></div>
        </div>



        {/* Hero Content */}
        <div className="relative z-10 text-center text-white max-w-3xl px-6">
          <motion.p
            className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-white/80 md:text-sm"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {c('hero_subtitle', 'Het juiste bod op elke woning')}
          </motion.p>
          <motion.h1
            className="font-serif text-5xl leading-[1.08] tracking-tight text-balance mb-10 md:text-7xl [text-shadow:0_2px_24px_rgba(0,0,0,0.35)]"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {c('hero_title', 'Persoonlijk woningbodadvies')}
          </motion.h1>

          {/* Property Form */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
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
      <section id="expertise" style={{ backgroundColor: '#1F3C88' }}>
        <motion.div
          className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:gap-20 md:py-28"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-white/50">
              Onze aanpak
            </p>
            <h2 className="font-serif text-5xl leading-[1.05] tracking-tight text-white md:text-6xl">
              Geen AI,<br />maar ervaring
            </h2>
          </div>
          <div className="space-y-6 text-white">
            <p className="text-base leading-relaxed text-white/80 md:text-lg">
              Onze makelaars stellen ieder rapport zorgvuldig samen op basis van uitgebreide en exclusieve
              marktdata, opgebouwd uit meer dan 100.000+ woningtransacties per jaar. Deze datagrondslag geeft
              een zeer compleet, actueel en op de meest recente data gebaseerd beeld van de woningmarkt en
              vormt de basis voor een nauwkeurige waardebepaling.
            </p>
            <p className="text-base leading-relaxed text-white/80 md:text-lg">
              Elk rapport wordt handmatig opgesteld en gecontroleerd door ervaren makelaars. Zij analyseren de
              marktdata, wegen alle relevante factoren en vertalen dit naar een onderbouwd en realistisch advies.
            </p>
            <p className="text-base leading-relaxed text-white/80 md:text-lg">
              Zo ben je verzekerd van een professioneel en betrouwbaar rapport waarop je met vertrouwen je
              volgende stap kunt baseren.
            </p>
          </div>
        </motion.div>

        {/* Stats strip */}
        <div className="border-t border-white/10">
          <motion.div
            className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-white/10 px-6 sm:grid-cols-3 sm:divide-x sm:divide-y-0"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            <div className="py-8 text-center sm:py-10">
              <p className="font-serif text-3xl text-white md:text-4xl">100.000+</p>
              <p className="mt-1 text-sm text-white/60">woningtransacties als datagrondslag</p>
            </div>
            <div className="py-8 text-center sm:py-10">
              <p className="font-serif text-3xl text-white md:text-4xl">48 uur</p>
              <p className="mt-1 text-sm text-white/60">van aanvraag tot rapport in je inbox</p>
            </div>
            <div className="py-8 text-center sm:py-10">
              <p className="font-serif text-3xl text-white md:text-4xl">100%</p>
              <p className="mt-1 text-sm text-white/60">opgesteld door ervaren makelaars</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* USP Section */}
      <section className="py-20 px-6 md:py-24" style={{ backgroundColor: '#FAF9F6' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-6 md:grid-cols-3">
            <motion.div
              className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-900/5 transition-shadow duration-300 hover:shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0 }}
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl" style={{ backgroundColor: '#1F3C88' }}>
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold leading-snug text-gray-900">
                Binnen 48 uur een volledig en onderbouwd adviesrapport
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Geen wekenlang wachten: je ontvangt het rapport snel en compleet in je mailbox.
              </p>
            </motion.div>

            <motion.div
              className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-900/5 transition-shadow duration-300 hover:shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl" style={{ backgroundColor: '#1F3C88' }}>
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold leading-snug text-gray-900">
                Inclusief 7 slimme biedtips voor een sterkere positie
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Praktische onderhandeltips waarmee je direct het verschil maakt op de woningmarkt.
              </p>
            </motion.div>

            <motion.div
              className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-900/5 transition-shadow duration-300 hover:shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl" style={{ backgroundColor: '#1F3C88' }}>
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold leading-snug text-gray-900">
                Altijd samengesteld door ervaren makelaars, geen AI
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Menselijk inzicht en actuele marktkennis vormen de basis van elk advies.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Property Results Section */}
      {propertyData && (
        <section id="property-results" className="py-24 px-6" style={{ backgroundColor: '#FAF9F6' }}>
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="bg-white rounded-2xl shadow-lg ring-1 ring-gray-900/5 p-8 mb-8"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <h2 className="font-serif text-3xl tracking-tight mb-6 text-gray-900">
                Woning overzicht
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
              <div className="mt-8 p-6 rounded-xl bg-gray-50 ring-1 ring-gray-900/5">
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
      <section id="hoe-werkt-het" className="py-24 px-6 scroll-mt-20 md:py-28" style={{ backgroundColor: '#FAF9F6' }}>
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">
              In drie stappen
            </p>
            <h2 className="font-serif text-4xl tracking-tight text-gray-900 mb-16 md:text-5xl md:mb-20">
              {c('how_it_works_title', 'Zo werkt het')}
            </h2>
          </motion.div>

          <motion.div
            className="relative grid gap-12 md:grid-cols-3 md:gap-10 mb-20 items-stretch"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, staggerChildren: 0.2 }}
          >
            {/* Verbindingslijn tussen de stappen (alleen desktop) */}
            <div className="pointer-events-none absolute left-[18%] right-[18%] top-8 hidden border-t-2 border-dashed border-gray-300 md:block" aria-hidden="true" />

            {/* Stap 1 */}
            <motion.div
              className="relative flex h-full flex-col items-center text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div
                className="relative z-10 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full font-serif text-2xl text-white shadow-md ring-4 ring-[#FAF9F6]"
                style={{ backgroundColor: '#1F3C88' }}
              >
                1
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">{c('step1_title', 'Vul je adres in')}</h3>
              <p className="mb-5 leading-relaxed text-gray-600">
                {c('step1_text', 'Vul postcode en huisnummer in om de locatie te vinden. Funda-link is verplicht voor het bodadvies.')}
              </p>
              <div className="mx-auto mt-auto flex min-h-[56px] max-w-xs items-center justify-center gap-1.5 rounded-xl bg-white p-3 text-xs text-gray-500 shadow-sm ring-1 ring-gray-900/5">
                💡 <strong>Tip:</strong> {c('step1_tip', 'Funda-link helpt bij persoonlijk advies')}
              </div>
            </motion.div>

            {/* Stap 2 */}
            <motion.div
              className="relative flex h-full flex-col items-center text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div
                className="relative z-10 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full font-serif text-2xl text-white shadow-md ring-4 ring-[#FAF9F6]"
                style={{ backgroundColor: '#1F3C88' }}
              >
                2
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">{c('step2_title', 'Vul je gegevens in')}</h3>
              <p className="mb-5 leading-relaxed text-gray-600">
                {c('step2_text', 'Vul je contactgegevens in zodat we het advies persoonlijk kunnen maken.')}
              </p>
              <div className="mx-auto mt-auto flex min-h-[56px] max-w-xs items-center justify-center gap-1.5 rounded-xl bg-white p-3 text-xs text-gray-500 shadow-sm ring-1 ring-gray-900/5">
                🔒 <strong>Veilig:</strong> {c('step2_tip', 'Al je gegevens worden veilig opgeslagen')}
              </div>
            </motion.div>

            {/* Stap 3 */}
            <motion.div
              className="relative flex h-full flex-col items-center text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div
                className="relative z-10 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full font-serif text-2xl text-white shadow-md ring-4 ring-[#FAF9F6]"
                style={{ backgroundColor: '#1F3C88' }}
              >
                3
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">{c('step3_title', 'Ontvang je rapport')}</h3>
              <p className="mb-5 leading-relaxed text-gray-600">
                {c('step3_text', 'Binnen 48 uur ontvang je een volledig en onderbouwd adviesrapport in je mailbox')}
              </p>
              <div className="mx-auto mt-auto flex min-h-[56px] max-w-xs items-center justify-center gap-1.5 rounded-xl bg-white p-3 text-xs text-gray-500 shadow-sm ring-1 ring-gray-900/5">
                ✓ <strong>Betrouwbaar:</strong> {c('step3_tip', 'Handmatig opgesteld door ervaren makelaars')}
              </div>
            </motion.div>
          </motion.div>

          {/* Prijs */}
          <motion.div
            className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-900/5 md:p-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">
              Eén vaste prijs
            </p>
            <div className="flex items-baseline justify-center gap-2">
              <span className="font-serif text-5xl tracking-tight" style={{ color: '#1F3C88' }}>€199,95</span>
              <span className="text-gray-500">excl. btw</span>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              €241,94 incl. btw · Eenmalig · Geen verborgen kosten
            </p>
            <a
              href="#home"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#1F3C88] px-7 py-3 font-semibold text-white shadow-md transition-all hover:bg-[#162E6B] hover:shadow-lg"
            >
              Start je aanvraag
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12l-7.5 7.5M21 12H3" />
              </svg>
            </a>
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
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">Onze missie</p>
              <h2 className="font-serif text-4xl tracking-tight text-gray-900 md:text-5xl">Over ons</h2>
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
      <footer id="contact" className="scroll-mt-20 border-t border-gray-900/10 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-12 md:grid-cols-3">
            {/* Brand */}
            <div>
              <p className="font-serif text-2xl tracking-tight text-gray-900">JuisteBod.nl</p>
              <p className="mt-2 text-gray-500">
                {c('footer_tagline', 'Het juiste bod op elke woning')}
              </p>
              <p className="mt-6 text-sm text-gray-400">
                KvK: {c('kvk_number', '97900443')}
              </p>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-gray-400">
                Contact
              </h3>
              <p className="mt-4 text-gray-600">
                Neem contact op met ons team
              </p>
              <a
                href={`mailto:${c('contact_email', 'info@juistebod.nl')}`}
                className="mt-1 inline-block font-medium text-[#1F3C88] transition-colors hover:text-[#162E6B] hover:underline"
              >
                {c('contact_email', 'info@juistebod.nl')}
              </a>
              <div className="mt-5">
                <a
                  href={c('instagram_url', 'https://www.instagram.com/juistebod?igsh=MXBxZXNpbDRmbXRx')}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Volg JuisteBod op Instagram"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full text-white transition-all hover:scale-105"
                  style={{ backgroundColor: '#7C8471' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#6b7562'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7C8471'; }}
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-gray-400">
                Navigatie
              </h3>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <a href="#hoe-werkt-het" className="text-gray-600 transition-colors hover:text-gray-900">Hoe werkt het</a>
                </li>
                <li>
                  <a href="#missie-visie" className="text-gray-600 transition-colors hover:text-gray-900">Missie & visie</a>
                </li>
                <li>
                  <a href="#home" className="text-gray-600 transition-colors hover:text-gray-900">Start aanvraag</a>
                </li>
                <li>
                  <a href="/privacy" className="text-gray-600 transition-colors hover:text-gray-900">Privacybeleid</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-900/10">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-sm text-gray-400 sm:flex-row">
            <p>© {new Date().getFullYear()} JuisteBod.nl — Alle rechten voorbehouden</p>
            <p>Veilig betalen via Mollie</p>
          </div>
        </div>
      </footer>
    </div>
    </MotionConfig>
  );
}
