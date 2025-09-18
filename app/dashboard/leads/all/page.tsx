"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, Filter, Download, Phone, Mail, CheckCircle, 
  Clock, User, TrendingUp, Calendar, ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { trackLeadEvents } from "@/lib/analytics";
import { FrontendLead } from "@/types/lead";

// Use the shared Lead type
type Lead = FrontendLead;

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [dateRange, setDateRange] = useState("7d");

  // Fetch leads from API
  const fetchLeads = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append('status', statusFilter.toUpperCase());
      if (sourceFilter !== "all") params.append('source', sourceFilter.toUpperCase());
      params.append('limit', '100'); // Get more leads for better filtering
      
      const response = await fetch(`/api/leads?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }
      
      const data = await response.json();
      setLeads(data.leads || []);
      setFilteredLeads(data.leads || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to load leads. Please try again.');
      // Fallback to empty array
      setLeads([]);
      setFilteredLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [statusFilter, sourceFilter]); // Refetch when filters change

  useEffect(() => {
    // Apply filters
    let filtered = [...leads];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(lead => 
        lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.lastName && lead.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    // Source filter
    if (sourceFilter !== "all") {
      filtered = filtered.filter(lead => lead.source === sourceFilter);
    }

    // Date range filter
    const now = new Date();
    const cutoff = new Date();
    if (dateRange === "1d") cutoff.setDate(now.getDate() - 1);
    else if (dateRange === "7d") cutoff.setDate(now.getDate() - 7);
    else if (dateRange === "30d") cutoff.setDate(now.getDate() - 30);
    
    if (dateRange !== "all") {
      filtered = filtered.filter(lead => new Date(lead.createdAt) > cutoff);
    }

    setFilteredLeads(filtered);
  }, [searchTerm, statusFilter, sourceFilter, dateRange, leads]);

  const handleContact = async (lead: Lead) => {
    try {
      // Track event
      trackLeadEvents.leadContacted(lead.id, 'phone');
      
      // Update lead status via API
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'CONTACTED',
          contactedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update lead');
      }

      // Update local state
      setLeads(prev => prev.map(l => 
        l.id === lead.id 
          ? { ...l, status: 'contacted' as const, contactedAt: new Date().toISOString() }
          : l
      ));
      
      toast.success(`Contacting ${lead.firstName} ${lead.lastName || ''}`);
    } catch (error) {
      console.error('Error updating lead:', error);
      toast.error('Failed to update lead status');
    }
  };

  const handleConvert = async (lead: Lead) => {
    try {
      // Track event
      trackLeadEvents.leadConverted(lead.id, lead.estimatedValue);
      
      // Update lead status via API
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'CONVERTED',
          convertedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update lead');
      }

      // Update local state
      setLeads(prev => prev.map(l => 
        l.id === lead.id 
          ? { ...l, status: 'converted' as const, convertedAt: new Date().toISOString() }
          : l
      ));
      
      toast.success(`${lead.firstName} marked as converted!`);
    } catch (error) {
      console.error('Error updating lead:', error);
      toast.error('Failed to update lead status');
    }
  };

  const exportLeads = () => {
    const headers = ["ID", "Name", "Email", "Phone", "Type", "Status", "Source", "UTM Campaign", "Pages Viewed", "Session Duration", "Created At"];
    const rows = filteredLeads.map(lead => [
      lead.id,
      `${lead.firstName} ${lead.lastName || ''}`,
      lead.email,
      lead.phone,
      lead.insuranceType,
      lead.status,
      lead.source,
      lead.utmCampaign || '',
      lead.pagesViewed,
      `${Math.floor(lead.sessionDuration / 60)}m ${lead.sessionDuration % 60}s`,
      format(new Date(lead.createdAt), 'yyyy-MM-dd HH:mm')
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\\n"
      + rows.map(row => row.join(",")).join("\\n");
    
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `leads_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate stats
  const stats = {
    total: filteredLeads.length,
    new: filteredLeads.filter(l => l.status === 'new').length,
    contacted: filteredLeads.filter(l => l.status === 'contacted').length,
    converted: filteredLeads.filter(l => l.status === 'converted').length,
    conversionRate: filteredLeads.length > 0 
      ? ((filteredLeads.filter(l => l.status === 'converted').length / filteredLeads.length) * 100).toFixed(1)
      : '0',
    avgFormTime: filteredLeads.length > 0
      ? Math.round(filteredLeads.reduce((acc, l) => acc + l.formCompletionTime, 0) / filteredLeads.length)
      : 0,
    totalValue: filteredLeads.reduce((acc, l) => acc + (l.estimatedValue || 0), 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lead Management</h1>
          <p className="text-muted-foreground mt-2">
            Track and manage leads from website capture to conversion
          </p>
        </div>
        <Button onClick={exportLeads} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Leads
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">New</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats.new}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Contacted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.contacted}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Converted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.converted}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Conv. Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate}%</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalValue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
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
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="NEW">New</SelectItem>
                <SelectItem value="CONTACTED">Contacted</SelectItem>
                <SelectItem value="QUALIFIED">Qualified</SelectItem>
                <SelectItem value="CONVERTED">Converted</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="GOOGLE_ADS">Google Ads</SelectItem>
                <SelectItem value="FACEBOOK">Facebook</SelectItem>
                <SelectItem value="ORGANIC">Organic</SelectItem>
                <SelectItem value="DIRECT">Direct</SelectItem>
                <SelectItem value="REFERRAL">Referral</SelectItem>
                <SelectItem value="WEBSITE">Website</SelectItem>
                <SelectItem value="LINKEDIN">LinkedIn</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Leads</CardTitle>
              <CardDescription>
                {filteredLeads.length} leads found
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-sm">
              Avg form completion: {stats.avgFormTime}s
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span>Loading leads...</span>
                </div>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <div className="text-center">
                  <p className="text-lg font-medium mb-2">No leads found</p>
                  <p className="text-sm">Try adjusting your filters or check back later for new leads.</p>
                </div>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Lead Info</th>
                    <th className="text-left p-2">Insurance Type</th>
                    <th className="text-left p-2">Source & Campaign</th>
                    <th className="text-left p-2">Behavior</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Value</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-b hover:bg-accent/50">
                    <td className="p-2">
                      <div>
                        <p className="font-medium">{lead.firstName} {lead.lastName}</p>
                        <p className="text-sm text-muted-foreground">{lead.email}</p>
                        <p className="text-sm text-muted-foreground">{lead.phone}</p>
                      </div>
                    </td>
                    <td className="p-2">
                      <Badge variant="outline">{lead.insuranceType}</Badge>
                    </td>
                    <td className="p-2">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{lead.source}</p>
                        {lead.utmCampaign && (
                          <p className="text-xs text-muted-foreground">{lead.utmCampaign}</p>
                        )}
                        <a 
                          href={lead.landingPage} 
                          className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {lead.landingPage}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="text-sm">
                        <p>{lead.pagesViewed} pages</p>
                        <p className="text-muted-foreground">
                          {Math.floor(lead.sessionDuration / 60)}m {lead.sessionDuration % 60}s
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Form: {lead.formCompletionTime}s
                        </p>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="space-y-1">
                        <Badge variant={
                          lead.status === 'new' ? 'default' :
                          lead.status === 'contacted' ? 'secondary' :
                          'outline'
                        }>
                          {lead.status}
                        </Badge>
                        {lead.assignedAgent && (
                          <p className="text-xs text-muted-foreground">{lead.assignedAgent}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(lead.createdAt), 'MMM dd, HH:mm')}
                        </p>
                      </div>
                    </td>
                    <td className="p-2">
                      <p className="font-medium">${lead.estimatedValue}</p>
                    </td>
                    <td className="p-2">
                      <div className="flex gap-1">
                        {lead.status === 'new' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleContact(lead)}
                          >
                            <Phone className="h-3 w-3 mr-1" />
                            Contact
                          </Button>
                        )}
                        {lead.status === 'contacted' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleConvert(lead)}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Convert
                          </Button>
                        )}
                        {lead.status === 'converted' && (
                          <Badge variant="outline" className="text-green-500">
                            ✓ Converted
                          </Badge>
                        )}
                      </div>
                    </td>
                  </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}