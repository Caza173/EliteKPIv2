import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Database,
  TestTube,
  CheckCircle,
  Save,
  Eye,
  EyeOff
} from "lucide-react";

export function MLSSettingsSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedMLS, setSelectedMLS] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [isTestingConnection, setIsTestingConnection] = useState<boolean>(false);

  // Fetch available states
  const { data: states = [] } = useQuery<string[]>({
    queryKey: ["/api/mls-grid/states"],
  });

  // Fetch cities for selected state
  const { data: cities = [] } = useQuery<string[]>({
    queryKey: ["/api/mls-grid/cities", selectedState],
    enabled: !!selectedState,
  });

  // Fetch MLS systems for selected location
  const { data: mlsSystems = [] } = useQuery<any[]>({
    queryKey: ["/api/mls-grid/systems", { state: selectedState, city: selectedCity }],
    enabled: !!selectedState,
  });

  // Fetch current MLS settings
  const { data: currentSettings } = useQuery<any>({
    queryKey: ["/api/mls-settings"],
  });

  // Update form when settings load
  useEffect(() => {
    if (currentSettings) {
      setSelectedState(currentSettings.states?.[0] || "");
      setSelectedMLS(currentSettings.mlsSystem || "");
      setApiKey(currentSettings.apiKey || "");
    }
  }, [currentSettings]);

  // Save MLS settings
  const saveMLSSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/mls-settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mls-settings"] });
      toast({
        title: "Success",
        description: "MLS settings saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save MLS settings",
        variant: "destructive",
      });
    },
  });

  // Test MLS connection
  const testConnectionMutation = useMutation({
    mutationFn: async ({ apiKey, originatingSystem }: { apiKey: string; originatingSystem: string }) => {
      const response = await apiRequest("POST", "/api/mls-grid/test-connection", {
        apiKey,
        originatingSystem,
      });
      return await response.json() as { success: boolean; message: string };
    },
    onSuccess: (data: { success: boolean; message: string }) => {
      toast({
        title: data.success ? "Connection Successful" : "Connection Failed",
        description: data.message,
        variant: data.success ? "default" : "destructive",
      });
    },
    onError: () => {
      toast({
        title: "Connection Error",
        description: "Failed to test MLS connection",
        variant: "destructive",
      });
    },
  });

  const handleSaveSettings = () => {
    if (!selectedMLS || !apiKey) {
      toast({
        title: "Validation Error",
        description: "Please select an MLS system and enter your API key",
        variant: "destructive",
      });
      return;
    }

    const selectedMLSData = mlsSystems.find(mls => mls.name === selectedMLS);
    if (!selectedMLSData) {
      toast({
        title: "Error",
        description: "Selected MLS system not found",
        variant: "destructive",
      });
      return;
    }

    saveMLSSettingsMutation.mutate({
      mlsSystem: selectedMLSData.name,
      mlsSystemName: selectedMLSData.displayName,
      apiKey,
      region: selectedMLSData.region,
      states: selectedMLSData.states,
      coverage: selectedMLSData.coverage,
    });
  };

  const handleTestConnection = () => {
    if (!selectedMLS || !apiKey) {
      toast({
        title: "Validation Error",
        description: "Please select an MLS system and enter your API key",
        variant: "destructive",
      });
      return;
    }

    setIsTestingConnection(true);
    testConnectionMutation.mutate(
      { apiKey, originatingSystem: selectedMLS },
      {
        onSettled: () => {
          setIsTestingConnection(false);
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          MLS Integration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="state">State</Label>
              <Select
                value={selectedState}
                onValueChange={(value) => {
                  setSelectedState(value);
                  setSelectedCity("");
                  setSelectedMLS("");
                }}
              >
                <SelectTrigger data-testid="select-state">
                  <SelectValue placeholder="Select your state" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="city">City (Optional)</Label>
              <Select
                value={selectedCity}
                onValueChange={setSelectedCity}
                disabled={!selectedState}
              >
                <SelectTrigger data-testid="select-city">
                  <SelectValue placeholder="Select your city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="mls">MLS System</Label>
            <Select
              value={selectedMLS}
              onValueChange={setSelectedMLS}
              disabled={!selectedState}
            >
              <SelectTrigger data-testid="select-mls">
                <SelectValue placeholder="Select your MLS system" />
              </SelectTrigger>
              <SelectContent>
                {mlsSystems.filter(mls => mls.name).map((mls) => (
                  <SelectItem key={mls.name} value={mls.name}>
                    {mls.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedMLS && (
              <p className="text-sm text-muted-foreground mt-1">
                Coverage: {mlsSystems.find(mls => mls.name === selectedMLS)?.coverage}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="apiKey">MLS Grid API Key</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="apiKey"
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your MLS Grid API key"
                  data-testid="input-api-key"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowApiKey(!showApiKey)}
                  data-testid="button-toggle-api-key"
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleTestConnection}
                disabled={!selectedMLS || !apiKey || isTestingConnection}
                data-testid="button-test-connection"
              >
                {isTestingConnection ? (
                  <>
                    <TestTube className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <TestTube className="w-4 h-4 mr-2" />
                    Test
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Get your API key from the MLS Grid dashboard after subscribing to your local MLS.
            </p>
          </div>

          {currentSettings && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3" data-testid="mls-connected-status">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium">MLS Connected</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Connected to {currentSettings.mlsSystemName} ({currentSettings.coverage})
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleSaveSettings}
              disabled={!selectedMLS || !apiKey || saveMLSSettingsMutation.isPending}
              data-testid="button-save-mls-settings"
            >
              {saveMLSSettingsMutation.isPending ? (
                "Saving..."
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save MLS Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}