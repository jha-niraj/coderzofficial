"use client"

import { useState, useTransition, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Button } from "@repo/ui/components/ui/button"
import { Badge } from "@repo/ui/components/ui/badge"
import { Input } from "@repo/ui/components/ui/input"
import { Textarea } from "@repo/ui/components/ui/textarea"
import { Label } from "@repo/ui/components/ui/label"
import { ScrollArea } from "@repo/ui/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@repo/ui/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@repo/ui/components/ui/select"
import {
    Rocket, Users, Eye, ThumbsUp, MessageSquare, Plus,
    CheckCircle, XCircle, Clock, Star, Trash2,
    AlertCircle, Loader2, Package, Upload, Image as ImageIcon, X
} from "lucide-react"
import toast from "@repo/ui/components/ui/sonner"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import {
    adminCreateProduct,
    adminVerifyProduct,
    adminRejectProduct,
    adminDeleteProduct,
    adminToggleFeatured,
    adminUploadImage
} from "@/actions/launchpads/admin.action"
import { useRouter } from "next/navigation"

interface Product {
    id: string
    slug: string
    name: string
    tagline: string
    description: string
    logo: string | null
    category: string
    type: string
    status: string
    viewCount: number
    likeCount: number
    commentCount: number
    isFeatured: boolean
    isVerified: boolean
    createdAt: string | Date
    createdBy?: {
        id: string
        name: string | null
        username: string | null
        image: string | null
        email?: string | null
    } | null
}

interface Analytics {
    totalProducts: number
    coderzProducts: number
    communityProducts: number
    pendingProducts: number
    totalViews: number
    totalLikes: number
    totalComments: number
}

interface LaunchpadsAdminDashboardProps {
    allProducts: Product[]
    pendingProducts: Product[]
    analytics: Analytics | null
}

const categories = [
    { value: 'LEARNING', label: 'Learning & Education' },
    { value: 'PRODUCTIVITY', label: 'Productivity' },
    { value: 'CAREER', label: 'Career & Growth' },
    { value: 'COMMUNITY', label: 'Community & Social' },
    { value: 'DEVELOPER_TOOLS', label: 'Developer Tools' },
    { value: 'AI_POWERED', label: 'AI Powered' },
    { value: 'OTHER', label: 'Other' }
]

function StatCard({ title, value, icon: Icon, description }: { title: string; value: number; icon: React.ElementType; description?: string }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value.toLocaleString()}</div>
                {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
            </CardContent>
        </Card>
    )
}

