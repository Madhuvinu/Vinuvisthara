import CollectionPage from '@/components/CollectionPage';

export default function CollectionSlugPage({
  params,
}: {
  params: { slug: string };
}) {
  return <CollectionPage slug={params.slug} />;
}
