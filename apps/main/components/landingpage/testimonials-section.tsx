"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Quote } from "lucide-react";

const testimonials = [
    { text: "SyncOrbit revolutionized our sprint planning. Meeting times cut by 40%.", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80", name: "Sarah Chen", role: "PM @ TechFlow" },
    { text: "Gamification features are genius. Engineering productivity is at an all-time high.", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80", name: "M. Rodriguez", role: "CTO @ DevCorp" },
    { text: "Finally, a tool that handles complex hierarchies without feeling clunky.", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80", name: "Dr. A. Patel", role: "Dir @ Creative" },
    { text: "Migrated from Jira in less than a day. The import tool was flawless.", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80", name: "Omar Raza", role: "Founder @ StartupX" },
    { text: "The timeline view is actually usable. Dependencies are clear.", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80", name: "Zainab H.", role: "Program Manager" },
    { text: "We needed a custom integration and built it via API in hours.", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80", name: "Aliza Khan", role: "Tech Lead" },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);

const TestimonialCard = ({ data }: { data: typeof testimonials[0] }) => (
    <div className="p-6 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
        <Quote className="w-4 h-4 text-neutral-300 mb-4" />
        <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed mb-6 font-medium">
            "{data.text}"
        </p>
        <div className="flex items-center gap-3 pt-4 border-t border-dashed border-neutral-100 dark:border-neutral-800">
            <Image src={data.image} alt={data.name} width={32} height={32} className="h-8 w-8 rounded-full grayscale" />
            <div className="flex flex-col">
                <div className="font-mono text-xs font-bold text-neutral-900 dark:text-white uppercase">{data.name}</div>
                <div className="font-mono text-[10px] text-neutral-500 uppercase">{data.role}</div>
            </div>
        </div>
    </div>
);

const TestimonialsColumn = ({ testimonials, duration, className }: { testimonials: typeof firstColumn, duration: number, className?: string }) => (
    <div className={className}>
        <motion.div
            animate={{ translateY: "-50%" }}
            transition={{ duration: duration, repeat: Infinity, ease: "linear", repeatType: "loop" }}
            className="flex flex-col gap-4 pb-4"
        >
            {
                [...new Array(2)].map((_, i) => (
                    <React.Fragment key={i}>
                        {testimonials.map((t, index) => <TestimonialCard key={index} data={t} />)}
                    </React.Fragment>
                ))
            }
        </motion.div>
    </div>
);

const Testimonials = () => {
    return (
        <section className="bg-white dark:bg-neutral-950 py-24 relative overflow-hidden border-t border-neutral-200 dark:border-neutral-800" id="testimonials">
            <div className="container max-w-7xl mx-auto px-4 text-center mb-12">
                <div className="inline-block px-2 py-1 mb-4 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-500">User_Transmissions</span>
                </div>
                <h2 className="text-4xl font-bold tracking-tighter text-neutral-900 dark:text-white">
                    Validated by <span className="text-neutral-400">Industry Leaders</span>
                </h2>
            </div>

            <div className="relative flex justify-center gap-4 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)] max-h-[600px] overflow-hidden max-w-5xl mx-auto">
                <TestimonialsColumn testimonials={firstColumn} duration={20} className="w-full md:w-1/2 lg:w-1/3" />
                <TestimonialsColumn testimonials={secondColumn} duration={25} className="hidden md:block w-full md:w-1/2 lg:w-1/3" />
                <TestimonialsColumn testimonials={firstColumn} duration={22} className="hidden lg:block w-full lg:w-1/3" />
            </div>
        </section>
    );
};

export default Testimonials;
