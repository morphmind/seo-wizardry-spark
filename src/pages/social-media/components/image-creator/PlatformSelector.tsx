import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { Platform, Orientation } from "../../types";
import { PLATFORMS } from "../../utils/platformUtils";

interface PlatformSelectorProps {
  platform: Platform;
  orientation: Orientation;
  topic: string;
  onPlatformChange: (platform: Platform) => void;
  onOrientationChange: (orientation: Orientation) => void;
  onTopicChange: (topic: string) => void;
  onSubmit: () => void;
  loading: boolean;
}

export function PlatformSelector({
  platform,
  orientation,
  topic,
  onPlatformChange,
  onOrientationChange,
  onTopicChange,
  onSubmit,
  loading
}: PlatformSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Platform</Label>
          <Select value={platform} onValueChange={onPlatformChange}>
            <SelectTrigger>
              <SelectValue placeholder="Platform seçin" />
            </SelectTrigger>
            <SelectContent>
              {PLATFORMS.map(p => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Görsel Yönü</Label>
          <Tabs value={orientation} onValueChange={onOrientationChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="horizontal">Yatay</TabsTrigger>
              <TabsTrigger value="vertical">Dikey</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Konu</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Görsel konusunu girin..."
            value={topic}
            onChange={(e) => onTopicChange(e.target.value)}
            className="flex-1"
          />
          <Button 
            onClick={onSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Promptlar Oluşturuluyor...
              </>
            ) : (
              "Promptları Oluştur"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
