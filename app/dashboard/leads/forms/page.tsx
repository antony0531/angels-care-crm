"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  FileText, Eye, MousePointer, Clock, TrendingUp, TrendingDown,
  ArrowUp, ArrowDown, CheckCircle2, XCircle, AlertTriangle,
  Copy, ExternalLink, Settings, BarChart3, Users, Target
} from "lucide-react";
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, FunnelChart, Funnel, LabelList
} from "recharts";
import { format, subDays } from "date-fns";

export default function LeadFormsPage() {
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedForm, setSelectedForm] = useState("all");

  // Forms Data - requires form builder integration
  const [formsData] = useState([]);

  // Field Performance - requires form analytics integration
  const [fieldPerformance] = useState([]);

  // Form Funnel - requires form analytics integration
  const [funnelData] = useState([]);

  // Submission Trends - requires form analytics integration
  const submissionTrend = [];

  // A/B Test Results - requires A/B testing platform integration
  const [abTests] = useState([]);

  // Device Performance - requires device analytics integration
  const [deviceData] = useState([]);

  // Error Messages - requires form validation analytics
  const [errorData] = useState([]);

  const getStatusBadge = (status: string) => {
    if (status === 'active') return <Badge className="bg-green-500/10 text-green-500">Active</Badge>;
    if (status === 'testing') return <Badge className="bg-yellow-500/10 text-yellow-500">Testing</Badge>;
    return <Badge variant="outline">Inactive</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Lead Forms Management</h1>
        <p className="text-muted-foreground mt-2">
          Monitor and optimize your lead capture forms
        </p>
      </div>

      {/* Time Range Filter */}
      <div className="flex items-center gap-2">
        <Button 
          variant={timeRange === "7d" ? "default" : "outline"}
          size="sm"
          onClick={() => setTimeRange("7d")}
        >
          7 Days
        </Button>
        <Button 
          variant={timeRange === "30d" ? "default" : "outline"}
          size="sm"
          onClick={() => setTimeRange("30d")}
        >
          30 Days
        </Button>
        <Button 
          variant={timeRange === "90d" ? "default" : "outline"}
          size="sm"
          onClick={() => setTimeRange("90d")}
        >
          90 Days
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Forms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formsData.length}</div>
            <p className="text-xs text-muted-foreground">
              {formsData.filter(f => f.status === 'active').length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(formsData.reduce((sum, f) => sum + f.views, 0) / 1000).toFixed(1)}k
            </div>
            <p className="text-xs text-green-500">↑ 12% from last period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formsData.reduce((sum, f) => sum + f.submissions, 0).toLocaleString()}
            </div>
            <p className="text-xs text-green-500">↑ 8% from last period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Avg Conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(formsData.reduce((sum, f) => sum + f.conversionRate, 0) / formsData.length).toFixed(1)}%
            </div>
            <Progress value={35} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Forms Performance Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Forms Performance</CardTitle>
              <CardDescription>All active and testing forms</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Create Form
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-sm text-muted-foreground">
                  <th className="text-left p-2">Form Name</th>
                  <th className="text-center p-2">Status</th>
                  <th className="text-center p-2">Views</th>
                  <th className="text-center p-2">Submissions</th>
                  <th className="text-center p-2">Conv. Rate</th>
                  <th className="text-center p-2">Avg Time</th>
                  <th className="text-center p-2">Abandonment</th>
                  <th className="text-center p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {formsData.map((form) => (
                  <tr key={form.id} className="border-b hover:bg-accent/50">
                    <td className="p-2">
                      <div>
                        <p className="font-medium">{form.name}</p>
                        <p className="text-xs text-muted-foreground">{form.url}</p>
                      </div>
                    </td>
                    <td className="p-2 text-center">{getStatusBadge(form.status)}</td>
                    <td className="p-2 text-center">{form.views.toLocaleString()}</td>
                    <td className="p-2 text-center font-medium">{form.submissions}</td>
                    <td className="p-2 text-center">
                      <Badge variant="outline" className={form.conversionRate > 3 ? "text-green-500" : ""}>
                        {form.conversionRate}%
                      </Badge>
                    </td>
                    <td className="p-2 text-center">{form.avgCompletionTime}s</td>
                    <td className="p-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className={form.abandonment > 30 ? "text-red-500" : ""}>{form.abandonment}%</span>
                        {form.abandonment > 30 && <AlertTriangle className="h-3 w-3 text-red-500" />}
                      </div>
                    </td>
                    <td className="p-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* Form Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Form Completion Funnel</CardTitle>
            <CardDescription>User progression through form fields</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {funnelData.map((stage, index) => (
                <div key={stage.stage}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{stage.stage}</span>
                    <span className="text-sm">
                      {stage.value.toLocaleString()} ({((stage.value / funnelData[0].value) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <Progress 
                    value={(stage.value / funnelData[0].value) * 100} 
                    className="h-6"
                    style={{ backgroundColor: stage.fill + '20' }}
                  />
                  {index < funnelData.length - 1 && (
                    <p className="text-xs text-muted-foreground text-right mt-1">
                      {((1 - funnelData[index + 1].value / stage.value) * 100).toFixed(1)}% drop-off
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submission Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Submission Trends</CardTitle>
            <CardDescription>Daily submissions and conversion rate</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={submissionTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Line yAxisId="left" type="monotone" dataKey="submissions" stroke="#3b82f6" name="Submissions" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="rate" stroke="#10b981" name="Conv. Rate %" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Field Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Field-by-Field Analysis</CardTitle>
          <CardDescription>Performance metrics for each form field</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-sm text-muted-foreground">
                  <th className="text-left p-2">Field Name</th>
                  <th className="text-center p-2">Completion Rate</th>
                  <th className="text-center p-2">Avg Time</th>
                  <th className="text-center p-2">Drop-offs</th>
                  <th className="text-center p-2">Performance</th>
                </tr>
              </thead>
              <tbody>
                {fieldPerformance.map((field) => (
                  <tr key={field.field} className="border-b">
                    <td className="p-2 font-medium">{field.field}</td>
                    <td className="p-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span>{field.completionRate}%</span>
                        {field.completionRate < 80 && <AlertTriangle className="h-3 w-3 text-yellow-500" />}
                      </div>
                    </td>
                    <td className="p-2 text-center">{field.avgTime}s</td>
                    <td className="p-2 text-center">
                      <Badge variant="outline" className={field.dropoffs > 100 ? "text-red-500" : ""}>
                        {field.dropoffs}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <Progress value={field.completionRate} className="h-2" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* A/B Tests */}
        <Card>
          <CardHeader>
            <CardTitle>A/B Test Results</CardTitle>
            <CardDescription>Form optimization experiments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {abTests.map((test) => (
                <div key={test.test} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{test.test}</span>
                    <Badge variant={test.status === 'active' ? 'default' : 'secondary'}>
                      {test.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className={`p-2 rounded ${test.winner === 'A' ? 'bg-green-500/10 border border-green-500/50' : 'bg-secondary'}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{test.variantA.name}</span>
                        {test.winner === 'A' && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                      </div>
                      <p className="text-xs mt-1">
                        {test.variantA.submissions} submissions • {test.variantA.rate}%
                      </p>
                    </div>
                    <div className={`p-2 rounded ${test.winner === 'B' ? 'bg-green-500/10 border border-green-500/50' : 'bg-secondary'}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{test.variantB.name}</span>
                        {test.winner === 'B' && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                      </div>
                      <p className="text-xs mt-1">
                        {test.variantB.submissions} submissions • {test.variantB.rate}%
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {test.confidence}% confidence
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Device Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Device Performance</CardTitle>
            <CardDescription>Form metrics by device type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deviceData.map((device) => (
                <div key={device.device} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{device.device}</span>
                    <Badge variant="outline">{device.rate}% conv.</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-center p-2 bg-secondary rounded">
                      <p className="font-bold">{device.views.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Views</p>
                    </div>
                    <div className="text-center p-2 bg-secondary rounded">
                      <p className="font-bold">{device.submissions}</p>
                      <p className="text-xs text-muted-foreground">Submits</p>
                    </div>
                    <div className="text-center p-2 bg-secondary rounded">
                      <p className="font-bold">{device.avgTime}s</p>
                      <p className="text-xs text-muted-foreground">Avg Time</p>
                    </div>
                  </div>
                  <Progress value={device.rate * 20} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}