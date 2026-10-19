/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Property, BuyerLead, AgentUser, AgentAlert, SiteVisitBooking, BookingStatus } from './types';
import { INITIAL_AGENT, INITIAL_PROPERTIES, INITIAL_LEADS, INITIAL_BOOKINGS } from './data/initialData';
import { AuthModal } from './components/AuthModal';
import { Navbar } from './components/Navbar';
import { StatsOverview } from './components/StatsOverview';
import { BuyerLeadsList } from './components/BuyerLeadsList';
import { PropertiesList } from './components/PropertiesList';
import { AddPropertyModal } from './components/AddPropertyModal';
import { SimulateLeadModal } from './components/SimulateLeadModal';
import { AIParserTesterModal } from './components/AIParserTesterModal';
import { InteractiveWhatsAppModal } from './components/InteractiveWhatsAppModal';
import { AgentAlertsDrawer } from './components/AgentAlertsDrawer';
import { SiteVisitModal } from './components/SiteVisitModal';
import { SiteVisitsManager } from './components/SiteVisitsManager';
import { PaywallModal } from './components/PaywallModal';
import { DigitalBrochureModal } from './components/DigitalBrochureModal';
import { LegalTrustModal, LegalModalTab } from './components/LegalTrustModal';
import { formatLeadBudget } from './utils/formatters';
import { CheckCircle2, Bell, Sparkles, Send, X, ShieldCheck } from 'lucide-react';

const STORAGE_KEYS = {
  USER: 'agentzap_current_user',
  PROPERTIES: 'agentzap_properties',
  LEADS: 'agentzap_buyer_leads',
  ALERTS: 'agentzap_alerts_feed',
  BOOKINGS: 'agentzap_site_visits',
  SOUND: 'agentzap_alert_sound',
  PRO: 'agentzap_is_pro',
};

const INITIAL_ALERTS: AgentAlert[] = [
  {
    id: 'alert-1',
    leadId: 'lead-101',
    buyerName: 'Rajesh Sharma',
    buyerPhone: '+91 98201 54321',
    propertyTitle: 'Modern Sunset Panoramic Villa',
    intent: 'SITE_VISIT_BOOKING',
    messageSnippet: 'Can you share more details? Also interested in scheduling a site walkthrough this Saturday at 3 PM.',
    priority: 'URGENT',
    channels: ['WHATSAPP', 'IN_APP'],
    status: 'DELIVERED',
    timestamp: '8 mins ago',
    agentPhone: '+91 98201 98765',
    waReplyLink: 'https://wa.me/919820154321?text=Hello%20Rajesh!%20This%20is%20Shahid%20from%20AgentZap.',
    isRead: false,
  },
  {
    id: 'alert-2',
    leadId: 'lead-102',
    buyerName: 'Priya Patel',
    buyerPhone: '+91 98110 23456',
    propertyTitle: 'The Horizon Sky Penthouse',
    intent: 'BROCHURE_REQUEST',
    messageSnippet: 'Please send the full PDF brochure and maintenance fees.',
    priority: 'HIGH',
    channels: ['WHATSAPP', 'IN_APP'],
    status: 'DELIVERED',
    timestamp: '25 mins ago',
    agentPhone: '+91 98201 98765',
    waReplyLink: 'https://wa.me/919811023456?text=Hello%20Priya!%20This%20is%20Shahid%20from%20AgentZap.',
    isRead: false,
  },
];

