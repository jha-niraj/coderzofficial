"use client"

import { cn } from "@repo/ui/lib/utils";

import Navbar from "@/components/landingpage/homepagenavbar";
import StudioSection from "@/components/landingpage/studio-section";
import FeaturesSection from "@/components/landingpage/featuressection";
import AIToolsSection from "@/components/landingpage/aitoolssection";
import ProjectsSection from "@/components/landingpage/projects-section";
import OpenSourceSection from "@/components/landingpage/opensource";
import AssessmentsSection from "@/components/landingpage/assessments-section";
import CreditsSection from "@/components/landingpage/credits-section";
import Testimonials from "@/components/landingpage/testimonials-section";
import Footer from "@/components/landingpage/footer";
import PricingSection from "@/components/landingpage/pricing-section";
import FaqsAccrodian from "@/components/landingpage/faqs";
import SmoothScroll from "@/components/smoothscroll";
import HeroSection from "@/components/landingpage/herosection";

export default function LandingPage() {
    return (
        <SmoothScroll>
            <Navbar />
            <main className={cn("relative bg-white dark:bg-neutral-900")}>
                <section id="hero">
                    <HeroSection />
                </section>
                <section id="studio">
                    <StudioSection />
                </section>
                <section id="mainfeatures">
                    <FeaturesSection />
                </section>
                <section id="aitools">
                    <AIToolsSection />
                </section>
                <ProjectsSection />
                <section id="opensource">
                    <OpenSourceSection />
                </section>
                <section id="assessments">
                    <AssessmentsSection />
                </section>
                <section id="credits">
                    <CreditsSection />
                </section>
                <Testimonials />
                <section id="pricing">
                    <PricingSection />
                </section>
                <section>
                    <FaqsAccrodian />
                </section>
                <Footer />
            </main>
        </SmoothScroll>
    )
}