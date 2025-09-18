"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, Eye, Clock, Share2, MessageSquare, Heart,
  TrendingUp, TrendingDown, ArrowUp, ArrowDown, BarChart3,
  Star, Users, Target, Award, BookOpen
} from "lucide-react";
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import { format, subDays } from "date-fns";

export default function ContentPerformancePage() {
  const [timeRange, setTimeRange] = useState("30d");
  const [contentType, setContentType] = useState("all");

  // Content Overview Metrics - requires content analytics integration
  const [contentMetrics] = useState({
    totalArticles: 0,
    totalPageviews: 0,
    avgReadTime: "0m 0s",
    avgShareRate: 0,
    engagementScore: 0,
    returnReaderRate: 0,
    contentVelocity: 0,
    topicDiversity: 0
  });

  // Top Performing Content - requires content management system integration
  const [topContent] = useState([]);

  // Content Type Performance - requires content analytics
  const [contentTypePerformance] = useState([]);

  // Topic Performance Radar - requires content categorization
  const topicPerformance = [];

  // Content Lifecycle - requires content analytics tracking
  const contentLifecycle = [];

  // Engagement Funnel - requires analytics integration
  const [engagementFunnel] = useState([]);

  // Author Performance - requires content management system
  const [authorPerformance] = useState([]);

  // Content Calendar Heatmap - requires publishing analytics
  const [publishingPattern] = useState([]);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Content Performance</h1>
        <p className="text-muted-foreground mt-2">
          Analyze content effectiveness and optimize your content strategy
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
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
        <div className="flex items-center gap-2 ml-4">
          <Button 
            variant={contentType === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setContentType("all")}
          >
            All Content
          </Button>
          <Button 
            variant={contentType === "articles" ? "default" : "outline"}
            size="sm"
            onClick={() => setContentType("articles")}
          >
            Articles
          </Button>
          <Button 
            variant={contentType === "guides" ? "default" : "outline"}
            size="sm"
            onClick={() => setContentType("guides")}
          >
            Guides
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Total Pageviews</CardTitle>
              <Eye className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(contentMetrics.totalPageviews / 1000).toFixed(1)}K</div>
            <div className="flex items-center text-xs text-green-500 mt-1">
              <ArrowUp className="h-3 w-3" />
              <span>18% from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Avg Read Time</CardTitle>
              <Clock className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contentMetrics.avgReadTime}</div>
            <div className="flex items-center text-xs text-green-500 mt-1">
              <ArrowUp className="h-3 w-3" />
              <span>23s improvement</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Engagement Score</CardTitle>
              <Heart className="h-4 w-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contentMetrics.engagementScore}/100</div>
            <Progress value={contentMetrics.engagementScore} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Share Rate</CardTitle>
              <Share2 className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contentMetrics.avgShareRate}%</div>
            <div className="flex items-center text-xs text-green-500 mt-1">
              <ArrowUp className="h-3 w-3" />
              <span>0.5% increase</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Top Performing Content</CardTitle>
              <CardDescription>Your best performing articles this period</CardDescription>
            </div>
            <Button variant="outline" size="sm">View All</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topContent.map((content, index) => (
              <div key={content.title} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="text-2xl font-bold text-muted-foreground">#{index + 1}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{content.title}</p>
                      <Badge variant="outline" className="text-xs">{content.type}</Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {content.views.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {content.avgTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="h-3 w-3" />
                        {content.shares}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {content.comments}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getScoreColor(content.score)}`}>
                    {content.score}
                  </div>
                  <div className="text-xs text-muted-foreground">Score</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* Content Type Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Performance by Content Type</CardTitle>
            <CardDescription>How different content formats perform</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={contentTypePerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avgViews" fill="#3b82f6" />
                <Bar dataKey="engagementRate" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 bg-blue-500 rounded" />
                <span>Avg Views</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 bg-green-500 rounded" />
                <span>Engagement Rate</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Topic Performance Radar */}
        <Card>
          <CardHeader>
            <CardTitle>Topic Performance Analysis</CardTitle>
            <CardDescription>Content performance by topic category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={topicPerformance}>
                <PolarGrid />
                <PolarAngleAxis dataKey="topic" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Views" dataKey="views" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                <Radar name="Engagement" dataKey="engagement" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                <Radar name="Shares" dataKey="shares" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Content Lifecycle */}
      <Card>
        <CardHeader>
          <CardTitle>Content Lifecycle Analysis</CardTitle>
          <CardDescription>How content performs over time after publication</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={contentLifecycle}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="newContent" stackId="1" stroke="#3b82f6" fill="#3b82f6" />
              <Area type="monotone" dataKey="evergreen" stackId="1" stroke="#10b981" fill="#10b981" />
              <Area type="monotone" dataKey="seasonal" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-blue-500 rounded" />
              <span>New Content (0-7 days)</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-green-500 rounded" />
              <span>Evergreen Content</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-yellow-500 rounded" />
              <span>Seasonal Content</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* Engagement Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Content Engagement Funnel</CardTitle>
            <CardDescription>User journey through content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {engagementFunnel.map((stage, index) => (
                <div key={stage.stage} className="relative">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{stage.stage}</span>
                    <span className="text-sm text-muted-foreground">
                      {stage.value.toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-1 bg-secondary rounded-full h-6 relative overflow-hidden">
                    <div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                      style={{ width: `${(stage.value / engagementFunnel[0].value) * 100}%` }}
                    />
                  </div>
                  {index < engagementFunnel.length - 1 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {((stage.value / engagementFunnel[index + 1].value - 1) * 100).toFixed(1)}% drop-off
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Author Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Author Performance</CardTitle>
            <CardDescription>Content creators leaderboard</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {authorPerformance.map((author, index) => (
                <div key={author.author} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-sm font-bold">
                        {author.author.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{author.author}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{author.articles} articles</span>
                        <span>{author.avgViews.toLocaleString()} avg views</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`text-xl font-bold ${getScoreColor(author.avgScore)}`}>
                      {author.avgScore}
                    </div>
                    {index === 0 && <Award className="h-5 w-5 text-yellow-500" />}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}