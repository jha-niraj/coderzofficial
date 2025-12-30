"use client"

export default function ComplianceGrid() {
    return (
        <section className="py-16 bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800">
            <div className="max-w-6xl mx-auto px-6 text-center">
                <p className="font-mono text-xs text-neutral-500 uppercase tracking-widest mb-8">
                    Enterprise-Grade Security Standards
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-60">
                    {
                        ["SOC 2 Compliant", "GDPR Ready", "ISO 27001", "FERPA Aligned"].map((item, i) => (
                            <div key={i} className="text-xl font-bold text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-800 rounded-lg py-4">
                                {item}
                            </div>
                        ))
                    }
                </div>
            </div>
        </section>
    )
}