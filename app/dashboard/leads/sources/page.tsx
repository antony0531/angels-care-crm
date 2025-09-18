"use client";

import { useState } from "react";
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
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedSource, setSelectedSource] = useState("all");

  // Source Performance Data
  const [sourceData] = useState([
    {
      source: "Google Ads",
      icon: Search,
      leads: 456,
      conversions: 56,
      conversionRate: 12.3,
      costPerLead: 32.50,
      totalCost: 14820,
      revenue: 45600,
      roi: 207.8,
      avgLeadScore: 78,
      trend: "up"
    },
    {
      source: "Organic Search",
      icon: Globe,
      leads: 389,
      conversions: 38,
      conversionRate: 9.8,
      costPerLead: 0,
      totalCost: 0,
      revenue: 38900,
      roi: 0,
      avgLeadScore: 82,
      trend: "up"
    },
    {
      source: "Facebook Ads",
      icon: Facebook,
      leads: 234,
      conversions: 17,
      conversionRate: 7.3,
      costPerLead: 45.20,
      totalCost: 10577,
      revenue: 23400,
      roi: 121.2,
      trend: "down"
    },
    {
      source: "Direct Traffic",
      icon: Users,
      leads: 123,
      conversions: 14,
      conversionRate: 11.4,
      costPerLead: 0,
      totalCost: 0,
      revenue: 14150,
      roi: 0,
      avgLeadScore: 75,
      trend: "stable"
    },
    {
      source: "Email Campaign",
      icon: Mail,
      leads: 98,
      conversions: 15,
      conversionRate: 15.3,
      costPerLead: 8.50,
      totalCost: 833,
      revenue: 12740,
      roi: 1429.1,
      avgLeadScore: 88,
      trend: "up"
    },
    {
      source: "LinkedIn",
      icon: Linkedin,
      leads: 67,
      conversions: 8,
      conversionRate: 11.9,
      costPerLead: 52.30,
      totalCost: 3504,
      revenue: 8040,
      roi: 129.4,
      trend: "up"
    },
    {
      source: "Referral",
      icon: Users,
      leads: 45,
      conversions: 7,
      conversionRate: 15.6,
      costPerLead: 0,
      totalCost: 0,
      revenue: 7020,
      roi: 0,
      avgLeadScore: 91,
      trend: "up"
    },
    {
      source: "Phone Calls",
      icon: Phone,
      leads: 34,
      conversions: 5,
      conversionRate: 14.7,
      costPerLead: 0,
      totalCost: 0,
      revenue: 5100,
      roi: 0,
      avgLeadScore: 85,
      trend: "stable"
    }
  ]);

  // Historical trend data
  const trendData = Array.from({ length: 30 }, (_, i) => ({
    date: format(subDays(new Date(), 29 - i), 'MMM dd'),
    "Google Ads": Math.floor(Math.random() * 20) + 10,
    "Organic": Math.floor(Math.random() * 15) + 8,
    "Facebook": Math.floor(Math.random() * 10) + 5,
    "Direct": Math.floor(Math.random() * 5) + 3,
    "Email": Math.floor(Math.random() * 4) + 2
  }));

  // Source quality metrics
  const qualityMetrics = [
    { metric: "Lead Quality", "Google Ads": 78, "Organic": 82, "Facebook": 65, "Email": 88, "Referral": 91 },
    { metric: "Response Rate", "Google Ads": 45, "Organic": 52, "Facebook": 38, "Email": 67, "Referral": 73 },
    { metric: "Conversion Speed", "Google Ads": 72, "Organic": 68, "Facebook": 61, "Email": 79, "Referral": 85 },
    { metric: "Lifetime Value", "Google Ads": 65, "Organic": 78, "Facebook": 58, "Email": 82, "Referral": 89 },
    { metric: "Engagement", "Google Ads": 68, "Organic": 75, "Facebook": 71, "Email": 85, "Referral": 88 }
  ];

  // Campaign performance
  const [campaignData] = useState([
    { campaign: "Medicare 2024", source: "Google Ads", leads: 234, cost: 7450, cpl: 31.84, conversion: 13.2 },
    { campaign: "ACA Awareness", source: "Facebook", leads: 156, cost: 6890, cpl: 44.17, conversion: 7.8 },
    { campaign: "Part D Promo", source: "Google Ads", leads: 122, cost: 3720, cpl: 30.49, conversion: 11.5 },
    { campaign: "Newsletter Q1", source: "Email", leads: 98, cost: 833, cpl: 8.50, conversion: 15.3 },
    { campaign: "Senior Benefits", source: "LinkedIn", leads: 67, cost: 3504, cpl: 52.30, conversion: 11.9 }
  ]);

  // Attribution data
  const [attributionData] = useState([
    { model: "First Touch", "Google Ads": 456, "Organic": 389, "Facebook": 234, "Email": 98 },
    { model: "Last Touch", "Google Ads": 423, "Organic": 401, "Facebook": 198, "Email": 112 },
    { model: "Linear", "Google Ads": 439, "Organic": 395, "Facebook": 216, "Email": 105 },
    { model: "Time Decay", "Google Ads": 445, "Organic": 392, "Facebook": 225, "Email": 103 }
  ]);

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