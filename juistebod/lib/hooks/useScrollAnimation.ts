import { useInView } from 'framer-motion'
import { useRef } from 'react'

export function useScrollAnimation(threshold = 0.1) {
  const ref = useRef(null)
  const isInView = useInView(ref, { 
    threshold,
    once: true, // Only animate once
    margin: "-100px 0px" // Start animation 100px before element comes into view
  })
  
  return { ref, isInView }
}

// Pre-defined animation variants
export const fadeInUp = {
  hidden: { 
    opacity: 0, 
    y: 60,
    transition: { duration: 0.6 }
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] // Custom easing
    }
  }
}

export const fadeInLeft = {
  hidden: { 
    opacity: 0, 
    x: -100,
    transition: { duration: 0.8 }
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { 
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

export const fadeInRight = {
  hidden: { 
    opacity: 0, 
    x: 100,
    transition: { duration: 0.8 }
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { 
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

export const fadeIn = {
  hidden: { 
    opacity: 0,
    transition: { duration: 0.6 }
  },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // Delay between child animations
      delayChildren: 0.1
    }
  }
}

export const scaleIn = {
  hidden: { 
    opacity: 0, 
    scale: 0.8,
    transition: { duration: 0.6 }
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
} 