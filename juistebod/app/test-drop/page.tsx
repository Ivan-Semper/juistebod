"use client";

import { useState } from "react";
import AnimatedWeegschaal from "../components/AnimatedWeegschaal";
import { motion } from "framer-motion";

export default function TestDropPage() {
  const [currentAnimation, setCurrentAnimation] = useState<'drop' | 'dropDramatic'>('drop');
  
  return (
    <div className="min-h-screen py-16 px-6" style={{ backgroundColor: '#FAF9F6' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 text-gray-800">
            🎯 Drop Animatie Test
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Hier kun je de drop animatie duidelijk zien! De weegschaal valt uit de hand en schommelt tot rust.
          </p>
        </div>

        {/* Animatie Selector */}
        <div className="text-center mb-12">
          <div className="inline-flex bg-white rounded-lg p-2 shadow-lg">
            <button
              onClick={() => setCurrentAnimation('drop')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                currentAnimation === 'drop' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Drop (Subtiel)
            </button>
            <button
              onClick={() => setCurrentAnimation('dropDramatic')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                currentAnimation === 'dropDramatic' 
                  ? 'bg-purple-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Drop Dramatic
            </button>
          </div>
        </div>

        {/* Grote Demo */}
        <div className="bg-white rounded-xl p-12 shadow-lg mb-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
            {currentAnimation === 'drop' ? 'Drop Animatie' : 'Drop Dramatic Animatie'}
          </h2>
          
          <div className="flex justify-center mb-8">
            <AnimatedWeegschaal 
              animationType={currentAnimation}
              size={400}
              showOnView={false}
              showRefreshButton={true}
            />
          </div>
          
          <div className="text-center">
            <p className="text-lg text-gray-600 mb-4">
              {currentAnimation === 'drop' 
                ? 'De weegschaal valt uit de hand en schommelt subtiel tot rust - professioneel en levendig.'
                : 'Dramatische val met bounce effect - meer impact en aandacht trekkend.'
              }
            </p>
          </div>
        </div>

        {/* Instructies */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold mb-6 text-gray-800 text-center">
            💡 Hoe de Drop Animatie werkt
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800">🎯 Drop (Subtiel)</h4>
              <ul className="text-gray-600 space-y-2">
                <li>• Start: Weegschaal begint hoger (-100px)</li>
                <li>• Gedraaid: Alsof het uit de hand valt (-10°)</li>
                <li>• Val: Spring physics naar normale positie</li>
                <li>• Schommeling: Zachte schommeling tot rust</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800">🔥 Drop Dramatic</h4>
              <ul className="text-gray-600 space-y-2">
                <li>• Start: Nog hoger (-150px) en meer rotatie</li>
                <li>• Val: Dramatische val met bounce effect</li>
                <li>• Beweging: Op en neer beweging tijdens val</li>
                <li>• Schommeling: Langere, meer uitgesproken schommeling</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 p-6 bg-white rounded-lg">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">🚀 Perfect voor JuisteBod omdat:</h4>
            <ul className="text-gray-600 space-y-2">
              <li>• <strong>Symbolisch:</strong> Weegschaal "valt" op de juiste plaats (zoals jouw advies)</li>
              <li>• <strong>Dynamisch:</strong> Trekt aandacht zonder afleidend te zijn</li>
              <li>• <strong>Vertrouwenwekkend:</strong> Suggereert dat je service "landt" zoals verwacht</li>
              <li>• <strong>Memorabel:</strong> Unieke animatie die mensen onthouden</li>
            </ul>
          </div>
        </div>

        {/* Navigatie */}
        <div className="text-center mt-12">
          <div className="flex justify-center gap-4">
            <a
              href="/"
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              ← Terug naar homepage
            </a>
            <a
              href="/animations-test"
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Alle animaties →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 