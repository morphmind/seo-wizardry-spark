import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { SocialPlatform } from "../types";
import { PLATFORM_CONFIGS } from "../utils/platformUtils";
import { ComingSoon } from "./ComingSoon";
import { ReelsIdeas } from "./reels/ReelsIdeas";

export function ContentIdeas() {
  const [platform, setPlatform] = useState<SocialPlatform>("instagram_reels");

  const renderContent = () => {
    switch (platform) {
      case "instagram_reels":
        return <ReelsIdeas />;
      default:
        return <ComingSoon platform={PLATFORM_CONFIGS[platform].name} />;
    }
  };

  return (
    <div className="space-y-6">
      <Select value={platform} onValueChange={(value: SocialPlatform) => setPlatform(value)}>
        <SelectTrigger>
          <SelectValue placeholder="Platform seçin" />
        </SelectTrigger>
        <SelectContent>
          {Object.keys(PLATFORM_CONFIGS).map((key) => (
            <SelectItem key={key} value={key as SocialPlatform}>
              {PLATFORM_CONFIGS[key as SocialPlatform].name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {renderContent()}
    </div>
  );
}
