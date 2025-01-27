import { Button } from "@/components/ui/button";

const PricingCard = ({
  title,
  price,
  description,
  features,
  isPopular,
}: {
  title: string;
  price: string;
  description: string;
  features: string[];
  isPopular?: boolean;
}) => (
  <div
    className={`rounded-lg p-8 ${
      isPopular
        ? "bg-primary text-primary-foreground shadow-lg scale-105"
        : "bg-card text-card-foreground border"
    }`}
  >
    <h3 className="text-2xl font-bold">{title}</h3>
    {isPopular && (
      <span className="inline-block px-4 py-1 text-sm rounded-full bg-secondary text-secondary-foreground mt-2">
        Most Popular
      </span>
    )}
    <div className="mt-4">
      <span className="text-4xl font-bold">${price}</span>
      <span className="text-muted-foreground">/month</span>
    </div>
    <p className="mt-4 text-sm">{description}</p>
    <ul className="mt-8 space-y-4">
      {features.map((feature) => (
        <li key={feature} className="flex items-center">
          <svg
            className={`w-5 h-5 mr-3 ${
              isPopular ? "text-primary-foreground" : "text-primary"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          {feature}
        </li>
      ))}
    </ul>
    <Button
      className={`w-full mt-8 ${
        isPopular
          ? "bg-background text-foreground hover:bg-secondary"
          : "bg-primary text-primary-foreground"
      }`}
    >
      Get Started
    </Button>
  </div>
);

export default function PricingPage() {
  const plans = [
    {
      title: "Standard",
      price: "29",
      description: "Perfect for small teams and startups",
      features: [
        "Up to 5 team members",
        "10GB storage",
        "Basic analytics",
        "Email support",
        "API access",
      ],
    },
    {
      title: "Plus",
      price: "79",
      description: "Best for growing businesses",
      features: [
        "Up to 15 team members",
        "50GB storage",
        "Advanced analytics",
        "Priority support",
        "Custom domains",
        "SSO integration",
      ],
      isPopular: true,
    },
    {
      title: "Premium",
      price: "149",
      description: "For large enterprises",
      features: [
        "Unlimited team members",
        "500GB storage",
        "Enterprise analytics",
        "24/7 support",
        "Dedicated manager",
        "Custom integrations",
      ],
    },
  ];

  return (
    <div className="py-24 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
          Simple, transparent pricing
        </h1>
        <p className="text-xl text-muted-foreground">
          Choose the perfect plan for your needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <PricingCard key={plan.title} {...plan} />
        ))}
      </div>
    </div>
  );
} 