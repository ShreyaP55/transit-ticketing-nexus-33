
import HeroSection from "@/components/home/HeroSection";
import HowItWorks from "@/components/home/HowItWorks";
import FeatureCards from "@/components/home/FeatureCards";
import MainLayout from "@/components/layout/MainLayout";
import { ConcessionSetupPrompt } from "@/components/concession/ConcessionSetupPrompt";
import { useUser } from "@/context/UserContext";

const Index = () => {
  const { isAuthenticated, userDetails } = useUser();

  return (
    <MainLayout showSidebar={false}>
      <div className="min-h-screen">
        <HeroSection isAuthenticated={isAuthenticated} userDetails={userDetails} />
        {isAuthenticated && (
          <div className="max-w-4xl mx-auto px-4 py-6">
            <ConcessionSetupPrompt />
          </div>
        )}
        <HowItWorks />
        <FeatureCards />
      </div>
    </MainLayout>
  );
};

export default Index;
