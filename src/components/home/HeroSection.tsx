import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bus as BusIcon } from "lucide-react";

const heroImg = "https://images.unsplash.com/photo-1570125909232-eb263c186f72?auto=format&fit=crop&w=900&q=80";

interface HeroSectionProps {
  isAuthenticated: boolean;
  userDetails: any;
}

const HeroSection: React.FC<HeroSectionProps> = ({ isAuthenticated, userDetails }) => {
  const navigate = useNavigate();

  return (
    <section className="flex flex-col md:flex-row items-center gap-8 md:gap-12 mb-12 mt-2">
      {/* Left: Main text */}
      <div className="flex-1 animate-fade-in">
        <h1 className="text-3xl md:text-5xl font-extrabold mb-4 text-primary drop-shadow-sm">
          Welcome to TransitNexus 🚍
        </h1>
        <p className="text-lg mb-6 text-muted-foreground max-w-xl">
          The smarter way to commute – buy passes, track buses in real time, and travel paperless in your city!
        </p>
        <div className="mt-5 flex gap-4 justify-center md:justify-start">
          <Button size="lg" className="animate-scale-in"
            onClick={() => navigate("/pass")}>
            Get a Pass
          </Button>
          <Button size="lg" variant="outline"
            onClick={() => navigate("/tickets")}>
            My Tickets
          </Button>
        </div>
      </div>
      {/* Right: Illustrative image */}
      <div className="flex-1 flex items-center justify-center animate-fade-in">
        <img
          src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=400&q=80"
          alt="Person using MacBook Pro"
          className="w-full max-w-xs md:max-w-md rounded-2xl shadow-xl object-cover"
        />
      </div>
    </section>
  );
};

export default HeroSection;
