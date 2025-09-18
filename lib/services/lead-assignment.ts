import { AssignmentRule } from '@/lib/contexts/settings-context';
import { FrontendLead } from '@/types/lead';
import { LeadScore } from './lead-scoring';

export interface AssignmentResult {
  success: boolean;
  assignedTo?: string;
  rule?: AssignmentRule;
  reason: string;
  error?: string;
}

export interface AgentAvailability {
  agentId: string;
  agentName: string;
  currentLeadCount: number;
  maxLeadCapacity: number;
  specializations: string[];
  isOnline: boolean;
  isActive: boolean;
}

/**
 * Lead Assignment Engine - Intelligently assigns leads to agents based on configured rules
 */
export class LeadAssignmentEngine {
  private rules: AssignmentRule[];
  private agents: AgentAvailability[];

  constructor(rules: AssignmentRule[], agents: AgentAvailability[] = []) {
    // Sort rules by priority (higher priority first)
    this.rules = rules
      .filter(rule => rule.isActive)
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));
    
    this.agents = agents.filter(agent => agent.isActive);
  }

  /**
   * Assign a lead to an agent based on assignment rules
   */
  async assignLead(lead: FrontendLead, leadScore?: LeadScore): Promise<AssignmentResult> {
    try {
      // If no rules are configured, use round-robin assignment
      if (this.rules.length === 0) {
        return this.roundRobinAssignment(lead);
      }

      // Try each rule in priority order
      for (const rule of this.rules) {
        const result = await this.evaluateRule(rule, lead, leadScore);
        if (result.success) {
          return result;
        }
      }

      // If no rules matched, fall back to round-robin
      return this.roundRobinAssignment(lead);

    } catch (error) {
      console.error('Assignment engine error:', error);
      return {
        success: false,
        reason: 'Assignment engine error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Evaluate a single assignment rule
   */
  private async evaluateRule(
    rule: AssignmentRule, 
    lead: FrontendLead, 
    leadScore?: LeadScore
  ): Promise<AssignmentResult> {
    try {
      // Parse conditions from JSON
      const conditions = Array.isArray(rule.conditions) ? rule.conditions : [rule.conditions];
      
      // Check if all conditions are met
      const conditionsMet = conditions.every(condition => 
        this.evaluateCondition(condition, lead, leadScore)
      );

      if (!conditionsMet) {
        return {
          success: false,
          reason: `Rule "${rule.name}" conditions not met`
        };
      }

      // Find the assigned agent
      const targetAgent = this.agents.find(agent => 
        agent.agentId === rule.assignTo || agent.agentName === rule.assignTo
      );

      if (!targetAgent) {
        return {
          success: false,
          reason: `Target agent "${rule.assignTo}" not found or not available`
        };
      }

      // Check agent availability and capacity
      if (!targetAgent.isOnline) {
        return {
          success: false,
          reason: `Agent "${targetAgent.agentName}" is offline`
        };
      }

      if (targetAgent.currentLeadCount >= targetAgent.maxLeadCapacity) {
        return {
          success: false,
          reason: `Agent "${targetAgent.agentName}" has reached maximum capacity`
        };
      }

      return {
        success: true,
        assignedTo: targetAgent.agentId,
        rule,
        reason: `Assigned via rule "${rule.name}"`
      };

    } catch (error) {
      return {
        success: false,
        reason: `Error evaluating rule "${rule.name}"`,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Evaluate a single condition
   */
  private evaluateCondition(condition: any, lead: FrontendLead, leadScore?: LeadScore): boolean {
    if (!condition || typeof condition !== 'object') return false;

    const { field, operator, value } = condition;

    let fieldValue: any;

    // Get field value from lead or score
    switch (field) {
      case 'insuranceType':
        fieldValue = lead.insuranceType;
        break;
      case 'source':
        fieldValue = lead.source;
        break;
      case 'score':
        fieldValue = leadScore?.score || 0;
        break;
      case 'scorePercentage':
        fieldValue = leadScore?.percentage || 0;
        break;
      case 'estimatedValue':
        fieldValue = lead.estimatedValue || 0;
        break;
      case 'pagesViewed':
        fieldValue = lead.pagesViewed;
        break;
      case 'sessionDuration':
        fieldValue = lead.sessionDuration;
        break;
      case 'utmSource':
        fieldValue = lead.utmSource;
        break;
      case 'utmCampaign':
        fieldValue = lead.utmCampaign;
        break;
      case 'city':
        fieldValue = lead.city;
        break;
      case 'state':
        fieldValue = lead.state;
        break;
      default:
        return false;
    }

    // Evaluate condition based on operator
    switch (operator) {
      case 'equals':
        return fieldValue === value;
      case 'not_equals':
        return fieldValue !== value;
      case 'contains':
        return typeof fieldValue === 'string' && fieldValue.toLowerCase().includes(value.toLowerCase());
      case 'greater_than':
        return Number(fieldValue) > Number(value);
      case 'less_than':
        return Number(fieldValue) < Number(value);
      case 'greater_equal':
        return Number(fieldValue) >= Number(value);
      case 'less_equal':
        return Number(fieldValue) <= Number(value);
      case 'in':
        return Array.isArray(value) && value.includes(fieldValue);
      case 'not_in':
        return Array.isArray(value) && !value.includes(fieldValue);
      default:
        return false;
    }
  }

  /**
   * Round-robin assignment when no rules match
   */
  private roundRobinAssignment(lead: FrontendLead): AssignmentResult {
    const availableAgents = this.agents.filter(agent => 
      agent.isOnline && agent.currentLeadCount < agent.maxLeadCapacity
    );

    if (availableAgents.length === 0) {
      return {
        success: false,
        reason: 'No available agents'
      };
    }

    // Find agent with lowest current lead count
    const selectedAgent = availableAgents.reduce((prev, current) => 
      prev.currentLeadCount <= current.currentLeadCount ? prev : current
    );

    return {
      success: true,
      assignedTo: selectedAgent.agentId,
      reason: `Round-robin assignment to "${selectedAgent.agentName}"`
    };
  }

  /**
   * Get default assignment rules for new installations
   */
  static getDefaultRules(): Omit<AssignmentRule, 'id' | 'createdAt' | 'updatedAt'>[] {
    return [
      {
        name: 'High-Score Medicare Leads',
        conditions: [
          { field: 'scorePercentage', operator: 'greater_equal', value: 80 },
          { field: 'insuranceType', operator: 'in', value: ['MEDICARE_ADVANTAGE', 'SUPPLEMENT'] }
        ],
        assignTo: 'senior-agent-id', // Would be actual agent ID
        priority: 100,
        isActive: true
      },
      {
        name: 'Life Insurance Specialist',
        conditions: [
          { field: 'insuranceType', operator: 'equals', value: 'LIFE_INSURANCE' }
        ],
        assignTo: 'life-specialist-id',
        priority: 90,
        isActive: true
      },
      {
        name: 'High-Value Leads',
        conditions: [
          { field: 'estimatedValue', operator: 'greater_than', value: 5000 }
        ],
        assignTo: 'senior-agent-id',
        priority: 80,
        isActive: true
      },
      {
        name: 'Organic Traffic Priority',
        conditions: [
          { field: 'source', operator: 'equals', value: 'ORGANIC' },
          { field: 'scorePercentage', operator: 'greater_equal', value: 60 }
        ],
        assignTo: 'organic-specialist-id',
        priority: 70,
        isActive: true
      },
      {
        name: 'Geographic Assignment - California',
        conditions: [
          { field: 'state', operator: 'equals', value: 'CA' }
        ],
        assignTo: 'ca-agent-id',
        priority: 60,
        isActive: true
      }
    ];
  }
}

/**
 * Utility function to assign a lead using configured rules
 */
export async function assignLead(
  lead: FrontendLead,
  assignmentRules: AssignmentRule[],
  agents: AgentAvailability[] = [],
  leadScore?: LeadScore
): Promise<AssignmentResult> {
  const engine = new LeadAssignmentEngine(assignmentRules, agents);
  return engine.assignLead(lead, leadScore);
}

/**
 * Utility function to validate assignment rules
 */
export function validateAssignmentRule(rule: Partial<AssignmentRule>): string[] {
  const errors: string[] = [];

  if (!rule.name || rule.name.trim() === '') {
    errors.push('Rule name is required');
  }

  if (!rule.assignTo || rule.assignTo.trim() === '') {
    errors.push('Assignment target is required');
  }

  if (!rule.conditions) {
    errors.push('At least one condition is required');
  } else {
    const conditions = Array.isArray(rule.conditions) ? rule.conditions : [rule.conditions];
    conditions.forEach((condition, index) => {
      if (!condition.field) {
        errors.push(`Condition ${index + 1}: Field is required`);
      }
      if (!condition.operator) {
        errors.push(`Condition ${index + 1}: Operator is required`);
      }
      if (condition.value === undefined || condition.value === null) {
        errors.push(`Condition ${index + 1}: Value is required`);
      }
    });
  }

  return errors;
}

/**
 * Utility function to get available condition fields
 */
export function getConditionFields(): Array<{ value: string; label: string; type: string }> {
  return [
    { value: 'insuranceType', label: 'Insurance Type', type: 'string' },
    { value: 'source', label: 'Lead Source', type: 'string' },
    { value: 'score', label: 'Lead Score', type: 'number' },
    { value: 'scorePercentage', label: 'Score Percentage', type: 'number' },
    { value: 'estimatedValue', label: 'Estimated Value', type: 'number' },
    { value: 'pagesViewed', label: 'Pages Viewed', type: 'number' },
    { value: 'sessionDuration', label: 'Session Duration (seconds)', type: 'number' },
    { value: 'utmSource', label: 'UTM Source', type: 'string' },
    { value: 'utmCampaign', label: 'UTM Campaign', type: 'string' },
    { value: 'city', label: 'City', type: 'string' },
    { value: 'state', label: 'State', type: 'string' }
  ];
}

/**
 * Utility function to get available operators
 */
export function getConditionOperators(): Array<{ value: string; label: string; types: string[] }> {
  return [
    { value: 'equals', label: 'Equals', types: ['string', 'number'] },
    { value: 'not_equals', label: 'Not Equals', types: ['string', 'number'] },
    { value: 'contains', label: 'Contains', types: ['string'] },
    { value: 'greater_than', label: 'Greater Than', types: ['number'] },
    { value: 'less_than', label: 'Less Than', types: ['number'] },
    { value: 'greater_equal', label: 'Greater Than or Equal', types: ['number'] },
    { value: 'less_equal', label: 'Less Than or Equal', types: ['number'] },
    { value: 'in', label: 'In List', types: ['string', 'number'] },
    { value: 'not_in', label: 'Not In List', types: ['string', 'number'] }
  ];
}