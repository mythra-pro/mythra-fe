import HeroSection from "./_components/landing/HeroSection";
import FeaturesGrid from "./_components/landing/FeaturesGrid";
import HowItWorks from "./_components/landing/HowItWorks";
import CallToAction from "./_components/landing/CallToAction";

export default function Home() {
  return (
    <div className="min-h-screen">
      <main>
        <HeroSection />
        <FeaturesGrid />
        <HowItWorks />
        <CallToAction />
      </main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-[#14F195] to-[#9945FF] bg-clip-text text-transparent">
                Mythra
              </h3>
              <p className="text-gray-400">
                NFT E-Ticketing powered by Solana blockchain
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a
                    href="#"
                    className="hover:text-[#14F195] transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#14F195] transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#14F195] transition-colors"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#14F195] transition-colors"
                  >
                    Support
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a
                    href="#"
                    className="hover:text-[#14F195] transition-colors"
                  >
                    Twitter
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#14F195] transition-colors"
                  >
                    Discord
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#14F195] transition-colors"
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Mythra. Built on Solana. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
