"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Globe, Search, Users, DollarSign, TrendingUp, TrendingDown,
  ArrowUp, ArrowDown, ExternalLink, Target, Clock, BarChart3,
  Facebook, Instagram, Linkedin, Twitter, Mail, Phone
} from "lucide-react";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import { format, subDays } from "date-fns";

export default function LeadSourcesPage() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedSource, setSelectedSource] = useState("all");

  // Real data states
  const [sourceData, setSourceData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [qualityMetrics, setQualityMetrics] = useState([]);
  const [campaignData, setCampaignData] = useState([]);

  // Fetch real source analytics data
  const fetchSourceData = async () => {
    try {
      // Fetch leads data
      const response = await fetch('/api/leads?limit=1000');
      const leadsData = await response.json();
      
      if (leadsData.leads) {
        const leads = leadsData.leads;
        
        // Analyze sources from real data
        const sourceMap = new Map();
        leads.forEach((lead: any) => {
          const source = lead.source || 'Direct';
          if (!sourceMap.has(source)) {
            sourceMap.set(source, {
              leads: 0,
              conversions: 0,
              contacted: 0,
              qualified: 0
            });
          }
          const sourceStats = sourceMap.get(source);
          sourceStats.leads += 1;
          if (lead.status === 'CONVERTED') sourceStats.conversions += 1;
          if (lead.status === 'CONTACTED') sourceStats.contacted += 1;
          if (lead.status === 'QUALIFIED') sourceStats.qualified += 1;
        });
        
        // Map sources to appropriate icons and calculate metrics
        const getSourceIcon = (sourceName: string) => {
          const lower = sourceName.toLowerCase();
          if (lower.includes('google') || lower.includes('search')) return Search;
          if (lower.includes('facebook')) return Facebook;
          if (lower.includes('linkedin')) return Linkedin;
          if (lower.includes('email')) return Mail;
          if (lower.includes('phone') || lower.includes('call')) return Phone;
          if (lower.includes('organic') || lower.includes('seo')) return Globe;
          if (lower.includes('referral')) return Users;
          return Globe;
        };
        
        // Cost tracking requires integration with ad platforms
        const calculateCosts = (sourceName: string, leads: number) => {
          // No cost data available without platform integration
          return { costPerLead: 0, totalCost: 0 };
        };
        
        const newSourceData = Array.from(sourceMap.entries()).map(([sourceName, stats]) => {
          const conversionRate = stats.leads > 0 ? (stats.conversions / stats.leads) * 100 : 0;
          const costs = calculateCosts(sourceName, stats.leads);
          const revenue = 0; // Revenue tracking not implemented
          const roi = 0; // ROI calculation requires cost and revenue data
          const avgLeadScore = 0; // Lead scoring system not implemented
          
          return {
            source: sourceName,
            icon: getSourceIcon(sourceName),
            leads: stats.leads,
            conversions: stats.conversions,
            conversionRate: Number(conversionRate.toFixed(1)),
            costPerLead: Number(costs.costPerLead.toFixed(2)),
            totalCost: Math.round(costs.totalCost),
            revenue: revenue,
            roi: Number(roi.toFixed(1)),
            avgLeadScore: Math.round(avgLeadScore),
            trend: conversionRate > 10 ? 'up' : conversionRate < 5 ? 'down' : 'stable'
          };
        }).sort((a, b) => b.leads - a.leads);
        
        setSourceData(newSourceData);
        
        // Generate trend data from real lead creation dates
        const newTrendData = Array.from({ length: 30 }, (_, i) => {
          const date = subDays(new Date(), 29 - i);
          const dateStr = format(date, 'yyyy-MM-dd');
          
          const dayData: any = { date: format(date, 'MMM dd') };
          
          newSourceData.slice(0, 5).forEach(source => {
            const leadsOnDate = leads.filter((lead: any) => {
              const leadDate = format(new Date(lead.createdAt), 'yyyy-MM-dd');
              return leadDate === dateStr && (lead.source || 'Direct') === source.source;
            }).length;
            dayData[source.source] = leadsOnDate;
          });
          
          return dayData;
        });
        
        setTrendData(newTrendData);
        
        // Generate quality metrics based on real performance
        const topSources = newSourceData.slice(0, 5);
        const newQualityMetrics = [
          {
            metric: "Lead Quality",
            ...Object.fromEntries(topSources.map(s => [s.source, s.avgLeadScore]))
          },
          {
            metric: "Response Rate",
            ...Object.fromEntries(topSources.map(s => [
              s.source, 
              s.leads > 0 ? Math.round(((s.conversions + (s as any).contacted + (s as any).qualified) / s.leads) * 100) : 0
            ]))
          },
          {
            metric: "Conversion Speed",
            ...Object.fromEntries(topSources.map(s => [s.source, 0]))
          },
          {
            metric: "ROI Performance",
            ...Object.fromEntries(topSources.map(s => [s.source, s.roi > 0 ? Math.round(s.roi) : 0]))
          },
          {
            metric: "Engagement",
            ...Object.fromEntries(topSources.map(s => [s.source, 0]))
          }
        ];
        
        setQualityMetrics(newQualityMetrics);
        
        // Generate campaign data based on sources
        const newCampaignData = topSources.slice(0, 5).map((source, idx) => {
          const campaignNames = [
            'Medicare Advantage 2024',
            'ACA Open Enrollment',
            'Medicare Supplement',
            'Part D Prescription',
            'Health Insurance Quotes'
          ];
          
          return {
            campaign: campaignNames[idx] || `${source.source} Campaign`,
            source: source.source,
            leads: source.leads,
            cost: source.totalCost,
            cpl: source.costPerLead,
            conversion: source.conversionRate
          };
        });
        
        setCampaignData(newCampaignData);
      }
    } catch (error) {
      console.error('Error fetching source data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSourceData();
  }, [timeRange]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <ArrowUp className="h-4 w-4 text-gray-400 rotate-90" />;
  };

  // Calculate totals
  const totals = {
    leads: sourceData.reduce((sum, s) => sum + s.leads, 0),
    conversions: sourceData.reduce((sum, s) => sum + s.conversions, 0),
    cost: sourceData.reduce((sum, s) => sum + s.totalCost, 0),
    revenue: sourceData.reduce((sum, s) => sum + s.revenue, 0)
  };

  const pieData = sourceData.map((s, i) => ({
    name: s.source,
    value: s.leads,
    percentage: ((s.leads / totals.leads) * 100).toFixed(1),
    color: COLORS[i % COLORS.length]
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading source analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Lead Sources Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Track and optimize your lead acquisition channels
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

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.leads.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From all sources</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.conversions}</div>
            <p className="text-xs text-muted-foreground">
              {((totals.conversions / totals.leads) * 100).toFixed(1)}% rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totals.cost / 1000).toFixed(1)}k</div>
            <p className="text-xs text-muted-foreground">
              ${(totals.cost / totals.leads).toFixed(2)} per lead
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totals.revenue / 1000).toFixed(1)}k</div>
            <p className="text-xs text-green-500">
              {((totals.revenue / totals.cost - 1) * 100).toFixed(0)}% ROI
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Source Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Source Performance</CardTitle>
          <CardDescription>Detailed metrics for each lead source</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-sm text-muted-foreground">
                  <th className="text-left p-2">Source</th>
                  <th className="text-center p-2">Leads</th>
                  <th className="text-center p-2">Conversions</th>
                  <th className="text-center p-2">Conv. Rate</th>
                  <th className="text-center p-2">CPL</th>
                  <th className="text-center p-2">Total Cost</th>
                  <th className="text-center p-2">Revenue</th>
                  <th className="text-center p-2">ROI</th>
                  <th className="text-center p-2">Lead Score</th>
                  <th className="text-center p-2">Trend</th>
                </tr>
              </thead>
              <tbody>
                {sourceData.map((source) => {
                  const Icon = source.icon;
                  return (
                    <tr key={source.source} className="border-b hover:bg-accent/50">
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{source.source}</span>
                        </div>
                      </td>
                      <td className="p-2 text-center font-medium">{source.leads}</td>
                      <td className="p-2 text-center">{source.conversions}</td>
                      <td className="p-2 text-center">
                        <Badge variant="outline" className={source.conversionRate > 10 ? "text-green-500" : ""}>
                          {source.conversionRate}%
                        </Badge>
                      </td>
                      <td className="p-2 text-center">
                        {source.costPerLead > 0 ? `$${source.costPerLead.toFixed(2)}` : '-'}
                      </td>
                      <td className="p-2 text-center">
                        {source.totalCost > 0 ? `$${source.totalCost.toLocaleString()}` : '-'}
                      </td>
                      <td className="p-2 text-center font-medium">
                        ${source.revenue.toLocaleString()}
                      </td>
                      <td className="p-2 text-center">
                        {source.roi > 0 ? (
                          <Badge className="bg-green-500/10 text-green-500">
                            {source.roi.toFixed(0)}%
                          </Badge>
                        ) : '-'}
                      </td>
                      <td className="p-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span>{source.avgLeadScore}</span>
                          <Progress value={source.avgLeadScore} className="w-12 h-1.5" />
                        </div>
                      </td>
                      <td className="p-2 text-center">
                        {getTrendIcon(source.trend)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* Lead Volume Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Volume Trend</CardTitle>
            <CardDescription>Daily lead capture by source</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="Google Ads" stackId="1" stroke="#3b82f6" fill="#3b82f6" />
                <Area type="monotone" dataKey="Organic" stackId="1" stroke="#10b981" fill="#10b981" />
                <Area type="monotone" dataKey="Facebook" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
                <Area type="monotone" dataKey="Direct" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" />
                <Area type="monotone" dataKey="Email" stackId="1" stroke="#ef4444" fill="#ef4444" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Source Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Source Distribution</CardTitle>
            <CardDescription>Lead volume by source</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {pieData.slice(0, 6).map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                    <span className="text-xs">{item.name}</span>
                  </div>
                  <span className="text-xs font-medium">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Active Campaign Performance</CardTitle>
          <CardDescription>Current marketing campaigns by source</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-sm text-muted-foreground">
                  <th className="text-left p-2">Campaign</th>
                  <th className="text-left p-2">Source</th>
                  <th className="text-center p-2">Leads</th>
                  <th className="text-center p-2">Cost</th>
                  <th className="text-center p-2">CPL</th>
                  <th className="text-center p-2">Conversion</th>
                  <th className="text-center p-2">Performance</th>
                </tr>
              </thead>
              <tbody>
                {campaignData.map((campaign) => (
                  <tr key={campaign.campaign} className="border-b">
                    <td className="p-2 font-medium">{campaign.campaign}</td>
                    <td className="p-2">
                      <Badge variant="outline">{campaign.source}</Badge>
                    </td>
                    <td className="p-2 text-center">{campaign.leads}</td>
                    <td className="p-2 text-center">${campaign.cost.toLocaleString()}</td>
                    <td className="p-2 text-center">${campaign.cpl.toFixed(2)}</td>
                    <td className="p-2 text-center">
                      <Badge variant="outline" className={campaign.conversion > 10 ? "text-green-500" : ""}>
                        {campaign.conversion}%
                      </Badge>
                    </td>
                    <td className="p-2">
                      <Progress value={campaign.conversion * 5} className="h-2" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Source Quality Radar */}
      <Card>
        <CardHeader>
          <CardTitle>Source Quality Analysis</CardTitle>
          <CardDescription>Comparative quality metrics across top sources</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={qualityMetrics}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Google Ads" dataKey="Google Ads" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              <Radar name="Organic" dataKey="Organic" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
              <Radar name="Email" dataKey="Email" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
              <Radar name="Referral" dataKey="Referral" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}