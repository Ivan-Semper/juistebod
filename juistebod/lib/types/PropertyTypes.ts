export interface PropertyData {
  url: string;
  title: string;
  address: string;
  price: string;
  location: string;
  propertyType: string;
  surface: string;
  rooms: string;
  yearBuilt: string;
  images: string[];
  description: string;
  features: string[];
  scrapedAt: string;
}

export interface ScrapingResponse {
  success: boolean;
  data?: PropertyData;
  error?: string;
  message?: string;
}

export interface PropertySummary {
  address: string;
  price: string;
  propertyType: string;
  surface: string;
  rooms: string;
} 