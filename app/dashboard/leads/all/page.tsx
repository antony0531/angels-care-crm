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
import { useLeadStatuses, useLeadSources } from "@/lib/contexts/settings-context";

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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  
  // Get settings from context
  const leadStatuses = useLeadStatuses();
  const leadSources = useLeadSources();
  
  // Helper function to get status color configuration
  const getStatusConfig = (statusName: string) => {
    return leadStatuses.find(s => s.name.toLowerCase() === statusName.toLowerCase());
  };
  
  // Helper function to convert color name to Tailwind classes
  const getStatusBadgeVariant = (statusName: string): "default" | "secondary" | "destructive" | "outline" => {
    const statusConfig = getStatusConfig(statusName);
    if (!statusConfig) return "outline";
    
    // Map color to badge variants
    switch (statusConfig.color) {
      case "blue": return "default";
      case "yellow": return "secondary";
      case "green": return "outline";
      case "red": return "destructive";
      case "purple": return "secondary";
      case "gray": return "outline";
      default: return "outline";
    }
  };
  
  // Helper function to get custom color classes for status badges
  const getStatusBadgeClasses = (statusName: string): string => {
    const statusConfig = getStatusConfig(statusName);
    if (!statusConfig) return "";
    
    // Return custom color classes based on configuration
    switch (statusConfig.color) {
      case "blue": return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200";
      case "yellow": return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200";
      case "green": return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200";
      case "red": return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200";
      case "purple": return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200";
      case "gray": return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-200";
      default: return "";
    }
  };
  

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
    // Reset to first page when filters change
    setCurrentPage(1);
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

  const handleStatusChange = async (lead: Lead, newStatus: string) => {
    try {
      // Update lead status via API
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus.toUpperCase(),
          ...(newStatus.toLowerCase() === 'contacted' ? { contactedAt: new Date().toISOString() } : {}),
          ...(newStatus.toLowerCase() === 'converted' ? { convertedAt: new Date().toISOString() } : {}),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update lead status');
      }

      // Update local state
      setLeads(prev => prev.map(l => 
        l.id === lead.id 
          ? { 
              ...l, 
              status: newStatus.toLowerCase() as const,
              ...(newStatus.toLowerCase() === 'contacted' ? { contactedAt: new Date().toISOString() } : {}),
              ...(newStatus.toLowerCase() === 'converted' ? { convertedAt: new Date().toISOString() } : {}),
            }
          : l
      ));
      
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating lead status:', error);
      toast.error('Failed to update lead status');
    }
  };

  const handleInsuranceTypeChange = async (lead: Lead, newInsuranceType: string) => {
    try {
      // Update lead insurance type via API
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          insuranceType: newInsuranceType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update insurance type');
      }

      // Update local state
      setLeads(prev => prev.map(l => 
        l.id === lead.id 
          ? { ...l, insuranceType: newInsuranceType }
          : l
      ));
      
      toast.success(`Insurance type updated to ${newInsuranceType}`);
    } catch (error) {
      console.error('Error updating insurance type:', error);
      toast.error('Failed to update insurance type');
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

  // Calculate pagination
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLeads = filteredLeads.slice(startIndex, endIndex);

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
      : 0
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
                {leadStatuses.map((status) => (
                  <SelectItem key={status.id} value={status.name.toUpperCase()}>
                    {status.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {leadSources.map((source) => (
                  <SelectItem key={source.id} value={source.name.toUpperCase()}>
                    {source.name}
                  </SelectItem>
                ))}
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
                  </tr>
                </thead>
                <tbody>
                  {currentLeads.map((lead) => (
                  <tr key={lead.id} className="border-b hover:bg-accent/50">
                    <td className="p-2">
                      <div>
                        <p className="font-medium">{lead.firstName} {lead.lastName}</p>
                        <p className="text-sm text-muted-foreground">{lead.email}</p>
                        <p className="text-sm text-muted-foreground">{lead.phone}</p>
                      </div>
                    </td>
                    <td className="p-2">
                      <Select
                        value={lead.insuranceType}
                        onValueChange={(value) => handleInsuranceTypeChange(lead, value)}
                      >
                        <SelectTrigger className="w-[140px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Medicare">Medicare</SelectItem>
                          <SelectItem value="ACA">ACA</SelectItem>
                          <SelectItem value="Life Insurance">Life Insurance</SelectItem>
                          <SelectItem value="Health Insurance">Health Insurance</SelectItem>
                          <SelectItem value="Auto Insurance">Auto Insurance</SelectItem>
                        </SelectContent>
                      </Select>
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
                        <Select
                          value={lead.status}
                          onValueChange={(value) => handleStatusChange(lead, value)}
                        >
                          <SelectTrigger className="w-[120px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="converted">Converted</SelectItem>
                          </SelectContent>
                        </Select>
                        {lead.assignedAgent && (
                          <p className="text-xs text-muted-foreground">{lead.assignedAgent}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(lead.createdAt), 'MMM dd, HH:mm')}
                        </p>
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

      {/* Pagination Controls */}
      {filteredLeads.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredLeads.length)} of {filteredLeads.length} leads
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Items per page selector */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Show:</span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(parseInt(value));
                      setCurrentPage(1); // Reset to first page when changing page size
                    }}
                  >
                    <SelectTrigger className="w-[70px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="30">30</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Page navigation */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {/* Show page numbers */}
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                      if (pageNumber <= totalPages) {
                        return (
                          <Button
                            key={pageNumber}
                            variant={currentPage === pageNumber ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNumber)}
                            className="w-8 h-8 p-0"
                          >
                            {pageNumber}
                          </Button>
                        );
                      }
                      return null;
                    })}
                    
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <>
                        <span className="text-muted-foreground">...</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(totalPages)}
                          className="w-8 h-8 p-0"
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}