"use client";

import { useState } from "react";
import Image from "next/image";
import PropertyForm from "./components/PropertyForm";
import GoogleMap from "./components/GoogleMap";
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

export default function Home() {
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null);
  const router = useRouter();

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
      <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
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
            
            {/* Navigation */}
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
            
            {/* Mobile menu button */}
            <button className="md:hidden p-2 rounded-md text-gray-700 hover:text-gray-900 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-house.jpg"
            alt="Modern house exterior"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 hero-overlay"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white max-w-2xl px-6">
          {/* Hero Logo */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <Image
              src="/Juiste bod logo balk.png"
              alt="JuisteBod.nl Logo"
              width={300}
              height={100}
              className="object-contain mx-auto filter brightness-0 invert"
              priority
            />
          </motion.div>
          
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
            Binnen 24 uur persoonlijk advies.
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
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Logo - Animated from left */}
            <motion.div 
              className="flex justify-center md:justify-start"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInLeft}
            >
              <div className="w-64 h-64 flex items-center justify-center">
                <Image
                  src="/weegschaal.png"
                  alt="JuisteBod.nl Logo - Weegschaal"
                  width={300}
                  height={300}
                  className="object-contain"
                  priority
                />
              </div>
            </motion.div>

            {/* Text Content - Animated from right */}
            <motion.div 
              className="text-gray-800 space-y-6"
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
              Social media
            </h4>
            <div className="flex justify-center space-x-6">
              <a 
                href="#" 
                className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-colors"
                style={{ backgroundColor: '#7C8471' }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#6b7562'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#7C8471'}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-colors"
                style={{ backgroundColor: '#7C8471' }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#6b7562'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#7C8471'}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-colors"
                style={{ backgroundColor: '#7C8471' }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#6b7562'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#7C8471'}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.112.221.085.343-.09.377-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
