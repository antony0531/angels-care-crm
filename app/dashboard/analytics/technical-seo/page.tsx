"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Search, Shield, Link2, FileText, Globe, Clock,
  CheckCircle2, XCircle, AlertTriangle, Info,
  ArrowUp, ArrowDown, ExternalLink, Code
} from "lucide-react";
import { 
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from "recharts";

export default function TechnicalSEOPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  // SEO Health Score
  const [healthScore] = useState({
    overall: 87,
    crawlability: 92,
    indexability: 85,
    siteStructure: 88,
    security: 95,
    mobile: 83,
    speed: 79
  });

  // Issues Summary
  const [issues] = useState({
    critical: 2,
    warnings: 8,
    notices: 15,
    passed: 142
  });

  // Crawl Statistics
  const [crawlStats] = useState({
    pagesIndexed: 487,
    pagesBlocked: 12,
    orphanPages: 5,
    brokenLinks: 3,
    redirectChains: 2,
    duplicateContent: 7
  });

  // Site Structure
  const [siteStructure] = useState([
    { level: "Level 0 (Homepage)", pages: 1, avgLoadTime: 1.2 },
    { level: "Level 1", pages: 12, avgLoadTime: 1.5 },
    { level: "Level 2", pages: 68, avgLoadTime: 1.8 },
    { level: "Level 3", pages: 234, avgLoadTime: 2.1 },
    { level: "Level 4+", pages: 172, avgLoadTime: 2.4 }
  ]);

  // Meta Data Analysis
  const [metaData] = useState([
    { type: "Title Tags", optimized: 423, missing: 12, duplicate: 8, tooLong: 15, tooShort: 5 },
    { type: "Meta Descriptions", optimized: 389, missing: 45, duplicate: 23, tooLong: 12, tooShort: 18 },
    { type: "H1 Tags", optimized: 456, missing: 7, duplicate: 15, multiple: 9 },
    { type: "Alt Text", optimized: 892, missing: 127 }
  ]);

  // Security & HTTPS
  const [securityChecks] = useState([
    { check: "HTTPS Enabled", status: "pass", description: "All pages served over HTTPS" },
    { check: "SSL Certificate", status: "pass", description: "Valid SSL certificate installed" },
    { check: "Mixed Content", status: "warning", description: "3 pages contain mixed content" },
    { check: "Security Headers", status: "pass", description: "All security headers configured" },
    { check: "HSTS", status: "pass", description: "HSTS header properly configured" }
  ]);

  // Mobile Usability
  const [mobileIssues] = useState([
    { issue: "Text too small", pages: 5, severity: "high" },
    { issue: "Clickable elements too close", pages: 12, severity: "medium" },
    { issue: "Content wider than screen", pages: 3, severity: "high" },
    { issue: "Viewport not set", pages: 0, severity: "critical" }
  ]);

  // XML Sitemap Status
  const [sitemapData] = useState({
    status: "valid",
    urls: 487,
    lastModified: "2024-01-15",
    errors: 0,
    warnings: 2
  });

  // Robots.txt Status
  const [robotsData] = useState({
    status: "valid",
    rules: 12,
    disallowedPaths: 8,
    crawlDelay: 0,
    sitemapReference: true
  });

  // Structured Data
  const [structuredData] = useState([
    { type: "Organization", count: 1, status: "valid" },
    { type: "Article", count: 45, status: "valid" },
    { type: "Product", count: 128, status: "warning" },
    { type: "BreadcrumbList", count: 487, status: "valid" },
    { type: "FAQPage", count: 8, status: "valid" }
  ]);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pass':
      case 'valid':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'fail':
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'pass':
      case 'valid':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'fail':
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const issuesPieData = [
    { name: 'Passed', value: issues.passed, color: '#10b981' },
    { name: 'Notices', value: issues.notices, color: '#3b82f6' },
    { name: 'Warnings', value: issues.warnings, color: '#f59e0b' },
    { name: 'Critical', value: issues.critical, color: '#ef4444' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Technical SEO</h1>
        <p className="text-muted-foreground mt-2">
          Monitor and optimize your site's technical foundation for search engines
        </p>
      </div>

      {/* SEO Health Score */}
      <Card>
        <CardHeader>
          <CardTitle>SEO Health Score</CardTitle>
          <CardDescription>Overall technical SEO performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500">{healthScore.overall}</div>
              <p className="text-sm text-muted-foreground mt-1">Overall</p>
              <Progress value={healthScore.overall} className="h-2 mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{healthScore.crawlability}</div>
              <p className="text-sm text-muted-foreground mt-1">Crawlability</p>
              <Progress value={healthScore.crawlability} className="h-2 mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{healthScore.indexability}</div>
              <p className="text-sm text-muted-foreground mt-1">Indexability</p>
              <Progress value={healthScore.indexability} className="h-2 mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{healthScore.siteStructure}</div>
              <p className="text-sm text-muted-foreground mt-1">Structure</p>
              <Progress value={healthScore.siteStructure} className="h-2 mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{healthScore.security}</div>
              <p className="text-sm text-muted-foreground mt-1">Security</p>
              <Progress value={healthScore.security} className="h-2 mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{healthScore.mobile}</div>
              <p className="text-sm text-muted-foreground mt-1">Mobile</p>
              <Progress value={healthScore.mobile} className="h-2 mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{healthScore.speed}</div>
              <p className="text-sm text-muted-foreground mt-1">Speed</p>
              <Progress value={healthScore.speed} className="h-2 mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issues Overview */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Issues Summary</CardTitle>
            <CardDescription>Technical SEO issues breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={issuesPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {issuesPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="flex items-center justify-between p-2 bg-red-500/10 rounded">
                <span className="text-sm">Critical</span>
                <span className="font-bold text-red-500">{issues.critical}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-yellow-500/10 rounded">
                <span className="text-sm">Warnings</span>
                <span className="font-bold text-yellow-500">{issues.warnings}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-blue-500/10 rounded">
                <span className="text-sm">Notices</span>
                <span className="font-bold text-blue-500">{issues.notices}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-green-500/10 rounded">
                <span className="text-sm">Passed</span>
                <span className="font-bold text-green-500">{issues.passed}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Crawl Statistics</CardTitle>
            <CardDescription>Search engine crawling metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Pages Indexed</span>
                </div>
                <span className="font-bold">{crawlStats.pagesIndexed}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Pages Blocked</span>
                </div>
                <span className="font-bold text-red-500">{crawlStats.pagesBlocked}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Orphan Pages</span>
                </div>
                <span className="font-bold text-yellow-500">{crawlStats.orphanPages}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Broken Links</span>
                </div>
                <span className="font-bold text-red-500">{crawlStats.brokenLinks}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Redirect Chains</span>
                </div>
                <span className="font-bold text-yellow-500">{crawlStats.redirectChains}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Duplicate Content</span>
                </div>
                <span className="font-bold text-yellow-500">{crawlStats.duplicateContent}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Site Structure */}
      <Card>
        <CardHeader>
          <CardTitle>Site Structure Analysis</CardTitle>
          <CardDescription>Page distribution across site depth levels</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={siteStructure}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="level" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="pages" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Recommendation</p>
                <p className="text-muted-foreground">
                  {siteStructure[4].pages} pages are more than 3 clicks from homepage. Consider improving internal linking.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meta Data Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Meta Data Analysis</CardTitle>
          <CardDescription>SEO meta tags optimization status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metaData.map((meta) => (
              <div key={meta.type} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{meta.type}</span>
                  <Badge variant="outline">
                    {Math.round((meta.optimized / (meta.optimized + meta.missing + (meta.duplicate || 0) + (meta.tooLong || 0) + (meta.tooShort || 0) + (meta.multiple || 0))) * 100)}% optimized
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 p-2 bg-green-500/10 rounded text-center">
                    <div className="text-lg font-bold text-green-500">{meta.optimized}</div>
                    <div className="text-xs text-muted-foreground">Optimized</div>
                  </div>
                  {meta.missing > 0 && (
                    <div className="flex-1 p-2 bg-red-500/10 rounded text-center">
                      <div className="text-lg font-bold text-red-500">{meta.missing}</div>
                      <div className="text-xs text-muted-foreground">Missing</div>
                    </div>
                  )}
                  {meta.duplicate !== undefined && meta.duplicate > 0 && (
                    <div className="flex-1 p-2 bg-yellow-500/10 rounded text-center">
                      <div className="text-lg font-bold text-yellow-500">{meta.duplicate}</div>
                      <div className="text-xs text-muted-foreground">Duplicate</div>
                    </div>
                  )}
                  {meta.tooLong !== undefined && meta.tooLong > 0 && (
                    <div className="flex-1 p-2 bg-yellow-500/10 rounded text-center">
                      <div className="text-lg font-bold text-yellow-500">{meta.tooLong}</div>
                      <div className="text-xs text-muted-foreground">Too Long</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* Security & HTTPS */}
        <Card>
          <CardHeader>
            <CardTitle>Security & HTTPS</CardTitle>
            <CardDescription>Site security configuration status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {securityChecks.map((check) => (
                <div key={check.check} className="flex items-start gap-3">
                  {getStatusIcon(check.status)}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{check.check}</p>
                    <p className="text-xs text-muted-foreground">{check.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mobile Usability */}
        <Card>
          <CardHeader>
            <CardTitle>Mobile Usability</CardTitle>
            <CardDescription>Mobile-specific issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mobileIssues.map((issue) => (
                <div key={issue.issue} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${
                      issue.severity === 'critical' ? 'bg-red-500' :
                      issue.severity === 'high' ? 'bg-orange-500' :
                      'bg-yellow-500'
                    }`} />
                    <span className="text-sm">{issue.issue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{issue.pages}</span>
                    <span className="text-xs text-muted-foreground">pages</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Technical Configuration */}
      <div className="grid grid-cols-3 gap-6">
        {/* XML Sitemap */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">XML Sitemap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-3">
              {getStatusIcon(sitemapData.status)}
              <Badge className="bg-green-500/10 text-green-500">Valid</Badge>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">URLs</span>
                <span className="font-medium">{sitemapData.urls}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Modified</span>
                <span className="font-medium">{sitemapData.lastModified}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Warnings</span>
                <span className="font-medium text-yellow-500">{sitemapData.warnings}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Robots.txt */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Robots.txt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-3">
              {getStatusIcon(robotsData.status)}
              <Badge className="bg-green-500/10 text-green-500">Valid</Badge>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rules</span>
                <span className="font-medium">{robotsData.rules}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Disallowed</span>
                <span className="font-medium">{robotsData.disallowedPaths}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sitemap Ref</span>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Structured Data */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Structured Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {structuredData.slice(0, 3).map((data) => (
                <div key={data.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(data.status)}
                    <span className="text-sm">{data.type}</span>
                  </div>
                  <span className="text-sm font-medium">{data.count}</span>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full mt-2">
                View All Schema
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}