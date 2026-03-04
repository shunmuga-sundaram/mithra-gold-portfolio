import { useState, useEffect } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Switch } from "../../components/ui/switch";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Settings, IndianRupee, Loader2 } from "lucide-react";
import { toast } from "sonner";
import appSettingsService, { AppSettings } from "../../../services/appSettingsService";

export function AdminSettings() {
  const [settings, setSettings] = useState<AppSettings>({ showPortfolioValue: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await appSettingsService.getSettings();
      setSettings(data);
    } catch (error: any) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await appSettingsService.updateSettings(settings);
      setSettings(updated);
      toast.success("Settings saved successfully!");
    } catch (error: any) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-yellow-600" />
          <span className="ml-2 text-lg">Loading settings...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-3">
          <Settings className="w-7 h-7 text-yellow-600" />
          <h2 className="text-2xl font-bold">Settings</h2>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <IndianRupee className="w-5 h-5 text-green-600" />
              Member Portfolio Display
            </CardTitle>
            <CardDescription>
              Control what financial information is visible to members on their dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between py-4 border-b">
              <div className="space-y-1">
                <Label className="text-base font-semibold">Show Portfolio Value</Label>
                <p className="text-sm text-gray-500">
                  When enabled, members can see the total INR value of their gold holdings
                  on their dashboard. Individual trade amounts are always visible.
                </p>
              </div>
              <Switch
                checked={settings.showPortfolioValue}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({ ...prev, showPortfolioValue: checked }))
                }
              />
            </div>

            <div className="rounded-lg bg-gray-50 border p-4 text-sm text-gray-600 space-y-1">
              <p className="font-semibold text-gray-700">What this controls:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <span className="font-medium">ON</span> — Members see "Portfolio Value" card
                  (e.g., ₹1,25,000)
                </li>
                <li>
                  <span className="font-medium">OFF</span> — Portfolio Value card is hidden;
                  only gold weight is shown (e.g., 10g)
                </li>
                <li>Individual trade amounts are always visible regardless of this setting</li>
              </ul>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-8"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Settings"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
