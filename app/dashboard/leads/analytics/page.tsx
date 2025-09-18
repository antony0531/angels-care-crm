"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, Users, Clock, Target, Calendar, MapPin,
  ArrowUp, ArrowDown, BarChart3, Activity, Timer, Zap,
  Phone, Mail, MousePointer, Eye, ChevronRight
} from "lucide-react";
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, FunnelChart, Funnel, LabelList, ScatterChart, Scatter, ZAxis
} from "recharts";
import { format, subDays } from "date-fns";

export default function LeadAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedMetric, setSelectedMetric] = useState("all");

  // Conversion Funnel Data
  const [funnelData] = useState([
    { stage: "Website Visitors", value: 10000, fill: "#3b82f6" },
    { stage: "Form Views", value: 3500, fill: "#10b981" },
    { stage: "Form Starts", value: 1800, fill: "#f59e0b" },
    { stage: "Form Completions", value: 1247, fill: "#8b5cf6" },
    { stage: "Qualified Leads", value: 423, fill: "#ef4444" },
    { stage: "Conversions", value: 111, fill: "#06b6d4" }
  ]);

  // Response Time Analysis
  const [responseTimeData] = useState([
    { range: "< 5 min", leads: 234, conversion: 18.2 },
    { range: "5-15 min", leads: 345, conversion: 15.3 },
    { range: "15-30 min", leads: 267, conversion: 12.1 },
    { range: "30-60 min", leads: 189, conversion: 9.5 },
    { range: "1-2 hours", leads: 134, conversion: 7.2 },
    { range: "2-4 hours", leads: 78, conversion: 5.8 },
    { range: "> 4 hours", leads: 45, conversion: 3.1 }
  ]);

  // Lead Quality Distribution
  const [qualityData] = useState([
    { score: "90-100", label: "Hot", count: 89, percentage: 7.1, color: "#ef4444" },
    { score: "70-89", label: "Warm", count: 334, percentage: 26.8, color: "#f59e0b" },
    { score: "50-69", label: "Cool", count: 523, percentage: 41.9, color: "#3b82f6" },
    { score: "0-49", label: "Cold", count: 301, percentage: 24.1, color: "#94a3b8" }
  ]);

  // Time-based patterns
  const [timePatterns] = useState({
    byHour: Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      leads: Math.floor(Math.random() * 50) + 10,
      conversion: Math.random() * 5 + 5
    })),
    byDay: [
      { day: "Mon", leads: 178, conversion: 8.9 },
      { day: "Tue", leads: 203, conversion: 9.2 },
      { day: "Wed", leads: 189, conversion: 8.7 },
      { day: "Thu", leads: 212, conversion: 9.5 },
      { day: "Fri", leads: 167, conversion: 7.8 },
      { day: "Sat", leads: 98, conversion: 6.2 },
      { day: "Sun", leads: 76, conversion: 5.9 }
    ]
  });

  // Geographic Distribution
  const [geoData] = useState([
    { state: "California", leads: 234, conversion: 9.2, avgValue: 450 },
    { state: "Texas", leads: 189, conversion: 8.7, avgValue: 420 },
    { state: "Florida", leads: 167, conversion: 10.1, avgValue: 380 },
    { state: "New York", leads: 145, conversion: 8.3, avgValue: 490 },
    { state: "Illinois", leads: 123, conversion: 7.9, avgValue: 410 }
  ]);

  // Lead Lifecycle
  const lifecycleData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    new: 100 - i * 2,
    contacted: i < 15 ? 20 + i * 3 : 65 - (i - 15) * 2,
    qualified: i < 20 ? 5 + i : 25,
    converted: i < 25 ? 2 + i * 0.5 : 14
  }));

  // Behavior Analysis
  const [behaviorData] = useState([
    { metric: "Avg Pages Viewed", value: 4.2, benchmark: 3.5, unit: "pages" },
    { metric: "Avg Session Duration", value: 3.5, benchmark: 2.8, unit: "min" },
    { metric: "Form Completion Rate", value: 35.6, benchmark: 28.0, unit: "%" },
    { metric: "Return Visit Rate", value: 23.4, benchmark: 18.0, unit: "%" },
    { metric: "Mobile vs Desktop", value: 42, benchmark: 50, unit: "% mobile" }
  ]);

  // Cohort Analysis
  const [cohortData] = useState([
    { cohort: "Week 1", week1: 100, week2: 45, week3: 28, week4: 15, week5: 8 },
    { cohort: "Week 2", week1: 100, week2: 48, week3: 32, week4: 18 },
    { cohort: "Week 3", week1: 100, week2: 42, week3: 25 },
    { cohort: "Week 4", week1: 100, week2: 51 },
    { cohort: "Week 5", week1: 100 }
  ]);

  // Scatter plot data for lead scoring
  const scatterData = Array.from({ length: 100 }, () => ({
    engagement: Math.random() * 100,
    fitScore: Math.random() * 100,
    converted: Math.random() > 0.7,
    value: Math.random() * 1000 + 100
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Lead Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Deep insights into lead behavior and conversion patterns
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

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel Analysis</CardTitle>
          <CardDescription>Lead journey from visitor to customer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {funnelData.map((stage, index) => (
              <div key={stage.stage}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{stage.stage}</span>
                    <Badge variant="outline">
                      {stage.value.toLocaleString()} ({((stage.value / funnelData[0].value) * 100).toFixed(1)}%)
                    </Badge>
                  </div>
                  {index < funnelData.length - 1 && (
                    <span className="text-sm text-muted-foreground">
                      {((1 - funnelData[index + 1].value / stage.value) * 100).toFixed(1)}% drop-off
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Progress 
                    value={(stage.value / funnelData[0].value) * 100} 
                    className="h-8"
                    style={{ backgroundColor: stage.fill + '20' }}
                  />
                  <div 
                    className="absolute inset-y-0 left-0 rounded-md"
                    style={{ 
                      width: `${(stage.value / funnelData[0].value) * 100}%`,
                      backgroundColor: stage.fill
                    }}
                  />
                </div>
                {index < funnelData.length - 1 && (
                  <div className="flex justify-center my-2">
                    <ChevronRight className="h-4 w-4 text-muted-foreground rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* Response Time Impact */}
        <Card>
          <CardHeader>
            <CardTitle>Response Time Impact</CardTitle>
            <CardDescription>Conversion rate by response time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" angle={-45} textAnchor="end" height={80} />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="leads" fill="#3b82f6" name="Leads" />
                <Line yAxisId="right" type="monotone" dataKey="conversion" stroke="#10b981" name="Conversion %" strokeWidth={2} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg">
              <p className="text-sm font-medium">Key Insight</p>
              <p className="text-xs text-muted-foreground">
                Leads contacted within 5 minutes are 6x more likely to convert
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Lead Quality Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Quality Distribution</CardTitle>
            <CardDescription>Scoring breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {qualityData.map((quality) => (
                <div key={quality.score} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: quality.color }} />
                      <span className="font-medium">{quality.label}</span>
                      <span className="text-sm text-muted-foreground">({quality.score})</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold">{quality.count}</span>
                      <span className="text-sm text-muted-foreground ml-2">{quality.percentage}%</span>
                    </div>
                  </div>
                  <Progress value={quality.percentage} className="h-2" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
              <div>
                <p className="text-xs text-muted-foreground">Avg Lead Score</p>
                <p className="text-xl font-bold">62.4</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Qualified Rate</p>
                <p className="text-xl font-bold">33.9%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Patterns */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Best Times to Contact</CardTitle>
            <CardDescription>Lead activity by hour</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={timePatterns.byHour}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="leads" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-green-500/10 rounded">
                <p className="text-xs text-muted-foreground">Peak Hours</p>
                <p className="font-bold">10-12 AM</p>
              </div>
              <div className="p-2 bg-blue-500/10 rounded">
                <p className="text-xs text-muted-foreground">Most Active</p>
                <p className="font-bold">Tuesday</p>
              </div>
              <div className="p-2 bg-purple-500/10 rounded">
                <p className="text-xs text-muted-foreground">Best Convert</p>
                <p className="font-bold">2-4 PM</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Pattern</CardTitle>
            <CardDescription>Lead volume and conversion by day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={timePatterns.byDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="leads" fill="#3b82f6" />
                <Line yAxisId="right" type="monotone" dataKey="conversion" stroke="#10b981" strokeWidth={2} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 flex justify-between text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Highest Volume</p>
                <p className="font-bold">Thursday</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Best Conversion</p>
                <p className="font-bold">Tuesday</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lead Lifecycle */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Lifecycle Analysis</CardTitle>
          <CardDescription>Lead progression over time (days since capture)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={lifecycleData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" label={{ value: "Days Since Capture", position: "insideBottom", offset: -5 }} />
              <YAxis label={{ value: "Percentage of Leads", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Area type="monotone" dataKey="new" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="New" />
              <Area type="monotone" dataKey="contacted" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="Contacted" />
              <Area type="monotone" dataKey="qualified" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" name="Qualified" />
              <Area type="monotone" dataKey="converted" stackId="1" stroke="#10b981" fill="#10b981" name="Converted" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* Geographic Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Geographic Performance</CardTitle>
            <CardDescription>Top performing states</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {geoData.map((state, index) => (
                <div key={state.state} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-bold text-muted-foreground">#{index + 1}</div>
                    <MapPin className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="font-medium">{state.state}</p>
                      <p className="text-xs text-muted-foreground">{state.leads} leads</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{state.conversion}% conv.</Badge>
                    <p className="text-xs text-muted-foreground mt-1">${state.avgValue} avg</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Behavior Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Behavior Analysis</CardTitle>
            <CardDescription>Lead engagement metrics vs benchmarks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {behaviorData.map((metric) => (
                <div key={metric.metric} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{metric.metric}</span>
                    <span className="font-bold">
                      {metric.value} {metric.unit}
                    </span>
                  </div>
                  <div className="relative">
                    <Progress value={(metric.value / Math.max(metric.value, metric.benchmark)) * 100} className="h-2" />
                    <div 
                      className="absolute top-0 h-2 w-0.5 bg-red-500"
                      style={{ left: `${(metric.benchmark / Math.max(metric.value, metric.benchmark)) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Benchmark: {metric.benchmark} {metric.unit}
                    {metric.value > metric.benchmark && (
                      <span className="text-green-500 ml-1">
                        (+{((metric.value - metric.benchmark) / metric.benchmark * 100).toFixed(0)}%)
                      </span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lead Scoring Scatter */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Scoring Analysis</CardTitle>
          <CardDescription>Engagement vs Fit Score correlation</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="engagement" name="Engagement Score" unit="%" />
              <YAxis dataKey="fitScore" name="Fit Score" unit="%" />
              <ZAxis dataKey="value" range={[50, 400]} name="Value" unit="$" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter 
                name="Leads" 
                data={scatterData} 
                fill={(entry: any) => entry.converted ? '#10b981' : '#3b82f6'}
              />
            </ScatterChart>
          </ResponsiveContainer>
          <div className="mt-4 flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm">Not Converted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm">Converted</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}