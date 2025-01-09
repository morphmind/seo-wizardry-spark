import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Pencil, 
  Share2, 
  MessageCircle,
  FileText,
  PenTool,
  Image,
  Globe,
  Link
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/components/theme-provider";
import ContentGenerator from "@/components/ContentGenerator";
import ImagePromptGenerator from "@/components/ImagePromptGenerator";
import InternalLinkGenerator from "@/components/InternalLinkGenerator";
import URLAnalyzer from "@/components/URLAnalyzer";
import SocialMedia from "./social-media";
import ContentWriter from "./content-writer";
import { cn } from "@/lib/utils";

// ... MinimalOwlLogo component remains same ...
const MinimalOwlLogo = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 100 100" 
    className="w-12 h-12"
    style={{ color: 'rgb(186,73,73)' }}
  >
    <path 
      d="M30 35 L40 25 L50 35 L60 25 L70 35" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3"
      strokeLinecap="round"
    />
    <circle cx="40" cy="45" r="10" fill="currentColor" />
    <circle cx="60" cy="45" r="10" fill="currentColor" />
    <circle cx="40" cy="45" r="4" fill="white" />
    <circle cx="60" cy="45" r="4" fill="white" />
    <path 
      d="M30 55 
         L35 60 L40 55 L45 60 L50 55 L55 60 L60 55 L65 60 L70 55
         L70 70
         L30 70
         Z" 
      fill="currentColor"
    />
  </svg>
);

const MainNavigationButton = ({
  active,
  onClick,
  icon: Icon,
  children
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 px-6 py-3 rounded-md transition-all",
      "hover:bg-accent/50",
      active ? "bg-[rgb(186,73,73)] text-white font-medium shadow-sm" : "text-foreground"
    )}
  >
    <Icon className={cn("w-4 h-4", active ? "text-white" : "text-foreground")} />
    <span>{children}</span>
  </button>
);

const SubNavigationButton = ({
  active,
  onClick,
  icon: Icon,
  title,
  description
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  title: string;
  description: string;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-col items-center gap-1 p-3 rounded-md transition-all w-full",
      "hover:bg-accent/50 border border-transparent",
      active ? "bg-background shadow-sm border-border" : "hover:border-border/50"
    )}
  >
    <Icon className={cn(
      "w-5 h-5 mb-1",
      active ? "text-[rgb(186,73,73)]" : "text-muted-foreground"
    )} />
    <span className={cn(
      "text-sm font-medium",
      active ? "text-[rgb(186,73,73)]" : "text-foreground"
    )}>
      {title}
    </span>
    <span className="text-xs text-muted-foreground hidden sm:block">
      {description}
    </span>
  </button>
);

const Index = () => {
  const navigate = useNavigate();
  const [mainTab, setMainTab] = useState("content-writer");
  const [contentTab, setContentTab] = useState("content");
  const { theme, setTheme } = useTheme();

  const subNavItems = [
    {
      id: "content",
      title: "Pre-Content",
      description: "İçerik taslağı oluştur",
      icon: FileText
    },
    {
      id: "full-content",
      title: "Full Content",
      description: "Tam içerik yazımı",
      icon: PenTool
    },
    {
      id: "image",
      title: "Image Gen",
      description: "Görsel üretimi",
      icon: Image
    },
    {
      id: "url-analyzer",
      title: "URL Analiz",
      description: "URL içerik analizi",
      icon: Globe
    },
    {
      id: "internal-link",
      title: "Link Builder",
      description: "İç link yapısı",
      icon: Link
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container px-4 sm:px-6 lg:px-8 max-w-4xl py-4 sm:py-8 flex-1">
        <div className="space-y-6">
          {/* Header section remains same */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
            <div className="flex items-center space-x-3">
              <MinimalOwlLogo />
              <span 
                className="text-2xl font-semibold tracking-tight" 
                style={{ 
                  color: 'rgb(186,73,73)',
                  letterSpacing: '0.5px'
                }}
              >
                AI GENIUS
              </span>
            </div>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
                <SettingsIcon className="h-5 w-4" />
              </Button>
            </div>
          </div>

          {/* Main Navigation */}
          <div className="flex justify-center gap-4 py-2">
            <MainNavigationButton
              active={mainTab === "content-writer"}
              onClick={() => setMainTab("content-writer")}
              icon={Pencil}
            >
              İçerik Üretici
            </MainNavigationButton>
            <MainNavigationButton
              active={mainTab === "social-media"}
              onClick={() => setMainTab("social-media")}
              icon={Share2}
            >
              Sosyal Medya
            </MainNavigationButton>
          </div>

          {/* Content Sections with New Sub Navigation */}
          {mainTab === "content-writer" && (
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="p-2 sm:p-6 space-y-6">
                {/* Sub Navigation */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4">
                  {subNavItems.map((item) => (
                    <SubNavigationButton
                      key={item.id}
                      active={contentTab === item.id}
                      onClick={() => setContentTab(item.id)}
                      icon={item.icon}
                      title={item.title}
                      description={item.description}
                    />
                  ))}
                </div>

                {/* Content Area */}
                <div className="pt-4 border-t">
                  {contentTab === "content" && <ContentGenerator />}
                  {contentTab === "full-content" && <ContentWriter />}
                  {contentTab === "image" && <ImagePromptGenerator />}
                  {contentTab === "url-analyzer" && <URLAnalyzer />}
                  {contentTab === "internal-link" && <InternalLinkGenerator />}
                </div>
              </div>
            </div>
          )}

          {mainTab === "social-media" && (
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <SocialMedia />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 mt-8 border-t">
        <div className="container flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open('https://wa.me/905076601593', '_blank')}
            className="text-muted-foreground hover:text-[rgb(186,73,73)] transition-colors flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Destek ve İletişim</span>
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default Index;
