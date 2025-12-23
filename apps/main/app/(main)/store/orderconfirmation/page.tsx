import Link from "next/link"
import Image from "next/image"
import { CheckCircle2, ChevronRight, Package, Truck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function OrderConfirmationPage() {
    // This would normally be fetched from an order state or API
    const order = {
        id: "ORD12345678",
        date: "March 28, 2025",
        total: 797,
        totalExp: 75,
        items: [
            {
                id: 1,
                name: "Code Ninja Hoodie",
                size: "L",
                color: "Midnight Black",
                price: 499,
                exp: 50,
                quantity: 1,
                image: "/placeholder.svg?height=80&width=80",
            },
            {
                id: 2,
                name: "Debug Mode T-Shirt",
                size: "M",
                color: "Navy Blue",
                price: 249,
                exp: 25,
                quantity: 1,
                image: "/placeholder.svg?height=80&width=80",
            },
        ],
        shipping: 49,
        estimatedDelivery: "April 2-5, 2025",
        shippingAddress: {
            name: "John Doe",
            street: "123 Main Street",
            city: "Anytown",
            state: "CA",
            zip: "12345",
            country: "United States",
        },
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container px-4 py-8 md:py-12">
                <div className="flex items-center text-sm mb-6">
                    <Link href="/" className="text-muted-foreground hover:text-foreground">
                        Home
                    </Link>
                    <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
                    <span className="font-medium">Order Confirmation</span>
                </div>
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
                        <p className="text-muted-foreground">
                            Thank you for your purchase. Your order has been confirmed and will be shipped soon.
                        </p>
                        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                            <span className="text-amber-700 dark:text-amber-300 font-medium">+{order.totalExp} EXP Earned!</span>
                            <span className="text-xs px-2 py-0.5 bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 rounded-full">
                                Level Up Progress: 65%
                            </span>
                        </div>
                    </div>
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Order #{order.id}</CardTitle>
                            <p className="text-sm text-muted-foreground">Placed on {order.date}</p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="font-medium mb-4">Order Status</h3>
                                <div className="relative flex justify-between mb-8">
                                    <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 bg-muted" />
                                    <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border border-primary bg-primary text-primary-foreground">
                                        <CheckCircle2 className="h-4 w-4" />
                                    </div>
                                    <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border border-muted bg-muted text-muted-foreground">
                                        <Package className="h-4 w-4" />
                                    </div>
                                    <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border border-muted bg-muted text-muted-foreground">
                                        <Truck className="h-4 w-4" />
                                    </div>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <div className="text-center">
                                        <p className="font-medium">Order Placed</p>
                                        <p className="text-muted-foreground">{order.date}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-medium">Processing</p>
                                        <p className="text-muted-foreground">In progress</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-medium">Estimated Delivery</p>
                                        <p className="text-muted-foreground">{order.estimatedDelivery}</p>
                                    </div>
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <h3 className="font-medium mb-2">Items</h3>
                                <div className="space-y-3">
                                    {
                                        order.items.map((item) => (
                                            <div key={item.id} className="flex items-center gap-4">
                                                <div className="relative h-16 w-16 overflow-hidden rounded-md border">
                                                    <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-medium">{item.name}</h4>
                                                    <p className="text-xs text-muted-foreground">
                                                        {item.size} · {item.color} · Qty: {item.quantity}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-medium">{item.price} Credits</div>
                                                    <div className="text-xs text-amber-600 dark:text-amber-400">+{item.exp} EXP</div>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-medium mb-2">Shipping Address</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {order.shippingAddress.name}
                                        <br />
                                        {order.shippingAddress.street}
                                        <br />
                                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                                        <br />
                                        {order.shippingAddress.country}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-medium mb-2">Order Summary</h3>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Subtotal</span>
                                            <span>{order.total - order.shipping} Credits</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Shipping</span>
                                            <span>{order.shipping} Credits</span>
                                        </div>
                                        <div className="flex justify-between font-medium pt-1">
                                            <span>Total</span>
                                            <span>{order.total} Credits</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-amber-600 dark:text-amber-400 pt-1">
                                            <span>EXP Earned</span>
                                            <span>+{order.totalExp} EXP</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col sm:flex-row gap-4 justify-between">
                            <Button variant="outline" className="w-full sm:w-auto">
                                Track Order
                            </Button>
                            <Link href="/" className="w-full sm:w-auto">
                                <Button className="w-full">Continue Shopping</Button>
                            </Link>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    )
}