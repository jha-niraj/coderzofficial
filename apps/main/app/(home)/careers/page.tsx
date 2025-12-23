'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { AlertCircle, Sparkles } from 'lucide-react';
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { Badge } from '@/components/ui/badge'
import ShimmerButton from '@/components/ui/shimmer-button'
import ShineBorder from '@/components/ui/shine-border'
import { RainbowButton } from '@/components/ui/rainbow-button'
import axios from 'axios'
import Link from 'next/link'
import { toast } from 'sonner'

interface JobListingProps {
    title: string;
    description: string;
    requirements: string[];
}
export default function CareersPage() {
    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        github: "",
        linkedin: "",
        position: "",
        coverletter: ""
    })

    const openForm = () => setIsFormOpen(true);
    const closeForm = () => setIsFormOpen(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
        const { id, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [id]: value,
        }));
    };
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await axios.post("/api/applications", formData);
            toast(response.data.msg, {
                description: "We will be contacting you as soon as possible and if you fit the profile, we will schedule an interview."
            });
        } catch (err: any) {
            console.error("Submission error details:", {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
            });
            toast("Error", {
                description: err.response?.data?.msg || "Failed to submit application. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen max-w-7xl pt-20 mx-auto">
            <div className="min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
                    <div className="fixed w-full sm:w-56 top-20 right-0 sm:right-4 z-20">
                        <ShineBorder>
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5 }}
                                className="rounded-lg flex items-center gap-2"
                            >
                                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                <p className="text-sm text-center sm:text-left font-medium">
                                    These are unpaid internships with potential for full-time conversion.
                                </p>
                            </motion.div>
                        </ShineBorder>
                    </div>
                    <header className="text-center relative overflow-hidden">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="relative z-10"
                        >
                            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
                                Join The Coder&apos;z Team
                            </h1>
                            <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
                                We&apos;re an innovative E-Learning platform dedicated to empowering the next generation of tech talent.
                                At Coder&apos;z, we believe in hands-on learning, cutting-edge technology, and the power of community.
                                Our mission is to bridge the gap between traditional education and the fast-paced tech industry,
                                providing aspiring developers with the skills, experience, and connections they need to thrive in their careers.
                            </p>
                            <Link href="https://form.jotform.com/243581704509055" target="_blank">
                                <ShimmerButton className="w-72 mx-auto text-white">
                                    Apply Now
                                </ShimmerButton>
                            </Link>
                        </motion.div>
                        <div className="absolute inset-0 z-0">
                            <svg className="absolute left-0 w-full h-full" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                                <path fill="#4338CA" fillOpacity="0.1" d="M45.3,-52.9C60.9,-40.9,77,-28.1,80.9,-12.1C84.8,3.9,76.5,22.1,64.4,35.8C52.3,49.5,36.4,58.7,19.2,64.1C1.9,69.5,-16.7,71.1,-32.6,64.7C-48.5,58.3,-61.8,44,-68.9,27C-76,10,-76.9,-9.7,-69.9,-25.3C-62.9,-40.9,-48,-52.5,-33.3,-64.4C-18.6,-76.3,-4.1,-88.5,7.9,-87.3C19.9,-86.1,39.8,-71.5,45.3,-52.9Z" transform="translate(100 100)" />
                            </svg>
                        </div>
                    </header>
                    <main className="max-w-7xl py-20 mx-auto">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-3xl font-semibold text-gray-900 dark:text-white mb-8 text-center"
                        >
                            Current Openings
                        </motion.h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <JobListing
                                title="Full Stack Developer"
                                description="We're looking for a passionate Full Stack Developer with strong React skills to help build and maintain our cutting-edge E-Learning platform."
                                requirements={[
                                    "Proficiency in React and modern JavaScript",
                                    "Experience with backend technologies (Node.js preferred)",
                                    "Understanding of RESTful APIs and database design",
                                    "Ability to write clean, maintainable code"
                                ]}
                            />
                            <JobListing
                                title="UI/UX Designer"
                                description="Join our design team to create intuitive and engaging user experiences for our E-Learning platform."
                                requirements={[
                                    "Strong portfolio showcasing UI and UX design skills",
                                    "Proficiency in design tools (Figma, Sketch, Adobe XD)",
                                    "Understanding of user-centered design principles",
                                    "Ability to create wireframes, prototypes, and high-fidelity designs"
                                ]}
                            />
                        </div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="mt-12 text-center"
                        >
                            <Link href="https://form.jotform.com/243581704509055" target="_blank">
                                <ShimmerButton className="w-72 mx-auto text-white">
                                    Apply Now
                                </ShimmerButton>
                            </Link>
                        </motion.div>
                    </main>
                </div>
            </div>

            <Sheet open={isFormOpen} onOpenChange={closeForm}>
                <SheetContent className="sm:max-w-[425px]">
                    <SheetHeader>
                        <SheetTitle>Apply for a Position</SheetTitle>
                        <SheetDescription>
                            Fill out the form below to apply for a position at The Coder&apos;z.
                        </SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" type='text' value={formData.name} onChange={handleInputChange} placeholder="John Doe" required />
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={formData.email} onChange={handleInputChange} placeholder='johndoe@gmail.com' required />
                        </div>
                        {/* <div>
                            <Label htmlFor="phonenumber">Contact Number(WhatsApp)</Label>
                            <Input id="phonenumber" type="text" value={formData.phonenumber} onChange={handleInputChange} placeholder='12345678910' required />
                        </div> */}
                        <div>
                            <Label htmlFor="github">GitHub</Label>
                            <Input id="github" type="text" value={formData.github} onChange={handleInputChange} placeholder='https://github.com/johndoe' required />
                        </div>
                        <div>
                            <Label htmlFor="linkedin">LinkedIn</Label>
                            <Input id="linkedin" type="text" value={formData.linkedin} onChange={handleInputChange} placeholder='https://linkedin.com/johndoe' required />
                        </div>
                        <div>
                            <Label htmlFor="position">Position</Label>
                            <select id="position" value={formData.position} onChange={handleInputChange} className="w-full rounded-md border border-gray-300 p-2" required>
                                <option value="">Select a position</option>
                                <option value="fullstackdev">Full Stack Developer</option>
                                <option value="ui/uxdesigner">UI/UX Designer</option>
                            </select>
                        </div>
                        <div>
                            <Label htmlFor="coverletter">Why do you want to join The Coder&apos;z?</Label>
                            <Textarea id="coverletter" value={formData.coverletter} onChange={handleInputChange} />
                        </div>
                        <ShimmerButton type="submit" className="w-full">
                            {
                                isSubmitting ? "Submitting" : "Submit"
                            }
                        </ShimmerButton>
                    </form>
                </SheetContent>
            </Sheet>
        </div>
    )
}

