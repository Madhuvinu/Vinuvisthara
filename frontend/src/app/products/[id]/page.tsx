import ProductDetailPage from '@/components/ProductDetailPage';

export default function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  return <ProductDetailPage productId={params.id} />;
}