function ProductRow({ 
    product, 
    onVerify, 
    onReject, 
    onDelete,
    onToggleFeatured,
    isPending 
}: { 
    product: Product
    onVerify: (id: string) => void
    onReject: (id: string, reason: string) => void
    onDelete: (id: string) => void
    onToggleFeatured: (id: string, featured: boolean) => void
    isPending: boolean
}) {
    const [rejectReason, setRejectReason] = useState("")
    const [showRejectDialog, setShowRejectDialog] = useState(false)

    const statusColors: Record<string, string> = {
        'PENDING_REVIEW': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        'APPROVED': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        'REJECTED': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        'DRAFT': 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
        'ARCHIVED': 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
        >
            <div className="flex items-start gap-4">
                {/* Logo */}
                {product.logo ? (
                    <Image
                        src={product.logo}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-lg object-cover"
                        unoptimized
                    />
                ) : (
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-800 flex items-center justify-center">
                        <span className="text-lg font-bold text-neutral-600 dark:text-neutral-300">
                            {product.name.charAt(0)}
                        </span>
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{product.name}</h3>
                        <Badge className={statusColors[product.status] || statusColors['DRAFT']}>
                            {product.status.replace('_', ' ')}
                        </Badge>
                        {product.type === 'CODERZ_OFFICIAL' && (
                            <Badge variant="outline" className="border-blue-500 text-blue-600">
                                <Rocket className="w-3 h-3 mr-1" />
                                Coderz
                            </Badge>
                        )}
                        {product.isFeatured && (
                            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                <Star className="w-3 h-3 mr-1" />
                                Featured
                            </Badge>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{product.tagline}</p>
                    
                    {/* Creator Info */}
                    {product.createdBy && (
                        <div className="flex items-center gap-2 mt-2">
                            <Avatar className="w-5 h-5">
                                <AvatarImage src={product.createdBy.image || undefined} />
                                <AvatarFallback className="text-xs">
                                    {product.createdBy.name?.charAt(0) || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">
                                {product.createdBy.name || product.createdBy.email}
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(product.createdAt), { addSuffix: true })}
                            </span>
                        </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {product.viewCount}
                        </span>
                        <span className="flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3" />
                            {product.likeCount}
                        </span>
                        <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {product.commentCount}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {product.status === 'PENDING_REVIEW' && (
                        <>
                            <Button
                                size="sm"
                                onClick={() => onVerify(product.id)}
                                disabled={isPending}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                            </Button>
                            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                                <DialogTrigger asChild>
                                    <Button size="sm" variant="destructive">
                                        <XCircle className="w-4 h-4 mr-1" />
                                        Reject
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Reject Product</DialogTitle>
                                        <DialogDescription>
                                            Provide a reason for rejecting this product.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <Textarea
                                        placeholder="Reason for rejection..."
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                    />
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={() => {
                                                onReject(product.id, rejectReason)
                                                setShowRejectDialog(false)
                                            }}
                                            disabled={!rejectReason.trim()}
                                        >
                                            Reject
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </>
                    )}
                    
                    {product.status === 'APPROVED' && (
                        <Button
                            size="sm"
                            variant={product.isFeatured ? "secondary" : "outline"}
                            onClick={() => onToggleFeatured(product.id, !product.isFeatured)}
                            disabled={isPending}
                        >
                            <Star className={`w-4 h-4 mr-1 ${product.isFeatured ? 'fill-current' : ''}`} />
                            {product.isFeatured ? 'Unfeature' : 'Feature'}
                        </Button>
                    )}

                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => onDelete(product.id)}
                        disabled={isPending}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </motion.div>
    )
}

export function LaunchpadsAdminDashboard({ 
    allProducts, 
    pendingProducts, 
    analytics 
}: LaunchpadsAdminDashboardProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [showAddDialog, setShowAddDialog] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const [newProduct, setNewProduct] = useState({
        name: '',
        tagline: '',
        description: '',
        logo: '',
        websiteUrl: '',
        demoUrl: '',
        githubUrl: '',
        category: 'OTHER',
        isFeatured: false
    })

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if (!validTypes.includes(file.type)) {
            toast.error('Please upload a JPG, PNG, or WebP image')
            return
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be smaller than 5MB')
            return
        }

        // Show preview immediately
        const reader = new FileReader()
        reader.onload = (event) => {
            setLogoPreview(event.target?.result as string)
        }
        reader.readAsDataURL(file)

        // Upload to server
        setIsUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            
            const result = await adminUploadImage(formData)
            
            if (result.success && result.url) {
                setNewProduct(prev => ({ ...prev, logo: result.url! }))
                toast.success('Logo uploaded successfully')
            } else {
                toast.error(result.message || 'Failed to upload logo')
                setLogoPreview(null)
            }
        } catch {
            toast.error('Failed to upload logo')
            setLogoPreview(null)
        } finally {
            setIsUploading(false)
        }
    }

    const resetForm = () => {
        setNewProduct({
            name: '',
            tagline: '',
            description: '',
            logo: '',
            websiteUrl: '',
            demoUrl: '',
            githubUrl: '',
            category: 'OTHER',
            isFeatured: false
        })
        setLogoPreview(null)
    }

    const handleVerify = (productId: string) => {
        startTransition(async () => {
            const result = await adminVerifyProduct(productId)
            if (result.success) {
                toast.success('Product approved!')
                router.refresh()
            } else {
                toast.error(result.error || 'Failed to approve')
            }
        })
    }

    const handleReject = (productId: string, reason: string) => {
        startTransition(async () => {
            const result = await adminRejectProduct(productId, reason)
            if (result.success) {
                toast.success('Product rejected')
                router.refresh()
            } else {
                toast.error(result.error || 'Failed to reject')
            }
        })
    }

    const handleDelete = (productId: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return
        
        startTransition(async () => {
            const result = await adminDeleteProduct(productId)
            if (result.success) {
                toast.success('Product deleted')
                router.refresh()
            } else {
                toast.error(result.error || 'Failed to delete')
            }
        })
    }

    const handleToggleFeatured = (productId: string, featured: boolean) => {
        startTransition(async () => {
            const result = await adminToggleFeatured(productId, featured)
            if (result.success) {
                toast.success(featured ? 'Product featured!' : 'Product unfeatured')
                router.refresh()
            } else {
                toast.error(result.error || 'Failed to update')
            }
        })
    }

    const handleCreateProduct = () => {
        if (!newProduct.name || !newProduct.tagline || !newProduct.description) {
            toast.error('Please fill in all required fields')
            return
        }

        startTransition(async () => {
            const result = await adminCreateProduct({
                ...newProduct,
                coverImage: '' // No longer using coverImage
            })
            if (result.success) {
                toast.success('Product created!')
                setShowAddDialog(false)
                resetForm()
                router.refresh()
            } else {
                toast.error(result.error || 'Failed to create')
            }
        })
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Rocket className="w-6 h-6" />
                        Launchpads Management
                    </h1>
                    <p className="text-muted-foreground">
                        Manage Coderz products and community submissions
                    </p>
                </div>
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Coderz Product
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Add Coderz Official Product</DialogTitle>
                            <DialogDescription>
                                Add a new product to the Coderz Labs collection
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Product Name *</Label>
                                    <Input
                                        placeholder="e.g., KnowMe AI"
                                        value={newProduct.name}
                                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label>Category</Label>
                                    <Select 
                                        value={newProduct.category} 
                                        onValueChange={(v) => setNewProduct({ ...newProduct, category: v })}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat.value} value={cat.value}>
                                                    {cat.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            
                            <div>
                                <Label>Tagline *</Label>
                                <Input
                                    placeholder="A short, catchy description"
                                    value={newProduct.tagline}
                                    onChange={(e) => setNewProduct({ ...newProduct, tagline: e.target.value })}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label>Description *</Label>
                                <Textarea
                                    placeholder="Detailed description..."
                                    value={newProduct.description}
                                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                    className="mt-1 min-h-[100px]"
                                />
                            </div>

                            {/* Logo Upload */}
                            <div>
                                <Label>Product Logo</Label>
                                <p className="text-xs text-muted-foreground mt-1 mb-3">
                                    Upload a square image (256x256px recommended)
                                </p>
                                <div className="flex items-start gap-4">
                                    {/* Preview */}
                                    <div className="relative">
                                        {logoPreview || newProduct.logo ? (
                                            <div className="relative w-20 h-20 rounded-xl overflow-hidden border">
                                                <Image
                                                    src={logoPreview || newProduct.logo}
                                                    alt="Logo preview"
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                                {isUploading && (
                                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="w-20 h-20 rounded-xl border-2 border-dashed flex items-center justify-center bg-muted">
                                                <ImageIcon className="w-6 h-6 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Upload Button */}
                                    <div className="flex-1">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png,image/webp"
                                            onChange={handleLogoUpload}
                                            className="hidden"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                            className="h-10"
                                        >
                                            {isUploading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Uploading...
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="w-4 h-4 mr-2" />
                                                    {logoPreview || newProduct.logo ? 'Change' : 'Upload'}
                                                </>
                                            )}
                                        </Button>
                                        {(logoPreview || newProduct.logo) && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() => {
                                                    setLogoPreview(null)
                                                    setNewProduct(prev => ({ ...prev, logo: '' }))
                                                }}
                                                className="ml-2 text-red-500 hover:text-red-600"
                                            >
                                                <X className="w-4 h-4 mr-1" />
                                                Remove
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label>Website URL</Label>
                                    <Input
                                        placeholder="https://..."
                                        value={newProduct.websiteUrl}
                                        onChange={(e) => setNewProduct({ ...newProduct, websiteUrl: e.target.value })}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label>Demo URL</Label>
                                    <Input
                                        placeholder="https://..."
                                        value={newProduct.demoUrl}
                                        onChange={(e) => setNewProduct({ ...newProduct, demoUrl: e.target.value })}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label>GitHub URL</Label>
                                    <Input
                                        placeholder="https://..."
                                        value={newProduct.githubUrl}
                                        onChange={(e) => setNewProduct({ ...newProduct, githubUrl: e.target.value })}
                                        className="mt-1"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isFeatured"
                                    checked={newProduct.isFeatured}
                                    onChange={(e) => setNewProduct({ ...newProduct, isFeatured: e.target.checked })}
                                />
                                <Label htmlFor="isFeatured" className="cursor-pointer">Feature this product</Label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreateProduct} disabled={isPending}>
                                {isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Product
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats */}
            {analytics && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    <StatCard title="Total Products" value={analytics.totalProducts} icon={Package} />
                    <StatCard title="Coderz Products" value={analytics.coderzProducts} icon={Rocket} />
                    <StatCard title="Community" value={analytics.communityProducts} icon={Users} />
                    <StatCard title="Pending Review" value={analytics.pendingProducts} icon={Clock} />
                    <StatCard title="Total Views" value={analytics.totalViews} icon={Eye} />
                    <StatCard title="Total Likes" value={analytics.totalLikes} icon={ThumbsUp} />
                    <StatCard title="Comments" value={analytics.totalComments} icon={MessageSquare} />
                </div>
            )}

            {/* Pending Products Alert */}
            {pendingProducts.length > 0 && (
                <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                            <AlertCircle className="w-5 h-5" />
                            {pendingProducts.length} Products Pending Review
                        </CardTitle>
                    </CardHeader>
                </Card>
            )}

            {/* Products Tabs */}
            <Tabs defaultValue="pending" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="pending" className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Pending ({pendingProducts.length})
                    </TabsTrigger>
                    <TabsTrigger value="all" className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        All Products ({allProducts.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pending">
                    <Card>
                        <CardHeader>
                            <CardTitle>Products Pending Review</CardTitle>
                            <CardDescription>
                                Review and approve community-submitted products
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {pendingProducts.length === 0 ? (
                                <div className="text-center py-12">
                                    <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                                    <h3 className="text-lg font-medium">All caught up!</h3>
                                    <p className="text-muted-foreground">No products pending review</p>
                                </div>
                            ) : (
                                <ScrollArea className="h-[500px]">
                                    <div className="space-y-3">
                                        {pendingProducts.map((product) => (
                                            <ProductRow
                                                key={product.id}
                                                product={product}
                                                onVerify={handleVerify}
                                                onReject={handleReject}
                                                onDelete={handleDelete}
                                                onToggleFeatured={handleToggleFeatured}
                                                isPending={isPending}
                                            />
                                        ))}
                                    </div>
                                </ScrollArea>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="all">
                    <Card>
                        <CardHeader>
                            <CardTitle>All Products</CardTitle>
                            <CardDescription>
                                Manage all Coderz and community products
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {allProducts.length === 0 ? (
                                <div className="text-center py-12">
                                    <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-medium">No products yet</h3>
                                    <p className="text-muted-foreground">Add your first Coderz product</p>
                                </div>
                            ) : (
                                <ScrollArea className="h-[500px]">
                                    <div className="space-y-3">
                                        {allProducts.map((product) => (
                                            <ProductRow
                                                key={product.id}
                                                product={product}
                                                onVerify={handleVerify}
                                                onReject={handleReject}
                                                onDelete={handleDelete}
                                                onToggleFeatured={handleToggleFeatured}
                                                isPending={isPending}
                                            />
                                        ))}
                                    </div>
                                </ScrollArea>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
