'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { Label } from '@repo/ui/components/ui/label'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { Badge } from '@repo/ui/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/ui/tabs'
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription
} from '@repo/ui/components/ui/sheet'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@repo/ui/components/ui/select'
import {
    Sparkles, Upload, Store, TrendingUp, Users, Star, Search,
    ArrowLeft, Coins
} from 'lucide-react'
import { DotmSquare11 } from '@repo/ui/components/ui/dotm-square-11'
import toast from '@repo/ui/components/ui/sonner'
import { purchaseTemplate } from '@/actions/(main)/ai/resume-marketplace.action'
import { uploadUserTemplate } from '@/actions/(main)/ai/resume-draft.action'
import { PLATFORM_TEMPLATES } from '@/types/resume-draft'
import Link from 'next/link'

interface Template {
    id: string
    slug: string
    name: string
    description: string
    isPlatform: boolean
    isMarketplace: boolean
    marketplacePrice: number
    creditsCost: number
    totalSales: number
    tags: string[]
    isFeatured: boolean
    createdBy: { name: string | null; username: string | null } | null
    owned: boolean
    _count: { purchases: number }
    config: unknown
}

interface MyStats {
    templates: Array<{ id: string; name: string; isMarketplace: boolean; marketplacePrice: number; totalSales: number; totalRevenue: number; _count: { purchases: number } }>
    earnings: Array<{ id: string; amount: number; createdAt: Date }>
    totalEarned: number
}

interface Props {
    templates: Template[]
    myStats: { templates: MyStats['templates']; earnings: MyStats['earnings']; totalEarned: number } | null
    userId?: string
    activeTab: string
}

const ACCENT_COLORS: Record<string, string> = {
    'clean-minimal': '#6366f1',
    'developer-pro': '#8b5cf6',
    'executive-classic': '#f59e0b',
    'ats-optimizer': '#10b981',
    'modern-creative': '#ec4899',
}

