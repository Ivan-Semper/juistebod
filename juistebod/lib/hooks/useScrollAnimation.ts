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

// New weegschaal animations
export const weegschaalBalance = {
  hidden: { 
    opacity: 0, 
    scale: 0.8,
    rotate: 0
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    rotate: 0,
    transition: { 
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  hover: {
    scale: 1.05,
    rotate: [0, -2, 2, -1, 1, 0],
    transition: {
      rotate: {
        duration: 2,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "loop"
      },
      scale: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  }
}

export const weegschaalFloat = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.9
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { 
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  animate: {
    y: [0, -10, 0],
    rotate: [0, 1, -1, 0],
    transition: {
      y: {
        duration: 3,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "loop"
      },
      rotate: {
        duration: 4,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "loop"
      }
    }
  }
}

export const weegschaalPulse = {
  hidden: { 
    opacity: 0, 
    scale: 0.8
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  pulse: {
    scale: [1, 1.1, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "loop"
    }
  }
}

// New drop animation - weegschaal valt uit de hand en schommelt
export const weegschaalDrop = {
  hidden: { 
    opacity: 0, 
    y: -120, // Start hoger (alsof in de hand)
    scale: 0.8,
    rotate: -15 // Meer gedraaid alsof het valt
  },
  visible: { 
    opacity: 1, 
    y: 0, // Valt naar normale positie
    scale: 1,
    rotate: [0, -4, 4, -3, 3, -2, 2, -1, 1, 0], // Langere schommeling
    transition: { 
      opacity: { duration: 0.3 },
      y: { duration: 1.8, ease: [0.25, 0.46, 0.45, 0.94], type: "spring", stiffness: 80, damping: 10 },
      scale: { duration: 1.8, ease: [0.25, 0.46, 0.45, 0.94], type: "spring", stiffness: 80, damping: 10 },
      rotate: {
        duration: 3,
        ease: "easeInOut",
        delay: 1.5 // Start na de drop
      }
    }
  }
}

// Alternative drop with more dramatic fall
export const weegschaalDropDramatic = {
  hidden: { 
    opacity: 0, 
    y: -200, // Nog hoger starten
    scale: 0.7,
    rotate: -25 // Meer rotatie
  },
  visible: { 
    opacity: 1, 
    y: [0, -10, 0, -5, 0, -2, 0], // Meer bounce tijdens schommeling
    scale: 1,
    rotate: [0, -8, 8, -6, 6, -4, 4, -2, 2, -1, 1, 0], // Nog langere schommeling
    transition: { 
      opacity: { duration: 0.3 },
      scale: { duration: 2.2, ease: [0.17, 0.67, 0.83, 0.67], type: "spring", stiffness: 50, damping: 6 },
      y: {
        duration: 4,
        ease: "easeInOut",
        delay: 1.8 // Start na de drop
      },
      rotate: {
        duration: 4,
        ease: "easeInOut",
        delay: 1.8 // Start na de drop
      }
    }
  }
}

// New slide from left animation - weegschaal arm slides in from left side of screen
export const weegschaalSlideFromLeft = {
  hidden: { 
    opacity: 1, 
    x: -250, // Start zodat arm uit het scherm komt, maar weegschaal zichtbaar blijft
    scale: 1,
    rotate: 0
  },
  visible: { 
    opacity: 1, 
    x: 0, // Schuift naar normale positie
    scale: 1,
    rotate: 0,
    transition: { 
      x: { 
        duration: 1.2, // Snappiger animatie
        ease: [0.25, 0.46, 0.45, 0.94],
        type: "spring",
        stiffness: 60, // Meer stiffness voor meer impact
        damping: 15
      },
      opacity: { duration: 0.6 }
    }
  }
} 