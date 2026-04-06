import { supabase } from "@/integrations/supabase/client";

export const sendNotification = async (
  title: string,
  body: string,
  url?: string
) => {
  try {
    await supabase.functions.invoke("send-push", {
      body: { title, body, url },
    });
  } catch (err) {
    console.error("Failed to send push notification:", err);
  }
};
