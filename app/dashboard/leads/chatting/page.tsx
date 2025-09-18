"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, Search, Filter, Users, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface ChattingRequest {
  id: number;
  firstName: string;
  phone: string;
  email: string;
  topic: string;
  timeAgo: string;
  language: string;
  message?: string;
  status: 'pending' | 'claimed' | 'completed';
  claimedBy?: string;
  claimedAt?: string;
}

export default function ChattingAssistancePage() {
  const [requests, setRequests] = useState<ChattingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTopic, setFilterTopic] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    // Simulate loading chat requests
    const mockRequests: ChattingRequest[] = [
      {
        id: 1,
        firstName: "Robert Johnson",
        phone: "(555) 0101",
        email: "robert.j@email.com",
        topic: "Medicare Advantage",
        timeAgo: "2 min",
        language: "English",
        message: "I need help understanding my Medicare options",
        status: 'pending'
      },
      {
        id: 2,
        firstName: "Maria Garcia",
        phone: "(555) 0102",
        email: "maria.g@email.com",
        topic: "ACA Plans",
        timeAgo: "5 min",
        language: "Spanish",
        message: "Necesito ayuda con planes ACA",
        status: 'pending'
      },
      {
        id: 3,
        firstName: "David Lee",
        phone: "(555) 0103",
        email: "david.l@email.com",
        topic: "Medicare Part D",
        timeAgo: "8 min",
        language: "English",
        message: "Questions about prescription coverage",
        status: 'claimed',
        claimedBy: "Agent Smith",
        claimedAt: "3 min ago"
      },
      {
        id: 4,
        firstName: "Sarah Wilson",
        phone: "(555) 0104",
        email: "sarah.w@email.com",
        topic: "Medicare Supplement",
        timeAgo: "12 min",
        language: "English",
        status: 'pending'
      },
      {
        id: 5,
        firstName: "James Brown",
        phone: "(555) 0105",
        email: "james.b@email.com",
        topic: "Dental Plans",
        timeAgo: "15 min",
        language: "English",
        message: "Looking for dental coverage options",
        status: 'pending'
      },
      {
        id: 6,
        firstName: "Lisa Chen",
        phone: "(555) 0106",
        email: "lisa.c@email.com",
        topic: "Vision Coverage",
        timeAgo: "18 min",
        language: "English",
        status: 'completed',
        claimedBy: "Agent Johnson",
        claimedAt: "10 min ago"
      },
      {
        id: 7,
        firstName: "Michael Davis",
        phone: "(555) 0107",
        email: "michael.d@email.com",
        topic: "Medicare Advantage",
        timeAgo: "22 min",
        language: "English",
        status: 'pending'
      },
      {
        id: 8,
        firstName: "Ana Rodriguez",
        phone: "(555) 0108",
        email: "ana.r@email.com",
        topic: "ACA Plans",
        timeAgo: "25 min",
        language: "Spanish",
        message: "Preguntas sobre subsidios",
        status: 'pending'
      }
    ];

    setTimeout(() => {
      setRequests(mockRequests);
      setLoading(false);
    }, 1000);
  }, []);

  const handleJoinWhatsApp = (request: ChattingRequest) => {
    // Simulate claiming and joining WhatsApp
    setRequests(prev => prev.map(r => 
      r.id === request.id 
        ? { ...r, status: 'claimed' as const, claimedBy: 'You', claimedAt: 'Just now' }
        : r
    ));
    
    toast.success(
      <div>
        <p className="font-semibold">Claimed & Joined WhatsApp</p>
        <p className="text-sm">You're now helping {request.firstName} with {request.topic}</p>
      </div>
    );
  };

  // Filter requests based on search and filters
  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.phone.includes(searchTerm);
    const matchesTopic = filterTopic === "all" || request.topic.includes(filterTopic);
    const matchesStatus = filterStatus === "all" || request.status === filterStatus;
    
    return matchesSearch && matchesTopic && matchesStatus;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    claimed: requests.filter(r => r.status === 'claimed').length,
    completed: requests.filter(r => r.status === 'completed').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Chatting Assistance</h1>
        <p className="text-muted-foreground mt-2">
          Manage incoming chat requests from website visitors
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card className="border-green-600/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.pending}</div>
          </CardContent>
        </Card>
        
        <Card className="border-blue-600/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Claimed</CardTitle>
              <MessageCircle className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats.claimed}</div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-600/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-gray-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-500">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Requests</CardTitle>
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
            
            <Select value={filterTopic} onValueChange={setFilterTopic}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Topics</SelectItem>
                <SelectItem value="Medicare">Medicare</SelectItem>
                <SelectItem value="ACA">ACA Plans</SelectItem>
                <SelectItem value="Dental">Dental</SelectItem>
                <SelectItem value="Vision">Vision</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="claimed">Claimed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Chat Requests</CardTitle>
              <CardDescription>
                {filteredRequests.length} requests found
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-green-500 border-green-500/50">
              {stats.pending} Needs Attention
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loading ? (
              <>
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </>
            ) : filteredRequests.length > 0 ? (
              filteredRequests.map(request => (
                <div
                  key={request.id}
                  className={`p-4 rounded-lg border ${
                    request.status === 'pending' 
                      ? 'border-green-600/30 bg-green-950/10' 
                      : request.status === 'claimed'
                      ? 'border-blue-600/20 bg-blue-950/10'
                      : 'border-gray-600/20 bg-gray-950/10'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-lg">{request.firstName}</span>
                        <Badge variant={request.status === 'pending' ? 'default' : 'secondary'}>
                          {request.status}
                        </Badge>
                        <Badge variant="outline">{request.topic}</Badge>
                        {request.language !== 'English' && (
                          <Badge variant="outline" className="text-yellow-500 border-yellow-500/50">
                            {request.language}
                          </Badge>
                        )}
                        <span className="text-sm text-muted-foreground ml-auto">
                          {request.timeAgo} ago
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-muted-foreground">Phone:</span> {request.phone}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Email:</span> {request.email}
                        </div>
                        {request.claimedBy && (
                          <div>
                            <span className="text-muted-foreground">Claimed by:</span> {request.claimedBy} ({request.claimedAt})
                          </div>
                        )}
                      </div>
                      
                      {request.message && (
                        <div className="bg-background/50 rounded p-2 mb-3">
                          <p className="text-sm italic">"{request.message}"</p>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        {request.status === 'pending' && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleJoinWhatsApp(request)}
                          >
                            <MessageCircle className="h-3 w-3 mr-1" />
                            Join WhatsApp & Claim
                          </Button>
                        )}
                        {request.status === 'claimed' && request.claimedBy === 'You' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setRequests(prev => prev.map(r => 
                                r.id === request.id 
                                  ? { ...r, status: 'completed' as const }
                                  : r
                              ));
                              toast.success(`Marked ${request.firstName}'s request as completed`);
                            }}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No chat requests found matching your filters
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}