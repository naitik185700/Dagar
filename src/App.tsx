import { useState, useEffect } from "react";
import { RedirectScreen } from "./components/RedirectScreen";
import { SettingsModal } from "./components/SettingsModal";
import { QRModal } from "./components/QRModal";
import { Headset } from "lucide-react";
import { LegalModal } from "./components/LegalModal";

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
  const [legalModalContent, setLegalModalContent] = useState<"terms" | "privacy" | null>(null);

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
        onOpenTerms={() => setLegalModalContent("terms")}
        onOpenPrivacy={() => setLegalModalContent("privacy")}
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

      <LegalModal
        isOpen={legalModalContent !== null}
        onClose={() => setLegalModalContent(null)}
        title={legalModalContent === "terms" ? "Terms & Conditions" : "Privacy Policy"}
        content={
          legalModalContent === "terms" ? (
            <>
              <h3 className="text-white font-semibold mb-2 text-base">1. Acceptance of Terms</h3>
              <p>By accessing and using app.kineticarena.online, you accept and agree to be bound by the terms and provisions of this agreement.</p>
              
              <h3 className="text-white font-semibold mb-2 mt-4 text-base">2. VIP Services</h3>
              <p>Our platform provides direct connections to our elite VIP hosts and dealers. We reserve the right to refuse service, terminate accounts, or cancel services at our sole discretion.</p>

              <h3 className="text-white font-semibold mb-2 mt-4 text-base">3. User Conduct</h3>
              <p>Users are expected to conduct themselves respectfully when interacting with our hosts via WhatsApp, Telegram, or any other provided communication channels. Any form of harassment or abuse will result in an immediate permanent ban.</p>

              <h3 className="text-white font-semibold mb-2 mt-4 text-base">4. Modifications</h3>
              <p>We may revise these terms of service at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms.</p>
            </>
          ) : (
            <>
              <h3 className="text-white font-semibold mb-2 text-base">1. Information We Collect</h3>
              <p>We only collect information necessary to provide our VIP services, such as your interactions with our platform and any details you provide when contacting our hosts via WhatsApp or Telegram.</p>
              
              <h3 className="text-white font-semibold mb-2 mt-4 text-base">2. How We Use Information</h3>
              <p>Your information is used solely to facilitate communication between you and our elite dealers, provide customer support, and improve your premium VIP experience.</p>

              <h3 className="text-white font-semibold mb-2 mt-4 text-base">3. Data Protection</h3>
              <p>We implement a variety of security measures to maintain the safety of your personal information. We do not sell, trade, or otherwise transfer your information to outside parties.</p>

              <h3 className="text-white font-semibold mb-2 mt-4 text-base">4. Third-Party Platforms</h3>
              <p>Please note that communications via WhatsApp and Telegram are also subject to the privacy policies and terms of those respective platforms.</p>
            </>
          )
        }
      />

      {/* 24/7 Help Support Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-2">
        <a 
          href="https://wa.me/8685809192" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full p-4 shadow-lg flex items-center justify-center transition-transform hover:scale-110 group relative"
          aria-label="24/7 Help Support"
        >
          <Headset size={28} />
          <span className="absolute right-full mr-4 bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md">
            24/7 Help Support
          </span>
        </a>
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 drop-shadow-sm">
          24x7 support
        </span>
      </div>
    </div>
  );
}

export default App;
