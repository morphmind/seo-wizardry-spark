import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface ComingSoonProps {
  platform: string;
}

export function ComingSoon({ platform }: ComingSoonProps) {
  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
          <Clock className="h-12 w-12 text-muted-foreground animate-pulse" />
          <h3 className="text-2xl font-semibold text-muted-foreground">Çok Yakında</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            {platform} için içerik üretme özelliği yakında kullanıma açılacak. 
            Şimdilik Instagram Reels için içerik üretebilirsiniz.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
