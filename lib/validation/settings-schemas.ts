import { z } from "zod"

// Lead Status Schema
export const leadStatusSchema = z.object({
  id: z.string().optional(),
  name: z.string()
    .min(1, "Status name is required")
    .max(50, "Status name must be 50 characters or less")
    .regex(/^[a-zA-Z0-9\s-_]+$/, "Status name can only contain letters, numbers, spaces, hyphens, and underscores"),
  color: z.enum(["blue", "yellow", "purple", "green", "red", "gray"], {
    errorMap: () => ({ message: "Please select a valid color" })
  }),
  order: z.number().min(1, "Order must be at least 1"),
  isDefault: z.boolean()
})

export const leadStatusesArraySchema = z.array(leadStatusSchema)

// Lead Source Schema
export const leadSourceSchema = z.object({
  id: z.string().optional(),
  name: z.string()
    .min(1, "Source name is required")
    .max(100, "Source name must be 100 characters or less"),
  type: z.enum(["paid", "organic", "direct", "email", "referral"], {
    errorMap: () => ({ message: "Please select a valid source type" })
  }),
  isActive: z.boolean()
})

export const leadSourcesArraySchema = z.array(leadSourceSchema)

// Custom Field Schema
export const customFieldSchema = z.object({
  id: z.string().optional(),
  name: z.string()
    .min(1, "Field name is required")
    .max(100, "Field name must be 100 characters or less")
    .regex(/^[a-zA-Z][a-zA-Z0-9\s]*$/, "Field name must start with a letter and contain only letters, numbers, and spaces"),
  type: z.enum(["text", "number", "select", "textarea", "date"], {
    errorMap: () => ({ message: "Please select a valid field type" })
  }),
  isRequired: z.boolean(),
  options: z.array(z.string().min(1, "Option cannot be empty")).optional(),
  order: z.number().min(1, "Order must be at least 1").optional()
}).refine((data) => {
  // If type is select, options are required
  if (data.type === "select") {
    return data.options && data.options.length > 0
  }
  return true
}, {
  message: "Select fields must have at least one option",
  path: ["options"]
})

export const customFieldsArraySchema = z.array(customFieldSchema)

// Lead Scoring Schema
export const leadScoringRuleSchema = z.object({
  id: z.string().optional(),
  action: z.string().min(1, "Action is required"),
  points: z.number()
    .min(0, "Points must be 0 or greater")
    .max(100, "Points cannot exceed 100"),
  order: z.number().min(1, "Order must be at least 1")
})

export const leadScoringArraySchema = z.array(leadScoringRuleSchema)

// Assignment Rules Schema
export const assignmentRuleSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Rule name is required"),
  conditions: z.record(z.any()), // Flexible conditions object
  assignTo: z.string().min(1, "Assignment target is required"),
  priority: z.number().min(1, "Priority must be at least 1")
})

export const assignmentRulesArraySchema = z.array(assignmentRuleSchema)

// Notification Settings Schema
export const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  webhookNotifications: z.boolean(),
  notificationEmail: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
  smsNumber: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number")
    .optional()
    .or(z.literal("")),
  dailyDigest: z.boolean(),
  instantAlerts: z.boolean()
})

// API & Integrations Schema
export const integrationsSettingsSchema = z.object({
  webhookUrl: z.string()
    .url("Must be a valid URL")
    .startsWith("https://", "Webhook URLs must use HTTPS for security")
    .optional()
    .or(z.literal("")),
  apiKey: z.string()
    .min(32, "API key must be at least 32 characters for security")
    .max(128, "API key cannot exceed 128 characters")
    .optional()
    .or(z.literal("")),
  enableWebhooks: z.boolean(),
  retryFailedCalls: z.boolean(),
  maxRetries: z.number()
    .min(1, "Must retry at least once")
    .max(10, "Cannot exceed 10 retries")
})

// Import/Export Settings Schema
export const importExportSettingsSchema = z.object({
  importSource: z.enum(["csv", "excel", "json"], {
    errorMap: () => ({ message: "Please select a valid import format" })
  }),
  exportFormat: z.enum(["csv", "excel", "json", "pdf"], {
    errorMap: () => ({ message: "Please select a valid export format" })
  }),
  autoExport: z.boolean(),
  exportFrequency: z.enum(["daily", "weekly", "monthly"], {
    errorMap: () => ({ message: "Please select a valid export frequency" })
  }),
  includeArchived: z.boolean()
})

// Combined Settings Schema
export const allSettingsSchema = z.object({
  statuses: leadStatusesArraySchema,
  sources: leadSourcesArraySchema,
  customFields: customFieldsArraySchema,
  scoring: leadScoringArraySchema,
  assignment: assignmentRulesArraySchema,
  notifications: notificationSettingsSchema,
  integrations: integrationsSettingsSchema,
  importExport: importExportSettingsSchema
})

// Type exports for TypeScript
export type LeadStatus = z.infer<typeof leadStatusSchema>
export type LeadSource = z.infer<typeof leadSourceSchema>
export type CustomField = z.infer<typeof customFieldSchema>
export type LeadScoringRule = z.infer<typeof leadScoringRuleSchema>
export type AssignmentRule = z.infer<typeof assignmentRuleSchema>
export type NotificationSettings = z.infer<typeof notificationSettingsSchema>
export type IntegrationsSettings = z.infer<typeof integrationsSettingsSchema>
export type ImportExportSettings = z.infer<typeof importExportSettingsSchema>
export type AllSettings = z.infer<typeof allSettingsSchema>

// Legacy type alias for backward compatibility
export type ApiSettings = IntegrationsSettings