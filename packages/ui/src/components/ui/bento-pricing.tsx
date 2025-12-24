'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@repo/ui/lib/utils';
import { Button } from '@repo/ui/components/ui/button';
import { Badge } from '@repo/ui/components/ui/badge';
import {
    CheckIcon, SparklesIcon, Zap, Gift, ArrowRight
} from 'lucide-react';

type PricingCardProps = {
    titleBadge: string;
    priceLabel: string;
    priceSuffix?: string;
    features: string[];
    cta?: string;
    ctaHref?: string;
    className?: string;
    credits?: number;
    onPurchase?: () => void;
};

function FilledCheck() {
    return (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full p-0.5">
            <CheckIcon className="size-3" strokeWidth={3} />
        </div>
    );
}

function PricingCard({
    titleBadge,
    priceLabel,
    priceSuffix = '/one-time',
    features,
    cta = 'Get Credits',
    ctaHref = '/purchase',
    className,
    credits,
    onPurchase,
}: PricingCardProps) {
    return (
        <div
            className={cn(
                'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 relative overflow-hidden rounded-2xl border',
                'hover:shadow-xl hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300',
                className,
            )}
        >
            <div className="flex items-center gap-3 p-5">
                <Badge variant="secondary" className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                    {titleBadge}
                </Badge>
                {
                    credits && (
                        <Badge variant="outline" className="ml-auto text-xs">
                            <Zap className="w-3 h-3 mr-1 text-amber-500" />
                            {credits} Credits
                        </Badge>
                    )
                }
            </div>
            <div className="flex items-end gap-2 px-5 py-3">
                <span className="font-mono text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
                    {priceLabel}
                </span>
                {
                    priceLabel.toLowerCase() !== 'free' && (
                        <span className="text-neutral-500 dark:text-neutral-400 text-sm pb-1">{priceSuffix}</span>
                    )
                }
            </div>
            <ul className="text-neutral-600 dark:text-neutral-400 grid gap-3 p-5 text-sm">
                {
                    features.map((f, i) => (
                        <li key={i} className="flex items-center gap-3">
                            <FilledCheck />
                            <span>{f}</span>
                        </li>
                    ))
                }
            </ul>
            <div className="p-5 pt-0">
                {
                    onPurchase ? (
                        <Button
                            onClick={onPurchase}
                            className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white border-0"
                        >
                            {cta}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button asChild variant="outline" className="w-full">
                            <Link href={ctaHref}>
                                {cta}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    )
                }
            </div>
        </div>
    );
}

interface BentoPricingProps {
    currency?: 'INR' | 'USD';
    onPurchase?: (credits: number, price: number) => void;
    showFreeCredits?: boolean;
    onRequestFreeCredits?: () => void;
}

