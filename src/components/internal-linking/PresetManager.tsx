import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Trash2, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface LinkBuilderPreset {
  id: string;
  name: string;
  urlDatabase?: string;
  linkingMethod: "manual" | "auto";
  manualLinkCount: string;
}

interface PresetManagerProps {
  onLoad: (preset: LinkBuilderPreset) => void;
  onSave: () => LinkBuilderPreset;
  urlDatabase: File | null;
  linkingMethod: "manual" | "auto";
  manualLinkCount: string;
}

export function PresetManager({ onLoad, onSave, urlDatabase, linkingMethod, manualLinkCount }: PresetManagerProps) {
  const [presets, setPresets] = useState<LinkBuilderPreset[]>(() => {
    const saved = localStorage.getItem("link_builder_presets");
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");

  const handleSavePreset = async (name: string, isUpdate = false) => {
    let urlDatabaseText = "";
    
    if (urlDatabase) {
      try {
        urlDatabaseText = await urlDatabase.text();
      } catch (error) {
        console.error("URL database okuma hatası:", error);
      }
    }

    const preset = {
      id: isUpdate ? selectedPreset : crypto.randomUUID(),
      name,
      urlDatabase: urlDatabaseText || undefined,
      linkingMethod,
      manualLinkCount,
    };

    let updatedPresets;
    if (isUpdate) {
      updatedPresets = presets.map(p => p.id === preset.id ? preset : p);
    } else {
      updatedPresets = [...presets, preset];
    }

    setPresets(updatedPresets);
    localStorage.setItem("link_builder_presets", JSON.stringify(updatedPresets));
    setShowNewDialog(false);
    setNewPresetName("");
    setSelectedPreset(preset.id);
    
    toast({
      description: isUpdate ? "Preset güncellendi" : "Yeni preset kaydedildi"
    });
  };

  const handleLoadPreset = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      setSelectedPreset(presetId);
      onLoad(preset);
      toast({
        description: "Preset yüklendi"
      });
    }
  };

  const handleDeletePreset = () => {
    if (selectedPreset) {
      const updatedPresets = presets.filter(preset => preset.id !== selectedPreset);
      setPresets(updatedPresets);
      localStorage.setItem("link_builder_presets", JSON.stringify(updatedPresets));
      setSelectedPreset("");
      toast({
        description: "Preset silindi"
      });
    }
  };

  const handleSaveButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (selectedPreset) {
      const preset = presets.find(p => p.id === selectedPreset);
      if (preset) {
        handleSavePreset(preset.name, true);
      }
    } else {
      setShowNewDialog(true);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <Select value={selectedPreset} onValueChange={handleLoadPreset}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Preset seçin" />
          </SelectTrigger>
          <SelectContent>
            {presets.map((preset) => (
              <SelectItem key={preset.id} value={preset.id}>
                {preset.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button 
          variant="outline" 
          size="icon"
          title="Ayarları Kaydet"
          onClick={handleSaveButtonClick}
        >
          <Save className="h-4 w-4" />
        </Button>

        <Button 
          variant="outline" 
          size="icon"
          title="Yeni Preset"
          onClick={(e) => {
            e.preventDefault();
            setShowNewDialog(true);
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>

        {selectedPreset && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                title="Preset'i Sil"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Preset'i Sil</AlertDialogTitle>
                <AlertDialogDescription>
                  Bu preset'i silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>İptal</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeletePreset}>Sil</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Preset</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Preset Adı</Label>
              <Input
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                placeholder="Preset adını girin"
              />
            </div>
            <Button 
              className="w-full"
              onClick={(e) => {
                e.preventDefault();
                if (newPresetName.trim()) {
                  handleSavePreset(newPresetName);
                }
              }}
            >
              Preset Oluştur
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}