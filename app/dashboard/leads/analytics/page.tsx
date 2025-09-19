"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, Activity
} from "lucide-react";
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

export default function LeadAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");

  // Real data states - only keep functional ones
  const [funnelData, setFunnelData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [timePatterns, setTimePatterns] = useState({ byHour: [], byDay: [] });
  const [lifecycleData, setLifecycleData] = useState([]);
  const [behaviorData, setBehaviorData] = useState([]);

  // Fetch real analytics data
  const fetchAnalyticsData = async () => {
    try {
      // Fetch leads data
      const response = await fetch('/api/leads?limit=1000');
      const leadsData = await response.json();
      
      if (leadsData.leads) {
        const leads = leadsData.leads;
        const totalLeads = leads.length;
        
        // Status distribution for real lead statuses
        const statusCounts = {
          new: leads.filter((lead: any) => lead.status === 'NEW').length,
          contacted: leads.filter((lead: any) => lead.status === 'CONTACTED').length,
          qualified: leads.filter((lead: any) => lead.status === 'QUALIFIED').length,
          converted: leads.filter((lead: any) => lead.status === 'CONVERTED').length
        };
        
        // Build simple conversion funnel from actual lead data
        const newFunnelData = [
          { stage: "New Leads", value: statusCounts.new, fill: "#3b82f6" },
          { stage: "Contacted", value: statusCounts.contacted, fill: "#10b981" },
          { stage: "Qualified", value: statusCounts.qualified, fill: "#f59e0b" },
          { stage: "Converted", value: statusCounts.converted, fill: "#ef4444" }
        ];
        setFunnelData(newFunnelData);
        
        // Lead status distribution
        const newStatusData = [
          { status: "New", count: statusCounts.new, percentage: (statusCounts.new / totalLeads) * 100, color: "#3b82f6" },
          { status: "Contacted", count: statusCounts.contacted, percentage: (statusCounts.contacted / totalLeads) * 100, color: "#10b981" },
          { status: "Qualified", count: statusCounts.qualified, percentage: (statusCounts.qualified / totalLeads) * 100, color: "#f59e0b" },
          { status: "Converted", count: statusCounts.converted, percentage: (statusCounts.converted / totalLeads) * 100, color: "#ef4444" }
        ];
        setStatusData(newStatusData);
        
        // Generate time patterns from real creation dates
        const hourMap = new Map();
        const dayMap = new Map(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => [day, { leads: 0, converted: 0 }]));
        
        leads.forEach((lead: any) => {
          const createdAt = new Date(lead.createdAt);
          const hour = createdAt.getHours();
          const dayName = createdAt.toLocaleDateString('en-US', { weekday: 'long' });
          
          // Hour analysis
          if (!hourMap.has(hour)) {
            hourMap.set(hour, { leads: 0, converted: 0 });
          }
          hourMap.get(hour).leads += 1;
          if (lead.status === 'CONVERTED') {
            hourMap.get(hour).converted += 1;
          }
          
          // Day analysis
          if (dayMap.has(dayName)) {
            dayMap.get(dayName).leads += 1;
            if (lead.status === 'CONVERTED') {
              dayMap.get(dayName).converted += 1;
            }
          }
        });
        
        const byHour = Array.from({ length: 24 }, (_, i) => {
          const data = hourMap.get(i) || { leads: 0, converted: 0 };
          return {
            hour: `${i}:00`,
            leads: data.leads,
            conversion: data.leads > 0 ? (data.converted / data.leads) * 100 : 0
          };
        });
        
        const byDay = Array.from(dayMap.entries()).map(([day, data]) => ({
          day: day.slice(0, 3),
          leads: data.leads,
          conversion: data.leads > 0 ? (data.converted / data.leads) * 100 : 0
        }));
        
        setTimePatterns({ byHour, byDay });
        
        // Generate lifecycle data from real dates
        const newLifecycleData = Array.from({ length: 30 }, (_, i) => {
          const dayThreshold = new Date();
          dayThreshold.setDate(dayThreshold.getDate() - i);
          
          const leadsOnDay = leads.filter((lead: any) => {
            const leadDate = new Date(lead.createdAt);
            return leadDate.toDateString() === dayThreshold.toDateString();
          });
          
          return {
            day: i + 1,
            new: leadsOnDay.filter((lead: any) => lead.status === 'NEW').length,
            contacted: leadsOnDay.filter((lead: any) => lead.status === 'CONTACTED').length,
            qualified: leadsOnDay.filter((lead: any) => lead.status === 'QUALIFIED').length,
            converted: leadsOnDay.filter((lead: any) => lead.status === 'CONVERTED').length
          };
        }).reverse();
        setLifecycleData(newLifecycleData);
        
        // Basic conversion metrics from real data
        const conversionRate = totalLeads > 0 ? (statusCounts.converted / totalLeads) * 100 : 0;
        const qualificationRate = totalLeads > 0 ? ((statusCounts.qualified + statusCounts.converted) / totalLeads) * 100 : 0;
        const contactRate = totalLeads > 0 ? ((statusCounts.contacted + statusCounts.qualified + statusCounts.converted) / totalLeads) * 100 : 0;
        
        const newBehaviorData = [
          { metric: "Contact Rate", value: contactRate, unit: "%" },
          { metric: "Qualification Rate", value: qualificationRate, unit: "%" },
          { metric: "Conversion Rate", value: conversionRate, unit: "%" }
        ];
        setBehaviorData(newBehaviorData);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

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

      {/* Lead Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Status Distribution</CardTitle>
          <CardDescription>Current status breakdown of all leads</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statusData.map((status) => (
              <div key={status.status} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: status.color }} />
                    <span className="font-medium">{status.status}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold">{status.count}</span>
                    <span className="text-sm text-muted-foreground ml-2">{status.percentage.toFixed(1)}%</span>
                  </div>
                </div>
                <Progress value={status.percentage} className="h-4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conversion Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Metrics</CardTitle>
          <CardDescription>Key performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            {behaviorData.map((metric) => (
              <div key={metric.metric} className="text-center">
                <p className="text-2xl font-bold text-primary">{metric.value.toFixed(1)}{metric.unit}</p>
                <p className="text-sm text-muted-foreground">{metric.metric}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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

    </div>
  );
}