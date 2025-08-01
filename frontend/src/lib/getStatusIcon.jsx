import { Check, CheckCheck } from "lucide-react";

// const AI_USER_ID = "686047cb7a143aecd9fee73d";
// This function returns the appropriate svg icon based on the message status

function getStatusIcon(status, receiverId) {
  // const isAI = receiverId === AI_USER_ID;
  // if (isAI) return null;
  switch (status) {
    case "sent":
      return <Check className="w-4 h-4 text-base-content/40" />;
    case "delivered":
      return <CheckCheck className="w-4 h-4 text-base-content/60" />;
    case "read":
      return <CheckCheck className="w-4 h-4 text-primary text-opacity-100" />;
    default:
      return null;
  }
}

export default getStatusIcon;