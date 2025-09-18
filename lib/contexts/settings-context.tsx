"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { toast } from 'sonner';

// Types based on our existing Prisma schema
export interface LeadStatusConfig {
  id: string;
  name: string;
  color: "blue" | "yellow" | "purple" | "green" | "red" | "gray";
  order: number;
  isDefault: boolean;
  isActive: boolean;
}

export interface LeadSourceConfig {
  id: string;
  name: string;
  type: "paid" | "organic" | "direct" | "email" | "referral";
  isActive: boolean;
}

export interface CustomFieldConfig {
  id: string;
  name: string;
  type: "text" | "number" | "select" | "textarea" | "date";
  isRequired: boolean;
  options: string[];
  order?: number;
  isActive: boolean;
}

export interface LeadScoringRule {
  id: string;
  action: string;
  points: number;
  isActive: boolean;
  order?: number;
}

export interface AssignmentRule {
  id: string;
  name: string;
  conditions: any; // JSON object
  assignTo: string;
  priority?: number;
  isActive: boolean;
}

export interface CrmSettings {
  id: string;
  // Notification Settings
  emailNotifications: boolean;
  smsNotifications: boolean;
  webhookNotifications: boolean;
  notificationEmail?: string;
  smsNumber?: string;
  dailyDigest: boolean;
  instantAlerts: boolean;
  
  // API & Webhook Settings
  webhookUrl?: string;
  apiKey?: string;
  enableWebhooks: boolean;
  retryFailedCalls: boolean;
  maxRetries: number;
  
  // Import/Export Settings
  importSource: "csv" | "excel" | "json";
  exportFormat: "csv" | "excel" | "json" | "pdf";
  autoExport: boolean;
  exportFrequency: "daily" | "weekly" | "monthly";
  includeArchived: boolean;
  
  customSettings?: any;
}

export interface AllSettings {
  statuses: LeadStatusConfig[];
  sources: LeadSourceConfig[];
  customFields: CustomFieldConfig[];
  scoringRules: LeadScoringRule[];
  assignmentRules: AssignmentRule[];
  crmSettings: CrmSettings | null;
}

export interface SettingsContextType {
  settings: AllSettings | null;
  loading: boolean;
  error: string | null;
  refetchSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<AllSettings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

// Specialized hooks for specific settings sections
export function useLeadStatuses() {
  const { settings } = useSettings();
  return settings?.statuses || [];
}

export function useLeadSources() {
  const { settings } = useSettings();
  return settings?.sources || [];
}

export function useCustomFields() {
  const { settings } = useSettings();
  return settings?.customFields || [];
}

export function useLeadScoringRules() {
  const { settings } = useSettings();
  return settings?.scoringRules || [];
}

export function useAssignmentRules() {
  const { settings } = useSettings();
  return settings?.assignmentRules || [];
}

export function useCrmSettings() {
  const { settings } = useSettings();
  return settings?.crmSettings;
}

export function useNotificationSettings() {
  const crmSettings = useCrmSettings();
  return {
    emailNotifications: crmSettings?.emailNotifications ?? true,
    smsNotifications: crmSettings?.smsNotifications ?? false,
    webhookNotifications: crmSettings?.webhookNotifications ?? false,
    notificationEmail: crmSettings?.notificationEmail,
    smsNumber: crmSettings?.smsNumber,
    dailyDigest: crmSettings?.dailyDigest ?? false,
    instantAlerts: crmSettings?.instantAlerts ?? true,
  };
}

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<AllSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/settings', {
        method: 'GET',
        cache: 'no-cache', // Always fetch fresh settings
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch settings: ${response.status}`);
      }

      const data = await response.json();
      setSettings(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch settings';
      setError(errorMessage);
      console.error('Settings fetch error:', err);
      
      // Set fallback empty settings to prevent crashes
      setSettings({
        statuses: [],
        sources: [],
        customFields: [],
        scoringRules: [],
        assignmentRules: [],
        crmSettings: null,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<AllSettings>) => {
    try {
      setError(null);
      
      // Optimistic update
      if (settings) {
        setSettings(prev => prev ? { ...prev, ...newSettings } : null);
      }
      
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings),
      });

      if (!response.ok) {
        throw new Error(`Failed to update settings: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Refetch to get the latest state from database
        await fetchSettings();
        toast.success('Settings updated successfully');
      } else {
        throw new Error(result.error || 'Failed to update settings');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update settings';
      setError(errorMessage);
      console.error('Settings update error:', err);
      toast.error(`Failed to update settings: ${errorMessage}`);
      
      // Revert optimistic update by refetching
      await fetchSettings();
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const contextValue: SettingsContextType = {
    settings,
    loading,
    error,
    refetchSettings: fetchSettings,
    updateSettings,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

// Export the context for advanced usage
export { SettingsContext };