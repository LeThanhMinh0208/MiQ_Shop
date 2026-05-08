import HeroSection from '../components/home/HeroSection.jsx';
import BrandLogos from '../components/home/BrandLogos.jsx';
import FeaturedCategories from '../components/home/FeaturedCategories.jsx';
import RecommendationSection from '../components/home/RecommendationSection.jsx';
import NewsletterSection from '../components/home/NewsletterSection.jsx';

const Home = () => {
  return (
    <>
      <HeroSection />
      <BrandLogos />
      <FeaturedCategories />
      <RecommendationSection title="RECOMMENDATIONS FOR YOU" />
      <NewsletterSection />
    </>
  );
};

export default Home;