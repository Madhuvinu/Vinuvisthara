import HeroSection from '@/components/HeroSection';
import FeaturedCollections from '@/components/FeaturedCollections';

// Force dynamic rendering since we fetch slider images from API
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedCollections />
    </>
  );
}
