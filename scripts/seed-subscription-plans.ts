import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { subscriptionPlans } from '../shared/schema';

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 2900, // $29.00
    yearlyPrice: 29000, // $290.00 (10 months for 12)
    description: 'Perfect for individual agents just getting started.',
    features: [
      '1 user included',
      'Up to 25 active properties', 
      'Basic performance dashboards',
      'Property management',
      'Essential CMA tools',
      'Email support'
    ],
    limits: {
      users: 1,
      properties: 25,
      reports: 'Basic',
      support: 'Email'
    },
    sortOrder: 1
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 7900, // $79.00
    yearlyPrice: 79000, // $790.00 (10 months for 12)
    description: 'For established agents and small teams.',
    features: [
      '3 users included ($15/additional user)',
      'Up to 100 active properties',
      'Advanced analytics & automation',
      'Leaderboards & goal tracking',
      'Performance analytics',
      'Advanced CMAs',
      'Priority email support'
    ],
    limits: {
      users: 3,
      properties: 100,
      additionalUserCost: 15,
      reports: 'Advanced',
      support: 'Priority Email'
    },
    sortOrder: 2
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 19900, // $199.00
    yearlyPrice: 199000, // $1,990.00 (10 months for 12)
    description: 'For high-performing agents and teams.',
    features: [
      '10 users included ($25/additional user)',
      'Up to 500 active properties',
      'Team collaboration tools',
      'Custom dashboards',
      'AI-powered pricing strategies',
      'Market Timing AI & Offer Strategies',
      'Office Challenges & Competition Hub',
      'Custom branding & API access',
      'Priority support'
    ],
    limits: {
      users: 10,
      properties: 500,
      additionalUserCost: 25,
      reports: 'Advanced',
      support: 'Priority Support'
    },
    sortOrder: 3
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: null, // Custom pricing
    yearlyPrice: null,
    description: 'For brokerages and large teams.',
    features: [
      'Unlimited users & properties',
      'Multi-office analytics',
      'White-label branding',
      'Dedicated account manager',
      'Custom integrations',
      'Advanced reporting',
      'Priority phone support',
      'Custom training & SLA'
    ],
    limits: {
      users: -1,
      properties: -1,
      reports: 'Advanced',
      support: 'Dedicated Support'
    },
    sortOrder: 4
  }
];

async function seedPlans() {
  try {
    console.log('Seeding subscription plans...');
    
    // Clear existing plans
    await db.delete(subscriptionPlans);
    
    // Insert new plans
    await db.insert(subscriptionPlans).values(plans);
    
    console.log('✅ Subscription plans seeded successfully!');
    console.log(`Inserted ${plans.length} plans:`, plans.map(p => `${p.name} (${p.id})`).join(', '));
    
  } catch (error) {
    console.error('❌ Error seeding subscription plans:', error);
  } finally {
    await client.end();
  }
}

seedPlans();
