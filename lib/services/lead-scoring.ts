import { LeadScoringRule } from '@/lib/contexts/settings-context';
import { FrontendLead } from '@/types/lead';

export interface LeadScore {
  score: number;
  maxScore: number;
  percentage: number;
  appliedRules: {
    rule: LeadScoringRule;
    points: number;
    reason: string;
  }[];
}

export interface ScoringEvent {
  type: 'form_submitted' | 'email_opened' | 'page_visited' | 'phone_provided' | 'high_value_insurance' | 'quick_form_completion' | 'multiple_pages_viewed' | 'return_visitor';
  data?: any;
}

/**
 * Lead Scoring Engine - Calculates lead scores based on configured rules
 */
export class LeadScoringEngine {
  private rules: LeadScoringRule[];

  constructor(rules: LeadScoringRule[]) {
    this.rules = rules.filter(rule => rule.isActive).sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  /**
   * Calculate score for a lead based on its data and events
   */
  calculateScore(lead: FrontendLead, events: ScoringEvent[] = []): LeadScore {
    const appliedRules: LeadScore['appliedRules'] = [];
    let totalScore = 0;

    // Calculate maximum possible score
    const maxScore = this.rules.reduce((sum, rule) => sum + rule.points, 0);

    // Apply scoring rules
    for (const rule of this.rules) {
      const result = this.evaluateRule(rule, lead, events);
      if (result.applies) {
        appliedRules.push({
          rule,
          points: result.points,
          reason: result.reason
        });
        totalScore += result.points;
      }
    }

    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    return {
      score: totalScore,
      maxScore,
      percentage,
      appliedRules
    };
  }

  /**
   * Evaluate a single scoring rule
   */
  private evaluateRule(rule: LeadScoringRule, lead: FrontendLead, events: ScoringEvent[]): {
    applies: boolean;
    points: number;
    reason: string;
  } {
    const action = rule.action.toLowerCase();

    switch (action) {
      case 'form_submitted':
        return {
          applies: true, // All leads have submitted a form
          points: rule.points,
          reason: 'Lead submitted a form'
        };

      case 'email_provided':
        return {
          applies: !!lead.email,
          points: rule.points,
          reason: 'Lead provided email address'
        };

      case 'phone_provided':
        return {
          applies: !!lead.phone && lead.phone.trim() !== '',
          points: rule.points,
          reason: 'Lead provided phone number'
        };

      case 'high_value_insurance':
        const highValueTypes = ['MEDICARE_ADVANTAGE', 'LIFE_INSURANCE'];
        return {
          applies: highValueTypes.includes(lead.insuranceType.toUpperCase()),
          points: rule.points,
          reason: `Lead interested in high-value insurance (${lead.insuranceType})`
        };

      case 'quick_form_completion':
        return {
          applies: lead.formCompletionTime <= 60, // Under 1 minute
          points: rule.points,
          reason: `Quick form completion (${lead.formCompletionTime}s)`
        };

      case 'multiple_pages_viewed':
        return {
          applies: lead.pagesViewed >= 3,
          points: rule.points,
          reason: `Viewed multiple pages (${lead.pagesViewed} pages)`
        };

      case 'long_session_duration':
        return {
          applies: lead.sessionDuration >= 300, // 5+ minutes
          points: rule.points,
          reason: `Long session duration (${Math.round(lead.sessionDuration / 60)} minutes)`
        };

      case 'return_visitor':
        // This would require additional data about previous visits
        const hasReturnVisitorEvent = events.some(e => e.type === 'return_visitor');
        return {
          applies: hasReturnVisitorEvent,
          points: rule.points,
          reason: 'Return visitor'
        };

      case 'premium_landing_page':
        const premiumPages = ['/medicare-advantage', '/life-insurance', '/premium-plans'];
        return {
          applies: premiumPages.some(page => lead.landingPage?.includes(page)),
          points: rule.points,
          reason: `Visited premium landing page (${lead.landingPage})`
        };

      case 'utm_campaign':
        return {
          applies: !!lead.utmCampaign && lead.utmCampaign.trim() !== '',
          points: rule.points,
          reason: `Came from marketing campaign (${lead.utmCampaign})`
        };

      case 'high_intent_source':
        const highIntentSources = ['GOOGLE_ADS', 'DIRECT', 'REFERRAL'];
        return {
          applies: highIntentSources.includes(lead.source.toUpperCase()),
          points: rule.points,
          reason: `High-intent traffic source (${lead.source})`
        };

      default:
        console.warn(`Unknown scoring rule action: ${action}`);
        return {
          applies: false,
          points: 0,
          reason: `Unknown action: ${action}`
        };
    }
  }

  /**
   * Get priority level based on score percentage
   */
  static getPriority(scorePercentage: number): 'low' | 'medium' | 'high' | 'urgent' {
    if (scorePercentage >= 80) return 'urgent';
    if (scorePercentage >= 60) return 'high';
    if (scorePercentage >= 40) return 'medium';
    return 'low';
  }

  /**
   * Get default scoring rules for new installations
   */
  static getDefaultRules(): Omit<LeadScoringRule, 'id' | 'createdAt' | 'updatedAt'>[] {
    return [
      {
        action: 'form_submitted',
        points: 10,
        isActive: true,
        order: 1
      },
      {
        action: 'phone_provided',
        points: 15,
        isActive: true,
        order: 2
      },
      {
        action: 'high_value_insurance',
        points: 20,
        isActive: true,
        order: 3
      },
      {
        action: 'quick_form_completion',
        points: 5,
        isActive: true,
        order: 4
      },
      {
        action: 'multiple_pages_viewed',
        points: 8,
        isActive: true,
        order: 5
      },
      {
        action: 'long_session_duration',
        points: 12,
        isActive: true,
        order: 6
      },
      {
        action: 'premium_landing_page',
        points: 10,
        isActive: true,
        order: 7
      },
      {
        action: 'high_intent_source',
        points: 8,
        isActive: true,
        order: 8
      },
      {
        action: 'utm_campaign',
        points: 5,
        isActive: true,
        order: 9
      }
    ];
  }
}

/**
 * Utility function to calculate lead score using configured rules
 */
export function calculateLeadScore(
  lead: FrontendLead, 
  scoringRules: LeadScoringRule[], 
  events: ScoringEvent[] = []
): LeadScore {
  const engine = new LeadScoringEngine(scoringRules);
  return engine.calculateScore(lead, events);
}

/**
 * Utility function to format score for display
 */
export function formatScore(score: LeadScore): string {
  return `${score.score}/${score.maxScore} (${score.percentage}%)`;
}

/**
 * Utility function to get score color based on percentage
 */
export function getScoreColor(percentage: number): string {
  if (percentage >= 80) return 'text-red-500'; // Urgent
  if (percentage >= 60) return 'text-orange-500'; // High
  if (percentage >= 40) return 'text-yellow-500'; // Medium
  return 'text-gray-500'; // Low
}

/**
 * Utility function to get score background color for badges
 */
export function getScoreBadgeColor(percentage: number): string {
  if (percentage >= 80) return 'bg-red-100 text-red-800 border-red-200';
  if (percentage >= 60) return 'bg-orange-100 text-orange-800 border-orange-200';
  if (percentage >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-gray-100 text-gray-800 border-gray-200';
}