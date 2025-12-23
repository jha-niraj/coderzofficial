"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
    ChevronRight, CreditCard, Minus, Plus, Trash2, Truck,
    Coffee, Code, AlertTriangle, CheckCircle2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export default function CheckoutPage() {
    const [step, setStep] = useState<"cart" | "shipping" | "payment" | "confirm">("cart")

    const cartItems = [
        {
            id: 1,
            name: "404: Sleeve Not Found Hoodie",
            price: 499,
            exp: 50,
            quantity: 1,
            image: "/placeholder.svg?height=80&width=80",
            availableSizes: ["S", "M", "L", "XL", "XXL"],
            availableColors: ["Midnight Black", "Navy Blue", "Dark Gray"],
            selectedSize: "",
            selectedColor: "",
        },
        {
            id: 2,
            name: "Ctrl+Alt+Defeat T-Shirt",
            price: 249,
            exp: -25,
            quantity: 1,
            image: "/placeholder.svg?height=80&width=80",
            availableSizes: ["S", "M", "L", "XL"],
            availableColors: ["White", "Gray", "Black"],
            selectedSize: "",
            selectedColor: "",
        },
    ]

    const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
    const totalExp = cartItems.reduce((total, item) => total + item.exp * item.quantity, 0)
    const shipping = 49
    const total = subtotal + shipping

    return (
        <div className="w-full min-h-screen bg-background">
            <div className="fixed top-16 right-4 z-50">
                <Link href="/checkout">
                    <Button className="rounded-full shadow-lg border border-primary/20 bg-background hover:bg-primary/10 text-foreground group">
                        <ShoppingCart className="h-5 w-5 mr-2 group-hover:text-primary transition-colors" />
                        Your Cart
                        <Badge className="ml-2 bg-primary text-primary-foreground">2</Badge>
                    </Button>
                </Link>
            </div>
            <div className="max-w-7xl mx-auto px-4 py-4">
                <h1 className="text-3xl font-bold mb-2">Checkout</h1>
                <p className="text-muted-foreground mb-8">
                    Almost there! Just a few more clicks before you can debug in style.
                </p>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold">Checkout Progress</h2>
                                <div className="text-sm text-muted-foreground">
                                    Step {step === "cart" ? "1" : step === "shipping" ? "2" : step === "payment" ? "3" : "4"} of 4
                                </div>
                            </div>
                            <div className="relative flex justify-between mb-8">
                                <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 bg-muted" />
                                <div
                                    className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border ${step === "cart" || step === "shipping" || step === "payment" || step === "confirm"
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-muted bg-muted text-muted-foreground"
                                        }`}
                                >
                                    <ShoppingCart className="h-5 w-5" />
                                    <span className="absolute -bottom-6 text-xs font-medium whitespace-nowrap">Your Cart</span>
                                </div>
                                <div
                                    className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border ${step === "shipping" || step === "payment" || step === "confirm"
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-muted bg-muted text-muted-foreground"
                                        }`}
                                >
                                    <Truck className="h-5 w-5" />
                                    <span className="absolute -bottom-6 text-xs font-medium whitespace-nowrap">Shipping</span>
                                </div>
                                <div
                                    className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border ${step === "payment" || step === "confirm"
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-muted bg-muted text-muted-foreground"
                                        }`}
                                >
                                    <CreditCard className="h-5 w-5" />
                                    <span className="absolute -bottom-6 text-xs font-medium whitespace-nowrap">Payment</span>
                                </div>
                                <div
                                    className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border ${step === "confirm"
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-muted bg-muted text-muted-foreground"
                                        }`}
                                >
                                    <CheckCircle2 className="h-5 w-5" />
                                    <span className="absolute -bottom-6 text-xs font-medium whitespace-nowrap">Confirm</span>
                                </div>
                            </div>
                        </div>
                        {
                            step === "cart" && (
                                <Card className="overflow-hidden border-primary/10 shadow-md">
                                    <CardHeader className="bg-muted/30 border-b">
                                        <CardTitle className="flex items-center gap-2">
                                            <ShoppingCart className="h-5 w-5" />
                                            Your Cart of Questionable Coding Decisions
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-2">
                                        {
                                            cartItems.length === 0 ? (
                                                <div className="text-center py-3">
                                                    <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                                        <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                                                    </div>
                                                    <h3 className="text-lg font-medium mb-2">
                                                        Your cart is emptier than your variable naming inspiration
                                                    </h3>
                                                    <p className="text-muted-foreground mb-6">
                                                        Looks like you haven&apos;t added anything yet. Time to debug that.
                                                    </p>
                                                    <Link href="/">
                                                        <Button>Find Some Merch</Button>
                                                    </Link>
                                                </div>
                                            ) : (
                                                cartItems.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="border rounded-lg p-4 bg-background shadow-sm hover:shadow-md transition-shadow"
                                                    >
                                                        <div className="flex flex-col sm:flex-row gap-4">
                                                            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border">
                                                                <Image
                                                                    src={item.image || "/placeholder.svg"}
                                                                    alt={item.name}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent"></div>
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                                                    <div>
                                                                        <h3 className="font-medium">{item.name}</h3>
                                                                        <div className="flex items-center gap-2 mt-1">
                                                                            <span className="text-sm font-medium">{item.price} Credits</span>
                                                                            <Badge
                                                                                className={`${item.exp > 0 ? "bg-amber-500/20 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400" : "bg-red-500/20 text-red-600 dark:bg-red-500/10 dark:text-red-400"} hover:bg-amber-500/30`}
                                                                            >
                                                                                {item.exp > 0 ? `+${item.exp} EXP` : `${item.exp} EXP`}
                                                                            </Badge>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center border rounded-md shadow-sm">
                                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none">
                                                                            <Minus className="h-3 w-3" />
                                                                            <span className="sr-only">Decrease quantity</span>
                                                                        </Button>
                                                                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none">
                                                                            <Plus className="h-3 w-3" />
                                                                            <span className="sr-only">Increase quantity</span>
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                                                    <div className="space-y-2">
                                                                        <Label htmlFor={`size-${item.id}`} className="text-sm">
                                                                            Select Size
                                                                        </Label>
                                                                        <Select>
                                                                            <SelectTrigger id={`size-${item.id}`} className="bg-background">
                                                                                <SelectValue placeholder="Choose size (like your confidence level)" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                {
                                                                                    item.availableSizes.map((size) => (
                                                                                        <SelectItem key={size} value={size}>
                                                                                            {size}
                                                                                        </SelectItem>
                                                                                    ))
                                                                                }
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label htmlFor={`color-${item.id}`} className="text-sm">
                                                                            Select Color
                                                                        </Label>
                                                                        <Select>
                                                                            <SelectTrigger id={`color-${item.id}`} className="bg-background">
                                                                                <SelectValue placeholder="Choose color (unlike your code)" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                {
                                                                                    item.availableColors.map((color) => (
                                                                                        <SelectItem key={color} value={color}>
                                                                                            {color}
                                                                                        </SelectItem>
                                                                                    ))
                                                                                }
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>
                                                                </div>
                                                                <div className="flex justify-end mt-4">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                                                                    >
                                                                        <Trash2 className="h-4 w-4 mr-1" />
                                                                        Remove (No Undo)
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )
                                        }
                                    </CardContent>
                                    <CardFooter className="flex justify-end p-6 bg-muted/30 border-t">
                                        <Button onClick={() => setStep("shipping")} className="group">
                                            Continue to Shipping
                                            <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </CardFooter>
                                </Card>
                            )
                        }
                        {
                            step === "shipping" && (
                                <Card className="overflow-hidden border-primary/10 shadow-md">
                                    <CardHeader className="bg-muted/30 border-b">
                                        <CardTitle className="flex items-center gap-2">
                                            <Truck className="h-5 w-5" />
                                            Shipping Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6 p-6">
                                        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-100 dark:border-amber-900/50">
                                            <p className="text-amber-800 dark:text-amber-200 text-sm flex items-center">
                                                <Coffee className="h-4 w-4 mr-2" />
                                                We promise to ship faster than your code compiles
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="first-name">First Name</Label>
                                                <Input id="first-name" placeholder="Your debugging alias" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="last-name">Last Name</Label>
                                                <Input id="last-name" placeholder="Your Stack Overflow surname" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input id="email" type="email" placeholder="Where we'll send your virtual high-fives" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="address">Street Address</Label>
                                            <Input id="address" placeholder="Where your packages go when they're not lost" />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="city">City</Label>
                                                <Input id="city" placeholder="Your localhost" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="state">State</Label>
                                                <Input id="state" placeholder="State of confusion?" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="zip">ZIP Code</Label>
                                                <Input id="zip" placeholder="Not your GitHub repo ID" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input id="phone" placeholder="For delivery drivers to ignore" />
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-between p-6 bg-muted/30 border-t">
                                        <Button variant="outline" onClick={() => setStep("cart")}>
                                            Back to Cart
                                        </Button>
                                        <Button onClick={() => setStep("payment")} className="group">
                                            Continue to Payment
                                            <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </CardFooter>
                                </Card>
                            )
                        }
                        {
                            step === "payment" && (
                                <Card className="overflow-hidden border-primary/10 shadow-md">
                                    <CardHeader className="bg-muted/30 border-b">
                                        <CardTitle className="flex items-center gap-2">
                                            <CreditCard className="h-5 w-5" />
                                            Payment Method
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6 p-6">
                                        <div className="p-6 bg-primary/10 rounded-lg border border-primary/20 shadow-sm">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-medium">Your Balance</h3>
                                                    <p className="text-sm text-muted-foreground">More credits than your GitHub contributions</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-bold">1250 Credits</p>
                                                    <p className="text-xs text-amber-600 dark:text-amber-400">Level 5 Code Wizard</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Payment Confirmation</Label>
                                            <RadioGroup defaultValue="credits">
                                                <div className="flex items-center space-x-2 border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                                    <RadioGroupItem value="credits" id="credits" />
                                                    <Label htmlFor="credits" className="flex-1">
                                                        <div className="font-medium">Pay with Credits</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            Use your available credits balance (no bugs included)
                                                        </div>
                                                    </Label>
                                                    <div className="text-right font-medium">{total} Credits</div>
                                                </div>
                                                <div className="flex items-center space-x-2 border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                                    <RadioGroupItem value="buy" id="buy" />
                                                    <Label htmlFor="buy" className="flex-1">
                                                        <div className="font-medium">Buy More Credits</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            Purchase additional credits (cheaper than therapy)
                                                        </div>
                                                    </Label>
                                                    <Button variant="outline" size="sm">
                                                        Buy Credits
                                                    </Button>
                                                </div>
                                            </RadioGroup>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-between p-6 bg-muted/30 border-t">
                                        <Button variant="outline" onClick={() => setStep("shipping")}>
                                            Back to Shipping
                                        </Button>
                                        <Button onClick={() => setStep("confirm")} className="group">
                                            Review Order
                                            <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </CardFooter>
                                </Card>
                            )
                        }
                        {
                            step === "confirm" && (
                                <Card className="overflow-hidden border-primary/10 shadow-md">
                                    <CardHeader className="bg-muted/30 border-b">
                                        <CardTitle className="flex items-center gap-2">
                                            <CheckCircle2 className="h-5 w-5" />
                                            Review Your Order (No Code Review Needed)
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6 p-6">
                                        <div>
                                            <h3 className="font-medium mb-2">Shipping Address</h3>
                                            <div className="p-3 bg-muted/30 rounded-lg">
                                                <p className="text-sm">
                                                    John Doe
                                                    <br />
                                                    123 Main Street
                                                    <br />
                                                    Anytown, CA 12345
                                                    <br />
                                                    United States
                                                    <br />
                                                    (123) 456-7890
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-medium mb-2">Payment Method</h3>
                                            <div className="p-3 bg-muted/30 rounded-lg">
                                                <p className="text-sm flex items-center">
                                                    <CreditCard className="h-4 w-4 mr-2 text-primary" />
                                                    Credits (Balance: 1250 Credits) - More valuable than Bitcoin
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-medium mb-2">Items</h3>
                                            <div className="space-y-3">
                                                {
                                                    cartItems.map((item) => (
                                                        <div key={item.id} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                                                            <div className="relative h-16 w-16 overflow-hidden rounded-md border">
                                                                <Image
                                                                    src={item.image || "/placeholder.svg"}
                                                                    alt={item.name}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent"></div>
                                                            </div>
                                                            <div className="flex-1">
                                                                <h4 className="text-sm font-medium">{item.name}</h4>
                                                                <p className="text-xs text-muted-foreground">
                                                                    Size: L · Color: Midnight Black · Qty: {item.quantity}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-sm font-medium">{item.price} Credits</div>
                                                                <div
                                                                    className={`text-xs ${item.exp > 0 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}
                                                                >
                                                                    {item.exp > 0 ? `+${item.exp} EXP` : `${item.exp} EXP`}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-between p-6 bg-muted/30 border-t">
                                        <Button variant="outline" onClick={() => setStep("payment")}>
                                            Back to Payment
                                        </Button>
                                        <Button className="bg-green-600 hover:bg-green-700 text-white">Place Order (No Rollbacks)</Button>
                                    </CardFooter>
                                </Card>
                            )
                        }
                    </div>
                    <div>
                        <Card className="overflow-hidden border-primary/10 shadow-md sticky top-20">
                            <CardHeader className="bg-muted/30 border-b">
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 p-6">
                                <div className="space-y-2">
                                    {
                                        cartItems.map((item) => (
                                            <div key={item.id} className="flex justify-between text-sm">
                                                <span>
                                                    {item.name} × {item.quantity}
                                                </span>
                                                <div className="text-right">
                                                    <div>{item.price * item.quantity} Credits</div>
                                                    <div
                                                        className={`text-xs ${item.exp > 0 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}
                                                    >
                                                        {item.exp > 0 ? `+${item.exp * item.quantity} EXP` : `${item.exp * item.quantity} EXP`}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                                <Separator />
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <div className="text-right">
                                        <div>{subtotal} Credits</div>
                                        <div
                                            className={`text-xs ${totalExp > 0 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}
                                        >
                                            {totalExp > 0 ? `+${totalExp} EXP` : `${totalExp} EXP`}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span>{shipping} Credits</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-medium">
                                    <span>Total</span>
                                    <div className="text-right">
                                        <div>{total} Credits</div>
                                        <div
                                            className={`text-xs ${totalExp > 0 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}
                                        >
                                            {totalExp > 0 ? `+${totalExp} EXP` : `${totalExp} EXP`}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg mt-4 border border-amber-100 dark:border-amber-900/50">
                                    <div className="flex items-center gap-2">
                                        <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                                            <span className="text-amber-600 dark:text-amber-400 text-xs font-bold">LVL</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Level Progress</p>
                                            <p className="text-xs text-amber-600 dark:text-amber-400">
                                                {totalExp > 0
                                                    ? `This purchase will earn you ${totalExp} EXP (more than fixing that bug)`
                                                    : `This purchase will cost you ${Math.abs(totalExp)} EXP (T-shirts require skill!)`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-3 h-2.5 w-full bg-amber-200 dark:bg-amber-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-amber-500 dark:bg-amber-400 transition-all duration-1000"
                                            style={{ width: "65%" }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-center mt-1 text-amber-600 dark:text-amber-400">325/500 EXP to Level 6</p>
                                </div>
                            </CardContent>
                            <div className="p-6 border-t">
                                <h3 className="font-medium mb-2 text-sm">Have a promo code?</h3>
                                <div className="flex gap-2">
                                    <Input placeholder="Try 'ITRIEDCSS'" className="flex-1" />
                                    <Button variant="outline">Apply</Button>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2 italic">* Not valid with other debugging sessions</p>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}