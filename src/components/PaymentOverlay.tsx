import { useEffect } from "react";
import { Card } from "@/components/ui/card";

export function PaymentOverlay() {
  useEffect(() => {
    // Add blur to content
    const content = document.querySelector('.container');
    if (content) {
      content.style.filter = 'blur(8px)';
    }

    return () => {
      const content = document.querySelector('.container');
      if (content) {
        content.style.filter = 'none';
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-[90%] max-w-md p-6 shadow-lg">
        <div className="space-y-4 text-center">
          <h2 className="text-2xl font-bold text-destructive">Payment Required</h2>
          <div className="space-y-2">
            <p className="text-xl font-semibold">$700</p>
            <p className="text-muted-foreground">
              Your payment is due. Please make the payment to continue using the application.
            </p>
          </div>
          <div className="pt-4">
            <p className="text-sm text-muted-foreground">
              Contact support for payment instructions
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
