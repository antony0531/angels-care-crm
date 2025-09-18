"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, TrendingUp, Smartphone, Search, Download, Settings,
  Zap, Users, FileText, MapPin, AlertCircle, CheckCircle2,
  Clock, MousePointer, Eye, Target, Globe, Gauge
} from "lucide-react";
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadialBarChart, RadialBar, PolarAngleAxis
} from "recharts";
import { format, subDays } from "date-fns";

interface SEOMetrics {
  // Core Web Vitals
  coreWebVitals: {
    score: number;
    lcp: number; // Largest Contentful Paint
    fid: number; // First Input Delay
    cls: number; // Cumulative Layout Shift
    trend: 'up' | 'down' | 'stable';
  };
  pageSpeed: {
    mobile: number;
    desktop: number;
    trend: 'up' | 'down' | 'stable';
  };
  mobileUsability: {
    score: number;
    issues: number;
  };
  crawlHealth: {
    indexed: number;
    errors: number;
    warnings: number;
  };
  
  // Technical SEO
  technicalHealth: {
    loadSpeed: { mobile: number; desktop: number; };
    serverResponse: number;
    jsExecutionTime: number;
    brokenLinks: number;
    redirectChains: number;
  };
  
  // User Engagement
  engagement: {
    bounceRate: number;
    avgSessionDuration: string;
    pagesPerSession: number;
    scrollDepth: { 
      25: number; 
      50: number; 
      75: number; 
      100: number; 
    };
    rageClicks: number;
  };
  
  // Content Performance
  contentPerformance: {
    organicCTR: number;
    avgPosition: number;
    topKeywords: { keyword: string; position: number; clicks: number; }[];
    contentEngagement: number;
    internalLinkCTR: number;
  };
  
  // Conversion Funnel
  conversionFunnel: { 
    stage: string; 
    value: number; 
    percentage: number; 
  }[];
  
  // Local SEO
  localSEO: {
    localPackRanking: number;
    gmbInteractions: number;
    reviewScore: number;
    citationAccuracy: number;
  };
  
  // Real-time
  realTime: {
    activeVisitors: number;
    currentTests: number;
    recentConversions: number;
    uptimePercentage: number;
  };
  
  // Time series data
  performanceTrend: {
    date: string;
    desktop: number;
    mobile: number;
    coreWebVitals: number;
  }[];
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<SEOMetrics>({
    coreWebVitals: {
      score: 92,
      lcp: 2.1,
      fid: 45,
      cls: 0.05,
      trend: 'up'
    },
    pageSpeed: {
      mobile: 78,
      desktop: 94,
      trend: 'stable'
    },
    mobileUsability: {
      score: 96,
      issues: 2
    },
    crawlHealth: {
      indexed: 245,
      errors: 3,
      warnings: 12
    },
    technicalHealth: {
      loadSpeed: { mobile: 3.2, desktop: 1.8 },
      serverResponse: 240,
      jsExecutionTime: 890,
      brokenLinks: 5,
      redirectChains: 2
    },
    engagement: {
      bounceRate: 42.3,
      avgSessionDuration: "3:24",
      pagesPerSession: 2.8,
      scrollDepth: { 25: 92, 50: 67, 75: 45, 100: 23 },
      rageClicks: 12
    },
    contentPerformance: {
      organicCTR: 4.2,
      avgPosition: 12.3,
      topKeywords: [
        { keyword: "medicare insurance plans", position: 3, clicks: 1240 },
        { keyword: "affordable health coverage", position: 5, clicks: 890 },
        { keyword: "supplement insurance quotes", position: 8, clicks: 567 },
        { keyword: "ACA marketplace plans", position: 4, clicks: 445 },
        { keyword: "senior health insurance", position: 6, clicks: 334 }
      ],
      contentEngagement: 68,
      internalLinkCTR: 12.4
    },
    conversionFunnel: [
      { stage: "Visitors", value: 10000, percentage: 100 },
      { stage: "Engaged", value: 6800, percentage: 68 },
      { stage: "Form Started", value: 2500, percentage: 25 },
      { stage: "Form Completed", value: 800, percentage: 8 },
      { stage: "Qualified", value: 300, percentage: 3 },
      { stage: "Converted", value: 120, percentage: 1.2 }
    ],
    localSEO: {
      localPackRanking: 2,
      gmbInteractions: 456,
      reviewScore: 4.7,
      citationAccuracy: 94
    },
    realTime: {
      activeVisitors: 34,
      currentTests: 3,
      recentConversions: 8,
      uptimePercentage: 99.98
    },
    performanceTrend: Array.from({ length: 7 }, (_, i) => ({
      date: format(subDays(new Date(), 6 - i), 'MMM dd'),
      desktop: Math.floor(Math.random() * 10) + 85,
      mobile: Math.floor(Math.random() * 15) + 70,
      coreWebVitals: Math.floor(Math.random() * 8) + 88
    }))
  });

