import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Heart, Minus, Plus, Share2, Star, Truck } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@repo/ui/components/ui/label";
import { Badge } from "@repo/ui/components/ui/badge";

export default function ProductDetails({ productId } : { productId: string }) {
    const product = {
        id: productId,
        name: "Code Ninja Hoodie",
        price: 49.99,
        originalPrice: 59.99,
        discount: 17,
        description:
            "The Code Ninja Hoodie is perfect for those late-night coding sessions. Made with premium cotton blend for maximum comfort and durability. Features a modern fit with a tech-inspired design that showcases your passion for coding.",
        features: [
            "80% cotton, 20% polyester blend",
            "Ribbed cuffs and hem",
            "Kangaroo pocket",
            "Drawstring hood",
            "Machine washable",
        ],
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: [
            { name: "Midnight Black", value: "#000000" },
            { name: "Navy Blue", value: "#0a192f" },
            { name: "Dark Gray", value: "#2d3748" },
        ],
        images: [
            "/placeholder.svg?height=600&width=600",
            "/placeholder.svg?height=600&width=600",
            "/placeholder.svg?height=600&width=600",
            "/placeholder.svg?height=600&width=600",
        ],
        rating: 4.8,
        reviewCount: 124,
        inStock: true,
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container px-4 py-8 md:py-12">
                <nav className="flex items-center text-sm mb-6">
                    <Link href="/" className="text-muted-foreground hover:text-foreground">
                        Home
                    </Link>
                    <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
                    <Link href="/category/hoodies" className="text-muted-foreground hover:text-foreground">
                        Hoodies
                    </Link>
                    <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
                    <span className="font-medium">{product.name}</span>
                </nav>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    <div className="space-y-4">
                        <div className="relative aspect-square overflow-hidden rounded-lg border">
                            <Image
                                src={product.images[0] || "/placeholder.svg"}
                                alt={product.name}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {
                                product.images.map((image, index) => (
                                    <div
                                        key={index}
                                        className="relative aspect-square overflow-hidden rounded-md border cursor-pointer hover:border-primary"
                                    >
                                        <Image
                                            src={image || "/placeholder.svg"}
                                            alt={`${product.name} - View ${index + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold">{product.name}</h1>
                            <div className="flex items-center gap-2 mt-2">
                                <div className="flex">
                                    {
                                        [...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-primary text-primary" : "text-muted-foreground"
                                                    }`}
                                            />
                                        ))
                                    }
                                </div>
                                <span className="text-sm text-muted-foreground">
                                    {product.rating} ({product.reviewCount} reviews)
                                </span>
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold">${product.price}</span>
                            {
                                product.originalPrice && (
                                    <span className="text-lg text-muted-foreground line-through">${product.originalPrice}</span>
                                )
                            }
                            {
                                product.discount && (
                                    <Badge variant="outline" className="text-green-600 border-green-600 ml-2">
                                        {product.discount}% OFF
                                    </Badge>
                                )
                            }
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-medium mb-2">Select Size</h3>
                                <RadioGroup defaultValue="M" className="grid grid-cols-5 gap-2">
                                    {
                                        product.sizes.map((size) => (
                                            <div key={size}>
                                                <RadioGroupItem value={size} id={`size-${size}`} className="peer sr-only" />
                                                <Label
                                                    htmlFor={`size-${size}`}
                                                    className="flex h-10 w-full cursor-pointer items-center justify-center rounded-md border text-center font-medium peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:text-primary"
                                                >
                                                    {size}
                                                </Label>
                                            </div>
                                        ))
                                    }
                                </RadioGroup>
                            </div>
                            <div>
                                <h3 className="font-medium mb-2">Select Color</h3>
                                <RadioGroup defaultValue="Midnight Black" className="flex gap-2">
                                    {
                                        product.colors.map((color) => (
                                            <div key={color.name} className="flex flex-col items-center gap-1">
                                                <RadioGroupItem value={color.name} id={`color-${color.name}`} className="peer sr-only" />
                                                <Label
                                                    htmlFor={`color-${color.name}`}
                                                    className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-primary peer-data-[state=checked]:ring-offset-2"
                                                >
                                                    <span className="absolute inset-0 rounded-full" style={{ backgroundColor: color.value }}></span>
                                                </Label>
                                                <span className="text-xs">{color.name}</span>
                                            </div>
                                        ))
                                    }
                                </RadioGroup>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center border rounded-md">
                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-none">
                                        <Minus className="h-4 w-4" />
                                        <span className="sr-only">Decrease quantity</span>
                                    </Button>
                                    <span className="w-12 text-center">1</span>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-none">
                                        <Plus className="h-4 w-4" />
                                        <span className="sr-only">Increase quantity</span>
                                    </Button>
                                </div>
                                <Button className="flex-1">Add to Cart</Button>
                                <Button variant="outline" size="icon">
                                    <Heart className="h-5 w-5" />
                                    <span className="sr-only">Add to wishlist</span>
                                </Button>
                                <Button variant="outline" size="icon">
                                    <Share2 className="h-5 w-5" />
                                    <span className="sr-only">Share product</span>
                                </Button>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Truck className="h-4 w-4" />
                                <span>Free shipping on orders over $50</span>
                            </div>
                        </div>
                        <Tabs defaultValue="description" className="mt-8">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="description">Description</TabsTrigger>
                                <TabsTrigger value="features">Features</TabsTrigger>
                                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                            </TabsList>
                            <TabsContent value="description" className="mt-4 text-muted-foreground">
                                <p>{product.description}</p>
                            </TabsContent>
                            <TabsContent value="features" className="mt-4">
                                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                                    {
                                        product.features.map((feature, index) => (
                                            <li key={index}>{feature}</li>
                                        ))
                                    }
                                </ul>
                            </TabsContent>
                            <TabsContent value="reviews" className="mt-4">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="text-4xl font-bold">{product.rating}</div>
                                        <div>
                                            <div className="flex">
                                                {
                                                    [...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-primary text-primary" : "text-muted-foreground"
                                                                }`}
                                                        />
                                                    ))
                                                }
                                            </div>
                                            <p className="text-sm text-muted-foreground">Based on {product.reviewCount} reviews</p>
                                        </div>
                                    </div>
                                    <Button variant="outline">Write a Review</Button>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
                <div className="mt-16">
                    <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {
                            [1, 2, 3, 4].map((id) => (
                                <Card key={id} className="overflow-hidden">
                                    <div className="relative aspect-square overflow-hidden">
                                        <Image
                                            src="/placeholder.svg?height=300&width=300"
                                            alt="Related Product"
                                            fill
                                            className="object-cover transition-transform hover:scale-105"
                                        />
                                    </div>
                                    <CardContent className="p-4">
                                        <h3 className="font-medium">Related Product {id}</h3>
                                        <p className="text-sm text-muted-foreground">Category</p>
                                        <p className="font-medium mt-2">$29.99</p>
                                    </CardContent>
                                </Card>
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}