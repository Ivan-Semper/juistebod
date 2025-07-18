"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { 
  weegschaalBalance, 
  weegschaalFloat, 
  weegschaalPulse,
  weegschaalDrop,
  weegschaalDropDramatic,
  weegschaalSlideFromLeft
} from "@/lib/hooks/useScrollAnimation";

interface AnimatedWeegschaalProps {
  animationType?: 'balance' | 'float' | 'pulse' | 'drop' | 'dropDramatic' | 'slideFromLeft' | 'none';
  size?: number;
  className?: string;
  showOnView?: boolean;
  showRefreshButton?: boolean;
}

export default function AnimatedWeegschaal({ 
  animationType = 'balance', 
  size = 300, 
  className = "",
  showOnView = true,
  showRefreshButton = false
}: AnimatedWeegschaalProps) {
  
  const [animationKey, setAnimationKey] = useState(0);
  
  const refreshAnimation = () => {
    setAnimationKey(prev => prev + 1);
  };
  
  const getAnimationProps = () => {
    const baseProps = {
      className: `cursor-pointer ${className}`,
      initial: showOnView ? "hidden" : undefined,
      whileInView: showOnView ? "visible" : undefined,
      viewport: showOnView ? { once: true, margin: "-100px" } : undefined,
    };

    switch (animationType) {
      case 'balance':
        return {
          ...baseProps,
          whileHover: "hover",
          variants: weegschaalBalance,
        };
      case 'float':
        return {
          ...baseProps,
          animate: "animate",
          variants: weegschaalFloat,
        };
      case 'pulse':
        return {
          ...baseProps,
          animate: "pulse",
          variants: weegschaalPulse,
        };
      case 'drop':
        return {
          ...baseProps,
          variants: weegschaalDrop,
        };
      case 'dropDramatic':
        return {
          ...baseProps,
          variants: weegschaalDropDramatic,
        };
      case 'slideFromLeft':
        return {
          ...baseProps,
          variants: weegschaalSlideFromLeft,
        };
      case 'none':
        return {
          className: className,
          initial: showOnView ? { opacity: 0, scale: 0.8 } : undefined,
          whileInView: showOnView ? { opacity: 1, scale: 1 } : undefined,
          viewport: showOnView ? { once: true, margin: "-100px" } : undefined,
          transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
        };
      default:
        return baseProps;
    }
  };

  return (
    <div className="text-center">
      <motion.div key={animationKey} {...getAnimationProps()}>
        <Image
          src="/weegschaal.png"
          alt="JuisteBod.nl Logo - Weegschaal"
          width={size}
          height={size}
          className="object-contain"
          priority
        />
      </motion.div>
      
      {showRefreshButton && (
        <button
          onClick={refreshAnimation}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
        >
          🔄 Speel opnieuw af
        </button>
      )}
    </div>
  );
}

// Voorbeeld van gebruik:
// <AnimatedWeegschaal animationType="balance" size={250} />
// <AnimatedWeegschaal animationType="float" size={200} />
// <AnimatedWeegschaal animationType="pulse" size={300} />
// <AnimatedWeegschaal animationType="slideFromLeft" size={250} /> 