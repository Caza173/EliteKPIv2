import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Activity } from "@shared/schema";
import { Handshake, FileText, Key, TrendingUp, Filter, Calendar as CalendarIcon, X } from "lucide-react";
import { formatDistanceToNow, isAfter, isBefore, isToday, isYesterday, isThisWeek, isThisMonth, startOfDay, endOfDay, subDays, subWeeks, subMonths } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function RecentActivity() {
  const [activityFilter, setActivityFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  
  const { data: activities = [] } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
    retry: false,
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'offer_accepted':
        return { icon: Handshake, color: 'bg-green-100 text-green-600' };
      case 'cma_completed':
        return { icon: FileText, color: 'bg-blue-100 text-blue-600' };
      case 'closed':
        return { icon: Key, color: 'bg-purple-100 text-purple-600' };
      default:
        return { icon: TrendingUp, color: 'bg-gray-100 text-gray-600' };
    }
  };

  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case 'offer_accepted':
        return 'Offer accepted';
      case 'offer_written':
        return 'Offer written';
      case 'cma_completed':
        return 'CMA completed';
      case 'buyer_appointment':
        return 'Buyer appointment';
      case 'listing_appointment':
        return 'Listing appointment';
      default:
        return activity.type.replace('_', ' ');
    }
  };

  const filteredActivities = activities.filter((activity: Activity) => {
    // Filter by activity type
    const matchesType = activityFilter === "all" || activity.type === activityFilter;
    
    // Filter by date
    const activityDate = new Date(activity.createdAt || activity.date);
    let matchesDate = true;
    
    switch (dateFilter) {
      case "today":
        matchesDate = isToday(activityDate);
        break;
      case "yesterday":
        matchesDate = isYesterday(activityDate);
        break;
      case "week":
        matchesDate = isThisWeek(activityDate);
        break;
      case "month":
        matchesDate = isThisMonth(activityDate);
        break;
      case "7days":
        matchesDate = isAfter(activityDate, subDays(new Date(), 7));
        break;
      case "30days":
        matchesDate = isAfter(activityDate, subDays(new Date(), 30));
        break;
      case "90days":
        matchesDate = isAfter(activityDate, subDays(new Date(), 90));
        break;
      case "custom":
        if (customStartDate && customEndDate) {
          matchesDate = isAfter(activityDate, startOfDay(new Date(customStartDate))) && 
                       isBefore(activityDate, endOfDay(new Date(customEndDate)));
        } else if (customStartDate) {
          matchesDate = isAfter(activityDate, startOfDay(new Date(customStartDate)));
        } else if (customEndDate) {
          matchesDate = isBefore(activityDate, endOfDay(new Date(customEndDate)));
        }
        break;
      default:
        matchesDate = true;
    }
    
    return matchesType && matchesDate;
  });
  
  const recentActivities = filteredActivities.slice(0, 5);

  if (recentActivities.length === 0) {
    return (
      <div className="lg:col-span-2 bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="flex flex-col gap-3 mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select value={activityFilter} onValueChange={setActivityFilter}>
                  <SelectTrigger className="w-[140px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Activities</SelectItem>
                    <SelectItem value="showing">Showings</SelectItem>
                    <SelectItem value="client_call">Client Calls</SelectItem>
                    <SelectItem value="listing_appointment">Listing Appts</SelectItem>
                    <SelectItem value="buyer_appointment">Buyer Appts</SelectItem>
                    <SelectItem value="cma_completed">CMA Completed</SelectItem>
                    <SelectItem value="offer_written">Offer Written</SelectItem>
                    <SelectItem value="offer_accepted">Offer Accepted</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-gray-500" />
                <Select value={dateFilter} onValueChange={(value) => {
                  setDateFilter(value);
                  if (value !== "custom") {
                    setCustomStartDate("");
                    setCustomEndDate("");
                  }
                }}>
                  <SelectTrigger className="w-[120px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="7days">Last 7 Days</SelectItem>
                    <SelectItem value="30days">Last 30 Days</SelectItem>
                    <SelectItem value="90days">Last 90 Days</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {dateFilter === "custom" && (
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="h-8 w-32 text-xs"
                    placeholder="Start date"
                  />
                  <span className="text-xs text-gray-500">to</span>
                  <Input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="h-8 w-32 text-xs"
                    placeholder="End date"
                  />
                  {(customStartDate || customEndDate) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => {
                        setCustomStartDate("");
                        setCustomEndDate("");
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}
              
              {(activityFilter !== "all" || dateFilter !== "all") && (
                <Badge variant="secondary" className="text-xs">
                  {recentActivities.length} filtered
                </Badge>
              )}
            </div>
          </div>
          <div className="text-center py-8">
            <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No {activityFilter === "all" && dateFilter === "all" ? "recent" : "matching"} activity</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2 bg-white shadow rounded-lg">
      <div className="p-6">
        <div className="flex flex-col gap-3 mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={activityFilter} onValueChange={setActivityFilter}>
                <SelectTrigger className="w-[140px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activities</SelectItem>
                  <SelectItem value="showing">Showings</SelectItem>
                  <SelectItem value="client_call">Client Calls</SelectItem>
                  <SelectItem value="listing_appointment">Listing Appts</SelectItem>
                  <SelectItem value="buyer_appointment">Buyer Appts</SelectItem>
                  <SelectItem value="cma_completed">CMA Completed</SelectItem>
                  <SelectItem value="offer_written">Offer Written</SelectItem>
                  <SelectItem value="offer_accepted">Offer Accepted</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-gray-500" />
              <Select value={dateFilter} onValueChange={(value) => {
                setDateFilter(value);
                if (value !== "custom") {
                  setCustomStartDate("");
                  setCustomEndDate("");
                }
              }}>
                <SelectTrigger className="w-[120px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {dateFilter === "custom" && (
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="h-8 w-32 text-xs"
                  placeholder="Start date"
                />
                <span className="text-xs text-gray-500">to</span>
                <Input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="h-8 w-32 text-xs"
                  placeholder="End date"
                />
                {(customStartDate || customEndDate) && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => {
                      setCustomStartDate("");
                      setCustomEndDate("");
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
            
            {(activityFilter !== "all" || dateFilter !== "all") && (
              <Badge variant="secondary" className="text-xs">
                {recentActivities.length} filtered
              </Badge>
            )}
          </div>
        </div>
        <div className="flow-root">
          <ul className="-mb-8">
            {recentActivities.map((activity: Activity, index: number) => {
              const { icon: IconComponent, color } = getActivityIcon(activity.type);
              const isLast = index === recentActivities.length - 1;
              
              return (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {!isLast && (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"></span>
                    )}
                    <div className="relative flex items-start space-x-3">
                      <div className="relative">
                        <div className={`w-8 h-8 ${color} rounded-full flex items-center justify-center`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div>
                          <div className="text-sm text-gray-500">
                            <span className="font-medium text-gray-900">
                              {getActivityText(activity)}
                            </span>
                            {activity.notes && (
                              <span> - {activity.notes}</span>
                            )}
                          </div>
                          <p className="mt-0.5 text-sm text-gray-500">
                            {formatDistanceToNow(new Date(activity.createdAt || activity.date))} ago
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
