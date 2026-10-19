export interface Property {
  id: string;
  title: string;
  address: string;
  city: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  type: 'Single Family' | 'Luxury Villa' | 'Penthouse' | 'Condo' | 'Townhouse';
  status: 'Active' | 'Under Offer' | 'Pending';
  imageUrl: string;
  inquiryCount: number;
  listedDate: string;
  description: string;
  projectCode?: string;
  qrTrackingCodes?: string[];
  brochurePdfUrl?: string;
}

export type InboundIntent =
  | 'SITE_VISIT_BOOKING'
  | 'BROCHURE_REQUEST'
  | 'PRICING_INQUIRY'
  | 'AGENT_CALLBACK'
  | 'STOP_FOLLOWUP'
  | 'GENERAL_QUERY';

export interface ExtractedEntities {
  propertyName: string | null;
  requestedDay: string | null;
  requestedTime: string | null;
  requestedDate: string | null;
  budget: string | null;
  bhk: string | null;
}

export interface MessageClassification {
  detectedIntent: InboundIntent;
  matchedPropertyId: string | null;
  matchedPropertyTitle: string | null;
  confidence: number;
  extractedEntities: ExtractedEntities;
  language: 'en' | 'hi' | 'hinglish';
  isStopIntent: boolean;
  explanation?: string;
}

export interface FollowUpAutomation {
  currentSequenceId: string;
  sequenceName: string;
  currentStep: number;
  totalSteps: number;
  status: 'ACTIVE' | 'PAUSED_BY_USER_REPLY' | 'COMPLETED' | 'UNSUBSCRIBED';
  lastTriggeredAt: string;
  nextScheduledAt: string | null;
  autoStopReason: string | null;
  pauseTimestamp?: string | null;
}

export interface WhatsAppQuickReplyButton {
  id: string;
  title: string;
  payload: string;
  type?: 'reply' | 'url' | 'phone_number';
  url?: string;
}

export interface WhatsAppDocument {
  filename: string;
  url: string;
  mimeType: string;
  caption?: string;
  fileSize?: string;
}

export interface InteractiveWhatsAppMessage {
  id: string;
  recipientPhone: string;
  propertyId?: string;
  propertyTitle?: string;
  document?: WhatsAppDocument;
  bodyText: string;
  footerText?: string;
  buttons: WhatsAppQuickReplyButton[];
  status: 'SENT' | 'DELIVERED' | 'READ';
  timestamp: string;
}

export interface AgentAlert {
  id: string;
  leadId: string;
  buyerName: string;
  buyerPhone: string;
  propertyTitle: string;
  intent: InboundIntent | string;
  messageSnippet: string;
  priority: 'URGENT' | 'HIGH' | 'NORMAL';
  channels: ('WHATSAPP' | 'IN_APP')[];
  status: 'DELIVERED' | 'ACKNOWLEDGED';
  timestamp: string;
  agentPhone: string;
  waReplyLink: string;
  isRead: boolean;
}

export interface AlertSettings {
  notifyOnTourRequest: boolean;
  notifyOnNewLead: boolean;
  notifyOnStopKeyword: boolean;
  alertAgentPhone: string;
  soundEnabled: boolean;
}

export interface BuyerLead {
  id: string;
  buyerName: string;
  phone: string;
  rawPhone: string; // digits only for wa.me
  email: string;
  propertyId: string;
  propertyTitle: string;
  message: string;
  budget: string;
  intent: 'Tour Request' | 'High Intent' | 'Offer Inquiry' | 'General';
  status: 'New' | 'Contacted' | 'Visit Scheduled' | 'Tour Booked';
  receivedTime: string;
  preferredDate?: string;
  classification?: MessageClassification;
  followUpAutomation?: FollowUpAutomation;
  lastInteractiveMessage?: InteractiveWhatsAppMessage;
}

export interface AgentUser {
  name: string;
  email: string;
  phone: string;
  brokerage: string;
  licenseNumber: string;
  avatarUrl: string;
}

export type TourType = 'IN_PERSON' | 'VIDEO_CALL';

export type BookingStatus = 'CONFIRMED' | 'COMPLETED' | 'RESCHEDULED' | 'CANCELLED';

export interface SiteVisitBooking {
  id: string;
  leadId?: string;
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail?: string;
  tourDate: string; // YYYY-MM-DD
  tourTime: string; // e.g. "03:30 PM"
  tourType: TourType;
  attendeesCount: number;
  notes?: string;
  status: BookingStatus;
  agentName: string;
  agentPhone: string;
  createdAt: string;
  googleCalendarUrl?: string;
  waConfirmationUrl?: string;
  waAgentDispatchUrl?: string;
  waReminderUrl?: string;
}
