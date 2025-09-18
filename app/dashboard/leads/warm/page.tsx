"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target, Search, Calendar, Mail, MessageSquare, User, TrendingUp, Clock } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface WarmLead {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  score: number;
  reason: string;
  lastContact: string;
  nextAction: string;
  timeAgo: string;
  source: string;
  interest: string;
  followUpCount: number;
  engagementLevel: 'high' | 'medium' | 'low';
  notes?: string;
}

export default function WarmLeadsPage() {
  const [leads, setLeads] = useState<WarmLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterInterest, setFilterInterest] = useState("all");
  const [filterEngagement, setFilterEngagement] = useState("all");
  const [sortBy, setSortBy] = useState("score");

  useEffect(() => {
    // Simulate loading warm leads
    const mockLeads: WarmLead[] = [
      {
        id: 1,
        firstName: "James",
        lastName: "Wilson",
        phone: "(555) 0201",
        email: "james.w@email.com",
        score: 7,
        reason: "Downloaded Medicare guide, opened 3 emails",
        lastContact: "Email opened yesterday",
        nextAction: "Send comparison chart",
        timeAgo: "3 hours",
        source: "Website",
        interest: "Medicare Advantage",
        followUpCount: 2,
        engagementLevel: 'high',
        notes: "Interested in PPO plans with dental"
      },
      {
        id: 2,
        firstName: "Susan",
        lastName: "Miller",
        phone: "(555) 0202",
        email: "susan.m@email.com",
        score: 6,
        reason: "Attended webinar, asked questions",
        lastContact: "Webinar attendance",
        nextAction: "Personal follow-up",
        timeAgo: "5 hours",
        source: "Webinar",
        interest: "Medicare Supplement",
        followUpCount: 1,
        engagementLevel: 'medium'
      },
      {
        id: 3,
        firstName: "David",
        lastName: "Taylor",
        phone: "(555) 0203",
        email: "david.t@email.com",
        score: 7,
        reason: "Requested callback, comparing plans",
        lastContact: "Form submission",
        nextAction: "Schedule call",
        timeAgo: "1 hour",
        source: "Landing Page",
        interest: "ACA Plans",
        followUpCount: 0,
        engagementLevel: 'high',
        notes: "Self-employed, needs family coverage"
      },
      {
        id: 4,
        firstName: "Nancy",
        lastName: "Thomas",
        phone: "(555) 0204",
        email: "nancy.t@email.com",
        score: 5,
        reason: "Clicked multiple plan links",
        lastContact: "Website activity",
        nextAction: "Send targeted info",
        timeAgo: "8 hours",
        source: "Email Campaign",
        interest: "Part D",
        followUpCount: 3,
        engagementLevel: 'low'
      },
      {
        id: 5,
        firstName: "Richard",
        lastName: "Jackson",
        phone: "(555) 0205",
        email: "richard.j@email.com",
        score: 8,
        reason: "Scheduled appointment, then postponed",
        lastContact: "Rescheduled call",
        nextAction: "Confirm new time",
        timeAgo: "30 min",
        source: "Referral",
        interest: "Medicare Advantage",
        followUpCount: 2,
        engagementLevel: 'high',
        notes: "Friend of current client Patricia Brown"
      },
      {
        id: 6,
        firstName: "Karen",
        lastName: "White",
        phone: "(555) 0206",
        email: "karen.w@email.com",
        score: 6,
        reason: "Multiple quote requests",
        lastContact: "Quote sent",
        nextAction: "Follow up on quote",
        timeAgo: "12 hours",
        source: "Website",
        interest: "Dental/Vision",
        followUpCount: 1,
        engagementLevel: 'medium'
      },
      {
        id: 7,
        firstName: "Joseph",
        lastName: "Martin",
        phone: "(555) 0207",
        email: "joseph.m@email.com",
        score: 7,
        reason: "Chat conversation, needs time to decide",
        lastContact: "WhatsApp chat",
        nextAction: "Check in tomorrow",
        timeAgo: "4 hours",
        source: "Live Chat",
        interest: "Medicare Supplement",
        followUpCount: 1,
        engagementLevel: 'medium',
        notes: "Comparing with employer retiree benefits"
      },
      {
        id: 8,
        firstName: "Betty",
        lastName: "Garcia",
        phone: "(555) 0208",
        email: "betty.g@email.com",
        score: 5,
        reason: "Newsletter subscriber, engaged reader",
        lastContact: "Clicked article",
        nextAction: "Send personalized content",
        timeAgo: "1 day",
        source: "Newsletter",
        interest: "Medicare Advantage",
        followUpCount: 4,
        engagementLevel: 'low'
      },
      {
        id: 9,
        firstName: "Christopher",
        lastName: "Lee",
        phone: "(555) 0209",
        email: "chris.l@email.com",
        score: 8,
        reason: "Spouse enrolling, considering joint plan",
        lastContact: "Phone inquiry",
        nextAction: "Family plan options",
        timeAgo: "2 hours",
        source: "Phone",
        interest: "ACA Plans",
        followUpCount: 1,
        engagementLevel: 'high'
      },
      {
        id: 10,
        firstName: "Dorothy",
        lastName: "Harris",
        phone: "(555) 0210",
        email: "dorothy.h@email.com",
        score: 6,
        reason: "Turning 64, researching early",
        lastContact: "Info packet sent",
        nextAction: "Educational follow-up",
        timeAgo: "6 hours",
        source: "SEO/Search",
        interest: "Medicare Basics",
        followUpCount: 0,
        engagementLevel: 'medium'
      }
    ];

    setTimeout(() => {
      setLeads(mockLeads);
      setLoading(false);
    }, 1000);
  }, []);

  const handleAction = (lead: WarmLead, action: string) => {
    toast.success(
      <div>
        <p className="font-semibold">{action}</p>
        <p className="text-sm">{lead.firstName} {lead.lastName} - Follow-up #{lead.followUpCount + 1}</p>
      </div>
    );
    
    // Update follow-up count
    setLeads(prev => prev.map(l => 
      l.id === lead.id 
        ? { ...l, followUpCount: l.followUpCount + 1 }
        : l
    ));
  };

  // Filter and sort leads
  let filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm);
    const matchesInterest = filterInterest === "all" || lead.interest.includes(filterInterest);
    const matchesEngagement = filterEngagement === "all" || lead.engagementLevel === filterEngagement;
    
    return matchesSearch && matchesInterest && matchesEngagement;
  });

  // Sort leads
  filteredLeads = [...filteredLeads].sort((a, b) => {
    switch(sortBy) {
      case 'score':
        return b.score - a.score;
      case 'engagement':
        const engagementOrder = { high: 3, medium: 2, low: 1 };
        return engagementOrder[b.engagementLevel] - engagementOrder[a.engagementLevel];
      case 'recent':
        return 0; // Already sorted by time in mock data
      case 'followups':
        return a.followUpCount - b.followUpCount; // Less follow-ups first
      default:
        return 0;
    }
  });

  const stats = {
    total: leads.length,
    highEngagement: leads.filter(l => l.engagementLevel === 'high').length,
    needsFollowUp: leads.filter(l => l.followUpCount === 0).length,
    avgScore: leads.length > 0 
      ? (leads.reduce((sum, l) => sum + l.score, 0) / leads.length).toFixed(1)
      : '0'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Warm Leads 🟡</h1>
        <p className="text-muted-foreground mt-2">
          Interested prospects showing engagement - nurture to convert
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-orange-600/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Warm Leads</CardTitle>
              <Target className="h-4 w-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Showing interest</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">High Engagement</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.highEngagement}</div>
            <p className="text-xs text-muted-foreground mt-1">Active & responsive</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Needs First Contact</CardTitle>
              <User className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats.needsFollowUp}</div>
            <p className="text-xs text-muted-foreground mt-1">No follow-up yet</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgScore}/10</div>
            <p className="text-xs text-muted-foreground mt-1">Interest level</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Sort</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterInterest} onValueChange={setFilterInterest}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by interest" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Interests</SelectItem>
                <SelectItem value="Medicare">Medicare Plans</SelectItem>
                <SelectItem value="ACA">ACA Plans</SelectItem>
                <SelectItem value="Part D">Part D</SelectItem>
                <SelectItem value="Dental">Dental/Vision</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterEngagement} onValueChange={setFilterEngagement}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Engagement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">Highest Score</SelectItem>
                <SelectItem value="engagement">Engagement Level</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="followups">Needs Follow-up</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Warm Lead Pipeline</CardTitle>
              <CardDescription>
                {filteredLeads.length} interested prospects requiring nurturing
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <>
                <Skeleton className="h-36 w-full" />
                <Skeleton className="h-36 w-full" />
                <Skeleton className="h-36 w-full" />
              </>
            ) : filteredLeads.length > 0 ? (
              filteredLeads.map(lead => (
                <div
                  key={lead.id}
                  className="p-4 rounded-lg border border-orange-600/30 bg-orange-950/10"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-lg">
                          {lead.firstName} {lead.lastName}
                        </span>
                        <Badge className="bg-orange-600">Score: {lead.score}/10</Badge>
                        <Badge variant="outline">{lead.interest}</Badge>
                        <Badge 
                          variant="outline" 
                          className={`
                            ${lead.engagementLevel === 'high' ? 'text-green-500 border-green-500/50' : ''}
                            ${lead.engagementLevel === 'medium' ? 'text-yellow-500 border-yellow-500/50' : ''}
                            ${lead.engagementLevel === 'low' ? 'text-gray-500 border-gray-500/50' : ''}
                          `}
                        >
                          {lead.engagementLevel} engagement
                        </Badge>
                        {lead.followUpCount === 0 && (
                          <Badge className="bg-blue-600">New</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {lead.timeAgo} ago • Source: {lead.source} • Follow-ups: {lead.followUpCount}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-orange-950/30 rounded p-3 mb-3">
                    <p className="text-sm font-medium text-orange-400 mb-1">WHY WARM:</p>
                    <p className="text-sm">{lead.reason}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-muted-foreground">Phone:</span> {lead.phone}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email:</span> {lead.email}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Contact:</span> {lead.lastContact}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Next Action:</span> 
                      <span className="text-yellow-400 font-medium ml-1">{lead.nextAction}</span>
                    </div>
                  </div>
                  
                  {lead.notes && (
                    <div className="bg-background/50 rounded p-2 mb-3">
                      <p className="text-sm">
                        <span className="text-muted-foreground">Notes:</span> {lead.notes}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAction(lead, 'Scheduling appointment with ' + lead.firstName)}
                    >
                      <Calendar className="h-3 w-3 mr-1" />
                      Schedule
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAction(lead, 'Sending info to ' + lead.firstName)}
                    >
                      <Mail className="h-3 w-3 mr-1" />
                      Send Info
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAction(lead, 'Adding ' + lead.firstName + ' to nurture campaign')}
                    >
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Add to Campaign
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No warm leads found matching your filters
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}