function JobListing({ title, description, requirements }: JobListingProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <CardContainer className="inter-var">
                <CardBody className="bg-gray-50 relative group/card  dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[30rem] h-auto rounded-xl p-6 border  ">
                    <CardItem
                        translateZ="50"
                        className="text-xl font-bold text-neutral-600 dark:text-white"
                    >
                        {title}
                    </CardItem>
                    <CardItem
                        as="p"
                        translateZ="60"
                        className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
                    >
                        {description}
                    </CardItem>
                    <CardItem translateZ="100" className="w-full mt-4">
                        <h4 className="text-sm font-semibold text-neutral-500 dark:text-neutral-200 mb-2">Requirements:</h4>
                        <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-2">
                            {requirements.map((req, index) => (
                                <motion.li
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                    className="flex items-center space-x-2"
                                >
                                    <Badge variant="outline" className="h-6 w-6 rounded-full p-0 flex items-center justify-center">
                                        {index + 1}
                                    </Badge>
                                    <span>{req}</span>
                                </motion.li>
                            ))}
                        </ul>
                    </CardItem>
                    <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-blue-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </CardBody>
            </CardContainer>
        </motion.div>
    )
}
function FloatingElements() {
    const elements = [
        { icon: "⚛️", x: "10%", y: "20%", size: "40px" },
        { icon: "🚀", x: "80%", y: "60%", size: "50px" },
        { icon: "💻", x: "30%", y: "70%", size: "45px" },
        { icon: "🌟", x: "70%", y: "20%", size: "35px" },
        { icon: "🔧", x: "20%", y: "90%", size: "30px" },
        { icon: "📚", x: "90%", y: "80%", size: "40px" },
    ]

    return (
        <>
            {elements.map((el, index) => (
                <motion.div
                    key={index}
                    className="absolute text-4xl"
                    style={{ left: el.x, top: el.y, fontSize: el.size }}
                    animate={{
                        y: ["0%", "10%", "0%"],
                        rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut",
                        delay: index * 0.2,
                    }}
                >
                    {el.icon}
                </motion.div>
            ))}
        </>
    )
}

