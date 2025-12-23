import ProductDetails from "../../_components/productdetails";


export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <ProductDetails productId={id} />
    )
}