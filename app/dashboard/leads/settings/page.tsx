"use client";

import { useState } from "react";
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
  Globe, Mail, Phone, Calendar, Clock, Zap, Download, Upload
} from "lucide-react";
import { toast } from "sonner";

export default function LeadSettingsPage() {
  // Lead Statuses
  const [statuses, setStatuses] = useState([
    { id: 1, name: "New", color: "blue", order: 1, isDefault: true },
    { id: 2, name: "Contacted", color: "yellow", order: 2, isDefault: false },
    { id: 3, name: "Qualified", color: "purple", order: 3, isDefault: false },
    { id: 4, name: "Converted", color: "green", order: 4, isDefault: false },
    { id: 5, name: "Lost", color: "red", order: 5, isDefault: false }
  ]);

  // Lead Sources
  const [sources, setSources] = useState([
    { id: 1, name: "Google Ads", type: "paid", active: true },
    { id: 2, name: "Organic Search", type: "organic", active: true },
    { id: 3, name: "Facebook Ads", type: "paid", active: true },
    { id: 4, name: "Direct", type: "direct", active: true },
    { id: 5, name: "Email Campaign", type: "email", active: true },
    { id: 6, name: "Referral", type: "referral", active: true },
    { id: 7, name: "LinkedIn", type: "paid", active: false },
    { id: 8, name: "Phone", type: "direct", active: true }
  ]);

  // Custom Fields
  const [customFields, setCustomFields] = useState([
    { id: 1, name: "Insurance Type", type: "select", required: true, options: ["Medicare Advantage", "ACA Plans", "Supplement", "Part D"] },
    { id: 2, name: "Age Range", type: "select", required: false, options: ["Under 65", "65-70", "71-75", "76+"] },
    { id: 3, name: "Preferred Contact Time", type: "select", required: false, options: ["Morning", "Afternoon", "Evening"] },
    { id: 4, name: "Budget", type: "number", required: false },
    { id: 5, name: "Notes", type: "textarea", required: false }
  ]);

  // Scoring Rules
  const [scoringRules] = useState([
    { id: 1, criteria: "Email opened", points: 5, active: true },
    { id: 2, criteria: "Link clicked", points: 10, active: true },
    { id: 3, criteria: "Form completed", points: 25, active: true },
    { id: 4, criteria: "Phone number provided", points: 15, active: true },
    { id: 5, criteria: "Downloaded content", points: 20, active: true },
    { id: 6, criteria: "Multiple page views", points: 8, active: true },
    { id: 7, criteria: "Return visit", points: 12, active: true }
  ]);

  // Assignment Rules
  const [assignmentRules] = useState([
    { id: 1, condition: "Source = Google Ads", assignTo: "John Smith", active: true },
    { id: 2, condition: "Insurance Type = Medicare", assignTo: "Jane Doe", active: true },
    { id: 3, condition: "Score > 70", assignTo: "Senior Agent", active: true },
    { id: 4, condition: "State = California", assignTo: "West Coast Team", active: false }
  ]);

  // Notification Settings
  const [notifications, setNotifications] = useState({
    newLead: true,
    leadAssigned: true,
    leadConverted: true,
    formSubmission: true,
    highScoreLead: true,
    dailyDigest: false,
    weeklyReport: true
  });

  // API Settings
  const [apiSettings] = useState({
    webhookUrl: "https://your-domain.com/webhook/leads",
    apiKey: "your_api_key_here",
    enabled: true,
    retryOnFail: true,
    maxRetries: 3
  });

  // Import/Export Settings
  const [importExportSettings] = useState({
    autoImport: false,
    importSource: "csv",
    exportFormat: "csv",
    includeCustomFields: true,
    scheduledExport: false,
    exportFrequency: "weekly"
  });

  const handleAddStatus = () => {
    const newStatus = {
      id: statuses.length + 1,
      name: "New Status",
      color: "gray",
      order: statuses.length + 1,
      isDefault: false
    };
    setStatuses([...statuses, newStatus]);
    toast.success("Status added");
  };

  const handleDeleteStatus = (id: number) => {
    setStatuses(statuses.filter(s => s.id !== id));
    toast.success("Status deleted");
  };

  const handleMoveStatus = (id: number, direction: 'up' | 'down') => {
    const index = statuses.findIndex(s => s.id === id);
    if (direction === 'up' && index > 0) {
      const newStatuses = [...statuses];
      [newStatuses[index - 1], newStatuses[index]] = [newStatuses[index], newStatuses[index - 1]];
      setStatuses(newStatuses);
    } else if (direction === 'down' && index < statuses.length - 1) {
      const newStatuses = [...statuses];
      [newStatuses[index], newStatuses[index + 1]] = [newStatuses[index + 1], newStatuses[index]];
      setStatuses(newStatuses);
    }
  };

  const handleSaveSettings = () => {
    toast.success("Settings saved successfully");
  };

  const getColorClass = (color: string) => {
    const colors: { [key: string]: string } = {
      blue: "bg-blue-500",
      yellow: "bg-yellow-500",
      purple: "bg-purple-500",
      green: "bg-green-500",
      red: "bg-red-500",
      gray: "bg-gray-500"
    };
    return colors[color] || "bg-gray-500";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lead Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure lead management system settings
          </p>
        </div>
        <Button onClick={handleSaveSettings}>
          <Save className="h-4 w-4 mr-2" />
          Save All Settings
        </Button>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="statuses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="statuses">Lead Statuses</TabsTrigger>
          <TabsTrigger value="sources">Lead Sources</TabsTrigger>
          <TabsTrigger value="fields">Custom Fields</TabsTrigger>
          <TabsTrigger value="scoring">Lead Scoring</TabsTrigger>
          <TabsTrigger value="assignment">Assignment Rules</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="api">API & Webhooks</TabsTrigger>
          <TabsTrigger value="import">Import/Export</TabsTrigger>
        </TabsList>

        {/* Lead Statuses Tab */}
        <TabsContent value="statuses" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Lead Statuses</CardTitle>
                  <CardDescription>Define the stages of your lead pipeline</CardDescription>
                </div>
                <Button onClick={handleAddStatus} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Status
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {statuses.map((status, index) => (
                  <div key={status.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className={`w-3 h-3 rounded-full ${getColorClass(status.color)}`} />
                    <Input 
                      value={status.name} 
                      onChange={(e) => {
                        const newStatuses = [...statuses];
                        newStatuses[index].name = e.target.value;
                        setStatuses(newStatuses);
                      }}
                      className="max-w-xs"
                    />
                    <Select 
                      value={status.color}
                      onValueChange={(value) => {
                        const newStatuses = [...statuses];
                        newStatuses[index].color = value;
                        setStatuses(newStatuses);
                      }}
                    >
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
                    {status.isDefault && <Badge>Default</Badge>}
                    <div className="flex-1" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveStatus(status.id, 'up')}
                      disabled={index === 0}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveStatus(status.id, 'down')}
                      disabled={index === statuses.length - 1}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteStatus(status.id)}
                      disabled={status.isDefault}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
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
                  <CardTitle>Lead Sources</CardTitle>
                  <CardDescription>Configure available lead sources</CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Source
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {sources.map((source) => (
                  <div key={source.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Switch 
                        checked={source.active}
                        onCheckedChange={(checked) => {
                          const newSources = [...sources];
                          const index = newSources.findIndex(s => s.id === source.id);
                          newSources[index].active = checked;
                          setSources(newSources);
                        }}
                      />
                      <div>
                        <p className="font-medium">{source.name}</p>
                        <Badge variant="outline" className="text-xs">{source.type}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
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
                  <CardTitle>Custom Fields</CardTitle>
                  <CardDescription>Add custom fields to capture additional lead information</CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Field
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {customFields.map((field) => (
                  <div key={field.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Input value={field.name} className="max-w-xs" placeholder="Field name" />
                        <Select value={field.type}>
                          <SelectTrigger className="w-32">
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
                        <div className="flex items-center gap-2">
                          <Switch checked={field.required} />
                          <Label>Required</Label>
                        </div>
                      </div>
                      {field.type === 'select' && field.options && (
                        <div className="mt-2 flex gap-2 flex-wrap">
                          {field.options.map((option, i) => (
                            <Badge key={i} variant="outline">{option}</Badge>
                          ))}
                          <Button variant="outline" size="sm">
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lead Scoring Tab */}
        <TabsContent value="scoring" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Lead Scoring Rules</CardTitle>
                  <CardDescription>Define how leads are scored based on their actions</CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {scoringRules.map((rule) => (
                  <div key={rule.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <Switch checked={rule.active} />
                    <div className="flex-1">
                      <p className="font-medium">{rule.criteria}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Points:</span>
                      <Input type="number" value={rule.points} className="w-20" />
                    </div>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
                  <CardTitle>Auto-Assignment Rules</CardTitle>
                  <CardDescription>Automatically assign leads to agents based on criteria</CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {assignmentRules.map((rule) => (
                  <div key={rule.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <Switch checked={rule.active} />
                    <div className="flex-1">
                      <p className="font-medium">If {rule.condition}</p>
                      <p className="text-sm text-muted-foreground">Then assign to: {rule.assignTo}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure when and how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <Label className="text-base">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications for {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </p>
                      </div>
                    </div>
                    <Switch 
                      checked={value}
                      onCheckedChange={(checked) => {
                        setNotifications({...notifications, [key]: checked});
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API & Webhooks Tab */}
        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API & Webhook Configuration</CardTitle>
              <CardDescription>Connect external services and applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Webhook URL</Label>
                  <Input value={apiSettings.webhookUrl} placeholder="https://your-domain.com/webhook" className="mt-1" />
                </div>
                <div>
                  <Label>API Key</Label>
                  <div className="flex gap-2 mt-1">
                    <Input type="password" value={apiSettings.apiKey} />
                    <Button variant="outline">Regenerate</Button>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={apiSettings.enabled} />
                  <Label>Enable webhook notifications</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={apiSettings.retryOnFail} />
                  <Label>Retry failed webhook calls</Label>
                </div>
                {apiSettings.retryOnFail && (
                  <div>
                    <Label>Max retries</Label>
                    <Input type="number" value={apiSettings.maxRetries} className="w-20 mt-1" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Import/Export Tab */}
        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import & Export Settings</CardTitle>
              <CardDescription>Configure data import and export options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Import Format</Label>
                    <Select value={importExportSettings.importSource}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Export Format</Label>
                    <Select value={importExportSettings.exportFormat}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={importExportSettings.includeCustomFields} />
                  <Label>Include custom fields in exports</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={importExportSettings.scheduledExport} />
                  <Label>Enable scheduled exports</Label>
                </div>
                {importExportSettings.scheduledExport && (
                  <div>
                    <Label>Export frequency</Label>
                    <Select value={importExportSettings.exportFrequency}>
                      <SelectTrigger className="w-32 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="flex gap-2 pt-4">
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Leads
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Template
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}