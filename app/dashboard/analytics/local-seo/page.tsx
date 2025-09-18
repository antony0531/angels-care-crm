"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, Star, Phone, Globe, Navigation, Search,
  TrendingUp, TrendingDown, ArrowUp, ArrowDown, Users,
  CheckCircle2, AlertTriangle, XCircle, MessageSquare, Eye
} from "lucide-react";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, RadialBarChart, RadialBar, PolarGrid, PolarAngleAxis
} from "recharts";
import { format, subDays } from "date-fns";

export default function LocalSEOPage() {
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedLocation, setSelectedLocation] = useState("all");

  // Local SEO Overview
  const [localMetrics] = useState({
    overallScore: 82,
    googleMyBusiness: 91,
    localPackRanking: 3.2,
    citationScore: 78,
    reviewRating: 4.6,
    totalReviews: 234,
    responseRate: 94,
    avgResponseTime: "2h 15m"
  });

  // Location Performance
  const [locationData] = useState([
    {
      location: "New York, NY",
      visibility: 89,
      searches: 12456,
      clicks: 3234,
      calls: 456,
      directions: 789,
      reviews: 67,
      rating: 4.7
    },
    {
      location: "Los Angeles, CA",
      visibility: 76,
      searches: 9876,
      clicks: 2345,
      calls: 345,
      directions: 567,
      reviews: 45,
      rating: 4.5
    },
    {
      location: "Chicago, IL",
      visibility: 82,
      searches: 7654,
      clicks: 1890,
      calls: 234,
      directions: 456,
      reviews: 34,
      rating: 4.6
    },
    {
      location: "Houston, TX",
      visibility: 71,
      searches: 5432,
      clicks: 1234,
      calls: 167,
      directions: 345,
      reviews: 28,
      rating: 4.4
    }
  ]);

  // Local Search Rankings
  const [localRankings] = useState([
    { keyword: "medicare advisor near me", position: 2, change: 1, volume: 8900 },
    { keyword: "senior care [city]", position: 1, change: 0, volume: 6700 },
    { keyword: "health insurance advisor", position: 4, change: -1, volume: 5400 },
    { keyword: "medicare help [city]", position: 3, change: 2, volume: 4300 },
    { keyword: "senior health advisor", position: 5, change: -2, volume: 3200 }
  ]);

  // GMB Insights
  const gmbInsights = Array.from({ length: 30 }, (_, i) => ({
    date: format(subDays(new Date(), 29 - i), 'MMM dd'),
    searches: Math.floor(Math.random() * 200) + 300,
    views: Math.floor(Math.random() * 150) + 250,
    actions: Math.floor(Math.random() * 50) + 30
  }));

  // Citation Health
  const [citationHealth] = useState({
    totalCitations: 156,
    consistent: 128,
    inconsistent: 18,
    missing: 10,
    duplicates: 5,
    topDirectories: [
      { name: "Google My Business", status: "complete", nap: true },
      { name: "Yelp", status: "complete", nap: true },
      { name: "Facebook", status: "complete", nap: true },
      { name: "Yellow Pages", status: "incomplete", nap: false },
      { name: "Bing Places", status: "complete", nap: true }
    ]
  });

  // Review Analysis
  const [reviewAnalysis] = useState({
    distribution: [
      { stars: 5, count: 145, percentage: 62 },
      { stars: 4, count: 56, percentage: 24 },
      { stars: 3, count: 23, percentage: 10 },
      { stars: 2, count: 7, percentage: 3 },
      { stars: 1, count: 3, percentage: 1 }
    ],
    sentiment: {
      positive: 78,
      neutral: 15,
      negative: 7
    },
    topKeywords: [
      { word: "helpful", count: 89 },
      { word: "professional", count: 76 },
      { word: "knowledgeable", count: 65 },
      { word: "patient", count: 54 },
      { word: "responsive", count: 43 }
    ]
  });

  // Competitor Analysis
  const [competitors] = useState([
    { name: "Competitor A", visibility: 85, reviews: 312, rating: 4.5, citations: 187 },
    { name: "Competitor B", visibility: 79, reviews: 245, rating: 4.3, citations: 156 },
    { name: "Your Business", visibility: 82, reviews: 234, rating: 4.6, citations: 156, isYou: true },
    { name: "Competitor C", visibility: 73, reviews: 189, rating: 4.2, citations: 134 }
  ]);

  // Local Pack Features
  const [localPackFeatures] = useState([
    { feature: "Business Name", status: "optimized", impact: "high" },
    { feature: "Address Consistency", status: "optimized", impact: "high" },
    { feature: "Phone Number", status: "optimized", impact: "medium" },
    { feature: "Business Hours", status: "needs-update", impact: "medium" },
    { feature: "Website Link", status: "optimized", impact: "high" },
    { feature: "Category Selection", status: "optimized", impact: "high" },
    { feature: "Photos", status: "needs-more", impact: "medium" },
    { feature: "Q&A Section", status: "incomplete", impact: "low" }
  ]);

  const getPositionChange = (change: number) => {
    if (change > 0) return <span className="text-green-500 flex items-center"><ArrowUp className="h-3 w-3" />{change}</span>;
    if (change < 0) return <span className="text-red-500 flex items-center"><ArrowDown className="h-3 w-3" />{Math.abs(change)}</span>;
    return <span className="text-gray-500">-</span>;
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'complete':
      case 'optimized':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'incomplete':
      case 'needs-update':
      case 'needs-more':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Local SEO Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Monitor and optimize your local search presence and visibility
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

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Local SEO Score</CardTitle>
              <MapPin className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{localMetrics.overallScore}/100</div>
            <Progress value={localMetrics.overallScore} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">GMB Score</CardTitle>
              <Globe className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{localMetrics.googleMyBusiness}/100</div>
            <Progress value={localMetrics.googleMyBusiness} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Avg Local Pack Position</CardTitle>
              <Search className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#{localMetrics.localPackRanking}</div>
            <div className="flex items-center text-xs text-green-500 mt-1">
              <ArrowUp className="h-3 w-3" />
              <span>0.8 position improvement</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Review Rating</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{localMetrics.reviewRating}</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(localMetrics.reviewRating)
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {localMetrics.totalReviews} total reviews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Location Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by Location</CardTitle>
          <CardDescription>Metrics across your business locations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {locationData.map((location) => (
              <div key={location.location} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">{location.location}</span>
                    <Badge variant="outline">
                      Visibility: {location.visibility}%
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium">{location.rating}</span>
                    <span className="text-sm text-muted-foreground">({location.reviews})</span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <div className="text-center p-2 bg-secondary rounded">
                    <Eye className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                    <div className="text-lg font-bold">{location.searches.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Searches</div>
                  </div>
                  <div className="text-center p-2 bg-secondary rounded">
                    <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                    <div className="text-lg font-bold">{location.clicks.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Clicks</div>
                  </div>
                  <div className="text-center p-2 bg-secondary rounded">
                    <Phone className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                    <div className="text-lg font-bold">{location.calls}</div>
                    <div className="text-xs text-muted-foreground">Calls</div>
                  </div>
                  <div className="text-center p-2 bg-secondary rounded">
                    <Navigation className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                    <div className="text-lg font-bold">{location.directions}</div>
                    <div className="text-xs text-muted-foreground">Directions</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* GMB Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Google My Business Insights</CardTitle>
            <CardDescription>Search and engagement trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={gmbInsights}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="searches" stroke="#3b82f6" name="Searches" strokeWidth={2} />
                <Line type="monotone" dataKey="views" stroke="#10b981" name="Views" strokeWidth={2} />
                <Line type="monotone" dataKey="actions" stroke="#f59e0b" name="Actions" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Local Search Rankings */}
        <Card>
          <CardHeader>
            <CardTitle>Local Search Rankings</CardTitle>
            <CardDescription>Top local keywords performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {localRankings.map((keyword) => (
                <div key={keyword.keyword} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{keyword.keyword}</p>
                    <p className="text-xs text-muted-foreground">
                      {keyword.volume.toLocaleString()} searches/mo
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-lg font-bold">#{keyword.position}</div>
                    </div>
                    <div className="w-12">
                      {getPositionChange(keyword.change)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Citation Health */}
        <Card>
          <CardHeader>
            <CardTitle>Citation Health</CardTitle>
            <CardDescription>Business listing consistency</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <div className="text-3xl font-bold">{localMetrics.citationScore}%</div>
              <Progress value={localMetrics.citationScore} className="h-2 mt-2" />
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Citations</span>
                <span className="font-medium">{citationHealth.totalCitations}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Consistent</span>
                <span className="font-medium text-green-500">{citationHealth.consistent}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Inconsistent</span>
                <span className="font-medium text-yellow-500">{citationHealth.inconsistent}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Missing NAP</span>
                <span className="font-medium text-red-500">{citationHealth.missing}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Review Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Review Distribution</CardTitle>
            <CardDescription>Rating breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reviewAnalysis.distribution.map((rating) => (
                <div key={rating.stars} className="flex items-center gap-2">
                  <div className="flex items-center gap-1 w-20">
                    <span className="text-sm">{rating.stars}</span>
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                  </div>
                  <div className="flex-1">
                    <Progress value={rating.percentage} className="h-2" />
                  </div>
                  <span className="text-sm w-12 text-right">{rating.count}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Response Rate</span>
                <span className="font-medium">{localMetrics.responseRate}%</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">Avg Response</span>
                <span className="font-medium">{localMetrics.avgResponseTime}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Competitor Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Competitor Analysis</CardTitle>
            <CardDescription>Local market comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {competitors.map((comp) => (
                <div 
                  key={comp.name} 
                  className={`p-2 rounded ${comp.isYou ? 'bg-primary/10 border border-primary' : 'border'}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{comp.name}</span>
                    {comp.isYou && <Badge>You</Badge>}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Visibility</span>
                      <div className="font-medium">{comp.visibility}%</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Reviews</span>
                      <div className="font-medium">{comp.reviews}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Rating</span>
                      <div className="font-medium">{comp.rating}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Local Pack Optimization */}
      <Card>
        <CardHeader>
          <CardTitle>Local Pack Optimization</CardTitle>
          <CardDescription>Google Local Pack feature optimization status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            {localPackFeatures.map((feature) => (
              <div key={feature.feature} className="p-3 border rounded-lg">
                <div className="flex items-start gap-2">
                  {getStatusIcon(feature.status)}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{feature.feature}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {feature.status.replace('-', ' ')}
                      </Badge>
                      <span className={`text-xs ${
                        feature.impact === 'high' ? 'text-red-500' :
                        feature.impact === 'medium' ? 'text-yellow-500' :
                        'text-blue-500'
                      }`}>
                        {feature.impact} impact
                      </span>
                    </div>
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