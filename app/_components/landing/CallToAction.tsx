import { Rocket, Ticket, Star } from "lucide-react";

export default function CallToAction() {
  return (
    <section className="py-20 md:py-32 bg-blue-600 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-10 right-10 w-96 h-96 bg-blue-400 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Heading */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Ready to Transform Your Events?
          </h2>

          {/* Subheading */}
          <p className="text-lg sm:text-xl md:text-2xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Join the next level funding and ticketing with Mythra. Create
            memorable experiences with the power of blockchain.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-12">
            <button className="group w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 bg-white text-blue-600 font-bold text-lg rounded-full hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2">
              <span>Create Event</span>
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>

            <button className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 bg-blue-500 text-white font-bold text-lg rounded-full border-2 border-blue-400 hover:bg-blue-700 transition-all duration-300 hover:border-blue-300">
              Browse Events
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 mt-16 max-w-3xl mx-auto items-center">
            <div className="bg-blue-500 rounded-2xl p-6 border border-blue-400">
              <Rocket className="text-3xl mb-2 text-white mx-auto block" />
              <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                1000+
              </div>
              <div className="text-blue-100 text-sm">
                Events Created
              </div>
            </div>

            <div className="bg-blue-500 rounded-2xl p-6 border border-blue-400">
              <Ticket className="text-3xl mb-2 text-white mx-auto block" />
              <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                50K+
              </div>
              <div className="text-blue-100 text-sm">
                Tickets Sold
              </div>
            </div>

            <div className="bg-blue-500 rounded-2xl p-6 border border-blue-400">
              <Star className="text-3xl mb-2 text-white mx-auto block" />
              <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                4.9/5
              </div>
              <div className="text-blue-100 text-sm">
                User Rating
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-blue-100 text-sm">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-blue-200"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-blue-200"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Setup in 5 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-blue-200"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
