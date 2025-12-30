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
import AcademicTools from "@/components/landingpage/academic-tools";
import PlacementConnect from "@/components/landingpage/placement-connect";
import SmoothScroll from "../components/smoothscroll";
import CreditsSystem from "@/components/landingpage/credits-system";
import StudentManagement from "@/components/landingpage/student-management";
import IntegrationMarquee from "@/components/landingpage/integration-marquee";
import AdminControlCenter from "@/components/landingpage/admincontrolcenter";
import ComplianceGrid from "@/components/landingpage/compliancegrid";

export default function UniversityLandingPage() {
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
				<section id="academic-tools">
					<AcademicTools />
				</section>
				<section id="student-management">
					<StudentManagement />
				</section>
				<section id="credits-system">
					<CreditsSystem />
				</section>
				<section id="integration-marquee">
					<IntegrationMarquee />
				</section>
				<section id="placement-connect">
					<PlacementConnect />
				</section>
				<section id="admin-control-center">
					<AdminControlCenter />
				</section>
				<section id="compliance-grid">
					<ComplianceGrid />
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