import { Ticket, Zap, Shield, Gem } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-blue-600 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Next Level Funding
            <br />
            <span className="text-blue-100">& Ticketing for Events</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto">
            Empower event organizers with advanced funding solutions powered by
            Web3 blockchain. Secure, transparent, and instant.
          </p>

          {/* Value Props */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
            <div className="bg-blue-500 rounded-2xl p-6 border border-blue-400 hover:bg-blue-700 transition-all duration-300">
              <Ticket className="text-3xl mb-3 text-white" />
              <h3 className="text-white font-semibold text-lg mb-2">
                NFT Tickets
              </h3>
              <p className="text-blue-100 text-sm">
                Unique digital tickets that you truly own
              </p>
            </div>

            <div className="bg-blue-500 rounded-2xl p-6 border border-blue-400 hover:bg-blue-700 transition-all duration-300">
              <Zap className="text-3xl mb-3 text-white" />
              <h3 className="text-white font-semibold text-lg mb-2">
                Lightning Fast
              </h3>
              <p className="text-blue-100 text-sm">
                Instant transactions on blockchain network
              </p>
            </div>

            <div className="bg-blue-500 rounded-2xl p-6 border border-blue-400 hover:bg-blue-700 transition-all duration-300">
              <Shield className="text-3xl mb-3 text-white" />
              <h3 className="text-white font-semibold text-lg mb-2">Secure</h3>
              <p className="text-blue-100 text-sm">
                Fraud-proof with blockchain verification
              </p>
            </div>

            <div className="bg-blue-500 rounded-2xl p-6 border border-blue-400 hover:bg-blue-700 transition-all duration-300">
              <Gem className="text-3xl mb-3 text-white" />
              <h3 className="text-white font-semibold text-lg mb-2">
                Collectible
              </h3>
              <p className="text-blue-100 text-sm">
                Keep memories as digital souvenirs
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="w-full sm:w-auto px-8 py-4 bg-white text-blue-600 font-bold rounded-full hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
              Get Started
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-blue-500 text-white font-bold rounded-full border-2 border-blue-400 hover:bg-blue-700 transition-all duration-300">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
}
