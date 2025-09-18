"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Target, TrendingUp, TrendingDown, Users, ShoppingCart, CreditCard,
  ArrowRight, ArrowUp, ArrowDown, Filter, MousePointer, Clock,
  AlertCircle, CheckCircle2, XCircle, DollarSign
} from "lucide-react";
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, FunnelChart, Funnel, LabelList, Sankey
} from "recharts";
import { format, subDays } from "date-fns";

export default function ConversionFunnelPage() {
  const [timeRange, setTimeRange] = useState("7d");
  const [funnelType, setFunnelType] = useState("main");

  // Main Conversion Funnel - requires analytics integration
  const [mainFunnel] = useState([]);

  // Goal Conversions - requires analytics integration  
  const [goalConversions] = useState({
    primary: { name: "Lead Submission", rate: 0, target: 10, value: "$0" },
    secondary: []
  });

  // Conversion by Source - requires analytics integration
  const [conversionBySource] = useState([]);

  // Device Conversion Rates - requires analytics integration
  const [deviceConversions] = useState([]);

  // A/B Test Results - requires A/B testing platform integration
  const [abTestResults] = useState([]);

  // Path Analysis - requires user journey tracking integration
  const [userPaths] = useState([]);

  // Conversion Trend - requires analytics integration
  const conversionTrend = [];

  // Cart Abandonment - requires e-commerce tracking integration
  const [cartAbandonment] = useState({
    rate: 0,
    reasons: [],
    recovery: {
      emailsSent: 0,
      recovered: 0,
      recoveryRate: 0,
      revenueRecovered: "$0"
    }
  });

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="h-3 w-3 text-green-500" />;
    if (change < 0) return <ArrowDown className="h-3 w-3 text-red-500" />;
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Conversion Funnel Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Track and optimize your conversion paths and goals
        </p>
      </div>

      {/* Time Range Filter */}
      <div className="flex items-center gap-2">
        <Button 
          variant={timeRange === "24h" ? "default" : "outline"}
          size="sm"
          onClick={() => setTimeRange("24h")}
        >
          24 Hours
        </Button>
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

      {/* Main Funnel Visualization */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Main Conversion Funnel</CardTitle>
              <CardDescription>User journey from landing to conversion</CardDescription>
            </div>
            <Badge variant="outline">Overall: {mainFunnel.length > 0 ? mainFunnel[mainFunnel.length - 1].rate : 0}%</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mainFunnel.map((stage, index) => (
              <div key={stage.stage}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{stage.stage}</span>
                    <Badge variant="outline" className="text-xs">
                      {stage.users.toLocaleString()} users
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">{stage.value}</span>
                    <span className="text-sm font-bold">{stage.rate}%</span>
                  </div>
                </div>
                <div className="relative">
                  <div className="h-10 bg-secondary rounded-lg overflow-hidden">
                    <div 
                      className="h-full rounded-lg flex items-center justify-end pr-3"
                      style={{ 
                        width: `${stage.rate}%`,
                        backgroundColor: stage.color
                      }}
                    >
                      {stage.rate > 5 && (
                        <span className="text-xs text-white font-medium">
                          {stage.rate}%
                        </span>
                      )}
                    </div>
                    {stage.rate <= 5 && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium">
                        {stage.rate}%
                      </span>
                    )}
                  </div>
                </div>
                {index < mainFunnel.length - 1 && (
                  <div className="flex items-center justify-center my-2">
                    <ArrowDown className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground ml-2">
                      {((mainFunnel[index].users - mainFunnel[index + 1].users) / mainFunnel[index].users * 100).toFixed(1)}% drop-off
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Goal Conversions */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Goal Conversions</CardTitle>
            <CardDescription>Performance against conversion goals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Primary Goal */}
              <div className="p-4 border rounded-lg bg-primary/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{goalConversions.primary.name}</span>
                  <Badge>Primary Goal</Badge>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold">{goalConversions.primary.rate}%</span>
                  <span className="text-sm text-muted-foreground">Target: {goalConversions.primary.target}%</span>
                </div>
                <Progress value={(goalConversions.primary.rate / goalConversions.primary.target) * 100} className="h-2" />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-muted-foreground">Value</span>
                  <span className="text-sm font-medium">{goalConversions.primary.value}</span>
                </div>
              </div>

              {/* Secondary Goals */}
              {goalConversions.secondary.map((goal) => (
                <div key={goal.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{goal.name}</span>
                      <span className="text-sm font-bold">{goal.rate}%</span>
                    </div>
                    <Progress value={(goal.rate / goal.target) * 100} className="h-1.5" />
                  </div>
                  <div className="ml-4 text-right">
                    <div className="text-sm font-medium">{goal.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Conversion by Source */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion by Traffic Source</CardTitle>
            <CardDescription>Performance across acquisition channels</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={conversionBySource}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="source" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="rate" fill="#3b82f6">
                  {conversionBySource.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={
                      entry.rate >= 12 ? '#10b981' :
                      entry.rate >= 8 ? '#3b82f6' :
                      '#f59e0b'
                    } />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Rate Trend</CardTitle>
          <CardDescription>Historical conversion performance</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={conversionTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Line yAxisId="left" type="monotone" dataKey="rate" stroke="#3b82f6" name="Conversion Rate (%)" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" name="Revenue ($)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-6">
        {/* Device Conversions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Device Conversion Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {deviceConversions.map((device) => (
                <div key={device.device}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{device.device}</span>
                    <span className="text-sm font-bold">{device.rate}%</span>
                  </div>
                  <Progress value={device.rate * 10} className="h-2" />
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">
                      {device.conversions}/{device.sessions}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Avg: {device.avgValue}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cart Abandonment */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Cart Abandonment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-red-500">{cartAbandonment.rate}%</div>
              <p className="text-xs text-muted-foreground">Abandonment Rate</p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Emails Sent</span>
                <span className="font-medium">{cartAbandonment.recovery.emailsSent}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Recovered</span>
                <span className="font-medium">{cartAbandonment.recovery.recovered}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Recovery Rate</span>
                <span className="font-medium text-green-500">{cartAbandonment.recovery.recoveryRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Revenue</span>
                <span className="font-medium">{cartAbandonment.recovery.revenueRecovered}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top User Paths */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Top Conversion Paths</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {userPaths.slice(0, 3).map((path, index) => (
                <div key={path.path} className="text-sm">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-muted-foreground">#{index + 1}</span>
                    <div className="flex-1">
                      <p className="text-xs font-medium break-all">{path.path}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-muted-foreground">{path.users} users</span>
                        <span className="text-xs font-bold">{path.conversion}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* A/B Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>A/B Test Results</CardTitle>
          <CardDescription>Active and recent conversion optimization tests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {abTestResults.map((test) => (
              <div key={test.test} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{test.test}</span>
                    <Badge variant={test.status === 'active' ? 'default' : 'secondary'}>
                      {test.status}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-green-500">+{test.uplift}%</div>
                    <div className="text-xs text-muted-foreground">{test.confidence}% confidence</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2 bg-secondary rounded">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Variant A: {test.variant_a.name}</span>
                      <span className="text-sm font-bold">{test.variant_a.rate}%</span>
                    </div>
                    <Progress value={test.variant_a.rate * 10} className="h-2" />
                    <span className="text-xs text-muted-foreground">{test.variant_a.conversions} conversions</span>
                  </div>
                  <div className="p-2 bg-primary/10 rounded border-2 border-primary/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Variant B: {test.variant_b.name}</span>
                      <span className="text-sm font-bold">{test.variant_b.rate}%</span>
                    </div>
                    <Progress value={test.variant_b.rate * 10} className="h-2" />
                    <span className="text-xs text-muted-foreground">{test.variant_b.conversions} conversions</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}