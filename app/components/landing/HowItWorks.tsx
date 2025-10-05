import { Edit, Ticket, CreditCard, Check } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Create Event",
      description:
        "Set up your event details, pricing, and mint NFT tickets on Solana",
      icon: Edit,
      color: "from-purple-500 to-pink-500",
    },
    {
      number: "02",
      title: "List & Sell",
      description:
        "Publish your event and receive instant SOL payments for each ticket sold",
      icon: Ticket,
      color: "from-green-400 to-cyan-500",
    },
    {
      number: "03",
      title: "Attendees Purchase",
      description: "Buyers get NFT tickets directly in their Solana wallet",
      icon: CreditCard,
      color: "from-blue-500 to-purple-600",
    },
    {
      number: "04",
      title: "Signature Check-in",
      description:
        "Verify attendance with wallet signature at your event entrance",
      icon: Check,
      color: "from-yellow-400 to-orange-500",
    },
  ];

  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-400 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            From event creation to check-in, powered by Solana blockchain
          </p>
        </div>

        {/* Desktop Timeline */}
        <div className="hidden lg:block max-w-7xl mx-auto">
          <div className="relative">
            {/* Connection Line */}
            <div className="absolute top-32 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-green-400 to-orange-500 opacity-20"></div>

            <div className="grid grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  {/* Number Badge */}
                  <div
                    className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-bold text-2xl shadow-lg relative z-10`}
                  >
                    <step.icon />
                  </div>

                  {/* Step Number */}
                  <div className="text-center mb-4">
                    <span
                      className={`text-5xl font-bold bg-gradient-to-br ${step.color} bg-clip-text text-transparent`}
                    >
                      {step.number}
                    </span>
                  </div>

                  {/* Content Card */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile/Tablet View */}
        <div className="lg:hidden max-w-2xl mx-auto">
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="relative flex gap-6">
                {/* Timeline Line */}
                {index !== steps.length - 1 && (
                  <div className="absolute left-10 top-24 bottom-0 w-1 bg-gradient-to-b from-gray-200 to-transparent"></div>
                )}

                {/* Icon and Number */}
                <div className="flex-shrink-0">
                  <div
                    className={`w-20 h-20 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-3xl shadow-lg relative z-10`}
                  >
                    <step.icon />
                  </div>
                  <div className="text-center mt-2">
                    <span
                      className={`text-2xl font-bold bg-gradient-to-br ${step.color} bg-clip-text text-transparent`}
                    >
                      {step.number}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pt-2">
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-6">
            Ready to revolutionize your events?
          </p>
          <button className="px-8 py-4 bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white font-bold rounded-full hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            Start Your First Event
          </button>
        </div>
      </div>
    </section>
  );
}
