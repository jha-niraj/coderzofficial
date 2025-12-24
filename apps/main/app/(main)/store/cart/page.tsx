import Link from "next/link"
import Image from "next/image"
import { ChevronRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"

import { Button } from "@repo/ui/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Separator } from "@repo/ui/components/ui/separator"
import { Input } from "@repo/ui/components/ui/input"

export default function CartPage() {
    const cartItems = [
        {
            id: 1,
            name: "Code Ninja Hoodie",
            size: "L",
            color: "Midnight Black",
            price: 49.99,
            quantity: 1,
            image: "/placeholder.svg?height=200&width=200",
        },
        {
            id: 2,
            name: "Debug Mode T-Shirt",
            size: "M",
            color: "Navy Blue",
            price: 24.99,
            quantity: 1,
            image: "/placeholder.svg?height=200&width=200",
        },
    ]

    const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
    const shipping = 4.99
    const total = subtotal + shipping

    return (
        <div className="min-h-screen bg-background">
            <div className="container px-4 py-8 md:py-12">
                <div className="flex items-center text-sm mb-6">
                    <Link href="/" className="text-muted-foreground hover:text-foreground">
                        Home
                    </Link>
                    <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
                    <span className="font-medium">Shopping Cart</span>
                </div>
                <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
                {
                    cartItems.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <div className="space-y-4">
                                    {
                                        cartItems.map((item) => (
                                            <Card key={item.id} className="overflow-hidden">
                                                <div className="flex flex-col sm:flex-row">
                                                    <div className="relative h-40 w-full sm:h-auto sm:w-40 flex-shrink-0">
                                                        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                                                    </div>
                                                    <div className="flex flex-1 flex-col p-4">
                                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                                            <div>
                                                                <h3 className="font-medium">{item.name}</h3>
                                                                <div className="text-sm text-muted-foreground mt-1">
                                                                    <p>Size: {item.size}</p>
                                                                    <p>Color: {item.color}</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-medium">${item.price.toFixed(2)}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between mt-4">
                                                            <div className="flex items-center border rounded-md">
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
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-1" />
                                                                Remove
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))
                                    }
                                </div>
                            </div>
                            <div>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Order Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Subtotal</span>
                                            <span>${subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Shipping</span>
                                            <span>${shipping.toFixed(2)}</span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between font-medium">
                                            <span>Total</span>
                                            <span>${total.toFixed(2)}</span>
                                        </div>

                                        <div className="pt-4">
                                            <div className="flex gap-2 mb-4">
                                                <Input placeholder="Discount code" className="flex-1" />
                                                <Button variant="outline">Apply</Button>
                                            </div>
                                            <Link href="/checkout">
                                                <Button className="w-full">Proceed to Checkout</Button>
                                            </Link>
                                            <p className="text-xs text-center text-muted-foreground mt-4">Taxes calculated at checkout</p>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-center border-t pt-6">
                                        <Link href="/" className="text-sm text-primary hover:underline flex items-center">
                                            <ShoppingBag className="h-4 w-4 mr-1" />
                                            Continue Shopping
                                        </Link>
                                    </CardFooter>
                                </Card>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12">
                            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
                            <h2 className="text-xl font-medium mb-2">Your cart is empty</h2>
                            <p className="text-muted-foreground mb-6">Looks like you haven&apos;t added anything to your cart yet.</p>
                            <Link href="/">
                                <Button>Start Shopping</Button>
                            </Link>
                        </div>
                    )
                }
            </div>
        </div>
    )
}