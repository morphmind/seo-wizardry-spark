import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ContentIdeas } from "./components/ContentIdeas";
import { ImageCreator } from "./components/image-creator/ImageCreator";
import { cn } from "@/lib/utils";
import { MessageSquare, Image } from "lucide-react";

const NavButton = ({ 
  active, 
  onClick, 
  icon: Icon,
  children 
}: { 
  active: boolean; 
  onClick: () => void;
  icon: React.ElementType;
  children: React.ReactNode 
}) => (
  <button
    onClick={onClick}
    type="button"
    className={cn(
      "flex-1 px-6 py-2.5 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2",
      "hover:bg-[rgb(186,73,73)]/20",
      active ? "bg-[rgb(186,73,73)] text-white shadow-sm" : "bg-accent/30"
    )}
  >
    <Icon className="w-4 h-4" />
    {children}
  </button>
);

const SocialMedia = () => {
  const [activeTab, setActiveTab] = useState<"content" | "image">("content");

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <Card className="p-4 bg-accent/10">
        <div className="flex gap-2">
          <NavButton
            active={activeTab === "content"}
            onClick={() => setActiveTab("content")}
            icon={MessageSquare}
          >
            İçerik Fikirleri
          </NavButton>
          <NavButton
            active={activeTab === "image"}
            onClick={() => setActiveTab("image")}
            icon={Image}
          >
            Görsel Oluşturucu
          </NavButton>
        </div>
      </Card>

      {/* Content */}
      {activeTab === "content" && <ContentIdeas />}
      {activeTab === "image" && <ImageCreator />}
    </div>
  );
};

export default SocialMedia;
