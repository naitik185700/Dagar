import { useState, useEffect } from "react";
import { RedirectScreen } from "./components/RedirectScreen";
import { SettingsModal } from "./components/SettingsModal";
import { QRModal } from "./components/QRModal";

export interface Profile {
  id: string;
  name: string;
  details: string;
  photoUrl: string;
  whatsapp: string;
  telegram: string;
}

export interface AnalyticsState {
  whatsapp: number;
  telegram: number;
  impressions: number;
  startDate: string;
}

const DEFAULT_PROFILES: Profile[] = [
  {
    id: "1",
    name: "Alex Johnson",
    details: "Lead Developer & Tech Support",
    photoUrl: "/profile_1.png",
    whatsapp: "15551230001",
    telegram: "alex_j",
  },
  {
    id: "2",
    name: "Sarah Miller",
    details: "Customer Success Manager",
    photoUrl: "/profile_2.png",
    whatsapp: "15551230002",
    telegram: "sarah_m",
  },
  {
    id: "3",
    name: "David Chen",
    details: "Senior Sales Representative",
    photoUrl: "/profile_3.png",
    whatsapp: "15551230003",
    telegram: "david_c",
  },
  {
    id: "4",
    name: "Emily Davis",
    details: "Marketing & PR Coordinator",
    photoUrl: "/profile_4.png",
    whatsapp: "15551230004",
    telegram: "emily_d",
  },
  {
    id: "5",
    name: "Marcus Wright",
    details: "Community Manager",
    photoUrl: "/profile_5.png",
    whatsapp: "15551230005",
    telegram: "marcus_w",
  }
];

function App() {
  const [profiles, setProfiles] = useState<Profile[]>(DEFAULT_PROFILES);
  const [analytics, setAnalytics] = useState<AnalyticsState>({
    whatsapp: 0,
    telegram: 0,
    impressions: 0,
    startDate: new Date().toISOString(),
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQROpen, setIsQROpen] = useState(false);

  // Load configuration and increment impressions on mount
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        if (data.profiles) setProfiles(data.profiles);
        
        // Trigger impression
        fetch('/api/impression', { method: 'POST' })
          .then(res => res.json())
          .then(analyticsData => setAnalytics(analyticsData))
          .catch(e => console.error("Error incrementing impression", e));
      })
      .catch(e => {
        console.error("Error reading backend data. Is the server running?", e);
      });
  }, []);

  // Update redirect clicks
  const handleRedirectClick = (platform: "whatsapp" | "telegram") => {
    fetch('/api/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform })
    })
      .then(res => res.json())
      .then(data => setAnalytics(data))
      .catch(e => console.error("Error updating click", e));
  };

  // Save new profiles configuration
  const handleSaveProfiles = (updatedProfiles: Profile[]) => {
    setProfiles(updatedProfiles);
    fetch('/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profiles: updatedProfiles })
    }).catch(e => console.error("Error saving profiles", e));
  };

  // Reset clicks
  const handleResetAnalytics = () => {
    fetch('/api/reset', { method: 'POST' })
      .then(res => res.json())
      .then(data => setAnalytics(data))
      .catch(e => console.error("Error resetting analytics", e));
  };

  return (
    <div className="min-h-screen bg-background relative text-on-surface overflow-x-hidden flex items-center justify-center p-md">
      <RedirectScreen
        profiles={profiles}
        onRedirectClick={handleRedirectClick}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenQR={() => setIsQROpen(true)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profiles={profiles}
        analytics={analytics}
        onSave={handleSaveProfiles}
        onResetAnalytics={handleResetAnalytics}
      />

      <QRModal
        isOpen={isQROpen}
        onClose={() => setIsQROpen(false)}
      />
    </div>
  );
}

export default App;
