import { Truck, RotateCcw, Award, Shield, Headphones } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'On all orders above $100'
  },
  {
    icon: RotateCcw,
    title: 'Easy Returns',
    description: '30-day return policy'
  },
  {
    icon: Award,
    title: 'Best Quality',
    description: 'Premium authentic sarees'
  },
  {
    icon: Shield,
    title: 'Secure Payment',
    description: '100% secure transactions'
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Dedicated customer service'
  }
];

export default function FeatureStrip() {
  return (
    <div className="bg-white relative z-10 -mt-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 py-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isLast = index === features.length - 1;
            
            return (
              <div 
                key={index}
                className={`flex flex-col items-center text-center space-y-3 ${!isLast ? 'border-r border-gray-200' : ''}`}
              >
                <div className="w-12 h-12 flex items-center justify-center text-gray-600 mb-2">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-poppins font-medium text-gray-900 text-sm">
                  {feature.title}
                </h3>
                <p className="font-poppins text-xs text-gray-500">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
