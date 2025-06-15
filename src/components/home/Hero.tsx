
import React from "react";
import { Clock, CreditCard, Bell, Shield, MapPin, Smartphone, ClipboardCheck, CheckCircle, Bus, User } from "lucide-react";

interface HeroProps {
  userFirstName?: string;
}

const features = [
  {
    icon: <Clock className="h-6 w-6 text-purple-300" />,
    title: "Quick Application",
    desc: "Apply for your bus pass in minutes, not hours. Our streamlined process saves you time.",
  },
  {
    icon: <CreditCard className="h-6 w-6 text-purple-300" />,
    title: "Secure Payments",
    desc: "Make payments with confidence using secure gateways. Your financial information is protected.",
  },
  {
    icon: <Bell className="h-6 w-6 text-purple-300" />,
    title: "Real-time Updates",
    desc: "Receive instant notifications about your journey and tickets.",
  },
  {
    icon: <Shield className="h-6 w-6 text-purple-300" />,
    title: "Verified Security",
    desc: "Your data is protected with enterprise-grade security and encryption.",
  },
  {
    icon: <MapPin className="h-6 w-6 text-purple-300" />,
    title: "Route Planning",
    desc: "Access detailed route information and plan your journey.",
  },
  {
    icon: <Smartphone className="h-6 w-6 text-purple-300" />,
    title: "Mobile Friendly",
    desc: "Access your passes anytime from your smartphone.",
  },
];

const steps = [
  {
    icon: <ClipboardCheck className="h-10 w-10 text-purple-300" />,
    title: "Apply Online",
    desc: "Fill out our simple application form in minutes.",
  },
  {
    icon: <CreditCard className="h-10 w-10 text-purple-300" />,
    title: "Make Payment",
    desc: "Simple, secure checkout using multiple options.",
  },
  {
    icon: <Smartphone className="h-10 w-10 text-purple-300" />,
    title: "Receive Digital Pass",
    desc: "Get your pass instantly via email or app.",
  },
  {
    icon: <CheckCircle className="h-10 w-10 text-purple-300" />,
    title: "Start Using",
    desc: "Just show your digital pass on your phone to ride.",
  },
];

const Hero: React.FC<HeroProps> = ({ userFirstName }) => {
  return (
    <div className="min-h-[80vh] relative overflow-hidden bg-gradient-to-br from-purple-900 to-indigo-800 text-white pb-8">
      {/* Pretty background blobs */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-purple-500 blur-3xl" />
        <div className="absolute top-1/3 right-0 w-96 h-96 rounded-full bg-indigo-500 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-pink-500 blur-3xl" />
      </div>
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-8 md:pt-16">
        {/* Top branding and avatar */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <Bus className="h-8 w-8 text-purple-300" />
            <span className="text-xl font-bold tracking-tight">TransitNexus</span>
          </div>
          {/* Avatar and welcome */}
          {userFirstName && (
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium mr-1">Hi, {userFirstName}!</span>
              {/* Avatar will be passed separately in Index.tsx */}
            </div>
          )}
        </div>

        {/* Hero content */}
        <div className="flex flex-col md:flex-row items-center gap-12">
          {/* Left */}
          <div className="text-center md:text-left md:w-1/2">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
              {
                userFirstName ?
                  <>
                    Welcome back, <span className="text-purple-300">{userFirstName}</span>!
                  </>
                  :
                  <>
                    All-in-one <span className="text-purple-300">Digital Bus Pass</span> Experience
                  </>
              }
            </h1>
            <p className="text-purple-100 text-lg mb-8 max-w-lg">
              Experience a seamless way to discover routes, track buses, and get all your tickets and passes in one place.
            </p>
          </div>
          {/* Right: illustrative image */}
          <div className="md:w-1/2 flex justify-center mt-6 md:mt-0 relative">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1570125909232-eb263c188f7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
                alt="Modern city bus"
                width={600}
                height={400}
                className="w-full h-[320px] object-cover rounded-xl shadow-2xl"
              />
              <div className="absolute -bottom-4 -right-4 bg-purple-500 p-4 rounded-lg shadow-lg">
                <div className="flex items-center">
                  <User className="h-6 w-6 mr-2" />
                  <span className="font-bold">10,000+ Users</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 mb-12">
          <div className="bg-white bg-opacity-10 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-purple-300 mb-1">99.9%</div>
            <div className="text-sm text-purple-100">Success Rate</div>
          </div>
          <div className="bg-white bg-opacity-10 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-purple-300 mb-1">24/7</div>
            <div className="text-sm text-purple-100">Support</div>
          </div>
          <div className="bg-white bg-opacity-10 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-purple-300 mb-1">5 Min</div>
            <div className="text-sm text-purple-100">Application Time</div>
          </div>
          <div className="bg-white bg-opacity-10 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-purple-300 mb-1">100+</div>
            <div className="text-sm text-purple-100">Cities Covered</div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white bg-opacity-10 p-8 rounded-2xl backdrop-blur-sm mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose TransitNexus?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-white bg-opacity-5 p-6 rounded-xl shadow-md hover:bg-opacity-10 transition-all"
              >
                <div className="bg-purple-900 bg-opacity-40 p-3 rounded-full w-fit mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-purple-100">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
        {/* How it works */}
        <div className="bg-white bg-opacity-10 p-8 rounded-2xl backdrop-blur-sm">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <div key={idx} className="text-center">
                <div className="bg-purple-900 bg-opacity-30 p-4 rounded-full mx-auto w-20 h-20 flex items-center justify-center mb-4">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-purple-100">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 bg-purple-900 bg-opacity-70 py-8 px-6 backdrop-blur-sm rounded-xl text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to get started?</h3>
          <p className="mb-6 text-purple-200">Join thousands of users who have simplified their transit experience.</p>
          <a href="/signup">
            <button className="px-8 py-3 bg-purple-500 text-purple-900 text-lg font-semibold rounded-lg shadow-lg hover:bg-purple-400 transition-all">
              Get Started Now
            </button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Hero;
