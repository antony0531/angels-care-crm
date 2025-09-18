"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Snowflake, Search, Phone, Mail, MessageSquare, Clock, UserX, BarChart3, Upload } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";

interface ColdLead {
  id: number;
  firstName: string;
  lastName?: string;
  phone: string;
  email: string;
  source: string;
  timeAgo: string;
  attempts: number;
  lastAttempt?: string;
  status: 'new' | 'contacted' | 'no_response' | 'bad_contact';
  preferredTime?: string;
  notes?: string;
}

export default function ColdLeadsPage() {
  const [leads, setLeads] = useState<ColdLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSource, setFilterSource] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);

  useEffect(() => {
    // Simulate loading cold leads
    const mockLeads: ColdLead[] = [
      {
        id: 1,
        firstName: "John",
        phone: "(555) 0301",
        email: "john@email.com",
        source: "Website Form",
        timeAgo: "10 min",
        attempts: 0,
        status: 'new'
      },
      {
        id: 2,
        firstName: "Mary",
        lastName: "Johnson",
        phone: "(555) 0302",
        email: "mary.j@email.com",
        source: "Landing Page",
        timeAgo: "25 min",
        attempts: 1,
        lastAttempt: "Email sent 2 hours ago",
        status: 'contacted',
        notes: "Preferred contact after 5pm"
      },
      {
        id: 3,
        firstName: "Robert",
        phone: "(555) 0303",
        email: "robert@email.com",
        source: "Facebook Ad",
        timeAgo: "45 min",
        attempts: 0,
        status: 'new'
      },
      {
        id: 4,
        firstName: "Linda",
        lastName: "Davis",
        phone: "(555) 0304",
        email: "linda.d@email.com",
        source: "Google Ads",
        timeAgo: "1 hour",
        attempts: 2,
        lastAttempt: "Called yesterday, no answer",
        status: 'no_response'
      },
      {
        id: 5,
        firstName: "Michael",
        phone: "(555) 0305",
        email: "michael@email.com",
        source: "Website Form",
        timeAgo: "2 hours",
        attempts: 0,
        status: 'new'
      },
      {
        id: 6,
        firstName: "Patricia",
        lastName: "Wilson",
        phone: "(555) 0306",
        email: "patricia.w@email.com",
        source: "Referral",
        timeAgo: "3 hours",
        attempts: 1,
        lastAttempt: "Text sent this morning",
        status: 'contacted'
      },
      {
        id: 7,
        firstName: "William",
        phone: "(555) 0307",
        email: "william@email.com",
        source: "SEO/Organic",
        timeAgo: "4 hours",
        attempts: 3,
        lastAttempt: "Multiple attempts, wrong number",
        status: 'bad_contact',
        notes: "Phone number may be incorrect"
      },
      {
        id: 8,
        firstName: "Elizabeth",
        lastName: "Brown",
        phone: "(555) 0308",
        email: "elizabeth.b@email.com",
        source: "Website Form",
        timeAgo: "5 hours",
        attempts: 0,
        status: 'new'
      },
      {
        id: 9,
        firstName: "James",
        phone: "(555) 0309",
        email: "james@email.com",
        source: "Landing Page",
        timeAgo: "6 hours",
        attempts: 1,
        lastAttempt: "Email opened but no response",
        status: 'contacted'
      },
      {
        id: 10,
        firstName: "Barbara",
        lastName: "Jones",
        phone: "(555) 0310",
        email: "barbara.j@email.com",
        source: "Facebook Ad",
        timeAgo: "8 hours",
        attempts: 0,
        status: 'new'
      },
      {
        id: 11,
        firstName: "Richard",
        phone: "(555) 0311",
        email: "richard@email.com",
        source: "Google Ads",
        timeAgo: "10 hours",
        attempts: 2,
        lastAttempt: "Left voicemail",
        status: 'no_response'
      },
      {
        id: 12,
        firstName: "Susan",
        lastName: "Garcia",
        phone: "(555) 0312",
        email: "susan.g@email.com",
        source: "Website Form",
        timeAgo: "12 hours",
        attempts: 0,
        status: 'new'
      },
      {
        id: 13,
        firstName: "Joseph",
        phone: "(555) 0313",
        email: "joseph@email.com",
        source: "SEO/Organic",
        timeAgo: "1 day",
        attempts: 4,
        lastAttempt: "Multiple attempts over 3 days",
        status: 'no_response',
        notes: "May not be interested anymore"
      },
      {
        id: 14,
        firstName: "Jessica",
        lastName: "Martinez",
        phone: "(555) 0314",
        email: "jessica.m@email.com",
        source: "Landing Page",
        timeAgo: "1 day",
        attempts: 0,
        status: 'new'
      },
      {
        id: 15,
        firstName: "Thomas",
        phone: "(555) 0315",
        email: "thomas@email.com",
        source: "Referral",
        timeAgo: "2 days",
        attempts: 1,
        lastAttempt: "Initial email sent",
        status: 'contacted'
      }
    ];

    setTimeout(() => {
      setLeads(mockLeads);
      setLoading(false);
    }, 1000);
  }, []);

  const handleContactLead = (lead: ColdLead, method: string) => {
    toast.success(
      <div>
        <p className="font-semibold">{method} initiated</p>
        <p className="text-sm">{lead.firstName} {lead.lastName || ''} - Attempt #{lead.attempts + 1}</p>
      </div>
    );
    
    // Update lead status and attempts
    setLeads(prev => prev.map(l => 
      l.id === lead.id 
        ? { 
            ...l, 
            attempts: l.attempts + 1, 
            status: 'contacted' as const,
            lastAttempt: `${method} just now`
          }
        : l
    ));
  };

  const handleBulkAction = (action: string) => {
    if (selectedLeads.length === 0) {
      toast.error("Please select leads first");
      return;
    }
    
    toast.success(`${action} initiated for ${selectedLeads.length} leads`);
    setSelectedLeads([]);
  };

  const toggleLeadSelection = (leadId: number) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const toggleAllLeads = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map(l => l.id));
    }
  };

  // Filter and sort leads
  let filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.lastName && lead.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm);
    const matchesSource = filterSource === "all" || lead.source.includes(filterSource);
    const matchesStatus = filterStatus === "all" || lead.status === filterStatus;
    
    return matchesSearch && matchesSource && matchesStatus;
  });

  // Sort leads
  filteredLeads = [...filteredLeads].sort((a, b) => {
    switch(sortBy) {
      case 'newest':
        return 0; // Already sorted by time in mock data
      case 'attempts':
        return a.attempts - b.attempts; // Least attempts first
      case 'no_attempts':
        return a.attempts === 0 ? -1 : 1;
      default:
        return 0;
    }
  });

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    noResponse: leads.filter(l => l.status === 'no_response').length,
    badContact: leads.filter(l => l.status === 'bad_contact').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Cold Leads ❄️</h1>
        <p className="text-muted-foreground mt-2">
          Basic contact information requiring initial outreach
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="border-blue-600/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Cold Leads</CardTitle>
              <Snowflake className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">New/Fresh</CardTitle>
              <Clock className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.new}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Contacted</CardTitle>
              <Phone className="h-4 w-4 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.contacted}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">No Response</CardTitle>
              <UserX className="h-4 w-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.noResponse}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Bad Contact</CardTitle>
              <UserX className="h-4 w-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.badContact}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Bulk Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
            
            <Select value={filterSource} onValueChange={setFilterSource}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="Website">Website Form</SelectItem>
                <SelectItem value="Landing">Landing Page</SelectItem>
                <SelectItem value="Facebook">Facebook Ad</SelectItem>
                <SelectItem value="Google">Google Ads</SelectItem>
                <SelectItem value="SEO">SEO/Organic</SelectItem>
                <SelectItem value="Referral">Referral</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="no_response">No Response</SelectItem>
                <SelectItem value="bad_contact">Bad Contact</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="no_attempts">Never Contacted</SelectItem>
                <SelectItem value="attempts">Least Attempts</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Bulk Actions */}
          {selectedLeads.length > 0 && (
            <div className="flex items-center gap-3 p-3 bg-blue-950/20 rounded-lg border border-blue-600/30">
              <span className="text-sm font-medium">{selectedLeads.length} selected</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleBulkAction("Bulk email")}>
                  <Mail className="h-3 w-3 mr-1" />
                  Bulk Email
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction("Bulk SMS")}>
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Bulk SMS
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction("Add to campaign")}>
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Add to Campaign
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction("Export")}>
                  <Upload className="h-3 w-3 mr-1" />
                  Export
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Cold Lead List</CardTitle>
              <CardDescription>
                {filteredLeads.length} leads requiring initial outreach
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={toggleAllLeads}
            >
              {selectedLeads.length === filteredLeads.length ? "Deselect All" : "Select All"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loading ? (
              <>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </>
            ) : filteredLeads.length > 0 ? (
              filteredLeads.map(lead => (
                <div
                  key={lead.id}
                  className="p-3 rounded-lg border border-blue-600/20 bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedLeads.includes(lead.id)}
                      onCheckedChange={() => toggleLeadSelection(lead.id)}
                      className="mt-1"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">
                            {lead.firstName} {lead.lastName || ''}
                          </span>
                          <Badge variant={
                            lead.status === 'new' ? 'default' :
                            lead.status === 'contacted' ? 'secondary' :
                            lead.status === 'no_response' ? 'outline' :
                            'destructive'
                          }>
                            {lead.status.replace('_', ' ')}
                          </Badge>
                          {lead.attempts > 0 && (
                            <Badge variant="outline">
                              {lead.attempts} attempt{lead.attempts > 1 ? 's' : ''}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {lead.source} • {lead.timeAgo} ago
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm mb-2">
                        <div>
                          <span className="text-muted-foreground">Phone:</span> {lead.phone}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Email:</span> {lead.email}
                        </div>
                        {lead.lastAttempt && (
                          <div>
                            <span className="text-muted-foreground">Last Attempt:</span> {lead.lastAttempt}
                          </div>
                        )}
                      </div>
                      
                      {lead.notes && (
                        <div className="text-sm text-muted-foreground italic mb-2">
                          Note: {lead.notes}
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7"
                          onClick={() => handleContactLead(lead, 'Called')}
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          Call
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7"
                          onClick={() => handleContactLead(lead, 'Texted')}
                        >
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Text
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7"
                          onClick={() => handleContactLead(lead, 'Emailed')}
                        >
                          <Mail className="h-3 w-3 mr-1" />
                          Email
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No cold leads found matching your filters
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}