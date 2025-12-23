'use client'

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export const AnimatedText = () => {
    const [currentIndex, setCurrentIndex] = useState(0)
    const phrases = [
        "Learn Faster",
        "Code Better",
        "Build Smarter",
        "Debug Quicker",
        "Think Deeper"
    ]

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % phrases.length)
        }, 2000)
        return () => clearInterval(interval)
    }, [phrases.length])

    return (
        <div className="h-[95px] sm:h-[65px] overflow-hidden">
            <motion.div
                key={currentIndex}
                initial={{ y: 40 }}
                animate={{ y: 0 }}
                exit={{ y: -40 }}
                transition={{ duration: 0.5 }}
                className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400"
            >
                {phrases[currentIndex]}
            </motion.div>
        </div>
    )
}

