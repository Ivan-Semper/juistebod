"use client";

import { motion } from "framer-motion";
import AnimatedWeegschaal from "./AnimatedWeegschaal";
import { fadeInUp, staggerContainer } from "@/lib/hooks/useScrollAnimation";

export default function WeegschaalDemo() {
  return (
    <section className="py-24 px-6" style={{ backgroundColor: '#FAF9F6' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <h2 className="text-4xl font-bold mb-8 text-gray-800">
            Weegschaal Animaties Demo
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Verschillende animatie opties voor de weegschaal. Kies welke het beste bij jouw merk past.
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          {/* Balance Animatie */}
          <motion.div 
            className="text-center bg-white rounded-lg p-6 shadow-lg"
            variants={fadeInUp}
          >
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Balance
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Schommelt bij hover - perfect voor interactie
            </p>
            <div className="flex justify-center">
              <AnimatedWeegschaal 
                animationType="balance" 
                size={150}
                showOnView={false}
              />
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Hover over de weegschaal!
            </p>
          </motion.div>

          {/* Float Animatie */}
          <motion.div 
            className="text-center bg-white rounded-lg p-6 shadow-lg"
            variants={fadeInUp}
          >
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Float
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Zweeft subtiel op en neer - rustig en professioneel
            </p>
            <div className="flex justify-center">
              <AnimatedWeegschaal 
                animationType="float" 
                size={150}
                showOnView={false}
              />
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Continue animatie
            </p>
          </motion.div>

          {/* Pulse Animatie */}
          <motion.div 
            className="text-center bg-white rounded-lg p-6 shadow-lg"
            variants={fadeInUp}
          >
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Pulse
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Pulseert zacht - trekt subtiel de aandacht
            </p>
            <div className="flex justify-center">
              <AnimatedWeegschaal 
                animationType="pulse" 
                size={150}
                showOnView={false}
              />
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Zachte pulsering
            </p>
          </motion.div>

          {/* Geen Animatie */}
          <motion.div 
            className="text-center bg-white rounded-lg p-6 shadow-lg"
            variants={fadeInUp}
          >
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Statisch
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Alleen inkom animatie - minimaal en clean
            </p>
            <div className="flex justify-center">
              <AnimatedWeegschaal 
                animationType="none" 
                size={150}
                showOnView={false}
              />
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Geen continue animatie
            </p>
          </motion.div>
        </motion.div>

        {/* Drop Animaties - Nieuwe sectie */}
        <motion.div
          className="text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <h3 className="text-3xl font-bold mb-6 text-gray-800">
            🎯 Drop Animaties
          </h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            De weegschaal valt uit de hand naar beneden en schommelt tot rust - perfect voor een dynamische indruk!
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          {/* Drop Animatie */}
          <motion.div 
            className="text-center bg-white rounded-lg p-6 shadow-lg border-2 border-blue-200"
            variants={fadeInUp}
          >
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Drop <span className="text-blue-600">✨ NEW</span>
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Valt uit de hand en schommelt subtiel - professioneel en levendig
            </p>
                       <div className="flex justify-center">
             <AnimatedWeegschaal 
               animationType="drop" 
               size={150}
               showOnView={false}
               showRefreshButton={true}
             />
           </div>
            <p className="text-xs text-gray-500 mt-4">
              Valt + schommelt tot rust
            </p>
          </motion.div>

          {/* Drop Dramatic Animatie */}
          <motion.div 
            className="text-center bg-white rounded-lg p-6 shadow-lg border-2 border-purple-200"
            variants={fadeInUp}
          >
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Drop Dramatic <span className="text-purple-600">🔥 NEW</span>
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Meer dramatische val met bounce - trekt veel aandacht
            </p>
                         <div className="flex justify-center">
               <AnimatedWeegschaal 
                 animationType="dropDramatic" 
                 size={150}
                 showOnView={false}
                 showRefreshButton={true}
               />
             </div>
            <p className="text-xs text-gray-500 mt-4">
              Dramatische val + bounce
            </p>
          </motion.div>
        </motion.div>

        {/* Implementatie Code */}
        <motion.div
          className="mt-16 bg-gray-900 rounded-lg p-6 text-left"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <h3 className="text-xl font-semibold mb-4 text-white">
            Implementatie Code
          </h3>
          <pre className="text-green-400 text-sm overflow-x-auto">
            <code>{`// Gebruik de AnimatedWeegschaal component:
import AnimatedWeegschaal from './components/AnimatedWeegschaal';

// Balance animatie (hover effect):
<AnimatedWeegschaal animationType="balance" size={300} />

// Float animatie (continue zweef effect):
<AnimatedWeegschaal animationType="float" size={300} />

// Pulse animatie (zachte pulsering):
<AnimatedWeegschaal animationType="pulse" size={300} />

// 🎯 DROP ANIMATIES - NIEUW!
// Drop animatie (valt uit hand, schommelt subtiel):
<AnimatedWeegschaal animationType="drop" size={300} />

// Drop dramatic (dramatische val met bounce):
<AnimatedWeegschaal animationType="dropDramatic" size={300} />

// Statisch (alleen inkom animatie):
<AnimatedWeegschaal animationType="none" size={300} />

// Custom eigenschappen:
<AnimatedWeegschaal 
  animationType="drop" 
  size={250} 
  className="custom-class"
  showOnView={true}
/>`}</code>
          </pre>
        </motion.div>
      </div>
    </section>
  );
} 