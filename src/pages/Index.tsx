
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import MainLayout from "@/components/layout/MainLayout";
import { CheckCircle, ClipboardCheck, Calendar, Bus, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const featureCards = [
  {
    icon: <Calendar size={32} className="text-primary" />,
    title: "Monthly Pass",
    desc: "Unlimited city rides with a digital monthly pass. Never stand in lines again."
  },
  {
    icon: <MapPin size={32} className="text-primary" />,
    title: "Live Tracking",
    desc: "Track your bus in real time and plan stress-free journeys from anywhere."
  },
  {
    icon: <ClipboardCheck size={32} className="text-primary" />,
    title: "Your Tickets",
    desc: "Access and manage your bookings anytime—no paper needed."
  },
];

const steps = [
  {
    icon: <User size={28} className="text-primary" />,
    title: "Sign Up",
    desc: "Create your profile in seconds."
  },
  {
    icon: <Bus size={28} className="text-primary" />,
    title: "Select Trip",
    desc: "Choose your route or get a monthly pass."
  },
  {
    icon: <CheckCircle size={28} className="text-primary" />,
    title: "Ride",
    desc: "Board, scan & travel with ease."
  },
];

const heroImg =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80"; // Forest, green, peaceful

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, userDetails } = useUser();

  return (
    <MainLayout title="Home">
      <div className="relative w-full max-w-5xl mx-auto my-8 px-2 sm:px-4">
        {/* Decorative BG */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/30 rounded-full blur-3xl z-0 animate-fade-in" />
        <div className="absolute top-1/2 -left-24 w-64 h-32 bg-secondary/50 rounded-full blur-3xl z-0 animate-fade-in" />
        {/* Hero Section */}
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 py-8 mb-12">
          {/* Hero Text */}
          <div className="flex-1 text-center md:text-left space-y-4 animate-fade-in">
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-2 gradient-heading">
              {isAuthenticated && userDetails?.firstName
                ? `Welcome, ${userDetails.firstName}!`
                : "TransitNexus – Smart City Transit"}
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Experience simple, modern travel. Book tickets, renew your pass, track buses—everything at your fingertips.
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
          {/* Hero Image */}
          <div className="flex-1 flex items-center justify-center animate-fade-in">
            <div className="shadow-2xl rounded-xl overflow-hidden w-[320px] h-[220px] relative group hover:scale-105 transition-transform duration-200">
              <img
                src={heroImg}
                alt="Modern transit"
                className="object-cover w-full h-full"
                loading="lazy"
              />
              <div className="absolute top-3 right-3 bg-white/85 px-3 py-1 rounded-full flex items-center gap-2 shadow animate-fade-in">
                <Bus size={20} className="text-primary" />
                <span className="font-bold text-sm text-primary">
                  Green Route
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 animate-fade-in">
          {featureCards.map((feat, idx) => (
            <div
              className="bg-white border border-primary/20 p-6 rounded-xl text-center shadow-lg hover:scale-105 transition-all duration-300 flex flex-col items-center gap-3 animate-scale-in"
              key={idx}
              style={{ animationDelay: `${idx * 120}ms` }}
            >
              <div className="mb-2">{feat.icon}</div>
              <h3 className="text-lg font-semibold text-primary">{feat.title}</h3>
              <p className="text-muted-foreground">{feat.desc}</p>
            </div>
          ))}
        </div>
        
        {/* How It Works */}
        <div className="mt-8 mb-16 px-1 py-8 bg-white/90 rounded-2xl shadow-md animate-fade-in">
          <h2 className="text-2xl font-bold text-primary text-center mb-8">How it works</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            {steps.map((step, idx) => (
              <div
                className={`flex flex-col items-center flex-1 max-w-xs transition-all duration-200 animate-fade-in hover:scale-105`}
                style={{ animationDelay: `${idx * 120}ms` }}
                key={idx}
              >
                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-primary/10 mb-3 border border-primary/10">{step.icon}</div>
                <div className="text-xl font-medium text-primary text-center">{step.title}</div>
                <div className="text-muted-foreground text-center">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        {/* Removed custom BusInn footer in favor of MainLayout's footer */}

      </div>
    </MainLayout>
  );
};

export default Index;