export function BentoPricing({
    currency = 'INR',
    onPurchase,
    showFreeCredits = true,
    onRequestFreeCredits
}: BentoPricingProps) {
    const prices = {
        starter: currency === 'INR' ? '₹49' : '$0.99',
        popular: currency === 'INR' ? '₹129' : '$2.49',
        pro: currency === 'INR' ? '₹239' : '$4.49',
        ultimate: currency === 'INR' ? '₹369' : '$6.99',
    };

    const numericPrices = {
        starter: currency === 'INR' ? 49 : 0.99,
        popular: currency === 'INR' ? 129 : 2.49,
        pro: currency === 'INR' ? 239 : 4.49,
        ultimate: currency === 'INR' ? 369 : 6.99,
    };

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-8">
            <div
                className={cn(
                    'bg-neutral-900 dark:bg-white border-neutral-800 dark:border-neutral-200 relative w-full overflow-hidden rounded-2xl border',
                    'lg:col-span-5',
                    'hover:shadow-2xl transition-all duration-300'
                )}
            >
                <div className="pointer-events-none absolute top-0 left-1/2 -mt-2 -ml-20 h-full w-full [mask-image:linear-gradient(white,transparent)]">
                    <div className="from-white/5 to-white/2 dark:from-neutral-900/5 dark:to-neutral-900/2 absolute inset-0 bg-gradient-to-r [mask-image:radial-gradient(farthest-side_at_top,white,transparent)]">
                        <div
                            aria-hidden="true"
                            className={cn(
                                'absolute inset-0 size-full mix-blend-overlay',
                                'bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px)]',
                                'bg-[size:24px]',
                            )}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-3 p-5">
                    <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0">
                        MOST POPULAR
                    </Badge>
                    <Badge variant="outline" className="hidden lg:flex border-white/20 text-white dark:border-neutral-800 dark:text-neutral-900">
                        <SparklesIcon className="me-1 size-3" /> Best Value
                    </Badge>
                    <div className="ml-auto flex items-center gap-2">
                        <Badge variant="secondary" className="bg-white/10 dark:bg-neutral-900/10 text-white dark:text-neutral-900">
                            <Zap className="w-3 h-3 mr-1 text-amber-400" />
                            150 Credits
                        </Badge>
                    </div>
                </div>
                <div className="flex flex-col p-5 lg:flex-row">
                    <div className="pb-4 lg:w-[35%]">
                        <span className="font-mono text-5xl font-bold tracking-tight text-white dark:text-neutral-900">
                            {prices.popular}
                        </span>
                        <span className="text-neutral-400 dark:text-neutral-600 text-sm ml-2">/one-time</span>
                        <p className="text-emerald-400 dark:text-emerald-600 text-sm mt-2 font-medium">
                            Save 12% vs regular
                        </p>
                    </div>
                    <ul className="text-neutral-300 dark:text-neutral-700 grid gap-3 text-sm lg:w-[65%]">
                        {
                            [
                                'Perfect for regular learners',
                                'Access all AI-powered tools',
                                'Interview prep & resume builder',
                                'Credits never expire',
                            ].map((f, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full p-0.5">
                                        <CheckIcon className="size-3" strokeWidth={3} />
                                    </div>
                                    <span className="leading-relaxed">{f}</span>
                                </li>
                            ))
                        }
                    </ul>
                </div>
                <div className="p-5 pt-0">
                    {
                        onPurchase ? (
                            <Button
                                onClick={() => onPurchase(150, numericPrices.popular)}
                                size="lg"
                                className="bg-white text-neutral-900 hover:bg-neutral-100 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800"
                            >
                                Get 150 Credits
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        ) : (
                            <Button asChild size="lg" className="bg-white text-neutral-900 hover:bg-neutral-100 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800">
                                <Link href="/purchase">
                                    Get 150 Credits
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        )
                    }
                </div>
            </div>
            <PricingCard
                titleBadge="STARTER"
                priceLabel={prices.starter}
                credits={50}
                features={[
                    'Perfect for trying out',
                    'Basic AI tools access',
                    'Limited assessments',
                ]}
                cta="Get 50 Credits"
                className="lg:col-span-3"
                onPurchase={onPurchase ? () => onPurchase(50, numericPrices.starter) : undefined}
            />
            <PricingCard
                titleBadge="PRO"
                priceLabel={prices.pro}
                credits={300}
                features={[
                    'For serious developers',
                    'All premium features',
                    'Advanced analytics',
                    'Save 19% vs regular',
                ]}
                cta="Get 300 Credits"
                className="lg:col-span-4"
                onPurchase={onPurchase ? () => onPurchase(300, numericPrices.pro) : undefined}
            />
            <PricingCard
                titleBadge="ULTIMATE"
                priceLabel={prices.ultimate}
                credits={500}
                features={[
                    'Maximum savings (25% off)',
                    'Power user bundle',
                    'Priority support',
                ]}
                cta="Get 500 Credits"
                className="lg:col-span-4"
                onPurchase={onPurchase ? () => onPurchase(500, numericPrices.ultimate) : undefined}
            />

            {
                showFreeCredits && (
                    <div
                        className={cn(
                            'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30',
                            'border-emerald-200 dark:border-emerald-800 relative w-full overflow-hidden rounded-2xl border',
                            'lg:col-span-8',
                            'hover:shadow-xl transition-all duration-300'
                        )}
                    >
                        <div className="flex flex-col md:flex-row items-center justify-between p-6 gap-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
                                    <Gift className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
                                        Get Free Credits!
                                    </h3>
                                    <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                                        Share about us on LinkedIn or Twitter and earn up to 50 free credits
                                    </p>
                                </div>
                            </div>
                            {
                                onRequestFreeCredits ? (
                                    <Button
                                        onClick={onRequestFreeCredits}
                                        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                                    >
                                        <Gift className="mr-2 h-4 w-4" />
                                        Claim Free Credits
                                    </Button>
                                ) : (
                                    <Button asChild className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white">
                                        <Link href="/purchase">
                                            <Gift className="mr-2 h-4 w-4" />
                                            Claim Free Credits
                                        </Link>
                                    </Button>
                                )
                            }
                        </div>
                    </div>
                )
            }
        </div>
    );
}

export default BentoPricing;