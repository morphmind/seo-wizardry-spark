import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PLATFORM_CONFIGS } from "../utils/platformUtils";
import { SocialPlatform, ImageType } from "../types";

interface PlatformSelectorProps {
  platform: SocialPlatform;
  imageType?: ImageType;
  onPlatformChange: (platform: SocialPlatform) => void;
  onImageTypeChange?: (type: ImageType) => void;
  showImageType?: boolean;
}

export function PlatformSelector({
  platform,
  imageType,
  onPlatformChange,
  onImageTypeChange,
  showImageType = false
}: PlatformSelectorProps) {
  const selectedConfig = PLATFORM_CONFIGS[platform];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Platform</Label>
        <Select value={platform} onValueChange={value => onPlatformChange(value as SocialPlatform)}>
          <SelectTrigger>
            <SelectValue placeholder="Select platform" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(PLATFORM_CONFIGS).map(config => (
              <SelectItem key={config.id} value={config.id}>
                {config.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showImageType && selectedConfig.imageTypes.length > 1 && onImageTypeChange && (
        <div className="space-y-2">
          <Label>Görsel Tipi</Label>
          <Select value={imageType} onValueChange={value => onImageTypeChange(value as ImageType)}>
            <SelectTrigger>
              <SelectValue placeholder="Select image type" />
            </SelectTrigger>
            <SelectContent>
              {selectedConfig.imageTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type === "story" ? "Story" : "Post"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
