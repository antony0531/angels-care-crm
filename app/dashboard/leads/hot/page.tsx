"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Flame, Search, Phone, Mail, Calendar, TrendingUp, Clock, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface HotLead {
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
  estimatedValue: string;
  product: string;
  agent?: string;
  notes?: string;
}

export default function HotLeadsPage() {
  const [leads, setLeads] = useState<HotLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProduct, setFilterProduct] = useState("all");
  const [sortBy, setSortBy] = useState("score");

  useEffect(() => {
    // Simulate loading hot leads
    const mockLeads: HotLead[] = [
      {
        id: 1,
        firstName: "Patricia",
        lastName: "Brown",
        phone: "(555) 0123",
        email: "patricia.b@email.com",
        score: 9,
        reason: "Requested quote, ready to enroll today",
        lastContact: "Called yesterday",
        nextAction: "Close deal",
        timeAgo: "10 min",
        estimatedValue: "$450/mo",
        product: "Medicare Advantage",
        agent: "John Smith",
        notes: "Prefers morning calls, has AARP currently"
      },
      {
        id: 2,
        firstName: "Michael",
        lastName: "Johnson",
        phone: "(555) 0124",
        email: "michael.j@email.com",
        score: 10,
        reason: "Wants to switch plans immediately",
        lastContact: "In conversation now",
        nextAction: "Send enrollment link",
        timeAgo: "Just now",
        estimatedValue: "$380/mo",
        product: "Medicare Supplement"
      },
      {
        id: 3,
        firstName: "Jennifer",
        lastName: "Davis",
        phone: "(555) 0125",
        email: "jennifer.d@email.com",
        score: 8,
        reason: "Comparing final options, deciding today",
        lastContact: "Emailed quote",
        nextAction: "Follow-up call",
        timeAgo: "45 min",
        estimatedValue: "$320/mo",
        product: "ACA Plans",
        notes: "Family of 4, needs dental coverage"
      },
      {
        id: 4,
        firstName: "William",
        lastName: "Martinez",
        phone: "(555) 0126",
        email: "william.m@email.com",
        score: 9,
        reason: "Turning 65 next month, needs coverage",
        lastContact: "Scheduled callback",
        nextAction: "Present options",
        timeAgo: "1 hour",
        estimatedValue: "$410/mo",
        product: "Medicare Advantage"
      },
      {
        id: 5,
        firstName: "Linda",
        lastName: "Garcia",
        phone: "(555) 0127",
        email: "linda.g@email.com",
        score: 8,
        reason: "Doctor recommended our plan",
        lastContact: "Sent brochure",
        nextAction: "Discuss benefits",
        timeAgo: "2 hours",
        estimatedValue: "$290/mo",
        product: "Medicare Part D"
      },
      {
        id: 6,
        firstName: "Robert",
        lastName: "Wilson",
        phone: "(555) 0128",
        email: "robert.w@email.com",
        score: 10,
        reason: "Credit card ready, wants to enroll",
        lastContact: "On hold",
        nextAction: "Complete enrollment",
        timeAgo: "5 min",
        estimatedValue: "$520/mo",
        product: "Medicare Advantage",
        agent: "Jane Doe"
      },
      {
        id: 7,
        firstName: "Barbara",
        lastName: "Anderson",
        phone: "(555) 0129",
        email: "barbara.a@email.com",
        score: 8,
        reason: "Spouse already enrolled, wants same plan",
        lastContact: "Text conversation",
        nextAction: "Send application",
        timeAgo: "30 min",
        estimatedValue: "$340/mo",
        product: "Medicare Supplement"
      }
    ];

    setTimeout(() => {
      setLeads(mockLeads);
      setLoading(false);
    }, 1000);
  }, []);

  const handleAction = (lead: HotLead, action: string) => {
    toast.success(
      <div>
        <p className="font-semibold">{action}</p>
        <p className="text-sm">{lead.firstName} {lead.lastName} - {lead.product}</p>
      </div>
    );
  };

  // Filter and sort leads
  let filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm);
    const matchesProduct = filterProduct === "all" || lead.product.includes(filterProduct);
    
    return matchesSearch && matchesProduct;
  });

  // Sort leads
  filteredLeads = [...filteredLeads].sort((a, b) => {
    switch(sortBy) {
      case 'score':
        return b.score - a.score;
      case 'value':
        const aValue = parseInt(a.estimatedValue.replace(/[^0-9]/g, ''));
        const bValue = parseInt(b.estimatedValue.replace(/[^0-9]/g, ''));
        return bValue - aValue;
      case 'recent':
        return 0; // Already sorted by time in mock data
      default:
        return 0;
    }
  });

  const totalValue = leads.reduce((sum, lead) => {
    const value = parseInt(lead.estimatedValue.replace(/[^0-9]/g, ''));
    return sum + value;
  }, 0);

  const avgScore = leads.length > 0 
    ? (leads.reduce((sum, lead) => sum + lead.score, 0) / leads.length).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Hot Leads 🔥</h1>
        <p className="text-muted-foreground mt-2">
          High-priority leads ready to convert - immediate action required
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-red-600/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Hot Leads</CardTitle>
              <Flame className="h-4 w-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{leads.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Ready to convert</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgScore}/10</div>
            <p className="text-xs text-muted-foreground mt-1">Conversion likelihood</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Monthly Value</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Potential revenue</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Urgent Action</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {leads.filter(l => l.timeAgo.includes('min') || l.timeAgo === 'Just now').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Within last hour</p>
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
            
            <Select value={filterProduct} onValueChange={setFilterProduct}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="Medicare Advantage">Medicare Advantage</SelectItem>
                <SelectItem value="Medicare Supplement">Medicare Supplement</SelectItem>
                <SelectItem value="Medicare Part D">Part D</SelectItem>
                <SelectItem value="ACA">ACA Plans</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">Highest Score</SelectItem>
                <SelectItem value="value">Highest Value</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
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
              <CardTitle>Hot Lead Pipeline</CardTitle>
              <CardDescription>
                {filteredLeads.length} high-priority leads requiring immediate attention
              </CardDescription>
            </div>
            <Badge className="bg-red-600">
              ${filteredLeads.reduce((sum, lead) => {
                const value = parseInt(lead.estimatedValue.replace(/[^0-9]/g, ''));
                return sum + value;
              }, 0).toLocaleString()}/mo potential
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <>
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
              </>
            ) : filteredLeads.length > 0 ? (
              filteredLeads.map(lead => (
                <div
                  key={lead.id}
                  className="p-4 rounded-lg border border-red-600/30 bg-red-950/10"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-lg">
                          {lead.firstName} {lead.lastName}
                        </span>
                        <Badge className="bg-red-600">Score: {lead.score}/10</Badge>
                        <Badge variant="outline">{lead.product}</Badge>
                        <Badge variant="outline" className="text-green-500 border-green-500/50">
                          {lead.estimatedValue}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {lead.timeAgo} ago {lead.agent && `• Assigned to: ${lead.agent}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-red-950/30 rounded p-3 mb-3">
                    <p className="text-sm font-medium text-red-400 mb-1">WHY HOT:</p>
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
                      <span className="text-orange-400 font-medium ml-1">{lead.nextAction}</span>
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
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => handleAction(lead, 'Calling ' + lead.firstName)}
                    >
                      <Phone className="h-3 w-3 mr-1" />
                      Call Now
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
                      onClick={() => handleAction(lead, 'Scheduling appointment with ' + lead.firstName)}
                    >
                      <Calendar className="h-3 w-3 mr-1" />
                      Schedule
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No hot leads found matching your filters
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}