export default function App() {
  // Current logged in user (or null if not logged in)
  const [currentUser, setCurrentUser] = useState<AgentUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_AGENT;
  });

  const [alerts, setAlerts] = useState<AgentAlert[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ALERTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_ALERTS;
  });

  const [bookings, setBookings] = useState<SiteVisitBooking[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_BOOKINGS as SiteVisitBooking[];
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SOUND);
      if (saved !== null) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return true;
  });

  const [isAlertsDrawerOpen, setIsAlertsDrawerOpen] = useState(false);
  const [latestUrgentAlert, setLatestUrgentAlert] = useState<AgentAlert | null>(null);

  const [properties, setProperties] = useState<Property[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROPERTIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          Array.isArray(parsed) &&
          parsed.some(
            (p: Property) =>
              (p.city && (p.city.includes('CA') || p.city.includes('Angeles') || p.address?.includes('Evergreen'))) ||
              (p.brochurePdfUrl && p.brochurePdfUrl.includes('agentzap.ai'))
          )
        ) {
          localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(INITIAL_PROPERTIES));
          return INITIAL_PROPERTIES;
        }
        return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_PROPERTIES;
  });

  const [leads, setLeads] = useState<BuyerLead[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LEADS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // 4. Ensure lead count permanently persists in localStorage across browser refreshes
          return parsed.map((l: BuyerLead) => ({
            ...l,
            budget: formatLeadBudget(l.budget),
            phone: l.phone && l.phone.startsWith('+1') ? '+91 98201 54321' : l.phone,
          }));
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_LEADS;
  });

  // Legal & Trust Modal State
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<LegalModalTab>('terms');

  const handleOpenLegalModal = (tab: LegalModalTab) => {
    setLegalModalTab(tab);
    setIsLegalModalOpen(true);
  };

  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'leads' | 'visits'>('overview');
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);
  const [isSimulateLeadOpen, setIsSimulateLeadOpen] = useState(false);
  const [isAIParserOpen, setIsAIParserOpen] = useState(false);
  const [isSiteVisitModalOpen, setIsSiteVisitModalOpen] = useState(false);
  const [selectedLeadForBooking, setSelectedLeadForBooking] = useState<BuyerLead | null>(null);
  const [selectedPropertyForBooking, setSelectedPropertyForBooking] = useState<Property | null>(null);

  const [selectedLeadForInteractive, setSelectedLeadForInteractive] = useState<BuyerLead | null>(null);
  const [targetPropertyForLead, setTargetPropertyForLead] = useState<Property | null>(null);
  const [activeBrochureProperty, setActiveBrochureProperty] = useState<Property | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Deep-link handler: Automatically detect ?brochure= or #brochure= to direct to Digital Property Brochure Microsite
  useEffect(() => {
    const handleCheckBrochureQuery = () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        let brochureId = searchParams.get('brochure');
        if (!brochureId && window.location.hash.includes('brochure=')) {
          brochureId = window.location.hash.split('brochure=')[1]?.split('&')[0];
        }
        if (brochureId) {
          const match = properties.find(
            (p) => p.id === brochureId || p.projectCode?.toLowerCase() === brochureId?.toLowerCase()
          );
          if (match) {
            setActiveBrochureProperty(match);
          } else if (properties.length > 0) {
            setActiveBrochureProperty(properties[0]);
          }
        }
      } catch {
        // ignore
      }
    };

    handleCheckBrochureQuery();
    window.addEventListener('popstate', handleCheckBrochureQuery);
    window.addEventListener('hashchange', handleCheckBrochureQuery);
    return () => {
      window.removeEventListener('popstate', handleCheckBrochureQuery);
      window.removeEventListener('hashchange', handleCheckBrochureQuery);
    };
  }, [properties]);

  // Freemium Pro Tier State
  const [isPro, setIsPro] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRO);
      if (saved !== null) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return false;
  });
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRO, JSON.stringify(isPro));
    } catch {
      // ignore
    }
  }, [isPro]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    } catch {
      // ignore
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(properties));
    } catch {
      // ignore
    }
  }, [properties]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
    } catch {
      // ignore
    }
  }, [leads]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
    } catch {
      // ignore
    }
  }, [alerts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    } catch {
      // ignore
    }
  }, [bookings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SOUND, JSON.stringify(soundEnabled));
    } catch {
      // ignore
    }
  }, [soundEnabled]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Pleasant Web Audio alert chime (zero external dependencies)
  const playAlertChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Autoplay policy fallback
    }
  };

  const handleLogin = (user: AgentUser) => {
    setCurrentUser(user);
    showToast(`Welcome back, ${user.name}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    showToast('Signed out of AgentZap.');
  };

  const handleAddProperty = (
    newPropData: Omit<Property, 'id' | 'inquiryCount' | 'listedDate'>
  ) => {
    const newProperty: Property = {
      ...newPropData,
      id: `prop-${Date.now()}`,
      inquiryCount: 0,
      listedDate: 'Just now',
    };

    setProperties((prev) => [newProperty, ...prev]);
    showToast(`"${newProperty.title}" successfully published to active listings!`);
  };

  const handleUpdateLeadStatus = (leadId: string, newStatus: BuyerLead['status']) => {
    setLeads((prev) =>
      prev.map((lead) => (lead.id === leadId ? { ...lead, status: newStatus } : lead))
    );
    showToast(`Lead marked as ${newStatus}.`);
  };

  const handleUpdateLeadPhone = (leadId: string, newPhone: string) => {
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id === leadId) {
          const cleanDigits = newPhone.replace(/\D/g, '');
          return {
            ...lead,
            phone: newPhone,
            rawPhone: cleanDigits || lead.rawPhone,
          };
        }
        return lead;
      })
    );
    showToast(`Phone number updated successfully.`);
  };

  const handleToggleSequenceStatus = (leadId: string) => {
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id === leadId && lead.followUpAutomation) {
          const nextStatus =
            lead.followUpAutomation.status === 'PAUSED_BY_USER_REPLY' ? 'ACTIVE' : 'PAUSED_BY_USER_REPLY';
          return {
            ...lead,
            followUpAutomation: {
              ...lead.followUpAutomation,
              status: nextStatus,
              autoStopReason: nextStatus === 'ACTIVE' ? null : 'Manually paused by agent',
            },
          };
        }
        return lead;
      })
    );
    showToast('Updated lead automation sequence status.');
  };

  // Step 4: Real-time Agent Alert Dispatch (Calls backend API & plays audio chime)
  const dispatchAlertForLead = async (lead: BuyerLead) => {
    const isTour =
      lead.intent === 'Tour Request' ||
      lead.classification?.detectedIntent === 'SITE_VISIT_BOOKING';
    const priority: 'URGENT' | 'HIGH' = isTour ? 'URGENT' : 'HIGH';

    let alertId = `alert-${Date.now()}`;
    let waBuyerReplyUrl = `https://wa.me/${lead.rawPhone}?text=${encodeURIComponent(
      `Hello ${lead.buyerName}! This is ${currentUser?.name || 'Shahid'} from AgentZap regarding "${lead.propertyTitle}". I received your message and would love to help you!`
    )}`;

    try {
      const response = await fetch('/api/alerts/dispatch-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          buyerName: lead.buyerName,
          buyerPhone: lead.phone,
          propertyTitle: lead.propertyTitle,
          intent: lead.classification?.detectedIntent || lead.intent,
          agentPhone: currentUser?.phone || '+91 98201 98765',
          messageText: lead.message,
          priority,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.alertId) alertId = data.alertId;
        if (data.waBuyerReplyUrl) waBuyerReplyUrl = data.waBuyerReplyUrl;
      }
    } catch {
      // Network fallback
    }

    const newAlert: AgentAlert = {
      id: alertId,
      leadId: lead.id,
      buyerName: lead.buyerName,
      buyerPhone: lead.phone,
      propertyTitle: lead.propertyTitle,
      intent: lead.classification?.detectedIntent || lead.intent,
      messageSnippet: lead.message,
      priority,
      channels: ['WHATSAPP', 'IN_APP'],
      status: 'DELIVERED',
      timestamp: 'Just now',
      agentPhone: currentUser?.phone || '+91 98201 98765',
      waReplyLink: waBuyerReplyUrl,
      isRead: false,
    };

    setAlerts((prev) => [newAlert, ...prev]);

    if (soundEnabled) {
      playAlertChime();
    }

    // Display high-priority floating banner
    setLatestUrgentAlert(newAlert);
    setTimeout(() => {
      setLatestUrgentAlert((current) => (current?.id === newAlert.id ? null : current));
    }, 8000);
  };

  const handleMarkAlertAsRead = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, isRead: true } : a))
    );
  };

  const handleMarkAllAlertsAsRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
    showToast('All notifications marked as read.');
  };

  const handleSaveLeadFromParsed = (leadData: any) => {
    if (!isPro && leads.length >= 5) {
      setIsPaywallOpen(true);
      showToast('⚠️ Free tier limit: 5/5 leads used. Upgrade to Pro for unlimited leads.');
      return;
    }
    const newLead: BuyerLead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      receivedTime: 'Just now',
    };
    const updatedLeads = [newLead, ...leads];
    setLeads(updatedLeads);
    dispatchAlertForLead(newLead);
    showToast(`Lead for ${newLead.buyerName} captured with AI Intent: ${newLead.classification?.detectedIntent}`);

    // When leads reach 5 on the Free evaluation tier, trigger Pro modal cleanly
    if (!isPro && updatedLeads.length >= 5) {
      setTimeout(() => {
        setIsPaywallOpen(true);
      }, 700);
    }
  };

  const handleAddLead = (leadData: Omit<BuyerLead, 'id' | 'receivedTime'>) => {
    if (!isPro && leads.length >= 5) {
      setIsPaywallOpen(true);
      showToast('⚠️ Free tier limit: 5/5 leads used. Upgrade to Pro for unlimited leads.');
      return;
    }
    const newLead: BuyerLead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      receivedTime: 'Just now',
    };

    const updatedLeads = [newLead, ...leads];
    setLeads(updatedLeads);
    dispatchAlertForLead(newLead);
    
    // Increment inquiry count on target property
    setProperties((prev) =>
      prev.map((p) =>
        p.id === newLead.propertyId ? { ...p, inquiryCount: p.inquiryCount + 1 } : p
      )
    );
    showToast(`New incoming lead from ${newLead.buyerName} received! Agent alert dispatched.`);

    // When leads reach 5 on the Free evaluation tier, trigger Pro modal cleanly
    if (!isPro && updatedLeads.length >= 5) {
      setTimeout(() => {
        setIsPaywallOpen(true);
      }, 700);
    }
  };

  // Step 5: Site Visit Booking Handlers
  const handleBookingCreated = (newBooking: SiteVisitBooking) => {
    setBookings((prev) => [newBooking, ...prev]);

    // Instantly update matched buyer lead badge to 'Visit Scheduled' and reflect in Tour Requests tab
    const cleanBookingPhone = newBooking.buyerPhone.replace(/\D/g, '');
    setLeads((prev) =>
      prev.map((l) => {
        const isMatch =
          (newBooking.leadId && l.id === newBooking.leadId) ||
          (!newBooking.leadId && l.phone.replace(/\D/g, '') === cleanBookingPhone);
        if (isMatch) {
          return {
            ...l,
            status: 'Visit Scheduled',
            intent: 'Tour Request',
            preferredDate: `${newBooking.tourDate} at ${newBooking.tourTime}`,
          };
        }
        return l;
      })
    );

    // Agent WhatsApp dispatch message containing the 1-tap Google Calendar link
    const cleanAgentPhone = (currentUser?.phone || '+91 98201 98765').replace(/\D/g, '');
    const agentDispatchText = `⚡ *AgentZap Site Visit Booking Dispatch*\n\n*New Tour Scheduled:*\n• *Property*: ${newBooking.propertyTitle}\n• *Buyer*: ${newBooking.buyerName} (${newBooking.buyerPhone})\n• *Date & Time*: ${newBooking.tourDate} at ${newBooking.tourTime}\n• *Type*: ${
      newBooking.tourType === 'VIDEO_CALL' ? '📹 Video Tour' : '📍 In-Person Physical Visit'
    }\n• *Location*: ${newBooking.propertyAddress}\n• *Notes*: ${newBooking.notes || 'Walkthrough'}\n\n📅 *1-Tap Google Calendar Event Link*:\n${newBooking.googleCalendarUrl || ''}\n\n👉 *Open Chat with Buyer on WhatsApp*:\nhttps://wa.me/${cleanBookingPhone}`;

    const waAgentDispatchUrl =
      newBooking.waAgentDispatchUrl ||
      `https://wa.me/${cleanAgentPhone}?text=${encodeURIComponent(agentDispatchText)}`;

    // Trigger instant agent alert for newly confirmed tour with 1-tap Google Calendar link
    const tourAlert: AgentAlert = {
      id: `alert-tour-${Date.now()}`,
      leadId: newBooking.leadId || 'booked-lead',
      buyerName: newBooking.buyerName,
      buyerPhone: newBooking.buyerPhone,
      propertyTitle: newBooking.propertyTitle,
      intent: 'SITE_VISIT_BOOKING',
      messageSnippet: `Site visit confirmed for ${newBooking.tourDate} at ${newBooking.tourTime}. 1-Tap Calendar: ${newBooking.googleCalendarUrl || ''}`,
      priority: 'URGENT',
      channels: ['WHATSAPP', 'IN_APP'],
      status: 'DELIVERED',
      timestamp: 'Just now',
      agentPhone: currentUser?.phone || '+91 98201 98765',
      waReplyLink: waAgentDispatchUrl,
      isRead: false,
    };
    setAlerts((prev) => [tourAlert, ...prev]);
    if (soundEnabled) playAlertChime();

    // Dispatch to backend API with 1-tap calendar URL
    try {
      fetch('/api/alerts/dispatch-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify
