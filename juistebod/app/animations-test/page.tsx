"use client";

import WeegschaalDemo from "../components/WeegschaalDemo";
import AnimatedWeegschaal from "../components/AnimatedWeegschaal";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/hooks/useScrollAnimation";

export default function AnimationsTestPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF9F6' }}>
      {/* Header */}
      <header className="py-16 px-6 text-center">
        <motion.h1 
          className="text-5xl font-bold mb-4 text-gray-800"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          Animaties Test Pagina
        </motion.h1>
        <motion.p 
          className="text-xl text-gray-600 max-w-2xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          Hier kun je alle weegschaal animaties uitproberen en zien welke het beste bij jouw website past.
        </motion.p>
      </header>

      {/* Demo Section */}
      <WeegschaalDemo />

      {/* Individuele test sectie */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.h2 
            className="text-3xl font-bold mb-8 text-center text-gray-800"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            Grote Weegschaal Voorbeelden
          </motion.h2>
          
          <div className="grid md:grid-cols-2 gap-16">
            {/* Balance - Groot */}
            <motion.div 
              className="text-center bg-white rounded-lg p-8 shadow-lg"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
            >
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">
                Balance (Groot)
              </h3>
              <p className="text-gray-600 mb-8">
                Ideaal voor hero sections of prominente plaatsen
              </p>
              <div className="flex justify-center">
                <AnimatedWeegschaal 
                  animationType="balance" 
                  size={300}
                  showOnView={false}
                />
              </div>
            </motion.div>

            {/* Float - Groot */}
            <motion.div 
              className="text-center bg-white rounded-lg p-8 shadow-lg"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
            >
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">
                Float (Groot)
              </h3>
              <p className="text-gray-600 mb-8">
                Perfect voor about sections of trust indicators
              </p>
              <div className="flex justify-center">
                <AnimatedWeegschaal 
                  animationType="float" 
                  size={300}
                  showOnView={false}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Gebruik suggesties */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="bg-white rounded-lg p-8 shadow-lg"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <h3 className="text-2xl font-bold mb-6 text-gray-800">
              Gebruik Aanbevelingen
            </h3>
            
            <div className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-gray-800 mb-2">
                  🎯 Balance Animatie
                </h4>
                <p className="text-gray-600">
                  <strong>Wanneer:</strong> Voor interactieve elementen waar je gebruikers wilt uitnodigen tot interactie.<br/>
                  <strong>Waar:</strong> Hero sections, call-to-action areas, prominente logo plaatsen.
                </p>
              </div>
              
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-gray-800 mb-2">
                  🌊 Float Animatie
                </h4>
                <p className="text-gray-600">
                  <strong>Wanneer:</strong> Voor subtiele, professionele beweging die aandacht trekt zonder afleiding.<br/>
                  <strong>Waar:</strong> About sections, trust indicators, testimonials.
                </p>
              </div>
              
              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold text-gray-800 mb-2">
                  💫 Pulse Animatie
                </h4>
                <p className="text-gray-600">
                  <strong>Wanneer:</strong> Voor zachte aandacht, bijvoorbeeld bij belangrijke informatie.<br/>
                  <strong>Waar:</strong> Pricing sections, belangrijke features, notifications.
                </p>
              </div>
              
              <div className="border-l-4 border-orange-500 pl-4 bg-orange-50 rounded-r-lg">
                <h4 className="font-semibold text-gray-800 mb-2">
                  🎯 Drop Animatie <span className="text-orange-600">✨ NEW</span>
                </h4>
                <p className="text-gray-600">
                  <strong>Wanneer:</strong> Voor een dynamische, levendige indruk die vertelt dat je service "valt" zoals je verwacht.<br/>
                  <strong>Waar:</strong> Hero sections, about sections, anywhere you want to show reliability + dynamism.
                </p>
              </div>
              
              <div className="border-l-4 border-red-500 pl-4 bg-red-50 rounded-r-lg">
                <h4 className="font-semibold text-gray-800 mb-2">
                  🔥 Drop Dramatic <span className="text-red-600">🔥 NEW</span>
                </h4>
                <p className="text-gray-600">
                  <strong>Wanneer:</strong> Voor maximale impact en aandacht - gebruik spaarzaam!<br/>
                  <strong>Waar:</strong> Landing pages, belangrijke announcements, speciaal voor JuisteBod concept.
                </p>
              </div>
              
              <div className="border-l-4 border-gray-500 pl-4">
                <h4 className="font-semibold text-gray-800 mb-2">
                  🎨 Statisch
                </h4>
                <p className="text-gray-600">
                  <strong>Wanneer:</strong> Voor clean, minimale designs waar je geen afleiding wilt.<br/>
                  <strong>Waar:</strong> Footers, kleine logo's, formele contexten.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Navigatie terug */}
      <div className="py-8 px-6 text-center">
        <motion.a
          href="/"
          className="inline-block text-white px-8 py-3 rounded-full font-medium transition-all"
          style={{ backgroundColor: '#1F3C88' }}
          whileHover={{ 
            scale: 1.05,
            boxShadow: "0 10px 25px rgba(31, 60, 136, 0.3)"
          }}
          whileTap={{ scale: 0.98 }}
        >
          ← Terug naar hoofdpagina
        </motion.a>
      </div>
    </div>
  );
} 