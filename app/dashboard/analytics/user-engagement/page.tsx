"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MousePointer, Clock, Eye, Users, Activity, Target,
  TrendingUp, TrendingDown, ArrowUp, ArrowDown, BarChart3,
  Repeat, LogOut, ChevronRight, Layers
} from "lucide-react";
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie, Scatter, ScatterChart, ZAxis
} from "recharts";
import { format, subDays } from "date-fns";

export default function UserEngagementPage() {
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedMetric, setSelectedMetric] = useState("all");

  // Key Engagement Metrics - requires analytics integration
  const [engagementMetrics] = useState({
    avgSessionDuration: "0m 0s",
    bounceRate: 0,
    pagesPerSession: 0,
    scrollDepth: 0,
    clickThroughRate: 0,
    returnVisitorRate: 0,
    engagementRate: 0,
    exitRate: 0
  });

  // User Behavior Flow - requires analytics integration
  const [behaviorFlow] = useState([]);

  // Engagement by Page Type - requires analytics integration
  const [pageEngagement] = useState([]);

  // Time on Page Distribution - requires analytics integration
  const timeDistribution = [];

  // Heatmap Data - requires heatmap tool integration
  const [heatmapData] = useState([]);

  // Session Replay Insights - requires session recording tool
  const [sessionInsights] = useState([]);

  // Device Engagement - requires analytics integration
  const deviceEngagement = [];

  // Engagement Trend - requires analytics integration
  const engagementTrend = [];

  // Interactive Elements Performance - requires user interaction tracking
  const [interactiveElements] = useState([]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">User Engagement Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Track how users interact with your website and identify engagement opportunities
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

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Avg Session Duration</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engagementMetrics.avgSessionDuration}</div>
            <div className="flex items-center text-xs text-green-500 mt-1">
              <ArrowUp className="h-3 w-3" />
              <span>12% from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Bounce Rate</CardTitle>
              <LogOut className="h-4 w-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engagementMetrics.bounceRate}%</div>
            <div className="flex items-center text-xs text-green-500 mt-1">
              <ArrowDown className="h-3 w-3" />
              <span>5% improvement</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Pages/Session</CardTitle>
              <Layers className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engagementMetrics.pagesPerSession}</div>
            <div className="flex items-center text-xs text-green-500 mt-1">
              <ArrowUp className="h-3 w-3" />
              <span>0.5 pages increase</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Engagement Rate</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engagementMetrics.engagementRate}%</div>
            <Progress value={engagementMetrics.engagementRate} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* User Behavior Flow */}
      <Card>
        <CardHeader>
          <CardTitle>User Behavior Flow</CardTitle>
          <CardDescription>How users navigate through your site</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {behaviorFlow.map((step, index) => (
              <div key={step.step} className="relative">
                <div className="flex items-center gap-4">
                  <div className="w-32 text-sm font-medium">{step.step}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-secondary rounded-full h-8 relative overflow-hidden">
                        <div 
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full flex items-center justify-end pr-3"
                          style={{ width: `${(step.users / behaviorFlow[0].users) * 100}%` }}
                        >
                          <span className="text-xs text-white font-medium">
                            {step.users.toLocaleString()} users
                          </span>
                        </div>
                      </div>
                      {index < behaviorFlow.length - 1 && (
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          -{behaviorFlow[index + 1].dropoff}%
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {index < behaviorFlow.length - 1 && (
                  <div className="ml-16 mt-1 mb-1">
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* Engagement Trends */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Engagement Trends</CardTitle>
                <CardDescription>Key metrics over time</CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">Sessions</Badge>
                <Badge variant="outline">Duration</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={engagementTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="sessions" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                <Area type="monotone" dataKey="avgDuration" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Time on Page Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Time on Page Distribution</CardTitle>
            <CardDescription>How long users spend on pages</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={timeDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="users" fill="#3b82f6">
                  {timeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={
                      index === 0 ? '#ef4444' :
                      index === 1 ? '#f59e0b' :
                      index <= 3 ? '#10b981' :
                      '#3b82f6'
                    } />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Page Type Engagement */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement by Page Type</CardTitle>
          <CardDescription>How users engage with different types of content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pageEngagement.map((page) => (
              <div key={page.type} className="grid grid-cols-5 gap-4 p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{page.type}</p>
                  <p className="text-xs text-muted-foreground">{page.sessions.toLocaleString()} sessions</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold">{page.avgTime}</p>
                  <p className="text-xs text-muted-foreground">Avg Time</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold">{page.bounceRate}%</p>
                  <p className="text-xs text-muted-foreground">Bounce Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold">{page.scrollDepth}%</p>
                  <p className="text-xs text-muted-foreground">Scroll Depth</p>
                </div>
                <div>
                  <Progress value={page.scrollDepth} className="h-2 mt-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* Click Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle>Click Heatmap Insights</CardTitle>
            <CardDescription>Most clicked elements on your site</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {heatmapData.map((item) => (
                <div key={item.element} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{item.element}</span>
                      <span className="text-sm text-muted-foreground">{item.clicks.toLocaleString()} clicks</span>
                    </div>
                    <div className="relative">
                      <Progress value={item.percentage * 3.5} className="h-2" />
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <span className="text-lg font-bold">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Session Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Session Replay Insights</CardTitle>
            <CardDescription>User frustration signals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {sessionInsights.map((insight) => (
                <div key={insight.insight} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{insight.insight}</span>
                    <div className={`flex items-center text-xs ${
                      insight.trend === 'up' ? 'text-red-500' : 'text-green-500'
                    }`}>
                      {insight.trend === 'up' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                      <span>{Math.abs(insight.change)}%</span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold">{insight.count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Elements */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Elements Performance</CardTitle>
          <CardDescription>How users interact with dynamic content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            {interactiveElements.map((element) => (
              <div key={element.element} className="text-center">
                <div className="text-lg font-bold">{element.interactions}</div>
                <p className="text-xs text-muted-foreground mb-2">{element.element}</p>
                <Progress value={element.completionRate} className="h-2" />
                <p className="text-xs mt-1">{element.completionRate}% completion</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}