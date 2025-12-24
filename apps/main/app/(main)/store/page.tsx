"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, ShoppingCart, Heart, Code, Coffee, Terminal, Sparkles, X } from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import { Badge } from "@repo/ui/components/ui/badge"
import { Card, CardContent, CardFooter } from "@repo/ui/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs"
import { toast } from "sonner"

export default function Home() {
    const [cartCount, setCartCount] = useState(0)
    const [showNotification, setShowNotification] = useState(false)
    const [notificationItem, setNotificationItem] = useState("")

    const handleAddToCart = (productName: string) => {
        setCartCount((prev) => prev + 1)
        setNotificationItem(productName)
        setShowNotification(true)

        setTimeout(() => {
            setShowNotification(false)
        }, 3000)
    }

    return (
        <div className="w-full py-8 min-h-screen bg-background">
            <div className="fixed top-16 right-4 z-50">
                <Link href="/store/checkout">
                    <Button className="rounded-full shadow-lg border border-primary/20 bg-background hover:bg-primary/10 text-foreground group">
                        <ShoppingCart className="h-5 w-5 mr-2 group-hover:text-primary transition-colors" />
                        Your Cart
                        {cartCount > 0 && <Badge className="ml-2 bg-primary text-primary-foreground">{cartCount}</Badge>}
                    </Button>
                </Link>
            </div>
            {
                showNotification && (
                    <div className="fixed top-20 right-4 z-50 bg-background border border-primary/20 shadow-lg rounded-lg p-4 animate-in slide-in-from-right-10 duration-300 max-w-xs">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                                    <ShoppingCart className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-medium">Item added to your cart</h4>
                                    <p className="text-sm text-muted-foreground">{notificationItem}</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowNotification(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )
            }
            <main className="flex-1">
                <section className="bg-gradient-to-b from-background to-muted relative overflow-hidden">
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute top-10 left-10 text-6xl font-mono opacity-20">{"{"}</div>
                        <div className="absolute bottom-10 right-10 text-6xl font-mono opacity-20">{"}"}</div>
                        <div className="absolute top-1/3 left-1/4 text-4xl font-mono opacity-10">{"<div>"}</div>
                        <div className="absolute bottom-1/3 right-1/4 text-4xl font-mono opacity-10">{"</div>"}</div>
                    </div>
                    <div className="container px-4 md:px-6 relative">
                        <div className="max-w-3xl mx-auto text-center mb-12">
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary mb-4">
                                <Coffee className="h-4 w-4 mr-2" />
                                <span className="text-sm font-medium">Powered by caffeine & questionable code</span>
                            </div>
                            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl mb-4 leading-tight">
                                Dress Like You{" "}
                                <span className="relative inline-block">
                                    <span className="relative z-10">Debug</span>
                                    <span className="absolute bottom-2 left-0 w-full h-3 bg-primary/20 -rotate-1"></span>
                                </span>{" "}
                                in Production
                            </h1>
                            <p className="text-muted-foreground md:text-xl mb-8">
                                Because nothing says &quot;I&apos;m a developer&quot; like wearing your error messages on your sleeve.
                            </p>
                            <div className="relative max-w-2xl mx-auto">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search for merch that compiles better than your code..."
                                    className="pl-12 py-7 text-lg rounded-full shadow-lg border-primary/20 focus:border-primary transition-all"
                                />
                                <Button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-6">Search</Button>
                            </div>
                            <div className="flex flex-wrap justify-center gap-2 mt-6">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-full group hover:bg-primary/10 transition-colors"
                                >
                                    <Terminal className="h-3.5 w-3.5 mr-1 group-hover:rotate-12 transition-transform" />
                                    Hoodies for Debugging
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-full group hover:bg-primary/10 transition-colors"
                                >
                                    <Code className="h-3.5 w-3.5 mr-1 group-hover:rotate-12 transition-transform" />
                                    T-Shirts That Don&apos;t Crash
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-full group hover:bg-primary/10 transition-colors"
                                >
                                    <Sparkles className="h-3.5 w-3.5 mr-1 group-hover:rotate-12 transition-transform" />
                                    Stickers for Stack Overflow Heroes
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="w-full py-8 bg-muted relative overflow-hidden">
                    <div className="max-w-7xl mx-auto">
                        <div className="absolute inset-0 opacity-5">
                            <div className="absolute top-10 right-10 text-6xl font-mono opacity-20">{"{"}</div>
                            <div className="absolute bottom-10 left-10 text-6xl font-mono opacity-20">{"}"}</div>
                        </div>
                        <div className="container px-4 md:px-6 relative">
                            <div className="flex items-center gap-2 mb-8">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Sparkles className="h-5 w-5 text-primary" />
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight">Featured Products</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card className="overflow-hidden group hover:shadow-xl transition-all border-primary/10 hover:border-primary/30">
                                    <div className="relative aspect-[4/3] overflow-hidden">
                                        <Image
                                            src="/placeholder.svg?height=300&width=400"
                                            alt="Limited Edition Hoodie"
                                            fill
                                            className="object-cover transition-transform group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6 text-white">
                                            <Badge className="self-start mb-2 bg-primary text-primary-foreground">Limited Edition</Badge>
                                            <h3 className="text-xl font-bold">&quot;It Works on My Machine&quot; Hoodie</h3>
                                            <p className="text-sm opacity-90">Only 50 pieces available. Bugs included at no extra charge.</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="font-bold">599 Credits</span>
                                                <span className="text-xs px-2 py-0.5 bg-amber-500/30 rounded-full">+60 EXP</span>
                                            </div>
                                            <Button
                                                className="mt-4 bg-white/90 hover:bg-white text-black"
                                                onClick={() => handleAddToCart('"It Works on My Machine" Hoodie')}
                                            >
                                                Add to Cart
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                                <Card className="overflow-hidden group hover:shadow-xl transition-all border-primary/10 hover:border-primary/30">
                                    <div className="relative aspect-[4/3] overflow-hidden">
                                        <Image
                                            src="/placeholder.svg?height=300&width=400"
                                            alt="New Arrival T-Shirts"
                                            fill
                                            className="object-cover transition-transform group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6 text-white">
                                            <Badge className="self-start mb-2 bg-amber-500 text-amber-950">New Arrival</Badge>
                                            <h3 className="text-xl font-bold">&quot;CSS Is My Cardio&quot; T-Shirts</h3>
                                            <p className="text-sm opacity-90">Fresh designs for those who flex with flexbox.</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="font-bold">299 Credits</span>
                                                <span className="text-xs px-2 py-0.5 bg-red-500/30 rounded-full">-30 EXP</span>
                                            </div>
                                            <Button
                                                className="mt-4 bg-white/90 hover:bg-white text-black"
                                                onClick={() => handleAddToCart('"CSS Is My Cardio" T-Shirts')}
                                            >
                                                Add to Cart
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                                <Card className="overflow-hidden group hover:shadow-xl transition-all border-primary/10 hover:border-primary/30">
                                    <div className="relative aspect-[4/3] overflow-hidden">
                                        <Image
                                            src="/placeholder.svg?height=300&width=400"
                                            alt="Sticker Bundle"
                                            fill
                                            className="object-cover transition-transform group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6 text-white">
                                            <Badge className="self-start mb-2 bg-green-500 text-green-950">Bundle Deal</Badge>
                                            <h3 className="text-xl font-bold">&quot;Merge Conflict&quot; Sticker Pack</h3>
                                            <p className="text-sm opacity-90">Buy 3, get 1 free. We won&apos;t force push these prices.</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="font-bold">199 Credits</span>
                                                <span className="text-xs px-2 py-0.5 bg-amber-500/30 rounded-full">+20 EXP</span>
                                            </div>
                                            <Button
                                                className="mt-4 bg-white/90 hover:bg-white text-black"
                                                onClick={() => handleAddToCart('"Merge Conflict" Sticker Pack')}
                                            >
                                                Add to Cart
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="py-16 max-w-7xl mx-auto">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight">Shop by Category</h2>
                                <p className="text-muted-foreground">Find the perfect merch to express your debugging style</p>
                            </div>
                        </div>
                        <Tabs defaultValue="all" className="w-full">
                            <TabsList className="w-full max-w-md mx-auto grid grid-cols-5 mb-12 bg-muted/50 p-1 rounded-full">
                                <TabsTrigger
                                    value="all"
                                    className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm"
                                >
                                    All
                                </TabsTrigger>
                                <TabsTrigger
                                    value="t-shirts"
                                    className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm"
                                >
                                    T-Shirts
                                </TabsTrigger>
                                <TabsTrigger
                                    value="hoodies"
                                    className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm"
                                >
                                    Hoodies
                                </TabsTrigger>
                                <TabsTrigger
                                    value="stickers"
                                    className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm"
                                >
                                    Stickers
                                </TabsTrigger>
                                <TabsTrigger
                                    value="mugs"
                                    className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm"
                                >
                                    Mugs
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="all" className="mt-0">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {
                                        [
                                            {
                                                id: 1,
                                                name: "404: Sleeve Not Found Hoodie",
                                                price: 499,
                                                exp: 50,
                                                category: "Hoodies",
                                                image: "/placeholder.svg?height=300&width=300"
                                            },
                                            {
                                                id: 2,
                                                name: "Ctrl+Alt+Defeat T-Shirt",
                                                price: 249,
                                                exp: -25,
                                                category: "T-Shirts",
                                                image: "/placeholder.svg?height=300&width=300",
                                            },
                                            {
                                                id: 3,
                                                name: "Java Before Code Mug",
                                                price: 149,
                                                exp: 15,
                                                category: "Mugs",
                                                image: "/placeholder.svg?height=300&width=300",
                                            },
                                            {
                                                id: 4,
                                                name: "Git Commit & Chill Stickers",
                                                price: 99,
                                                exp: 10,
                                                category: "Stickers",
                                                image: "/placeholder.svg?height=300&width=300",
                                            },
                                            {
                                                id: 5,
                                                name: "Dark Mode: It's Not a Phase Hoodie",
                                                price: 549,
                                                exp: 55,
                                                category: "Hoodies",
                                                image: "/placeholder.svg?height=300&width=300",
                                            },
                                            {
                                                id: 6,
                                                name: "Semicolon Savior T-Shirt",
                                                price: 249,
                                                exp: -25,
                                                category: "T-Shirts",
                                                image: "/placeholder.svg?height=300&width=300",
                                            },
                                            {
                                                id: 7,
                                                name: "Keyboard Warrior: Rage Edition Mug",
                                                price: 149,
                                                exp: 15,
                                                category: "Mugs",
                                                image: "/placeholder.svg?height=300&width=300",
                                            },
                                            {
                                                id: 8,
                                                name: "React: I'm Not Responsive Sticker",
                                                price: 49,
                                                exp: 5,
                                                category: "Stickers",
                                                image: "/placeholder.svg?height=300&width=300",
                                            },
                                        ].map((product, index: number) => (
                                            <Link key={index} href={`/store/product/${product.id}`}>
                                                <Card
                                                    key={product.id}
                                                    className="overflow-hidden transition-all hover:shadow-lg group border-primary/10 hover:border-primary/30"
                                                >
                                                    <div className="relative aspect-square overflow-hidden">
                                                        <Image
                                                            src={product.image || "/placeholder.svg"}
                                                            alt={product.name}
                                                            fill
                                                            className="object-cover transition-transform group-hover:scale-105"
                                                        />
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <Heart className="h-4 w-4" />
                                                            <span className="sr-only">Add to wishlist</span>
                                                        </Button>
                                                        <div className="absolute top-2 left-2">
                                                            <Badge className="bg-primary/90 hover:bg-primary text-primary-foreground">Hot Item</Badge>
                                                        </div>
                                                    </div>
                                                    <CardContent className="p-4">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <h3 className="font-medium group-hover:text-primary transition-colors">{product.name}</h3>
                                                                <p className="text-sm text-muted-foreground">{product.category}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-medium">{product.price} Credits</p>
                                                                <p
                                                                    className={`text-xs ${product.exp > 0 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}
                                                                >
                                                                    {product.exp > 0 ? `+${product.exp} EXP` : `${product.exp} EXP`}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                    <CardFooter className="p-4 pt-0">
                                                        <Button
                                                            className="w-full bg-primary/90 hover:bg-primary transition-colors"
                                                            onClick={() => handleAddToCart(product.name)}
                                                        >
                                                            Add to Cart
                                                        </Button>
                                                    </CardFooter>
                                                </Card>
                                            </Link>
                                        ))
                                    }
                                </div>
                            </TabsContent>
                            <TabsContent value="t-shirts" className="mt-0">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {/* T-Shirts content would go here */}
                                </div>
                            </TabsContent>
                            <TabsContent value="hoodies" className="mt-0">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {/* Hoodies content would go here */}
                                </div>
                            </TabsContent>
                            <TabsContent value="stickers" className="mt-0">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {/* Stickers content would go here */}
                                </div>
                            </TabsContent>
                            <TabsContent value="mugs" className="mt-0">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {/* Mugs content would go here */}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </section>
            </main>
        </div>
    )
}