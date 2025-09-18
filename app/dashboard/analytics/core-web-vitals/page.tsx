"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Activity, TrendingUp, TrendingDown, Gauge, Monitor, Smartphone,
  AlertCircle, CheckCircle2, Info, ArrowUp, ArrowDown, Minus
} from "lucide-react";
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { format, subDays } from "date-fns";

export default function CoreWebVitalsPage() {
  const [selectedMetric, setSelectedMetric] = useState("all");
  const [selectedDevice, setSelectedDevice] = useState("all");
  const [timeRange, setTimeRange] = useState("7d");

  // Core metrics data
  const [metrics] = useState({
    lcp: { value: 1.8, rating: "good", change: -0.2, unit: "s" },
    fid: { value: 45, rating: "good", change: -5, unit: "ms" },
    cls: { value: 0.05, rating: "good", change: -0.01, unit: "" },
    ttfb: { value: 0.6, rating: "good", change: -0.1, unit: "s" },
    fcp: { value: 1.2, rating: "good", change: -0.15, unit: "s" },
    inp: { value: 200, rating: "needs-improvement", change: 10, unit: "ms" }
  });

  // Historical trend data
  const trendData = Array.from({ length: 30 }, (_, i) => ({
    date: format(subDays(new Date(), 29 - i), 'MMM dd'),
    lcp: 1.5 + Math.random() * 1,
    fid: 30 + Math.random() * 40,
    cls: 0.02 + Math.random() * 0.08,
    ttfb: 0.4 + Math.random() * 0.4,
    fcp: 1 + Math.random() * 0.8,
    inp: 150 + Math.random() * 100
  }));

  // Page-specific performance
  const [pagePerformance] = useState([
    { page: "/", lcp: 1.5, fid: 40, cls: 0.03, visits: 15234, score: 95 },
    { page: "/products", lcp: 2.1, fid: 55, cls: 0.08, visits: 8923, score: 88 },
    { page: "/blog", lcp: 1.8, fid: 35, cls: 0.04, visits: 6234, score: 92 },
    { page: "/contact", lcp: 1.2, fid: 30, cls: 0.02, visits: 3456, score: 98 },
    { page: "/about", lcp: 1.9, fid: 48, cls: 0.06, visits: 2890, score: 90 }
  ]);

  // Device breakdown
  const [deviceData] = useState([
    { device: "Desktop", lcp: 1.5, fid: 35, cls: 0.04, users: 60 },
    { device: "Mobile", lcp: 2.3, fid: 65, cls: 0.08, users: 35 },
    { device: "Tablet", lcp: 1.9, fid: 45, cls: 0.06, users: 5 }
  ]);

  const getRatingColor = (rating: string) => {
    switch(rating) {
      case 'good': return 'text-green-500';
      case 'needs-improvement': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getRatingBadge = (rating: string) => {
    switch(rating) {
      case 'good': return 'bg-green-500/10 text-green-500';
      case 'needs-improvement': return 'bg-yellow-500/10 text-yellow-500';
      case 'poor': return 'bg-red-500/10 text-red-500';
      default: return '';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#10b981';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Core Web Vitals</h1>
        <p className="text-muted-foreground mt-2">
          Monitor and optimize your site's user experience metrics
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

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-3 gap-4">
        {/* LCP - Largest Contentful Paint */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm">Largest Contentful Paint (LCP)</CardTitle>
                <CardDescription className="text-xs mt-1">Loading Performance</CardDescription>
              </div>
              <Gauge className={`h-5 w-5 ${getRatingColor(metrics.lcp.rating)}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold">{metrics.lcp.value}</span>
              <span className="text-sm text-muted-foreground mb-1">{metrics.lcp.unit}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={getRatingBadge(metrics.lcp.rating)}>
                {metrics.lcp.rating}
              </Badge>
              <div className="flex items-center text-xs">
                {metrics.lcp.change < 0 ? (
                  <>
                    <ArrowDown className="h-3 w-3 text-green-500" />
                    <span className="text-green-500">{Math.abs(metrics.lcp.change)}s</span>
                  </>
                ) : (
                  <>
                    <ArrowUp className="h-3 w-3 text-red-500" />
                    <span className="text-red-500">{metrics.lcp.change}s</span>
                  </>
                )}
              </div>
            </div>
            <Progress value={metrics.lcp.value <= 2.5 ? 100 : metrics.lcp.value <= 4 ? 50 : 10} className="h-2 mt-3" />
            <p className="text-xs text-muted-foreground mt-2">Target: ≤ 2.5s</p>
          </CardContent>
        </Card>

        {/* FID - First Input Delay */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm">First Input Delay (FID)</CardTitle>
                <CardDescription className="text-xs mt-1">Interactivity</CardDescription>
              </div>
              <Activity className={`h-5 w-5 ${getRatingColor(metrics.fid.rating)}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold">{metrics.fid.value}</span>
              <span className="text-sm text-muted-foreground mb-1">{metrics.fid.unit}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={getRatingBadge(metrics.fid.rating)}>
                {metrics.fid.rating}
              </Badge>
              <div className="flex items-center text-xs">
                {metrics.fid.change < 0 ? (
                  <>
                    <ArrowDown className="h-3 w-3 text-green-500" />
                    <span className="text-green-500">{Math.abs(metrics.fid.change)}ms</span>
                  </>
                ) : (
                  <>
                    <ArrowUp className="h-3 w-3 text-red-500" />
                    <span className="text-red-500">{metrics.fid.change}ms</span>
                  </>
                )}
              </div>
            </div>
            <Progress value={metrics.fid.value <= 100 ? 100 : metrics.fid.value <= 300 ? 50 : 10} className="h-2 mt-3" />
            <p className="text-xs text-muted-foreground mt-2">Target: ≤ 100ms</p>
          </CardContent>
        </Card>

        {/* CLS - Cumulative Layout Shift */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm">Cumulative Layout Shift (CLS)</CardTitle>
                <CardDescription className="text-xs mt-1">Visual Stability</CardDescription>
              </div>
              <Activity className={`h-5 w-5 ${getRatingColor(metrics.cls.rating)}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold">{metrics.cls.value}</span>
              <span className="text-sm text-muted-foreground mb-1">{metrics.cls.unit}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={getRatingBadge(metrics.cls.rating)}>
                {metrics.cls.rating}
              </Badge>
              <div className="flex items-center text-xs">
                {metrics.cls.change < 0 ? (
                  <>
                    <ArrowDown className="h-3 w-3 text-green-500" />
                    <span className="text-green-500">{Math.abs(metrics.cls.change)}</span>
                  </>
                ) : (
                  <>
                    <ArrowUp className="h-3 w-3 text-red-500" />
                    <span className="text-red-500">{metrics.cls.change}</span>
                  </>
                )}
              </div>
            </div>
            <Progress value={metrics.cls.value <= 0.1 ? 100 : metrics.cls.value <= 0.25 ? 50 : 10} className="h-2 mt-3" />
            <p className="text-xs text-muted-foreground mt-2">Target: ≤ 0.1</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Time to First Byte (TTFB)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{metrics.ttfb.value}</span>
              <span className="text-sm text-muted-foreground">{metrics.ttfb.unit}</span>
            </div>
            <Progress value={80} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">First Contentful Paint (FCP)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{metrics.fcp.value}</span>
              <span className="text-sm text-muted-foreground">{metrics.fcp.unit}</span>
            </div>
            <Progress value={85} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Interaction to Next Paint (INP)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{metrics.inp.value}</span>
              <span className="text-sm text-muted-foreground">{metrics.inp.unit}</span>
            </div>
            <Progress value={60} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Historical Trends */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>Historical Core Web Vitals over time</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedMetric === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedMetric("all")}
              >
                All Metrics
              </Button>
              <Button
                variant={selectedMetric === "lcp" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedMetric("lcp")}
              >
                LCP
              </Button>
              <Button
                variant={selectedMetric === "fid" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedMetric("fid")}
              >
                FID
              </Button>
              <Button
                variant={selectedMetric === "cls" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedMetric("cls")}
              >
                CLS
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              {(selectedMetric === "all" || selectedMetric === "lcp") && (
                <Line type="monotone" dataKey="lcp" stroke="#10b981" name="LCP (s)" strokeWidth={2} />
              )}
              {(selectedMetric === "all" || selectedMetric === "fid") && (
                <Line type="monotone" dataKey="fid" stroke="#3b82f6" name="FID (ms)" strokeWidth={2} />
              )}
              {(selectedMetric === "all" || selectedMetric === "cls") && (
                <Line type="monotone" dataKey="cls" stroke="#f59e0b" name="CLS" strokeWidth={2} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* Device Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Device Performance</CardTitle>
            <CardDescription>Core Web Vitals by device type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deviceData.map((device) => (
                <div key={device.device} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {device.device === "Desktop" ? <Monitor className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
                      <span className="font-medium">{device.device}</span>
                      <span className="text-sm text-muted-foreground">({device.users}% of users)</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="flex justify-between p-2 bg-secondary rounded">
                      <span className="text-muted-foreground">LCP</span>
                      <span className="font-medium">{device.lcp}s</span>
                    </div>
                    <div className="flex justify-between p-2 bg-secondary rounded">
                      <span className="text-muted-foreground">FID</span>
                      <span className="font-medium">{device.fid}ms</span>
                    </div>
                    <div className="flex justify-between p-2 bg-secondary rounded">
                      <span className="text-muted-foreground">CLS</span>
                      <span className="font-medium">{device.cls}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Page-by-Page Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Top Pages Performance</CardTitle>
            <CardDescription>Core Web Vitals by page</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pagePerformance.map((page) => (
                <div key={page.page} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{page.page}</span>
                      <Badge variant="outline" className="text-xs">
                        {page.visits.toLocaleString()} visits
                      </Badge>
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      <span>LCP: {page.lcp}s</span>
                      <span>FID: {page.fid}ms</span>
                      <span>CLS: {page.cls}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold" style={{ color: getScoreColor(page.score) }}>
                      {page.score}
                    </div>
                    <div className="text-xs text-muted-foreground">Score</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Recommendations</CardTitle>
          <CardDescription>Actionable insights to improve your Core Web Vitals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex gap-3 p-3 bg-green-500/10 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Optimize Images</p>
                <p className="text-sm text-muted-foreground">
                  Implement lazy loading and use next-gen formats (WebP) to improve LCP by ~0.5s
                </p>
              </div>
            </div>
            <div className="flex gap-3 p-3 bg-yellow-500/10 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Reduce JavaScript Execution</p>
                <p className="text-sm text-muted-foreground">
                  Code split and defer non-critical JS to improve FID by ~20ms
                </p>
              </div>
            </div>
            <div className="flex gap-3 p-3 bg-blue-500/10 rounded-lg">
              <Info className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Add Size Attributes</p>
                <p className="text-sm text-muted-foreground">
                  Set explicit width/height on images and videos to prevent CLS
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}