  const [timeRange, setTimeRange] = useState("7d");

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return "bg-green-500/10";
    if (score >= 50) return "bg-yellow-500/10";
    return "bg-red-500/10";
  };

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "SEO Analytics Export\n"
      + `Core Web Vitals Score,${metrics.coreWebVitals.score}\n`
      + `Mobile Page Speed,${metrics.pageSpeed.mobile}\n`
      + `Desktop Page Speed,${metrics.pageSpeed.desktop}\n`;
    
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `seo_analytics_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SEO Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive performance metrics and optimization insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
          <Button onClick={exportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Core Web Vitals Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className={getScoreBg(metrics.coreWebVitals.score)}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Core Web Vitals</CardTitle>
              <Gauge className={`h-4 w-4 ${getScoreColor(metrics.coreWebVitals.score)}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className={`text-2xl font-bold ${getScoreColor(metrics.coreWebVitals.score)}`}>
                {metrics.coreWebVitals.score}
              </span>
              <Badge variant={metrics.coreWebVitals.trend === 'up' ? 'default' : 'secondary'}>
                {metrics.coreWebVitals.trend === 'up' ? '↑' : metrics.coreWebVitals.trend === 'down' ? '↓' : '→'} 
                {metrics.coreWebVitals.trend}
              </Badge>
            </div>
            <div className="mt-2 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">LCP</span>
                <span>{metrics.coreWebVitals.lcp}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">FID</span>
                <span>{metrics.coreWebVitals.fid}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">CLS</span>
                <span>{metrics.coreWebVitals.cls}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={getScoreBg(metrics.pageSpeed.mobile)}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Page Speed</CardTitle>
              <Zap className={`h-4 w-4 ${getScoreColor((metrics.pageSpeed.mobile + metrics.pageSpeed.desktop) / 2)}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Mobile</span>
                  <span className={getScoreColor(metrics.pageSpeed.mobile)}>{metrics.pageSpeed.mobile}</span>
                </div>
                <Progress value={metrics.pageSpeed.mobile} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Desktop</span>
                  <span className={getScoreColor(metrics.pageSpeed.desktop)}>{metrics.pageSpeed.desktop}</span>
                </div>
                <Progress value={metrics.pageSpeed.desktop} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={getScoreBg(metrics.mobileUsability.score)}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Mobile Usability</CardTitle>
              <Smartphone className={`h-4 w-4 ${getScoreColor(metrics.mobileUsability.score)}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className={`text-2xl font-bold ${getScoreColor(metrics.mobileUsability.score)}`}>
                {metrics.mobileUsability.score}%
              </span>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Issues</p>
                <p className="text-sm font-semibold">{metrics.mobileUsability.issues}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Crawl Health</CardTitle>
              <Search className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-green-500">Indexed</span>
                <span className="font-semibold">{metrics.crawlHealth.indexed}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-red-500">Errors</span>
                <span className="font-semibold">{metrics.crawlHealth.errors}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-yellow-500">Warnings</span>
                <span className="font-semibold">{metrics.crawlHealth.warnings}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Technical SEO Health */}
        <Card>
          <CardHeader>
            <CardTitle>Technical SEO Health</CardTitle>
            <CardDescription>Site performance and technical metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Load Speed</p>
                  <div className="flex gap-4 mt-1">
                    <span className="text-sm">📱 {metrics.technicalHealth.loadSpeed.mobile}s</span>
                    <span className="text-sm">💻 {metrics.technicalHealth.loadSpeed.desktop}s</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Server Response</p>
                  <p className="text-lg font-semibold">{metrics.technicalHealth.serverResponse}ms</p>
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={metrics.performanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="desktop" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="mobile" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="coreWebVitals" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="text-center p-2 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">JS Execution</p>
                  <p className="text-sm font-semibold">{metrics.technicalHealth.jsExecutionTime}ms</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Broken Links</p>
                  <p className="text-sm font-semibold text-red-500">{metrics.technicalHealth.brokenLinks}</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Redirect Chains</p>
                  <p className="text-sm font-semibold text-yellow-500">{metrics.technicalHealth.redirectChains}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Engagement */}
        <Card>
          <CardHeader>
            <CardTitle>User Engagement & Behavior</CardTitle>
            <CardDescription>How users interact with your site</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Bounce Rate</p>
                  <p className="text-lg font-semibold">{metrics.engagement.bounceRate}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Session Duration</p>
                  <p className="text-lg font-semibold">{metrics.engagement.avgSessionDuration}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pages/Session</p>
                  <p className="text-lg font-semibold">{metrics.engagement.pagesPerSession}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Scroll Depth Distribution</p>
                <div className="space-y-2">
                  {Object.entries(metrics.engagement.scrollDepth).map(([depth, percentage]) => (
                    <div key={depth} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-10">{depth}%</span>
                      <Progress value={percentage} className="flex-1 h-2" />
                      <span className="text-xs w-10 text-right">{percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-red-500/10">
                <span className="text-sm">Rage Clicks Detected</span>
                <Badge variant="destructive">{metrics.engagement.rageClicks}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Content Performance & Keywords</CardTitle>
            <CardDescription>Organic search performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Organic CTR</p>
                  <p className="text-2xl font-bold">{metrics.contentPerformance.organicCTR}%</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Avg Position</p>
                  <p className="text-2xl font-bold">{metrics.contentPerformance.avgPosition}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Top Performing Keywords</p>
                <div className="space-y-2">
                  {metrics.contentPerformance.topKeywords.slice(0, 5).map((kw, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{kw.keyword}</p>
                        <p className="text-xs text-muted-foreground">{kw.clicks} clicks</p>
                      </div>
                      <Badge variant={kw.position <= 3 ? "default" : "secondary"}>
                        #{kw.position}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Content Engagement</p>
                  <p className="text-sm font-semibold">{metrics.contentPerformance.contentEngagement}%</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Internal Link CTR</p>
                  <p className="text-sm font-semibold">{metrics.contentPerformance.internalLinkCTR}%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Optimization */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Optimization</CardTitle>
            <CardDescription>Track visitor journey to conversion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.conversionFunnel.map((stage, index) => (
                <div key={stage.stage} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{stage.stage}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {stage.value.toLocaleString()} ({stage.percentage}%)
                      </span>
                      {index > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {Math.round((stage.value / metrics.conversionFunnel[index - 1].value) * 100)}% of previous
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-8 relative">
                    <div 
                      className="h-8 rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                      style={{ 
                        width: `${stage.percentage}%`,
                        background: 'linear-gradient(90deg, #3b82f6, #2563eb)'
                      }}
                    >
                      {stage.percentage >= 5 && (
                        <span className="text-xs text-white font-bold drop-shadow-md">
                          {stage.percentage}%
                        </span>
                      )}
                    </div>
                    {stage.percentage < 5 && (
                      <span 
                        className="absolute top-1/2 -translate-y-1/2 text-xs font-bold text-foreground"
                        style={{ left: `calc(${stage.percentage}% + 10px)` }}
                      >
                        {stage.percentage}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Local SEO */}
        <Card>
          <CardHeader>
            <CardTitle>Local SEO Performance</CardTitle>
            <CardDescription>Local search visibility and reputation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <MapPin className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Local Pack Ranking</p>
                <p className="text-2xl font-bold">#{metrics.localSEO.localPackRanking}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">GMB Interactions</p>
                <p className="text-2xl font-bold">{metrics.localSEO.gmbInteractions}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Review Score</p>
                <p className="text-2xl font-bold">⭐ {metrics.localSEO.reviewScore}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Citation Accuracy</p>
                <p className="text-2xl font-bold">{metrics.localSEO.citationAccuracy}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Monitoring */}
        <Card>
          <CardHeader>
            <CardTitle>Real-time Monitoring</CardTitle>
            <CardDescription>Live performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                <div>
                  <p className="text-xs text-muted-foreground">Active Visitors</p>
                  <p className="text-lg font-semibold">{metrics.realTime.activeVisitors}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Running A/B Tests</p>
                <p className="text-lg font-semibold">{metrics.realTime.currentTests}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Recent Conversions</p>
                <p className="text-lg font-semibold">{metrics.realTime.recentConversions}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Uptime</p>
                <p className="text-lg font-semibold text-green-500">{metrics.realTime.uptimePercentage}%</p>
              </div>
            </div>
            <div className="mt-4 p-2 rounded-lg bg-green-500/10 text-center">
              <p className="text-sm text-green-600 dark:text-green-400">
                ✓ All systems operational
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}