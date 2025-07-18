"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import PropertyForm from "./components/PropertyForm";
import GoogleMap from "./components/GoogleMap";
import AnimatedWeegschaal from "./components/AnimatedWeegschaal";
import { PropertyData } from "@/lib/types/PropertyTypes";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  useScrollAnimation, 
  fadeInUp, 
  fadeInLeft, 
  fadeInRight, 
  staggerContainer, 
  scaleIn
} from "@/lib/hooks/useScrollAnimation";

// Hero carousel images - automatisch gegenereerd uit folder
const generateHeroImages = () => {
  // Alleen de afbeeldingen die echt bestaan in de landing_page_photos folder
  const imageFilenames = [
    'artists-eyes-tHV0jeh_Yd4-unsplash.jpg',
    'anya-chernik-LXHbMXfFrhw-unsplash.jpg'
  ];

  return imageFilenames.map((filename, index) => ({
    src: `/landing_page_photos/${filename}`,
    alt: `Beautiful property ${index + 1}`
  }));
};

const heroImages = generateHeroImages();

export default function Home() {
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const router = useRouter();

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

  const handlePropertyFound = (data: PropertyData) => {
    setPropertyData(data);
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
      // Store property data in session storage for checkout page
      sessionStorage.setItem('propertyData', JSON.stringify(propertyData));
      router.push('/checkout');
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF9F6' }}>
      {/* Header Navigation */}
      <motion.header 
        className="fixed top-0 w-full z-50 bg-white/50 backdrop-blur-md shadow-sm"
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
              <a href="#" className="cursor-pointer">
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
                <a href="#waarom-juistebod" className="text-gray-700 hover:text-gray-900 transition-colors">
                  Waarom ons
                </a>
                <a href="#testimonials" className="text-gray-700 hover:text-gray-900 transition-colors">
                  Reviews
                </a>
                <a href="#contact" className="text-gray-700 hover:text-gray-900 transition-colors">
                  Contact
                </a>
              </nav>
              <button className="md:hidden p-2 rounded-md text-gray-700 hover:text-gray-900 transition-colors ml-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
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
            <span className="underline">Het juiste bod op elke woning</span>
          </motion.p>
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-12 leading-tight"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            Persoonlijk Woningbod advies
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
                Woning Gegevens
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Property Details */}
                <div>
                  <h3 className="text-xl font-semibold mb-4" style={{ color: '#7C8471' }}>
                    {propertyData.title}
                  </h3>
                  <div className="space-y-3">
                    <p className="text-gray-800"><strong>Adres:</strong> {propertyData.address}</p>
                    <p className="text-gray-800"><strong>Prijs:</strong> {propertyData.price}</p>
                    <p className="text-gray-800"><strong>Type:</strong> {propertyData.propertyType}</p>
                    <p className="text-gray-800"><strong>Oppervlakte:</strong> {propertyData.surface}</p>
                    <p className="text-gray-800"><strong>Kamers:</strong> {propertyData.rooms}</p>
                    <p className="text-gray-800"><strong>Bouwjaar:</strong> {propertyData.yearBuilt}</p>
                  </div>
                </div>

                {/* Google Map with Location */}
                <div>
                  <GoogleMap 
                    address={propertyData.address}
                    propertyTitle={propertyData.title}
                    onMapLoaded={() => console.log('Map loaded successfully')}
                  />
                </div>
              </div>

              {/* Property Image (if available) */}
              {propertyData.images.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-lg font-semibold mb-4 text-gray-800">Foto's</h4>
                  <img 
                    src={propertyData.images[0]} 
                    alt="Property" 
                    className="w-full max-w-2xl h-64 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Description */}
              {propertyData.description && (
                <div className="mt-8">
                  <h4 className="text-lg font-semibold mb-4 text-gray-800">Omschrijving</h4>
                  <p className="text-gray-800 leading-relaxed">
                    {propertyData.description}
                  </p>
                </div>
              )}

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

      {/* Trust Section */}
      <section className="py-24 px-6" style={{ backgroundColor: '#FAF9F6' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-end">
            {/* Weegschaal - neemt 5 kolommen links */}
            <div className="lg:col-span-5 flex justify-center lg:justify-start h-full self-end">
              <AnimatedWeegschaal 
                animationType="slideFromLeft"
                size={500}
                showOnView={true}
                showRefreshButton={true}
              />
            </div>

            {/* Text Content - neemt 7 kolommen rechts */}
            <motion.div 
              className="lg:col-span-7 text-gray-800 space-y-6 flex flex-col justify-end min-h-[400px]"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInRight}
            >
              <p className="text-lg leading-relaxed">
                Wij geloven dat iedereen recht heeft op eerlijk en deskundig advies bij het kopen van een woning zonder dat daar hoge makelaarskosten bij komen kijken.
              </p>
              <p className="text-lg leading-relaxed">
                Onze missie is om woningzoekers snel, helder en betaalbaar te helpen bij het bepalen van een bod. Zodat je met vertrouwen en kennis van de markt je volgende stap kan zetten!
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="hoe-werkt-het" className="py-24 px-6" style={{ backgroundColor: '#FAF9F6' }}>
        <div className="max-w-6xl mx-auto text-center">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold mb-20 text-gray-800"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            Zo werkt het
          </motion.h2>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-12 mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {/* Stap 1 */}
            <motion.div className="relative text-center" variants={fadeInUp}>
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-2xl font-bold"
                style={{ backgroundColor: '#1F3C88' }}
              >
                1
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Plak je Funda link</h3>
              <p className="text-lg text-gray-600 leading-relaxed mb-4">
                Kopieer de URL van de woning die je wilt kopen en plak deze in ons formulier
              </p>
              <div className="text-sm text-gray-500 bg-white rounded-lg p-4 mx-auto max-w-xs">
                💡 <strong>Tip:</strong> Werkt met alle Funda woningen
              </div>
              
              {/* Arrow */}
              <div className="hidden md:block absolute -right-6 top-8">
                <svg width="48" height="24" viewBox="0 0 48 24" className="text-gray-300">
                  <path d="M36 12L40 8V10H48V14H40V16L36 12Z" fill="currentColor"/>
                  <path d="M0 11H36V13H0V11Z" fill="currentColor"/>
                </svg>
              </div>
            </motion.div>
            
            {/* Stap 2 */}
            <motion.div className="relative text-center" variants={fadeInUp}>
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-2xl font-bold"
                style={{ backgroundColor: '#1F3C88' }}
              >
                2
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Vul je gegevens in</h3>
              <p className="text-lg text-gray-600 leading-relaxed mb-4">
                Vertel ons over jezelf en je woonsituatie voor een persoonlijk advies
              </p>
              <div className="text-sm text-gray-500 bg-white rounded-lg p-4 mx-auto max-w-xs">
                🔒 <strong>Veilig:</strong> Al je gegevens worden veilig opgeslagen
              </div>
              
              {/* Arrow */}
              <div className="hidden md:block absolute -right-6 top-8">
                <svg width="48" height="24" viewBox="0 0 48 24" className="text-gray-300">
                  <path d="M36 12L40 8V10H48V14H40V16L36 12Z" fill="currentColor"/>
                  <path d="M0 11H36V13H0V11Z" fill="currentColor"/>
                </svg>
              </div>
            </motion.div>
            
            {/* Stap 3 */}
            <motion.div className="text-center" variants={fadeInUp}>
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-2xl font-bold"
                style={{ backgroundColor: '#7C8471' }}
              >
                3
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Ontvang je rapport</h3>
              <p className="text-lg text-gray-600 leading-relaxed mb-4">
                Binnen 24 uur krijg je een uitgebreid bodadvies in je mailbox
              </p>
              <div className="text-sm text-gray-500 bg-white rounded-lg p-4 mx-auto max-w-xs">
                ⚡ <strong>Snel:</strong> Gemiddeld binnen 12 uur geleverd
              </div>
            </motion.div>
          </motion.div>

          {/* Extra info */}
          <motion.div 
            className="bg-white rounded-xl p-8 shadow-lg max-w-4xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={scaleIn}
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
                ✅ Alles voor slechts €49 - Geen verborgen kosten
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why JuisteBod Section */}
      <section id="waarom-juistebod" className="py-24 px-6" style={{ backgroundColor: '#FAF9F6' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-16 text-gray-800">
              Waarom JuisteBod.nl?
            </h2>
          </motion.div>
          
          <motion.div 
            className="prose prose-lg max-w-none text-gray-700 space-y-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <p className="text-lg leading-relaxed">
              De woningmarkt is de afgelopen jaren volledig op z'n kop gezet. 
              Waar huizen vroeger maanden te koop stonden, is er nu amper tijd om adem te halen. Je bezichtigt 
              een woning, en voor je het weet moet je een bod doen van tienduizenden euro's boven de vraagprijs 
              — vaak zonder te weten of dat wel verstandig is.
            </p>
            
            <p className="text-lg leading-relaxed">
              Voor veel mensen, zeker starters, voelt het alsof ze constant achter het net vissen. Steeds wéér 
              misgegrepen. Steeds te laat. Of nét niet hoog genoeg. In deze hectische markt kreeg ik steeds vaker 
              dezelfde vraag van vrienden, kennissen en uiteindelijk vrienden van vrienden:
            </p>
            
            <motion.div 
              className="text-center my-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={scaleIn}
            >
              <p className="text-2xl md:text-3xl font-semibold text-gray-800 italic">
                "Wat moet ik bieden op dit huis?"
              </p>
            </motion.div>
            
            <p className="text-lg leading-relaxed">
              Het viel me op hoeveel mensen, vooral starters, compleet vastlopen in het biedproces. 
              Daarom ben ik JuisteBod.nl gestart. Geen AI-gegenereerde schatting, maar persoonlijk advies van 
              een vastgoeddeskundige met actuele marktkennis en ervaring in het makelaarsvak.
            </p>
            
            <motion.div 
              className="bg-white rounded-xl p-8 shadow-lg my-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={scaleIn}
            >
              <h3 className="text-2xl font-bold mb-6 text-center text-gray-800">
                En het mooiste?
              </h3>
              <div className="text-center space-y-4">
                <p className="text-lg text-gray-700">
                  Een gemiddelde aankoopmakelaar kost al snel tussen de €1.500 en €3.000.
                </p>
                <p className="text-xl font-semibold" style={{ color: '#1F3C88' }}>
                  Bij JuisteBod.nl krijg je persoonlijk en professioneel advies voor slechts €49,95.
                </p>
                <p className="text-lg font-medium" style={{ color: '#7C8471' }}>
                  Dezelfde kennis maar een fractie van de prijs.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose JuisteBod Section */}
      <section className="py-24 px-6" style={{ backgroundColor: '#FAF9F6' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-gray-800">
              Persoonlijk biedadvies
            </h2>
            <p className="text-lg leading-relaxed text-gray-700 max-w-3xl mx-auto">
              Bij Juiste bod krijg je persoonlijk biedadvies van een ervaren vastgoedprofesional. 
              Geen algoritme, maar menselijk inzicht. Op basis van kennis van de markt, 
              vergelijkbare woningen én strategieën die echt werken.
            </p>
          </motion.div>

          <motion.div 
            className="prose prose-lg max-w-none text-gray-700 space-y-6 mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <p className="text-lg leading-relaxed text-center">
              Ontvang binnen 24 uur een onderbouwd advies dat je helpt slim te bieden zonder 
              honderden euro's uit te geven aan een aankoopmakelaar. 
              Geen gok, geen koude data. Gewoon het juiste bod.
            </p>
          </motion.div>

          <motion.div 
            className="bg-white rounded-xl p-8 shadow-lg"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={scaleIn}
          >
            <h3 className="text-2xl font-bold mb-8 text-center text-gray-800">
              Wat je krijgt met persoonlijk advies van JuisteBod.nl:
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-green-600 font-bold text-lg">✅</span>
                  <div>
                    <h4 className="font-semibold text-gray-800">Menselijk inzicht</h4>
                    <p className="text-gray-600">Geen AI, maar advies van een vastgoedprofessional</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="text-green-600 font-bold text-lg">✅</span>
                  <div>
                    <h4 className="font-semibold text-gray-800">Afgestemd op jouw woning</h4>
                    <p className="text-gray-600">We kijken naar afwerking, ligging, populariteit van de buurt en meer</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="text-green-600 font-bold text-lg">✅</span>
                  <div>
                    <h4 className="font-semibold text-gray-800">Slimme biedstrategie</h4>
                    <p className="text-gray-600">Niet alleen wat je moet bieden, maar ook hoe je het aanpakt</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="text-green-600 font-bold text-lg">✅</span>
                  <div>
                    <h4 className="font-semibold text-gray-800">Snelle levering</h4>
                    <p className="text-gray-600">Binnen 24 uur jouw persoonlijke biedadvies in je mailbox</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-green-600 font-bold text-lg">✅</span>
                  <div>
                    <h4 className="font-semibold text-gray-800">Betaalbaar</h4>
                    <p className="text-gray-600">Slechts €49,95 in plaats van duizenden euro's voor een aankoopmakelaar</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="text-green-600 font-bold text-lg">✅</span>
                  <div>
                    <h4 className="font-semibold text-gray-800">Onafhankelijk advies</h4>
                    <p className="text-gray-600">Geen verkooppraatjes, geen belangen, alleen eerlijke informatie</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="text-green-600 font-bold text-lg">✅</span>
                  <div>
                    <h4 className="font-semibold text-gray-800">Meer kans op succes</h4>
                    <p className="text-gray-600">Vergroot je kans om niet alleen een bod te doen, maar ook te winnen</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-6" style={{ backgroundColor: '#FAF9F6' }}>
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold mb-20 text-center text-gray-800"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            Tevreden klanten
          </motion.h2>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {/* Testimonial 1 */}
            <motion.div className="text-center" variants={fadeInUp}>
              <div className="text-6xl mb-6" style={{ color: '#7C8471' }}>"</div>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Vanwege de prijsontwikkeling van je product en dienst door huurverzwaringen van eigenaars heb ik zorgvuldig voor jullie dienstverlening gekozen. Daarom is feedback van anderen die voorheen ervaring hadden.
              </p>
              <div className="font-semibold text-gray-800 text-lg">
                Nathalie Louwers
              </div>
            </motion.div>

            {/* Testimonial 2 */}
            <motion.div className="text-center" variants={fadeInUp}>
              <div className="text-6xl mb-6" style={{ color: '#7C8471' }}>"</div>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Vanwege de prijsontwikkeling van je product en dienst door huurverzwaringen van eigenaars heb ik zorgvuldig voor jullie dienstverlening gekozen. Daarom is feedback van anderen die voorheen ervaring hadden.
              </p>
              <div className="font-semibold text-gray-800 text-lg">
                Ellis Steenhuis
              </div>
            </motion.div>

            {/* Testimonial 3 */}
            <motion.div className="text-center" variants={fadeInUp}>
              <div className="text-6xl mb-6" style={{ color: '#7C8471' }}>"</div>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Vanwege de prijsontwikkeling van je product en dienst door huurverzwaringen van eigenaars heb ik zorgvuldig voor jullie dienstverlening gekozen. Daarom is feedback van anderen die voorheen ervaring hadden.
              </p>
              <div className="font-semibold text-gray-800 text-lg">
                Lillian Frayers
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-16 px-6" style={{ backgroundColor: '#FAF9F6', borderTop: '1px solid rgba(124, 132, 113, 0.2)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 mb-12">
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
                Het juiste bod op elke woning
              </p>
            </div>

            {/* Contact Info */}
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold mb-4 text-gray-800">
                Neem contact op
              </h3>
              <p className="text-lg text-gray-600 mb-2">
                Telefoon: 06-12345678
              </p>
              <p className="text-lg text-gray-600">
                Email: info@juistebod.nl
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
                href="https://www.instagram.com/juistebod?igsh=MXBxZXNpbDRmbXRx" 
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
          </div>
        </div>
      </footer>
    </div>
  );
}
