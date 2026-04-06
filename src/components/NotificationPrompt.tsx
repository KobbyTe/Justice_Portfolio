import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const VAPID_PUBLIC_KEY = "BGOMUn1yri69sjn-lRzvrFdSlahBuuptRE8dP4f_EaZpLtFjoyPZrUsZH2KLGdlfcZdrlGBV9Q89-qFEL1_iECE";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const NotificationPrompt = () => {
  const [show, setShow] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    // Only show on standalone PWA or if notifications are supported
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;
    if (Notification.permission === "granted" || Notification.permission === "denied") return;
    
    // Don't show in iframe/preview
    try {
      if (window.self !== window.top) return;
    } catch {
      return;
    }

    // Show after a short delay
    const timer = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const subscribe = async () => {
    setSubscribing(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("Notification permission denied");
        setShow(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const subJson = subscription.toJSON();

      await supabase.from("push_subscriptions").upsert(
        {
          endpoint: subJson.endpoint!,
          p256dh: subJson.keys!.p256dh!,
          auth: subJson.keys!.auth!,
          user_agent: navigator.userAgent,
        },
        { onConflict: "endpoint" }
      );

      toast.success("Notifications enabled!");
      setShow(false);
    } catch (err) {
      console.error("Push subscription failed:", err);
      toast.error("Failed to enable notifications");
    } finally {
      setSubscribing(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-sm animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-card border border-border rounded-2xl p-4 shadow-lg flex items-start gap-3">
        <div className="bg-primary/10 p-2 rounded-full shrink-0">
          <Bell className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Enable Notifications</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Get notified about new bookings, comments, and messages.
          </p>
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={subscribe} disabled={subscribing} className="text-xs h-8">
              {subscribing ? "Enabling..." : "Allow"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShow(false)} className="text-xs h-8">
              Not now
            </Button>
          </div>
        </div>
        <button onClick={() => setShow(false)} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default NotificationPrompt;
