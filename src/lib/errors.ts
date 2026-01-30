// lib/errors.ts
export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
  
      // Wallet errors
      if (message.includes("user rejected") || message.includes("user denied")) {
        return "Transaction cancelled by user";
      }
  
      // Balance errors
      if (message.includes("insufficient")) {
        return "Insufficient SOL balance";
      }
  
      // Program errors
      if (message.includes("soldout")) {
        return "Campaign is sold out";
      }
      if (message.includes("campaignnotactive")) {
        return "Campaign is not active";
      }
      if (message.includes("alreadyclaimed")) {
        return "Pack already claimed";
      }
      if (message.includes("notpackowner")) {
        return "You don't own this pack";
      }
      if (message.includes("invalidproof")) {
        return "Invalid proof - contact support";
      }
      if (message.includes("invalidmintauthority")) {
        return "Invalid mint authority - token not configured correctly";
      }
      if (message.includes("invalidamount")) {
        return "Invalid amount";
      }
  
      // Network errors
      if (message.includes("network") || message.includes("timeout")) {
        return "Network error - please try again";
      }
  
      // API errors
      if (message.includes("not found")) {
        return "Campaign not found";
      }
      if (message.includes("not purchased")) {
        return "Pack not purchased yet";
      }
  
      return error.message;
    }
  
    return "Something went wrong";
  }