// ─── Template detail sheet ────────────────────────────────────────────────────
function TemplateDetailSheet({ template, userId, onClose, onPurchased }: {
    template: Template | null
    userId?: string
    onClose: () => void
    onPurchased: (id: string) => void
}) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    if (!template) return null

    const accent = ACCENT_COLORS[template.slug] ?? '#6366f1'
    const platDef = PLATFORM_TEMPLATES.find(p => p.slug === template.slug)

    const handleBuy = async () => {
        if (!userId) { router.push('/signin'); return }
        setLoading(true)
        const res = await purchaseTemplate(template.id)
        setLoading(false)
        if (!res.success) return toast.error(res.error)
        toast.success('Template purchased!')
        onPurchased(template.id)
        onClose()
    }

    const handleUse = () => {
        router.push(`/ai/resume?newTemplate=${template.slug}`)
        onClose()
    }

    return (
        <Sheet open={!!template} onOpenChange={onClose}>
            <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto p-0 flex flex-col">
                {/* Preview banner */}
                <div className="h-40 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${accent}15, ${accent}30)`, borderBottom: `1px solid ${accent}30` }}>
                    <div className="text-center space-y-1">
                        <p className="text-3xl font-black" style={{ color: accent }}>{template.name}</p>
                        {template.isPlatform && <Badge className="bg-violet-100 text-violet-700 text-xs">BuildrHQ Official</Badge>}
                    </div>
                </div>

                <div className="flex-1 p-6 space-y-5">
                    <SheetHeader>
                        <SheetTitle>{template.name}</SheetTitle>
                        <SheetDescription>{template.description}</SheetDescription>
                    </SheetHeader>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                        {template.tags.map(t => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3">
                        <StatBox label="Sales" value={template._count.purchases.toString()} />
                        <StatBox label="Downloads" value={template.totalSales.toString()} />
                        <StatBox label="Price" value={template.isPlatform ? 'Free' : `${template.marketplacePrice}cr`} />
                    </div>

                    {/* Creator */}
                    {!template.isPlatform && template.createdBy && (
                        <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                            <Users className="w-4 h-4" />
                            <span>By <span className="font-medium">{template.createdBy.name ?? template.createdBy.username}</span></span>
                        </div>
                    )}
                    {template.isPlatform && (
                        <div className="flex items-center gap-2 text-sm text-violet-600">
                            <Star className="w-4 h-4 fill-current" />
                            <span>Official BuildrHQ Template</span>
                        </div>
                    )}

                    {/* Section order */}
                    {platDef && (
                        <div className="space-y-1.5">
                            <p className="text-xs font-medium text-neutral-500">Section order</p>
                            <div className="flex flex-wrap gap-1">
                                {platDef.sectionOrder.map((s, i) => (
                                    <Badge key={s} variant="outline" className="text-[10px]">
                                        {i + 1}. {s}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-neutral-100 dark:border-neutral-800">
                    {loading ? (
                        <div className="flex justify-center"><DotmSquare11 size={32} dotSize={4} speed={1.4} /></div>
                    ) : template.owned || template.isPlatform ? (
                        <Button className="w-full bg-neutral-900 text-white dark:bg-white dark:text-black hover:opacity-90 h-11" onClick={handleUse}>
                            <Sparkles className="w-4 h-4 mr-2" /> Use This Template
                        </Button>
                    ) : (
                        <Button className="w-full h-11" style={{ backgroundColor: accent }} onClick={handleBuy}>
                            <Coins className="w-4 h-4 mr-2" />
                            Buy for {template.marketplacePrice} credits
                        </Button>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}

function StatBox({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 text-center">
            <p className="text-base font-bold">{value}</p>
            <p className="text-[10px] text-neutral-500">{label}</p>
        </div>
    )
}

// ─── Upload Template Form ─────────────────────────────────────────────────────
function UploadTemplateForm({ onSuccess }: { onSuccess: () => void }) {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [tags, setTags] = useState('')
    const [price, setPrice] = useState(0)
    const [primaryColor, setPrimaryColor] = useState('#1a1a1a')
    const [font, setFont] = useState('inter')
    const [layout, setLayout] = useState<'single' | 'two-column'>('single')
    const [sectionOrder, setSectionOrder] = useState('header,summary,experience,skills,education,projects')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!name.trim() || !description.trim()) return toast.error('Name and description required')
        setLoading(true)
        const res = await uploadUserTemplate({
            name,
            description,
            config: { primaryColor, fontFamily: font, layout, showPhoto: false, fontSize: 'medium' },
            sectionOrder: sectionOrder.split(',').map(s => s.trim()).filter(Boolean),
            tags: tags.split(',').map(s => s.trim()).filter(Boolean),
            marketplacePrice: price,
        })
        setLoading(false)
        if (!res.success) return toast.error(res.error ?? 'Failed to upload')
        toast.success('Template uploaded!')
        onSuccess()
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 col-span-2">
                    <Label className="text-xs">Template Name</Label>
                    <Input value={name} onChange={e => setName(e.target.value)} placeholder="My Custom Template" className="h-8 text-sm" />
                </div>
                <div className="space-y-1.5 col-span-2">
                    <Label className="text-xs">Description</Label>
                    <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What makes this template unique?" className="h-20 text-xs resize-none" />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs">Primary Color</Label>
                    <div className="flex gap-2">
                        <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="h-8 w-10 rounded cursor-pointer" />
                        <Input value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="h-8 text-xs flex-1" />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs">Font</Label>
                    <Select value={font} onValueChange={setFont}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="inter" className="text-xs">Inter</SelectItem>
                            <SelectItem value="roboto" className="text-xs">Roboto</SelectItem>
                            <SelectItem value="georgia" className="text-xs">Georgia</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs">Layout</Label>
                    <Select value={layout} onValueChange={v => setLayout(v as 'single' | 'two-column')}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="single" className="text-xs">Single Column</SelectItem>
                            <SelectItem value="two-column" className="text-xs">Two Column</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs">Marketplace Price (credits)</Label>
                    <Input type="number" min={0} value={price} onChange={e => setPrice(Number(e.target.value))} className="h-8 text-sm" />
                    <p className="text-[10px] text-neutral-500">0 = free · You earn 90% of each sale</p>
                </div>
                <div className="space-y-1.5 col-span-2">
                    <Label className="text-xs">Tags (comma-separated)</Label>
                    <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="minimal, ATS, developer" className="h-8 text-sm" />
                </div>
                <div className="space-y-1.5 col-span-2">
                    <Label className="text-xs">Section Order (comma-separated)</Label>
                    <Input value={sectionOrder} onChange={e => setSectionOrder(e.target.value)} className="h-8 text-xs" />
                    <p className="text-[10px] text-neutral-500">Options: header, summary, experience, skills, education, projects, certifications</p>
                </div>
            </div>
            <Button
                className="w-full bg-neutral-900 text-white dark:bg-white dark:text-black hover:opacity-90"
                onClick={handleSubmit}
                disabled={loading}
            >
                {loading ? <DotmSquare11 size={18} dotSize={3} speed={1.4} /> : <><Upload className="w-4 h-4 mr-2" />Upload Template</>}
            </Button>
        </div>
    )
}

// ─── Main Forge Client ────────────────────────────────────────────────────────
export function ForgeClient({ templates: initialTemplates, myStats, userId, activeTab }: Props) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [templates, setTemplates] = useState<Template[]>(initialTemplates)
    const [selected, setSelected] = useState<Template | null>(null)
    const [search, setSearch] = useState(searchParams.get('search') ?? '')
    const [sort, setSort] = useState<string>('popular')
    const platformTemplates = templates.filter(t => t.isPlatform)
    const communityTemplates = templates.filter(t => !t.isPlatform && t.isMarketplace)

    const filtered = (arr: Template[]) =>
        arr.filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase()))

    const handlePurchased = (id: string) => {
        setTemplates(ts => ts.map(t => t.id === id ? { ...t, owned: true } : t))
    }

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
            {/* ── Hero ── */}
            <div className="bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 px-4 sm:px-6 lg:px-8 py-10">
                <div className="max-w-5xl mx-auto">
                    <Link href="/ai/resume">
                        <Button variant="ghost" size="sm" className="mb-4 text-neutral-500">
                            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Resume Builder
                        </Button>
                    </Link>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Store className="w-6 h-6 text-violet-600" />
                                <h1 className="text-2xl font-bold">Forge</h1>
                                <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 text-xs">Resume Templates</Badge>
                            </div>
                            <p className="text-sm text-neutral-500">Discover beautiful templates. Earn credits by selling yours.</p>
                        </div>
                    </div>

                    {/* Stats bar */}
                    <div className="flex items-center gap-6 mt-5 text-sm">
                        <div className="flex items-center gap-1.5">
                            <LayoutGrid className="w-3.5 h-3.5 text-violet-500" />
                            <span className="font-semibold">{templates.length}</span>
                            <span className="text-neutral-500">templates</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="font-semibold">{templates.reduce((s, t) => s + t._count.purchases, 0)}</span>
                            <span className="text-neutral-500">total downloads</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Content ── */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Tabs defaultValue={activeTab}>
                    <div className="flex items-center justify-between mb-5">
                        <TabsList>
                            <TabsTrigger value="browse">Browse</TabsTrigger>
                            <TabsTrigger value="sell">Create & Sell</TabsTrigger>
                            {myStats && <TabsTrigger value="earnings">My Earnings</TabsTrigger>}
                        </TabsList>
                        {/* Search + Sort */}
                        <div className="flex items-center gap-2">
                            <div className="relative w-44">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="h-8 pl-8 text-xs" />
                            </div>
                            <Select value={sort} onValueChange={setSort}>
                                <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="popular" className="text-xs">Popular</SelectItem>
                                    <SelectItem value="newest" className="text-xs">Newest</SelectItem>
                                    <SelectItem value="price_asc" className="text-xs">Price ↑</SelectItem>
                                    <SelectItem value="price_desc" className="text-xs">Price ↓</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* ── Browse ── */}
                    <TabsContent value="browse" className="space-y-8">
                        {/* Platform templates */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <h2 className="text-sm font-semibold">BuildrHQ Official</h2>
                                <Badge className="bg-violet-100 text-violet-700 text-[10px]">Free</Badge>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filtered(platformTemplates).map(t => (
                                    <TemplateCard key={t.id} template={t} onClick={() => setSelected(t)} />
                                ))}
                            </div>
                        </section>

                        {/* Community */}
                        {filtered(communityTemplates).length > 0 && (
                            <section>
                                <h2 className="text-sm font-semibold mb-4">Community Templates</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filtered(communityTemplates).map(t => (
                                        <TemplateCard key={t.id} template={t} onClick={() => setSelected(t)} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </TabsContent>

                    {/* ── Create & Sell ── */}
                    <TabsContent value="sell">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Upload className="w-4 h-4 text-violet-600" />
                                    <h2 className="text-sm font-semibold">Upload Your Template</h2>
                                </div>
                                <UploadTemplateForm onSuccess={() => { router.refresh() }} />
                            </div>
                            <div className="space-y-4">
                                <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 border border-violet-200 dark:border-violet-900/30 p-6">
                                    <h3 className="font-semibold text-sm mb-3">How earnings work</h3>
                                    <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
                                        <li className="flex items-start gap-2"><span className="text-violet-600 font-bold">90%</span> goes to you on every sale</li>
                                        <li className="flex items-start gap-2"><span className="text-violet-600 font-bold">10%</span> platform fee to keep Forge running</li>
                                        <li className="flex items-start gap-2"><span className="text-violet-600 font-bold">Instant</span> credits credited to your account</li>
                                        <li className="flex items-start gap-2"><span className="text-violet-600 font-bold">Convert</span> credits to cash via the credits page</li>
                                    </ul>
                                </div>
                                {myStats && myStats.templates.length > 0 && (
                                    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
                                        <h3 className="font-semibold text-sm mb-3">Your Templates</h3>
                                        {myStats.templates.map(t => (
                                            <div key={t.id} className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                                                <div>
                                                    <p className="text-xs font-medium">{t.name}</p>
                                                    <p className="text-[10px] text-neutral-500">{t._count.purchases} sales · {t.totalRevenue} credits earned</p>
                                                </div>
                                                <Badge variant="outline" className="text-[10px]">{t.isMarketplace ? `${t.marketplacePrice}cr` : 'Private'}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    {/* ── Earnings ── */}
                    {myStats && (
                        <TabsContent value="earnings">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                                <StatBox label="Total Earned" value={`${myStats.totalEarned} credits`} />
                                <StatBox label="Templates" value={myStats.templates.length.toString()} />
                                <StatBox label="Total Sales" value={myStats.templates.reduce((s, t) => s + t._count.purchases, 0).toString()} />
                            </div>
                            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
                                <h3 className="font-semibold text-sm mb-4">Recent Earnings</h3>
                                {myStats.earnings.length === 0 ? (
                                    <p className="text-sm text-neutral-500">No earnings yet. Upload a template to get started.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {myStats.earnings.map(e => (
                                            <div key={e.id} className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                                                <div className="flex items-center gap-2">
                                                    <Coins className="w-3.5 h-3.5 text-amber-500" />
                                                    <span className="text-xs text-neutral-600">Template sale</span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-semibold text-emerald-600">+{e.amount} credits</p>
                                                    <p className="text-[10px] text-neutral-400">{new Date(e.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                                    <p className="text-xs text-neutral-500 mb-2">Convert your credits to cash or use them on the platform</p>
                                    <Button variant="outline" size="sm" onClick={() => router.push('/transactions')}>
                                        <Coins className="w-3.5 h-3.5 mr-1.5" /> View All Credits
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>
                    )}
                </Tabs>
            </div>

            {/* Template detail sheet */}
            <TemplateDetailSheet
                template={selected}
                userId={userId}
                onClose={() => setSelected(null)}
                onPurchased={handlePurchased}
            />
        </div>
    )
}

function TemplateCard({ template, onClick }: { template: Template; onClick: () => void }) {
    const accent = ACCENT_COLORS[template.slug] ?? '#6366f1'
    return (
        <button
            onClick={onClick}
            className="text-left rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden hover:shadow-md transition-shadow group"
        >
            {/* Preview */}
            <div className="h-28 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${accent}10, ${accent}25)` }}>
                <p className="text-sm font-bold" style={{ color: accent }}>{template.name}</p>
                {template.isFeatured && (
                    <div className="absolute top-2 right-2">
                        <Badge className="text-[10px] bg-amber-100 text-amber-700">Featured</Badge>
                    </div>
                )}
            </div>
            {/* Info */}
            <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold">{template.name}</p>
                    {template.isPlatform ? (
                        <Badge className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 flex-shrink-0">Free</Badge>
                    ) : template.owned ? (
                        <Badge className="text-[10px] bg-blue-50 text-blue-700 flex-shrink-0">Owned</Badge>
                    ) : (
                        <Badge variant="outline" className="text-[10px] flex-shrink-0">{template.marketplacePrice}cr</Badge>
                    )}
                </div>
                <p className="text-[10px] text-neutral-500 line-clamp-2">{template.description}</p>
                <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-1">
                    <span>{template._count.purchases} downloads</span>
                    {!template.isPlatform && template.createdBy && <span>by {template.createdBy.name}</span>}
                </div>
            </div>
        </button>
    )
}

function LayoutGrid({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
    )
}
