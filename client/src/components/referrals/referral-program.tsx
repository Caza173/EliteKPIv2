import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Gift, 
  Users, 
  Mail, 
  Star, 
  CheckCircle, 
  Clock, 
  Plus
} from "lucide-react";

interface ReferralStats {
  total: number;
  successful: number;
  pending: number;
  rewardsEarned: number;
}

interface Referral {
  id: string;
  refereeEmail: string;
  refereeName?: string;
  referralCode: string;
  status: 'pending' | 'signed_up' | 'subscribed';
  inviteSentAt: string;
  signUpAt?: string;
  subscriptionAt?: string;
}

export default function ReferralProgram() {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [refereeEmail, setRefereeEmail] = useState("");
  const [refereeName, setRefereeName] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch referral stats
  const { data: stats } = useQuery<ReferralStats>({
    queryKey: ["/api/referrals/stats"],
  });

  // Fetch referrals list
  const { data: referrals } = useQuery<Referral[]>({
    queryKey: ["/api/referrals"],
  });

  // Send referral invitation
  const sendInviteMutation = useMutation({
    mutationFn: async (data: { refereeEmail: string; refereeName?: string; customMessage?: string }) => {
      return apiRequest("POST", "/api/referrals", data);
    },
    onSuccess: () => {
      toast({
        title: "Invitation Sent!",
        description: "Your referral invitation has been sent successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/referrals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/referrals/stats"] });
      setIsInviteModalOpen(false);
      setRefereeEmail("");
      setRefereeName("");
      setCustomMessage("");
    },
    onError: () => {
      toast({
        title: "Failed to Send",
        description: "There was an error sending the invitation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendInvite = () => {
    if (!refereeEmail.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter the referee's email address.",
        variant: "destructive",
      });
      return;
    }

    sendInviteMutation.mutate({
      refereeEmail: refereeEmail.trim(),
      refereeName: refereeName.trim() || undefined,
      customMessage: customMessage.trim() || undefined,
    });
  };

  const progressPercentage = stats ? Math.min((stats.successful / 3) * 100, 100) : 0;
  const successfulReferrals = stats?.successful || 0;
  const referralsNeeded = Math.max(3 - successfulReferrals, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-orange-600 border-orange-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'signed_up':
        return <Badge variant="outline" className="text-blue-600 border-blue-600"><Users className="h-3 w-3 mr-1" />Signed Up</Badge>;
      case 'subscribed':
        return <Badge className="bg-green-100 text-green-800 border-green-600"><CheckCircle className="h-3 w-3 mr-1" />Subscribed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Program Overview */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Gift className="h-5 w-5" />
            Referral Program: Get 1 Month Free!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-purple-700">
              Refer 3 agents to EliteKPI and get <strong>1 month free</strong> subscription! 
              Share the power of our real estate management platform with your network.
            </p>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-purple-700 font-medium">
                  Progress: {successfulReferrals}/3 successful referrals
                </span>
                <span className="text-purple-600">
                  {referralsNeeded > 0 ? `${referralsNeeded} more needed` : 'Reward earned!'}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-3 bg-purple-100" />
            </div>

            {/* Rewards Status */}
            {stats && stats.rewardsEarned > 0 && (
              <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
                <Star className="h-5 w-5 text-green-600" />
                <span className="font-medium">
                  🎉 Congratulations! You've earned {stats.rewardsEarned} month{stats.rewardsEarned > 1 ? 's' : ''} free!
                </span>
              </div>
            )}

            {/* Action Button */}
            <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Invite an Agent
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Send Referral Invitation
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Agent's Email Address*</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="agent@realestate.com"
                      value={refereeEmail}
                      onChange={(e) => setRefereeEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Agent's Name (Optional)</Label>
                    <Input
                      id="name"
                      placeholder="John Smith"
                      value={refereeName}
                      onChange={(e) => setRefereeName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Personal Message (Optional)</Label>
                    <Textarea
                      id="message"
                      placeholder="Hi! I've been using EliteKPI for my real estate business and thought you might be interested..."
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsInviteModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSendInvite}
                      disabled={sendInviteMutation.isPending}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {sendInviteMutation.isPending ? "Sending..." : "Send Invitation"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Referral Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Sent</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.successful}</div>
              <div className="text-sm text-gray-600">Successful</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.rewardsEarned}</div>
              <div className="text-sm text-gray-600">Months Earned</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Referrals List */}
      {referrals && referrals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Your Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {referrals.map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{referral.refereeName || referral.refereeEmail}</div>
                    <div className="text-sm text-gray-600">{referral.refereeEmail}</div>
                    <div className="text-xs text-gray-500">
                      Invited: {new Date(referral.inviteSentAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Referral Code</div>
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono font-bold text-purple-700">
                        {referral.referralCode}
                      </code>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(referral.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* How it Works */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <div className="font-medium">Send Invitations</div>
                <div className="text-sm text-gray-600">Invite real estate agents to try EliteKPI</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <div className="font-medium">They Sign Up & Subscribe</div>
                <div className="text-sm text-gray-600">Your referrals create accounts and become paying subscribers</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <div className="font-medium">Get Rewarded</div>
                <div className="text-sm text-gray-600">For every 3 successful referrals, you get 1 month free!</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}