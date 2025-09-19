"use client";

import { useState, useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, Users, Tag, FileText, Bell, Shield, Database,
  Plus, Trash2, Edit, Save, X, ChevronUp, ChevronDown,
  Globe, Mail, Phone, Calendar, Clock, Zap, Download, Upload,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { 
  allSettingsSchema, 
  type AllSettings,
  type LeadStatus,
  type CustomField,
  type IntegrationsSettings
} from "@/lib/validation/settings-schemas";

export default function LeadSettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("statuses");
  
  // Initialize form with React Hook Form and Zod validation
  const form = useForm<AllSettings>({
    resolver: zodResolver(allSettingsSchema),
    defaultValues: {
      statuses: [
        { id: "1", name: "New", color: "blue", order: 1, isDefault: true },
        { id: "2", name: "Contacted", color: "yellow", order: 2, isDefault: false },
        { id: "3", name: "Qualified", color: "purple", order: 3, isDefault: false },
        { id: "4", name: "Converted", color: "green", order: 4, isDefault: false },
        { id: "5", name: "Lost", color: "red", order: 5, isDefault: false }
      ],
      sources: [
        { id: "1", name: "Google Ads", type: "paid", isActive: true },
        { id: "2", name: "Organic Search", type: "organic", isActive: true },
        { id: "3", name: "Facebook Ads", type: "paid", isActive: true },
        { id: "4", name: "Direct", type: "direct", isActive: true },
        { id: "5", name: "Email Campaign", type: "email", isActive: true },
        { id: "6", name: "Referral", type: "referral", isActive: true }
      ],
      customFields: [
        { id: "1", name: "Insurance Type", type: "select", isRequired: true, options: ["Medicare Advantage", "ACA Plans", "Supplement", "Part D"], order: 1 },
        { id: "2", name: "Age Range", type: "select", isRequired: false, options: ["Under 65", "65-70", "71-75", "76+"], order: 2 },
        { id: "3", name: "Preferred Contact Time", type: "select", isRequired: false, options: ["Morning", "Afternoon", "Evening"], order: 3 }
      ],
      scoring: [
        { id: "1", action: "Email opened", points: 5, order: 1 },
        { id: "2", action: "Link clicked", points: 10, order: 2 },
        { id: "3", action: "Form completed", points: 25, order: 3 },
        { id: "4", action: "Phone number provided", points: 15, order: 4 }
      ],
      assignment: [
        { 
          id: "1", 
          name: "Google Ads Assignment",
          conditions: { source: "Google Ads" },
          assignTo: "John Smith", 
          priority: 1
        },
        { 
          id: "2", 
          name: "Medicare Specialist",
          conditions: { insuranceType: "Medicare" },
          assignTo: "Jane Doe", 
          priority: 2
        }
      ],
      notifications: {
        emailNotifications: true,
        smsNotifications: false,
        webhookNotifications: true,
        notificationEmail: "admin@angelcare.com",
        smsNumber: "",
        dailyDigest: false,
        instantAlerts: true
      },
      integrations: {
        webhookUrl: "https://your-domain.com/webhook/leads",
        apiKey: "your_api_key_here",
        enableWebhooks: true,
        retryFailedCalls: true,
        maxRetries: 3
      },
      importExport: {
        importSource: "csv",
        exportFormat: "csv",
        autoExport: false,
        exportFrequency: "weekly",
        includeArchived: false
      }
    },
    mode: "onChange"
  });
  
  // Form field arrays for dynamic sections
  const { fields: statusFields, append: appendStatus, remove: removeStatus } = useFieldArray({
    control: form.control,
    name: "statuses"
  });
  
  const { fields: customFieldsArray, append: appendCustomField, remove: removeCustomField } = useFieldArray({
    control: form.control,
    name: "customFields"
  });
  
  const { fields: scoringRulesArray, append: appendScoringRule, remove: removeScoringRule } = useFieldArray({
    control: form.control,
    name: "scoring"
  });
  
  const { fields: sourcesArray, append: appendSource, remove: removeSource } = useFieldArray({
    control: form.control,
    name: "sources"
  });
  
  const { fields: assignmentRulesArray, append: appendAssignmentRule, remove: removeAssignmentRule } = useFieldArray({
    control: form.control,
    name: "assignment"
  });

  // Load settings data from the API
  const loadSettings = async () => {
    setIsDataLoading(true);
    try {
      const response = await fetch('/api/settings');
      if (!response.ok) {
        throw new Error(`Failed to load settings: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success && result.data) {
        form.reset(result.data);
        toast.success("Settings loaded successfully!");
      }
    } catch (error) {
      console.error('Settings load error:', error);
      toast.error("Failed to load settings. Using defaults.");
    } finally {
      setIsDataLoading(false);
    }
  };

  // Professional form submission handler
  const onSubmit = async (data: AllSettings) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success) {
        toast.success("Settings saved successfully!");
      } else {
        throw new Error(result.error || "Unknown error occurred");
      }
    } catch (error) {
      console.error('Settings save error:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to save settings. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadSettings();
  }, []);
  
  // Helper functions for dynamic sections
  const handleAddStatus = () => {
    const newOrder = statusFields.length + 1;
    appendStatus({
      id: `new-${Date.now()}`,
      name: "New Status",
      color: "gray",
      order: newOrder,
      isDefault: false
    });
    toast.success("Status added");
  };
  
  const handleAddCustomField = () => {
    appendCustomField({
      id: `new-${Date.now()}`,
      name: "New Field",
      type: "text",
      isRequired: false,
      order: customFieldsArray.length + 1
    });
    toast.success("Custom field added");
  };

  const handleAddScoringRule = () => {
    appendScoringRule({
      id: `new-${Date.now()}`,
      action: "New Action",
      points: 5,
      order: scoringRulesArray.length + 1
    });
    toast.success("Scoring rule added");
  };

  const handleAddAssignmentRule = () => {
    appendAssignmentRule({
      id: `new-${Date.now()}`,
      name: "New Assignment Rule",
      conditions: {},
      assignTo: "Unassigned",
      priority: assignmentRulesArray.length + 1
    });
    toast.success("Assignment rule added");
  };

  const handleAddSource = () => {
    appendSource({
      id: `new-${Date.now()}`,
      name: "New Source",
      type: "organic",
      isActive: true
    });
    toast.success("Lead source added");
  };

  // Error display helper
  const getFieldError = (fieldName: string) => {
    const error = form.formState.errors;
    const fieldPath = fieldName.split('.');
    let currentError: any = error;
    
    for (const path of fieldPath) {
      if (currentError && currentError[path]) {
        currentError = currentError[path];
      } else {
        return null;
      }
    }
    
    return currentError?.message || null;
  };

  if (isDataLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Lead Management Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure your CRM settings, lead scoring, and automation rules
          </p>
        </div>
        <Button type="submit" disabled={isLoading} className="min-w-32">
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save All Settings
            </>
          )}
        </Button>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="statuses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="statuses">Lead Statuses</TabsTrigger>
          <TabsTrigger value="sources">Lead Sources</TabsTrigger>
          <TabsTrigger value="fields">Custom Fields</TabsTrigger>
          <TabsTrigger value="assignment">Assignment Rules</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">API & Webhooks</TabsTrigger>
          <TabsTrigger value="import">Import/Export</TabsTrigger>
        </TabsList>

        {/* Lead Statuses Tab */}
        <TabsContent value="statuses" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Lead Status Configuration</CardTitle>
                  <CardDescription>Customize lead statuses and progression flow</CardDescription>
                </div>
                <Button type="button" onClick={handleAddStatus} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Status
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {statusFields.map((status, index) => (
                  <div key={status.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-1">
                      <Controller
                        name={`statuses.${index}.name`}
                        control={form.control}
                        render={({ field }) => (
                          <Input 
                            {...field} 
                            placeholder="Status name"
                            className="font-medium"
                          />
                        )}
                      />
                      {getFieldError(`statuses.${index}.name`) && (
                        <p className="text-sm text-red-500 mt-1">{getFieldError(`statuses.${index}.name`)}</p>
                      )}
                    </div>
                    
                    <Controller
                      name={`statuses.${index}.color`}
                      control={form.control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="blue">Blue</SelectItem>
                            <SelectItem value="yellow">Yellow</SelectItem>
                            <SelectItem value="purple">Purple</SelectItem>
                            <SelectItem value="green">Green</SelectItem>
                            <SelectItem value="red">Red</SelectItem>
                            <SelectItem value="gray">Gray</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    
                    {form.watch(`statuses.${index}.isDefault`) && <Badge>Default</Badge>}
                    
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStatus(index)}
                      disabled={statusFields.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lead Sources Tab */}
        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Lead Source Configuration</CardTitle>
                  <CardDescription>Manage where your leads come from and track source performance</CardDescription>
                </div>
                <Button type="button" onClick={handleAddSource} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Source
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sourcesArray.map((source, index) => (
                  <div key={source.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-1">
                      <Controller
                        name={`sources.${index}.name`}
                        control={form.control}
                        render={({ field }) => (
                          <Input 
                            {...field} 
                            placeholder="Source name"
                            className="font-medium"
                          />
                        )}
                      />
                      {getFieldError(`sources.${index}.name`) && (
                        <p className="text-sm text-red-500 mt-1">{getFieldError(`sources.${index}.name`)}</p>
                      )}
                    </div>
                    
                    <Controller
                      name={`sources.${index}.type`}
                      control={form.control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="organic">Organic</SelectItem>
                            <SelectItem value="direct">Direct</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="referral">Referral</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`source-active-${index}`}>Active</Label>
                      <Controller
                        name={`sources.${index}.isActive`}
                        control={form.control}
                        render={({ field }) => (
                          <Switch
                            id={`source-active-${index}`}
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                    </div>
                    
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSource(index)}
                      disabled={sourcesArray.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Fields Tab */}
        <TabsContent value="fields" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Custom Fields Configuration</CardTitle>
                  <CardDescription>Create custom fields to capture additional lead information</CardDescription>
                </div>
                <Button type="button" onClick={handleAddCustomField} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Field
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customFieldsArray.map((field, index) => (
                  <div key={field.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Label htmlFor={`field-name-${index}`}>Field Name</Label>
                        <Controller
                          name={`customFields.${index}.name`}
                          control={form.control}
                          render={({ field }) => (
                            <Input 
                              id={`field-name-${index}`}
                              {...field} 
                              placeholder="Field name"
                              className="font-medium"
                            />
                          )}
                        />
                        {getFieldError(`customFields.${index}.name`) && (
                          <p className="text-sm text-red-500 mt-1">{getFieldError(`customFields.${index}.name`)}</p>
                        )}
                      </div>
                      
                      <div className="w-40">
                        <Label htmlFor={`field-type-${index}`}>Type</Label>
                        <Controller
                          name={`customFields.${index}.type`}
                          control={form.control}
                          render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger id={`field-type-${index}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="number">Number</SelectItem>
                                <SelectItem value="select">Select</SelectItem>
                                <SelectItem value="textarea">Textarea</SelectItem>
                                <SelectItem value="date">Date</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`field-required-${index}`}>Required</Label>
                        <Controller
                          name={`customFields.${index}.isRequired`}
                          control={form.control}
                          render={({ field }) => (
                            <Switch
                              id={`field-required-${index}`}
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                      </div>
                      
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCustomField(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {form.watch(`customFields.${index}.type`) === 'select' && (
                      <div>
                        <Label htmlFor={`field-options-${index}`}>Options (comma-separated)</Label>
                        <Controller
                          name={`customFields.${index}.options`}
                          control={form.control}
                          render={({ field }) => (
                            <Textarea
                              id={`field-options-${index}`}
                              placeholder="Option 1, Option 2, Option 3"
                              value={field.value?.join(', ') || ''}
                              onChange={(e) => {
                                const options = e.target.value
                                  .split(',')
                                  .map(opt => opt.trim())
                                  .filter(opt => opt.length > 0);
                                field.onChange(options);
                              }}
                            />
                          )}
                        />
                        {getFieldError(`customFields.${index}.options`) && (
                          <p className="text-sm text-red-500 mt-1">{getFieldError(`customFields.${index}.options`)}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assignment Rules Tab */}
        <TabsContent value="assignment" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Assignment Rules</CardTitle>
                  <CardDescription>Configure automatic lead assignment to agents based on conditions</CardDescription>
                </div>
                <Button type="button" onClick={handleAddAssignmentRule} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assignmentRulesArray.map((rule, index) => (
                  <div key={rule.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Label htmlFor={`rule-name-${index}`}>Rule Name</Label>
                        <Controller
                          name={`assignment.${index}.name`}
                          control={form.control}
                          render={({ field }) => (
                            <Input 
                              id={`rule-name-${index}`}
                              {...field} 
                              placeholder="Rule name"
                              className="font-medium"
                            />
                          )}
                        />
                        {getFieldError(`assignment.${index}.name`) && (
                          <p className="text-sm text-red-500 mt-1">{getFieldError(`assignment.${index}.name`)}</p>
                        )}
                      </div>
                      
                      <div className="w-40">
                        <Label htmlFor={`rule-assignto-${index}`}>Assign To</Label>
                        <Controller
                          name={`assignment.${index}.assignTo`}
                          control={form.control}
                          render={({ field }) => (
                            <Input 
                              id={`rule-assignto-${index}`}
                              {...field} 
                              placeholder="Agent name"
                            />
                          )}
                        />
                        {getFieldError(`assignment.${index}.assignTo`) && (
                          <p className="text-sm text-red-500 mt-1">{getFieldError(`assignment.${index}.assignTo`)}</p>
                        )}
                      </div>
                      
                      <div className="w-24">
                        <Label htmlFor={`rule-priority-${index}`}>Priority</Label>
                        <Controller
                          name={`assignment.${index}.priority`}
                          control={form.control}
                          render={({ field }) => (
                            <Input 
                              id={`rule-priority-${index}`}
                              {...field} 
                              type="number"
                              min="1"
                              placeholder="Priority"
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            />
                          )}
                        />
                      </div>
                      
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAssignmentRule(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div>
                      <Label htmlFor={`rule-conditions-${index}`}>Conditions (JSON format)</Label>
                      <Controller
                        name={`assignment.${index}.conditions`}
                        control={form.control}
                        render={({ field }) => (
                          <Textarea
                            id={`rule-conditions-${index}`}
                            placeholder='{"source": "Google Ads", "insuranceType": "Medicare"}'
                            value={JSON.stringify(field.value || {}, null, 2)}
                            onChange={(e) => {
                              try {
                                const parsed = JSON.parse(e.target.value || '{}');
                                field.onChange(parsed);
                              } catch {
                                // Keep the text value for editing
                              }
                            }}
                            className="font-mono text-sm"
                          />
                        )}
                      />
                      {getFieldError(`assignment.${index}.conditions`) && (
                        <p className="text-sm text-red-500 mt-1">{getFieldError(`assignment.${index}.conditions`)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Import/Export Tab */}
        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import/Export Settings</CardTitle>
              <CardDescription>Configure data import and export preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="importSource">Import Source Format</Label>
                  <Controller
                    name="importExport.importSource"
                    control={form.control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="importSource">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="excel">Excel</SelectItem>
                          <SelectItem value="json">JSON</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {getFieldError('importExport.importSource') && (
                    <p className="text-sm text-red-500 mt-1">{getFieldError('importExport.importSource')}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="exportFormat">Export Format</Label>
                  <Controller
                    name="importExport.exportFormat"
                    control={form.control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="exportFormat">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="excel">Excel</SelectItem>
                          <SelectItem value="json">JSON</SelectItem>
                          <SelectItem value="pdf">PDF</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {getFieldError('importExport.exportFormat') && (
                    <p className="text-sm text-red-500 mt-1">{getFieldError('importExport.exportFormat')}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="autoExport">Auto Export</Label>
                <Controller
                  name="importExport.autoExport"
                  control={form.control}
                  render={({ field }) => (
                    <Switch
                      id="autoExport"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
              
              {form.watch('importExport.autoExport') && (
                <div>
                  <Label htmlFor="exportFrequency">Export Frequency</Label>
                  <Controller
                    name="importExport.exportFrequency"
                    control={form.control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="exportFrequency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {getFieldError('importExport.exportFrequency') && (
                    <p className="text-sm text-red-500 mt-1">{getFieldError('importExport.exportFrequency')}</p>
                  )}
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <Label htmlFor="includeArchived">Include Archived Leads</Label>
                <Controller
                  name="importExport.includeArchived"
                  control={form.control}
                  render={({ field }) => (
                    <Switch
                      id="includeArchived"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how you receive lead notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <Controller
                      name="notifications.emailNotifications"
                      control={form.control}
                      render={({ field }) => (
                        <Switch
                          id="emailNotifications"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="smsNotifications">SMS Notifications</Label>
                    <Controller
                      name="notifications.smsNotifications"
                      control={form.control}
                      render={({ field }) => (
                        <Switch
                          id="smsNotifications"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="dailyDigest">Daily Digest</Label>
                    <Controller
                      name="notifications.dailyDigest"
                      control={form.control}
                      render={({ field }) => (
                        <Switch
                          id="dailyDigest"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="notificationEmail">Notification Email</Label>
                    <Controller
                      name="notifications.notificationEmail"
                      control={form.control}
                      render={({ field }) => (
                        <Input
                          id="notificationEmail"
                          type="email"
                          placeholder="admin@company.com"
                          {...field}
                        />
                      )}
                    />
                    {getFieldError('notifications.notificationEmail') && (
                      <p className="text-sm text-red-500 mt-1">{getFieldError('notifications.notificationEmail')}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="smsNumber">SMS Number</Label>
                    <Controller
                      name="notifications.smsNumber"
                      control={form.control}
                      render={({ field }) => (
                        <Input
                          id="smsNumber"
                          type="tel"
                          placeholder="+1234567890"
                          {...field}
                        />
                      )}
                    />
                    {getFieldError('notifications.smsNumber') && (
                      <p className="text-sm text-red-500 mt-1">{getFieldError('notifications.smsNumber')}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API & Integrations Tab */}
        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API & Webhook Settings</CardTitle>
              <CardDescription>Configure external integrations and webhooks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <Controller
                    name="integrations.webhookUrl"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        id="webhookUrl"
                        type="url"
                        placeholder="https://your-domain.com/webhook"
                        {...field}
                      />
                    )}
                  />
                  {getFieldError('integrations.webhookUrl') && (
                    <p className="text-sm text-red-500 mt-1">{getFieldError('integrations.webhookUrl')}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="apiKey">API Key</Label>
                  <Controller
                    name="integrations.apiKey"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        id="apiKey"
                        type="password"
                        placeholder="Enter your API key"
                        {...field}
                      />
                    )}
                  />
                  {getFieldError('integrations.apiKey') && (
                    <p className="text-sm text-red-500 mt-1">{getFieldError('integrations.apiKey')}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="enableWebhooks">Enable Webhooks</Label>
                <Controller
                  name="integrations.enableWebhooks"
                  control={form.control}
                  render={({ field }) => (
                    <Switch
                      id="enableWebhooks"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  );
}