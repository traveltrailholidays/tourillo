import LogoTTH from '@/components/logo-tth';
import LogoFull from '@/components/v1/logo-full';

export type CompanyType = 'TOURILLO' | 'TRAVEL_TRAIL_HOLIDAYS';

export interface CompanyConfig {
  name: string;
  shortName: string;
  LogoComponent: React.ComponentType;
  contactPhone: string;
  supportPhone: string;
  email: string;
  website: string;
  bankDetails: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    ifsc: string;
    accountType: string;
  };
  upiDetails: {
    merchantName: string;
    upiId: string;
    phoneNumber: string;
    qrCodePath: string;
  };
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    pincode: string;
  };
  stats: {
    trips: string;
    reviews: string;
    satisfaction: string;
  };
}

export const COMPANY_CONFIGS: Record<CompanyType, CompanyConfig> = {
  TOURILLO: {
    name: 'Tourillo Private Limited',
    shortName: 'Tourillo',
    LogoComponent: LogoFull,
    contactPhone: '+91 9625992025',
    supportPhone: '9625992025',
    email: 'support@tourillo.com',
    website: 'www.tourillo.com',
    bankDetails: {
      bankName: 'IndusInd Bank',
      accountName: 'Tourillo Private Limited',
      accountNumber: '259625992025',
      ifsc: 'INDB0000735',
      accountType: 'Current',
    },
    upiDetails: {
      merchantName: 'Tourillo Pvt Ltd',
      upiId: '9625992025@upi',
      phoneNumber: '9625992025',
      qrCodePath: '/images/payment/upi.webp',
    },
    address: {
      line1: 'Tourillo Office',
      line2: 'New Delhi',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
    },
    stats: {
      trips: '500+',
      reviews: '350+',
      satisfaction: '100%',
    },
  },
  TRAVEL_TRAIL_HOLIDAYS: {
    name: 'Travel Trail Holidays Private Limited',
    shortName: 'Travel Trail Holidays',
    LogoComponent: LogoTTH,
    contactPhone: '+91 9876543210',
    supportPhone: '9876543210',
    email: 'support@traveltrailholidays.com',
    website: 'www.traveltrailholidays.com',
    bankDetails: {
      bankName: 'HDFC Bank',
      accountName: 'Travel Trail Holidays Private Limited',
      accountNumber: '50200012345678',
      ifsc: 'HDFC0001234',
      accountType: 'Current',
    },
    upiDetails: {
      merchantName: 'Travel Trail Holidays',
      upiId: '9876543210@paytm',
      phoneNumber: '9876543210',
      qrCodePath: '/images/payment/tth-upi.webp',
    },
    address: {
      line1: 'Travel Trail Office',
      line2: 'Gurgaon',
      city: 'Gurgaon',
      state: 'Haryana',
      pincode: '122001',
    },
    stats: {
      trips: '800+',
      reviews: '600+',
      satisfaction: '98%',
    },
  },
};

export const getCompanyConfig = (companyType: CompanyType): CompanyConfig => {
  return COMPANY_CONFIGS[companyType];
};
