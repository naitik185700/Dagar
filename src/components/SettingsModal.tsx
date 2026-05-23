import React, { useState, useEffect } from "react";
import type { Profile, AnalyticsState } from "../App";
import { X, Save, RefreshCw, ShieldAlert, Lock } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: Profile[];
  analytics: AnalyticsState;
  onSave: (profiles: Profile[]) => void;
  onResetAnalytics: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profiles,
  analytics,
  onSave,
  onResetAnalytics,
}) => {
  const [localProfiles, setLocalProfiles] = useState<Profile[]>(profiles);
  const [activeTab, setActiveTab] = useState<"profiles" | "analytics">("profiles");
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [newPin, setNewPin] = useState("");
  
  const [pinChangeState, setPinChangeState] = useState<"idle" | "authorizing" | "loading" | "success">("idle");
  const [oldPinInput, setOldPinInput] = useState("");
  const [pinChangeError, setPinChangeError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setLocalProfiles(profiles);
      setActiveTab("profiles");
      setIsAuthenticated(false);
      setPinInput("");
      setPinError(false);
      
      const timer = setInterval(() => setCurrentTime(new Date()), 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen, profiles]);

  if (!isOpen) return null;

  const handleProfileChange = (index: number, field: keyof Profile, value: string) => {
    const updated = [...localProfiles];
    updated[index] = { ...updated[index], [field]: value };
    setLocalProfiles(updated);
  };

  const handleSave = () => {
    onSave(localProfiles);
    onClose();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput })
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        setPinError(false);
      } else {
        setPinError(true);
      }
    } catch (e) {
      console.error("Error verifying PIN", e);
      setPinError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-sm md:p-md">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-[768px] max-h-[90vh] bg-surface border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between p-lg border-b border-white/5 bg-surface-container-low/50">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Admin Dashboard</h2>
          <button onClick={onClose} className="p-xs text-on-surface-variant hover:text-on-surface transition-colors rounded-full hover:bg-white/5">
            <X className="w-6 h-6" />
          </button>
        </div>

        {!isAuthenticated ? (
          <div className="flex-1 flex flex-col items-center justify-center p-xl">
            <ShieldAlert className="w-12 h-12 text-primary mb-md" />
            <h3 className="font-headline-md text-on-surface mb-sm">Authentication Required</h3>
            <p className="font-body-md text-on-surface-variant mb-lg text-center">
              Please enter the admin PIN to access settings.
            </p>
            <form onSubmit={handleLogin} className="w-full max-w-[320px] flex flex-col gap-sm">
              <input
                type="password"
                placeholder="Enter PIN"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full bg-surface-container-low border border-white/10 rounded-xl px-md py-sm text-center text-headline-sm tracking-[0.5em] text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                autoFocus
              />
              {pinError && <span className="text-error text-body-sm text-center">Incorrect PIN</span>}
              <button
                type="submit"
                className="mt-sm w-full py-sm rounded-xl bg-primary text-on-primary font-body-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                Unlock
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Tabs */}
        <div className="flex border-b border-white/5 bg-surface-container-low/30">
          <button
            className={`flex-1 py-sm font-body-lg transition-colors ${activeTab === "profiles" ? "text-primary border-b-2 border-primary bg-primary/5" : "text-on-surface-variant hover:bg-white/5"}`}
            onClick={() => setActiveTab("profiles")}
          >
            Manage Profiles
          </button>
          <button
            className={`flex-1 py-sm font-body-lg transition-colors ${activeTab === "analytics" ? "text-primary border-b-2 border-primary bg-primary/5" : "text-on-surface-variant hover:bg-white/5"}`}
            onClick={() => setActiveTab("analytics")}
          >
            Analytics
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-lg">
          {activeTab === "profiles" && (
            <div className="flex flex-col gap-lg">
              {localProfiles.map((profile, index) => (
                <div key={profile.id} className="p-md rounded-xl bg-surface-container-low border border-white/5 flex flex-col gap-sm">
                  <div className="flex items-center gap-md mb-xs">
                    <div style={{ width: "48px", height: "48px", minWidth: "48px" }} className="rounded-full border border-white/10 overflow-hidden flex-shrink-0">
                      <img src={profile.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <h3 className="font-headline-sm text-on-surface">Profile {index + 1}</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                    <div>
                      <label className="block text-body-sm text-on-surface-variant mb-xs">Full Name</label>
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => handleProfileChange(index, "name", e.target.value)}
                        className="w-full bg-surface border border-white/10 rounded-lg px-sm py-xs text-on-surface focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-body-sm text-on-surface-variant mb-xs">Details/Role</label>
                      <input
                        type="text"
                        value={profile.details}
                        onChange={(e) => handleProfileChange(index, "details", e.target.value)}
                        className="w-full bg-surface border border-white/10 rounded-lg px-sm py-xs text-on-surface focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-body-sm text-on-surface-variant mb-xs">WhatsApp Number (incl. country code)</label>
                      <input
                        type="text"
                        value={profile.whatsapp}
                        onChange={(e) => handleProfileChange(index, "whatsapp", e.target.value)}
                        className="w-full bg-surface border border-white/10 rounded-lg px-sm py-xs text-on-surface focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-body-sm text-on-surface-variant mb-xs">Telegram Username</label>
                      <input
                        type="text"
                        value={profile.telegram}
                        onChange={(e) => handleProfileChange(index, "telegram", e.target.value)}
                        className="w-full bg-surface border border-white/10 rounded-lg px-sm py-xs text-on-surface focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-body-sm text-on-surface-variant mb-xs">Profile Photo</label>
                      <div className="flex items-center gap-sm">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            
                            const formData = new FormData();
                            formData.append("photo", file);
                            formData.append("profileId", profile.id);
                            
                            try {
                              const res = await fetch('/api/upload', {
                                method: 'POST',
                                body: formData,
                              });
                              const data = await res.json();
                              if (data.success) {
                                handleProfileChange(index, "photoUrl", data.photoUrl);
                              } else {
                                alert(data.error || "Upload failed");
                              }
                            } catch (err) {
                              console.error("Upload error", err);
                              alert("Network error during upload");
                            }
                          }}
                          className="w-full bg-surface border border-white/10 rounded-lg px-sm py-xs text-on-surface file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-body-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 outline-none transition-all cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="flex flex-col gap-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                <div className="p-md rounded-xl bg-surface-container-low border border-white/5 flex flex-col items-center justify-center gap-xs">
                  <span className="text-body-lg text-on-surface-variant text-center">Data Period</span>
                  <span className="text-body-sm text-on-surface opacity-80 text-center mt-1">
                    From: {analytics.startDate ? new Date(analytics.startDate).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "N/A"}<br/>
                    To: {currentTime.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                <div className="p-md rounded-xl bg-primary/10 border border-primary/20 flex flex-col items-center justify-center gap-xs">
                  <span className="text-body-lg text-primary">WhatsApp Clicks</span>
                  <span className="text-headline-lg text-primary font-bold">{analytics.whatsapp}</span>
                </div>
                <div className="p-md rounded-xl bg-secondary/10 border border-secondary/20 flex flex-col items-center justify-center gap-xs">
                  <span className="text-body-lg text-secondary">Telegram Clicks</span>
                  <span className="text-headline-lg text-secondary font-bold">{analytics.telegram}</span>
                </div>
              </div>

              <div className="mt-md p-md rounded-xl bg-surface-container-low border border-white/5 flex flex-col items-start gap-md">
                <div className="flex items-center gap-sm text-primary">
                  <Lock className="w-5 h-5" />
                  <h3 className="font-headline-sm">Security</h3>
                </div>
                <p className="text-body-md text-on-surface-variant">
                  Update the Admin PIN used to access these settings.
                </p>
                <div className="flex flex-col w-full max-w-[400px] gap-sm">
                  {pinChangeState === "idle" && (
                    <div className="flex gap-sm">
                      <input
                        type="password"
                        placeholder="Enter New PIN"
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value)}
                        className="flex-1 bg-surface border border-white/10 rounded-lg px-sm py-xs text-on-surface focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                      />
                      <button
                        onClick={() => {
                          if (newPin.length < 4) {
                            setPinChangeError("PIN must be at least 4 characters.");
                            return;
                          }
                          setPinChangeError("");
                          setOldPinInput("");
                          setPinChangeState("authorizing");
                        }}
                        className="px-md py-sm rounded-lg bg-primary/20 text-primary font-body-lg hover:bg-primary/30 transition-colors"
                      >
                        Update
                      </button>
                    </div>
                  )}

                  {pinChangeState === "authorizing" && (
                    <div className="flex flex-col gap-sm animate-fade-in-up">
                      <label className="text-body-sm text-on-surface-variant">Enter CURRENT PIN to authorize:</label>
                      <div className="flex gap-sm">
                        <input
                          type="password"
                          placeholder="Current PIN"
                          value={oldPinInput}
                          onChange={(e) => setOldPinInput(e.target.value)}
                          className="flex-1 bg-surface border border-white/10 rounded-lg px-sm py-xs text-on-surface focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                          autoFocus
                        />
                        <button
                          onClick={async () => {
                            if (!oldPinInput) return;
                            setPinChangeState("loading");
                            setPinChangeError("");
                            try {
                              const res = await fetch('/api/update-pin', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ oldPin: oldPinInput, newPin })
                              });
                              const data = await res.json();
                              if (data.success) {
                                setNewPin("");
                                setOldPinInput("");
                                setPinChangeState("success");
                                setTimeout(() => setPinChangeState("idle"), 3000);
                              } else {
                                setPinChangeError(data.error || "Failed to update PIN.");
                                setPinChangeState("authorizing");
                              }
                            } catch (e) {
                              console.error("Error updating PIN", e);
                              setPinChangeError("Network error.");
                              setPinChangeState("authorizing");
                            }
                          }}
                          className="px-md py-sm rounded-lg bg-primary text-on-primary font-body-lg hover:bg-primary/90 transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setPinChangeState("idle")}
                          className="px-md py-sm rounded-lg border border-white/10 text-on-surface-variant hover:bg-white/5 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {pinChangeState === "loading" && (
                    <div className="py-sm text-primary animate-pulse">Updating securely...</div>
                  )}

                  {pinChangeState === "success" && (
                    <div className="py-sm px-md bg-primary/10 border border-primary/20 text-primary rounded-lg animate-fade-in-up flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4" />
                      Admin PIN successfully updated!
                    </div>
                  )}

                  {pinChangeError && (
                    <div className="text-error text-body-sm mt-1 animate-fade-in-up">{pinChangeError}</div>
                  )}
                </div>
              </div>

              <div className="mt-md p-md rounded-xl bg-error/10 border border-error/20 flex flex-col items-start gap-md">
                <div className="flex items-center gap-sm text-error">
                  <ShieldAlert className="w-5 h-5" />
                  <h3 className="font-headline-sm">Danger Zone</h3>
                </div>
                <p className="text-body-md text-error/80">
                  Resetting analytics will clear all tracking metrics permanently across all profiles.
                </p>
                <button
                  onClick={onResetAnalytics}
                  className="flex items-center justify-center gap-xs px-md py-sm rounded-lg bg-error text-on-error font-body-lg hover:bg-error/80 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" /> Reset Data
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {activeTab === "profiles" && (
          <div className="p-md border-t border-white/5 bg-surface flex justify-end gap-sm">
            <button
              onClick={onClose}
              className="px-lg py-sm rounded-lg border border-white/10 text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-colors font-body-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-lg py-sm rounded-lg bg-primary text-on-primary hover:bg-primary/90 transition-colors font-body-lg flex items-center gap-xs shadow-lg shadow-primary/20"
            >
              <Save className="w-4 h-4" /> Save Profiles
            </button>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
};
