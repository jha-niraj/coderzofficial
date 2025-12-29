"use client"

// Component Imports
import Navbar from "@/components/landingpage/navbar";
import HeroSection from "@/components/landingpage/hero-section";
import FeaturesSection from "@/components/landingpage/features-section";
import HowItWorksSection from "@/components/landingpage/how-it-works-section";
import PricingSection from "@/components/landingpage/pricing-section";
import TestimonialsSection from "@/components/landingpage/testimonials-section";
import FaqSection from "@/components/landingpage/faq-section";
import CtaSection from "@/components/landingpage/cta-section";
import Footer from "@/components/landingpage/footer";
import VerificationTools from "@/components/landingpage/verificationtools";
import InterviewSuite from "@/components/landingpage/interviewsuite";
import SmoothScroll from "../components/smoothscroll";
import BotTerminal from "@/components/landingpage/botterminal";
import CandidateIntelligence from "@/components/landingpage/candidateintelliegence";
import IntegrationMarquee from "@/components/landingpage/intergrationmarquee";

export default function HiringLandingPage() {
	return (
		<SmoothScroll>
			<Navbar />
			<main className="relative bg-white dark:bg-neutral-900">
				<section id="hero">
					<HeroSection />
				</section>
				<section id="features">
					<FeaturesSection />
				</section>
				<section id="how-it-works">
					<HowItWorksSection />
				</section>
				<section id="botterminal">
					<BotTerminal />
				</section>
				<section id="verificationtools">
					<VerificationTools />
				</section>
				<section id="candidateintelliegence">
					<CandidateIntelligence />
				</section>
				<section id="integrationmarquee">
					<IntegrationMarquee />
				</section>
				<section id="interviewsuite">
					<InterviewSuite />
				</section>
				<section id="pricing">
					<PricingSection />
				</section>
				<section id="testimonials">
					<TestimonialsSection />
				</section>
				<section id="faq">
					<FaqSection />
				</section>
				<section id="cta">
					<CtaSection />
				</section>
				<Footer />
			</main>
		</SmoothScroll>
	)
}