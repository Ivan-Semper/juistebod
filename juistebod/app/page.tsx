"use client";

import { useState } from "react";
import Image from "next/image";
import PropertyForm from "./components/PropertyForm";
import GoogleMap from "./components/GoogleMap";
import { PropertyData } from "@/lib/types/PropertyTypes";

export default function Home() {
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null);

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

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF9F6' }}>
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
          <p className="text-lg md:text-xl font-light mb-4 opacity-90">
            het juiste bod op elke woning
          </p>
          <h1 className="text-4xl md:text-6xl font-bold mb-12 leading-tight">
            Binnen 24 uur persoonlijk advies.
          </h1>
          
          {/* Property Form */}
          <PropertyForm onPropertyFound={handlePropertyFound} />
        </div>
      </section>

      {/* Property Results Section */}
      {propertyData && (
        <section id="property-results" className="py-24 px-6" style={{ backgroundColor: '#FAF9F6' }}>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
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

              {/* Next Steps */}
              <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <h4 className="text-lg font-semibold mb-4 text-gray-800">Volgende Stap</h4>
                <p className="text-gray-800 mb-4">
                  Nu we je woning hebben geanalyseerd, kunnen we een professioneel bodadvies opstellen.
                </p>
                <button 
                  className="text-white px-8 py-3 rounded-full font-medium transition-colors"
                  style={{ backgroundColor: '#1F3C88' }}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#1a3278'}
                  onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#1F3C88'}
                >
                  Ga verder naar betaling
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Trust Section */}
      <section className="py-24 px-6" style={{ backgroundColor: '#FAF9F6' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Illustration */}
            <div className="flex justify-center md:justify-start">
              <div className="w-64 h-64 flex items-center justify-center">
                {/* Clean minimalist scale illustration with accent color */}
                <div className="relative">
                  <svg width="200" height="200" viewBox="0 0 200 200" style={{ color: '#7C8471' }}>
                    {/* Stick figure head */}
                    <circle cx="100" cy="40" r="20" stroke="currentColor" strokeWidth="3" fill="none" />
                    
                    {/* Stick figure body */}
                    <line x1="100" y1="60" x2="100" y2="120" stroke="currentColor" strokeWidth="3" />
                    
                    {/* Arms holding scale */}
                    <line x1="100" y1="80" x2="60" y2="70" stroke="currentColor" strokeWidth="3" />
                    <line x1="100" y1="80" x2="140" y2="70" stroke="currentColor" strokeWidth="3" />
                    
                    {/* Scale crossbar */}
                    <line x1="60" y1="70" x2="140" y2="70" stroke="currentColor" strokeWidth="3" />
                    
                    {/* Scale pans */}
                    <ellipse cx="60" cy="70" rx="15" ry="8" stroke="currentColor" strokeWidth="2" fill="none" />
                    <ellipse cx="140" cy="70" rx="15" ry="8" stroke="currentColor" strokeWidth="2" fill="none" />
                    
                    {/* Legs */}
                    <line x1="100" y1="120" x2="80" y2="160" stroke="currentColor" strokeWidth="3" />
                    <line x1="100" y1="120" x2="120" y2="160" stroke="currentColor" strokeWidth="3" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Text Content */}
            <div className="text-gray-800 space-y-6">
              <p className="text-lg leading-relaxed">
                Wij geloven dat iedereen recht heeft op eerlijk en deskundig advies bij het kopen van een woning zonder dat daar hoge makelaarskosten bij komen kijken.
              </p>
              <p className="text-lg leading-relaxed">
                Onze missie is om woningzoekers snel, helder en betaalbaar te helpen bij het bepalen van een bod. Zodat je met vertrouwen en kennis van de markt je volgende stap kan zetten!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6" style={{ backgroundColor: '#FAF9F6' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-20 text-gray-800">
            Zo werkt het
          </h2>
          
          <div className="grid md:grid-cols-3 gap-16 mb-16">
            <div className="text-center">
              <div 
                className="w-3 h-3 rounded-full mx-auto mb-8"
                style={{ backgroundColor: '#7C8471' }}
              ></div>
              <h3 className="text-2xl font-bold mb-8 text-gray-800">Woninglink</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Plak de link van je droomwoning en wij doen de rest
              </p>
            </div>
            
            <div className="text-center">
              <div 
                className="w-3 h-3 rounded-full mx-auto mb-8"
                style={{ backgroundColor: '#7C8471' }}
              ></div>
              <h3 className="text-2xl font-bold mb-8 text-gray-800">Betaal</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Veilig en snel betalen voor professioneel advies
              </p>
            </div>
            
            <div className="text-center">
              <div 
                className="w-3 h-3 rounded-full mx-auto mb-8"
                style={{ backgroundColor: '#7C8471' }}
              ></div>
              <h3 className="text-2xl font-bold mb-8 text-gray-800">juiste bod</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Ontvang binnen 24 uur je persoonlijke bodadvies
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-6" style={{ backgroundColor: '#FAF9F6' }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-20 text-center text-gray-800">
            Tevreden klanten
          </h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            {/* Testimonial 1 */}
            <div className="text-center">
              <div className="text-6xl mb-6" style={{ color: '#7C8471' }}>"</div>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Vanwege de prijsontwikkeling van je product en dienst door huurverzwaringen van eigenaars heb ik zorgvuldig voor jullie dienstverlening gekozen. Daarom is feedback van anderen die voorheen ervaring hadden.
              </p>
              <div className="font-semibold text-gray-800 text-lg">
                Nathalie Louwers
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="text-center">
              <div className="text-6xl mb-6" style={{ color: '#7C8471' }}>"</div>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Vanwege de prijsontwikkeling van je product en dienst door huurverzwaringen van eigenaars heb ik zorgvuldig voor jullie dienstverlening gekozen. Daarom is feedback van anderen die voorheen ervaring hadden.
              </p>
              <div className="font-semibold text-gray-800 text-lg">
                Ellis Steenhuis
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="text-center">
              <div className="text-6xl mb-6" style={{ color: '#7C8471' }}>"</div>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Vanwege de prijsontwikkeling van je product en dienst door huurverzwaringen van eigenaars heb ik zorgvuldig voor jullie dienstverlening gekozen. Daarom is feedback van anderen die voorheen ervaring hadden.
              </p>
              <div className="font-semibold text-gray-800 text-lg">
                Lillian Frayers
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6" style={{ backgroundColor: '#FAF9F6', borderTop: '1px solid rgba(124, 132, 113, 0.2)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 mb-12">
            {/* Company Info */}
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold mb-4 text-gray-800">
                Juistebod.nl
              </h3>
              <p className="text-lg" style={{ color: '#7C8471' }}>
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
