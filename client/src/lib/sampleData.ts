// Sample data generator for demo purposes
import type { Property, Activity, Commission, Expense } from "@shared/schema";

export const sampleProperties: Omit<Property, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[] = [
  {
    address: "2205 South Lamar Boulevard",
    city: "Austin",
    state: "TX",
    zipCode: "78701",
    representationType: "buyer_rep",
    status: "active_under_contract",
    propertyType: "single_family",
    bedrooms: 3,
    bathrooms: "2.0",
    squareFeet: 1850,
    listingPrice: "450000.00",
    offerPrice: "440000.00",
    acceptedPrice: "445000.00",
    soldPrice: null,
    leadSource: "referral",
    commissionRate: "2.50",
    clientName: "John & Sarah Miller",
    listingDate: "2025-01-10",
    soldDate: null,
    daysOnMarket: null,
    buyerAgreementDate: null,
    sellerAgreementDate: null,
    lossReason: null,
    referralFee: null,
    imageUrl: null,
    notes: "Great starter home in desirable neighborhood"
  },
  {
    address: "1717 West 6th Street",
    city: "Austin",
    state: "TX", 
    zipCode: "78703",
    representationType: "seller_rep",
    status: "listed",
    propertyType: "condo",
    bedrooms: 2,
    bathrooms: "2.0",
    squareFeet: 1200,
    listingPrice: "325000.00",
    offerPrice: null,
    acceptedPrice: null,
    soldPrice: null,
    leadSource: "soi",
    commissionRate: "3.00",
    clientName: "Maria Rodriguez",
    listingDate: "2025-01-15",
    soldDate: null,
    daysOnMarket: null,
    buyerAgreementDate: null,
    sellerAgreementDate: null,
    lossReason: null,
    referralFee: null,
    imageUrl: null,
    notes: "Modern condo with city views"
  },
  {
    address: "314 East Highland Mall Boulevard",
    city: "Austin",
    state: "TX",
    zipCode: "78752",
    representationType: "buyer_rep", 
    status: "closed",
    propertyType: "townhouse",
    bedrooms: 4,
    bathrooms: "3.5",
    squareFeet: 2400,
    listingPrice: "675000.00",
    offerPrice: "665000.00",
    acceptedPrice: "670000.00",
    soldPrice: "670000.00",
    leadSource: "online",
    commissionRate: "2.50",
    clientName: "David & Jennifer Chen",
    listingDate: "2024-12-20",
    soldDate: "2025-01-12",
    daysOnMarket: 23,
    buyerAgreementDate: "2024-12-18",
    sellerAgreementDate: null,
    lossReason: null,
    referralFee: null,
    imageUrl: null,
    notes: "Successful closing, happy clients"
  }
];

export const sampleActivities: Omit<Activity, 'id' | 'userId' | 'createdAt'>[] = [
  {
    type: "showing",
    date: "2025-01-18",
    notes: "Showed 2205 South Lamar Boulevard to the Millers - very interested",
    propertyId: null // Will be linked after property creation
  },
  {
    type: "buyer_meeting",
    date: "2025-01-17", 
    notes: "Initial consultation with new buyer clients",
    propertyId: null
  },
  {
    type: "listing_appointment",
    date: "2025-01-16",
    notes: "CMA presentation and listing agreement signed",
    propertyId: null
  },
  {
    type: "closing",
    date: "2025-01-12",
    notes: "Successful closing on Highland Mall Boulevard townhouse",
    propertyId: null
  },
  {
    type: "inspection",
    date: "2025-01-15",
    notes: "Attended inspection for South Lamar Boulevard property",
    propertyId: null
  }
];

export const sampleCommissions: Omit<Commission, 'id' | 'userId' | 'createdAt'>[] = [
  {
    amount: "8375.00",
    commissionRate: "2.50",
    type: "buyer_side",
    dateEarned: "2025-01-12",
    notes: "Commission from Highland Mall Boulevard closing",
    propertyId: null
  }
];

export const sampleExpenses: Omit<Expense, 'id' | 'userId' | 'createdAt'>[] = [
  {
    category: "marketing",
    amount: "150.00",
    description: "Professional photography for listing",
    date: "2025-01-15",
    notes: "Photography for West 6th Street condo",
    propertyId: null,
    receiptUrl: null
  },
  {
    category: "gas",
    amount: "45.00", 
    description: "Driving to showings",
    date: "2025-01-18",
    notes: "Multiple showings around Austin",
    propertyId: null,
    receiptUrl: null
  },
  {
    category: "meals",
    amount: "75.00",
    description: "Client dinner meeting",
    date: "2025-01-16", 
    notes: "Dinner with potential sellers",
    propertyId: null,
    receiptUrl: null
  }
];

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}