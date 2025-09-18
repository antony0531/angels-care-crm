"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Activity, Users, Globe, Clock, Eye, MousePointer,
  TrendingUp, MapPin, Monitor, Smartphone, RefreshCw,
  Circle, Zap, Navigation, ExternalLink, Timer
} from "lucide-react";
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie
} from "recharts";
import { format } from "date-fns";

export default function RealTimeMonitorPage() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Active Users
  const [activeUsers] = useState({
    current: 342,
    change: 12,
    peak: 456,
    average: 285
  });

  // Live Activity Feed
  const [activityFeed, setActivityFeed] = useState([
    { id: 1, time: "Just now", action: "Page View", page: "/medicare-plans", location: "New York, NY", device: "Mobile" },
    { id: 2, time: "5s ago", action: "Form Start", page: "/contact", location: "Los Angeles, CA", device: "Desktop" },
    { id: 3, time: "12s ago", action: "Download", page: "/guides/medicare-2024", location: "Chicago, IL", device: "Desktop" },
    { id: 4, time: "18s ago", action: "Click", page: "/", location: "Houston, TX", device: "Mobile" },
    { id: 5, time: "25s ago", action: "Conversion", page: "/quote", location: "Phoenix, AZ", device: "Desktop" }
  ]);

  // Real-time Metrics
  const [realtimeMetrics] = useState({
    pageviews: { current: 1234, trend: "up", change: 8 },
    sessions: { current: 342, trend: "up", change: 12 },
    conversions: { current: 23, trend: "down", change: -3 },
    avgDuration: { current: "3:45", trend: "up", change: 15 }
  });

  // Active Pages
  const [activePages] = useState([
    { page: "/medicare-plans", users: 89, views: 234, avgTime: "2:34" },
    { page: "/", users: 67, views: 189, avgTime: "1:23" },
    { page: "/senior-care", users: 45, views: 123, avgTime: "3:45" },
    { page: "/contact", users: 34, views: 98, avgTime: "4:12" },
    { page: "/blog/medicare-guide", users: 28, views: 76, avgTime: "5:23" }
  ]);

  // Traffic Sources
  const [trafficSources] = useState([
    { source: "Direct", users: 98, percentage: 28.7, color: "#3b82f6" },
    { source: "Organic", users: 123, percentage: 36.0, color: "#10b981" },
    { source: "Social", users: 45, percentage: 13.2, color: "#f59e0b" },
    { source: "Paid", users: 56, percentage: 16.4, color: "#8b5cf6" },
    { source: "Referral", users: 20, percentage: 5.8, color: "#ef4444" }
  ]);

  // Geographic Distribution
  const [geoData] = useState([
    { location: "United States", users: 287, percentage: 83.9 },
    { location: "Canada", users: 23, percentage: 6.7 },
    { location: "United Kingdom", users: 15, percentage: 4.4 },
    { location: "Australia", users: 10, percentage: 2.9 },
    { location: "Other", users: 7, percentage: 2.0 }
  ]);

  // Device Distribution
  const deviceData = [
    { name: "Desktop", value: 198, percentage: 57.9 },
    { name: "Mobile", value: 123, percentage: 36.0 },
    { name: "Tablet", value: 21, percentage: 6.1 }
  ];

  // Real-time trend (last 60 seconds)
  const [trendData] = useState(
    Array.from({ length: 60 }, (_, i) => ({
      second: i,
      users: Math.floor(Math.random() * 50) + 300,
      pageviews: Math.floor(Math.random() * 30) + 20
    }))
  );

  // User Flow
  const [userFlow] = useState([
    { from: "Homepage", to: "Products", users: 45 },
    { from: "Products", to: "Details", users: 34 },
    { from: "Details", to: "Cart", users: 23 },
    { from: "Cart", to: "Checkout", users: 18 },
    { from: "Checkout", to: "Success", users: 12 }
  ]);

  // Performance Alerts
  const [alerts] = useState([
    { type: "success", message: "Page load time improved by 15%", time: "2 min ago" },
    { type: "warning", message: "High bounce rate on /pricing page", time: "5 min ago" },
    { type: "info", message: "Traffic spike detected from social media", time: "8 min ago" }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setLastUpdated(new Date());
      
      // Simulate new activity
      setActivityFeed(prev => {
        const newActivity = {
          id: Date.now(),
          time: "Just now",
          action: ["Page View", "Click", "Form Start", "Download", "Conversion"][Math.floor(Math.random() * 5)],
          page: ["/", "/medicare-plans", "/contact", "/blog", "/quote"][Math.floor(Math.random() * 5)],
          location: ["New York, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX"][Math.floor(Math.random() * 4)],
          device: ["Desktop", "Mobile", "Tablet"][Math.floor(Math.random() * 3)]
        };
        
        // Update times for existing activities
        const updated = prev.map((item, index) => ({
          ...item,
          time: index === 0 ? "5s ago" :
                index === 1 ? "12s ago" :
                index === 2 ? "18s ago" :
                index === 3 ? "25s ago" :
                "32s ago"
        }));
        
        return [newActivity, ...updated.slice(0, 4)];
      });
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Real-time Monitor</h1>
          <p className="text-muted-foreground mt-2">
            Live website activity and performance monitoring
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Circle className={`h-3 w-3 ${autoRefresh ? 'text-green-500 animate-pulse' : 'text-gray-400'}`} />
            <span className="text-sm text-muted-foreground">
              Last updated: {format(lastUpdated, 'HH:mm:ss')}
            </span>
          </div>
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </Button>
        </div>
      </div>

      {/* Active Users Card */}
      <Card className="border-2 border-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
              <CardTitle>Active Users Right Now</CardTitle>
            </div>
            <Badge variant="outline" className="text-lg px-3 py-1">
              <Users className="h-4 w-4 mr-2" />
              {activeUsers.current}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">+{activeUsers.change}</p>
              <p className="text-xs text-muted-foreground">vs. 5 min ago</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{activeUsers.peak}</p>
              <p className="text-xs text-muted-foreground">Today's Peak</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{activeUsers.average}</p>
              <p className="text-xs text-muted-foreground">Daily Average</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Pageviews/min</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{realtimeMetrics.pageviews.current}</span>
              <div className={`flex items-center text-sm ${
                realtimeMetrics.pageviews.trend === 'up' ? 'text-green-500' : 'text-red-500'
              }`}>
                <TrendingUp className="h-4 w-4" />
                <span>{Math.abs(realtimeMetrics.pageviews.change)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{realtimeMetrics.sessions.current}</span>
              <div className={`flex items-center text-sm ${
                realtimeMetrics.sessions.trend === 'up' ? 'text-green-500' : 'text-red-500'
              }`}>
                <TrendingUp className="h-4 w-4" />
                <span>{Math.abs(realtimeMetrics.sessions.change)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Conversions/hr</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{realtimeMetrics.conversions.current}</span>
              <div className={`flex items-center text-sm ${
                realtimeMetrics.conversions.trend === 'up' ? 'text-green-500' : 'text-red-500'
              }`}>
                <TrendingUp className="h-4 w-4" />
                <span>{Math.abs(realtimeMetrics.conversions.change)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Avg Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{realtimeMetrics.avgDuration.current}</span>
              <div className={`flex items-center text-sm ${
                realtimeMetrics.avgDuration.trend === 'up' ? 'text-green-500' : 'text-red-500'
              }`}>
                <TrendingUp className="h-4 w-4" />
                <span>{Math.abs(realtimeMetrics.avgDuration.change)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Live Activity Feed */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Live Activity Feed</CardTitle>
              <Zap className="h-4 w-4 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activityFeed.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 text-sm animate-in">
                  <div className="h-2 w-2 bg-green-500 rounded-full mt-1.5 animate-pulse" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{activity.action}</span>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {activity.page} • {activity.location}
                    </div>
                    <Badge variant="outline" className="text-xs mt-1">
                      {activity.device}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Pages */}
        <Card>
          <CardHeader>
            <CardTitle>Top Active Pages</CardTitle>
            <CardDescription>Most visited pages right now</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activePages.map((page, index) => (
                <div key={page.page} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-sm font-bold text-muted-foreground">#{index + 1}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium truncate">{page.page}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{page.users} users</span>
                        <span>{page.views} views</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">{page.avgTime}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Live Traffic Sources</CardTitle>
            <CardDescription>Where visitors are coming from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={trafficSources}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="users"
                  >
                    {trafficSources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {trafficSources.map((source) => (
                <div key={source.source} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: source.color }} />
                    <span>{source.source}</span>
                  </div>
                  <span className="font-medium">{source.users} ({source.percentage}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Trend Graph */}
      <Card>
        <CardHeader>
          <CardTitle>Real-time Activity Trend</CardTitle>
          <CardDescription>Last 60 seconds of activity</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="second" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="users" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              <Area type="monotone" dataKey="pageviews" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* Geographic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Geographic Activity</CardTitle>
            <CardDescription>User locations in real-time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {geoData.map((location) => (
                <div key={location.location} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">{location.location}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={location.percentage} className="w-24 h-2" />
                    <span className="text-sm font-bold w-12 text-right">{location.users}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Device Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Device Distribution</CardTitle>
            <CardDescription>Active users by device type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deviceData.map((device) => (
                <div key={device.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {device.name === 'Desktop' ? <Monitor className="h-5 w-5" /> : <Smartphone className="h-5 w-5" />}
                    <div>
                      <p className="font-medium">{device.name}</p>
                      <p className="text-xs text-muted-foreground">{device.percentage}% of traffic</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{device.value}</p>
                    <p className="text-xs text-muted-foreground">users</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Alerts</CardTitle>
          <CardDescription>Recent system notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {alerts.map((alert, index) => (
              <div key={index} className={`p-3 rounded-lg flex items-start gap-3 ${
                alert.type === 'success' ? 'bg-green-500/10' :
                alert.type === 'warning' ? 'bg-yellow-500/10' :
                'bg-blue-500/10'
              }`}>
                <Activity className={`h-4 w-4 mt-0.5 ${
                  alert.type === 'success' ? 'text-green-500' :
                  alert.type === 'warning' ? 'text-yellow-500' :
                  'text-blue-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{alert.message}</p>
                  <p className="text-xs text-muted-foreground">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}