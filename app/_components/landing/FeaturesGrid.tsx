import { Pen, DollarSign, Link, Palette } from "lucide-react";

export default function FeaturesGrid() {
  const features = [
    {
      icon: Pen,
      title: "Signature-based Check-in",
      description:
        "Verify ticket ownership with wallet signatures. No more fake tickets or paper checks.",
      gradient: "from-[#0077B6] to-[#0096C7]",
    },
    {
      icon: DollarSign,
      title: "Next-Level Funding",
      description:
        "Access advanced funding options for your events. Crowdfunding, sponsorships, and instant payouts.",
      gradient: "from-[#0096C7] to-[#48CAE4]",
    },
    {
      icon: Link,
      title: "On-chain Transparency",
      description:
        "Every transaction recorded on blockchain. Full audit trail and accountability.",
      gradient: "from-[#03045E] to-[#0077B6]",
    },
    {
      icon: Palette,
      title: "NFT Digital Souvenirs",
      description:
        "Attendees keep their tickets as collectible NFTs. Memories that last forever.",
      gradient: "from-[#48CAE4] to-[#90E0EF]",
    },
  ];

  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Why Choose Mythra?
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Built on blockchain for the next level funding and ticketing
            experience
          </p>
        </div>{" "}
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-transparent overflow-hidden"
            >
              {/* Gradient Background on Hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
              ></div>

              <div className="relative z-10">
                {/* Icon */}
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6 text-3xl`}
                >
                  <feature.icon className="text-white" />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Decorative Element */}
              <div
                className={`absolute -bottom-2 -right-2 w-24 h-24 bg-gradient-to-br ${feature.gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity duration-300`}
              ></div>
            </div>
          ))}
        </div>
        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-[#0077B6] mb-2">
              99.9%
            </div>
            <div className="text-gray-600 text-sm md:text-base">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-[#0096C7] mb-2">
              &lt;1s
            </div>
            <div className="text-gray-600 text-sm md:text-base">
              Transaction Time
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-[#48CAE4] mb-2">
              $0.00025
            </div>
            <div className="text-gray-600 text-sm md:text-base">Avg. Fee</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-[#0077B6] mb-2">
              100%
            </div>
            <div className="text-gray-600 text-sm md:text-base">Secure</div>
          </div>
        </div>
      </div>
    </section>
  );
}
