import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, RefreshCcw, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { languages } from "@/lib/languages";
import { countries } from "@/lib/countries";
import { FormValues, ArticleHistory } from "./types";
import { cn } from "@/lib/utils";
import { PresetManager } from "./components/PresetManager";
import { ModelAndTypeSelector } from "./components/ModelAndTypeSelector";
import { SEOOptimizationSettings } from "./components/SEOOptimizationSettings";
import { MultimediaSettings } from "./components/MultimediaSettings";
import { ToneAndLanguageSettings } from "./components/ToneAndLanguageSettings";
import { RealTimeDataSettings } from "./components/RealTimeDataSettings";
import { ListicleSettings } from "./components/ListicleSettings";
import { AdditionalSettings } from "./components/AdditionalSettings";
import { CustomPromptSettings } from "./components/CustomPromptSettings";
import { ArticleOutput } from "./components/ArticleOutput";
import { ArticleHistory as ArticleHistoryComponent } from "./components/ArticleHistory";

const defaultCustomSectionPrompt = `Include SEO-Friendly Tables and Lists:
Present information in tables where applicable.
Use bullet points or numbered lists for clarity and optimal SEO.
Format Enhancements:
Use bold formatting for any important keywords.
Use italicized text for emphasis or differentiation.
Incorporate "quote elements" to highlight specific statements or references.
Preservation of Data and Proper Nouns:
Keep all existing tables and retrieve all data accurately (do not omit or alter any information).
Do not translate proper nouns (e.g., names, website names, song titles, artist names) and retain them in their original form.`;

const defaultCustomIntroPrompt = `Use the PAS (Problem-Agitate-Solution) formula to write an engaging introduction for an article about {keyword}. Follow these steps:
Problem: Begin by defining a common problem or challenge your audience faces in relation to {keyword}.
Agitate: Highlight the frustrations or negative consequences of not addressing this problem. Explain what can go wrong or how it can impact the reader if left unresolved.
Solution: Introduce the article as the answer that will help the reader overcome this issue. Emphasize that your content will provide valuable, practical information to guide them toward a resolution.
Ensure the target keyword ({keyword}) is used naturally within the introduction. The goal is to hook the reader from the very beginning, making them eager to discover the solutions you'll present.`;

const NavButton = ({ 
  active, 
  onClick, 
  children 
}: { 
  active: boolean; 
  onClick: () => void; 
  children: React.ReactNode 
}) => (
  <button
    onClick={onClick}
    type="button"
    className={cn(
      "flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-all",
      "hover:bg-[rgb(186,73,73)]/20",
      active ? "bg-[rgb(186,73,73)] text-white shadow-sm" : "bg-accent/30"
    )}
  >
    {children}
  </button>
);

export default function ContentWriter() {
  const { toast } = useToast();
  const [articleId, setArticleId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTab, setSelectedTab] = useState("basic");
  const [articles, setArticles] = useState<ArticleHistory[]>(() => {
    try {
      const saved = localStorage.getItem("article_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const form = useForm<FormValues>({
    defaultValues: {
      preset: "",
      model: "gpt-4o-mini",
      articleType: "blog_post",
      imageOption: "auto",
      imageModel: "premium",
      imageStyle: "illustration",
      imageSize: "1344x768",
      maxImages: 3,
      maxVideos: 2,
      toneOfVoice: "seo_optimized",
      language: "Turkish",
      country: "TR",
      pointOfView: "third_person",
      useRealTimeData: true,
      realTimeSourceFilter: "default",
      citeSources: false,
      useOutlineEditor: false,
      includeFaq: true,
      includeKeyTakeaways: false,
      improveReadability: true,
      seoOptimization: "ai_powered",
      customSearchOperators: "",
      keywords: "",
      urlsToLinkTo: "",
      targetKeyword: "",
      extraTitlePrompt: "",
      extraSectionPrompt: defaultCustomSectionPrompt,
      extraIntroPrompt: defaultCustomIntroPrompt,
      listNumberingFormat: "",
      listItemPrompt: "",
      enableSupplementalInfo: false,
      enableAutoLength: false,
      articleUrl: "",
      enableRewriting: false
    }
  });

  const watchArticleType = form.watch("articleType");
  const watchImageOption = form.watch("imageOption");
  const watchRealTimeSourceFilter = form.watch("realTimeSourceFilter");
  const formValues = form.watch();
	useEffect(() => {
    const currentTab = localStorage.getItem('contentWriterSelectedTab');
    if (currentTab) {
      setSelectedTab(currentTab);
    }

    form.reset({
      preset: "",
      model: "gpt-4o-mini",
      articleType: "blog_post",
      imageOption: "auto",
      imageModel: "premium",
      imageStyle: "illustration",
      imageSize: "1344x768",
      maxImages: 3,
      maxVideos: 2,
      toneOfVoice: "seo_optimized",
      language: "Turkish",
      country: "TR",
      pointOfView: "third_person",
      useRealTimeData: true,
      realTimeSourceFilter: "default",
      citeSources: false,
      useOutlineEditor: false,
      includeFaq: true,
      includeKeyTakeaways: false,
      improveReadability: true,
      seoOptimization: "ai_powered",
      customSearchOperators: "",
      keywords: "",
      urlsToLinkTo: "",
      targetKeyword: "",
      extraTitlePrompt: "",
      extraSectionPrompt: defaultCustomSectionPrompt,
      extraIntroPrompt: defaultCustomIntroPrompt,
      listNumberingFormat: "",
      listItemPrompt: "",
      enableSupplementalInfo: false,
      enableAutoLength: false,
      articleUrl: "",
      enableRewriting: false
    });
  }, [form]);

  useEffect(() => {
    localStorage.setItem('contentWriterFormState', JSON.stringify(formValues));
  }, [formValues]);

  useEffect(() => {
    localStorage.setItem('contentWriterSelectedTab', selectedTab);
  }, [selectedTab]);

  const handleTabChange = (value: string) => {
    setSelectedTab(value);
  };

  const handleSaveToHistory = (article: ArticleHistory) => {
    const exists = articles.some(a => a.id === article.id);
    if (!exists) {
      const newArticles = [article, ...articles];
      setArticles(newArticles);
      try {
        localStorage.setItem("article_history", JSON.stringify(newArticles));
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
        if (error.name === 'QuotaExceededError') {
          const reducedArticles = newArticles.slice(0, -1);
          localStorage.setItem("article_history", JSON.stringify(reducedArticles));
          setArticles(reducedArticles);
        }
      }
    }
  };

  const handleDeleteFromHistory = (id: string) => {
    const newArticles = articles.filter(article => article.id !== id);
    setArticles(newArticles);
    try {
      localStorage.setItem("article_history", JSON.stringify(newArticles));
    } catch (error) {
      console.error('Failed to update localStorage:', error);
    }
  };

  const handlePresetLoad = (preset: Partial<FormValues>) => {
    Object.entries(preset).forEach(([key, value]) => {
      form.setValue(key as keyof FormValues, value, { shouldDirty: true });
    });
  };

  const handlePresetSave = () => {
    return form.getValues();
  };

  const handleReset = () => {
    setArticleId(null);
    form.reset();
  };

  const onSubmit = async (data: FormValues) => {
    const apiKey = localStorage.getItem("koala_api_key");
    if (!apiKey) {
      toast({
        title: "Error",
        description: "Please add your Koala.sh API key in settings",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("https://koala.sh/api/articles/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetKeyword: data.targetKeyword,
          gptVersion: data.model,
          articleType: data.articleType,
          seoOptimizationLevel: data.seoOptimization,
          multimediaOption: data.imageOption,
          imageModel: data.imageModel,
          imageStyle: data.imageStyle,
          imageSize: data.imageSize,
          maxImages: data.maxImages,
          maxVideos: data.maxVideos,
          toneOfVoiceProfile: data.toneOfVoice,
          language: data.language,
          country: data.country,
          realTimeData: data.useRealTimeData,
          shouldCiteSources: data.citeSources,
          includeFaq: data.includeFaq,
          includeKeyTakeaways: data.includeKeyTakeaways,
          readabilityMode: data.improveReadability ? "8th_grade" : "default",
          urls: data.urlsToLinkTo?.split(/[\n,]+/).map(url => url.trim()),
          extraTitlePrompt: data.extraTitlePrompt,
          extraSectionPrompt: data.extraSectionPrompt,
          extraIntroductionPrompt: data.extraIntroPrompt,
          listNumberingFormat: data.listNumberingFormat,
          listItemPrompt: data.listItemPrompt,
          enableSupplementalInformation: data.enableSupplementalInfo,
          enableAutomaticLength: data.enableAutoLength,
          articleUrl: data.articleUrl,
          rewriteAllSourceData: data.enableRewriting
        }),
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const result = await response.json();
      setArticleId(result.articleId);
      toast({
        title: "Success",
        description: "Article creation started successfully. You can track the progress below."
      });
    } catch (error) {
      console.error('API Error:', error);
      toast({
        title: "Error",
        description: "Failed to create article. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container px-4 sm:px-6 lg:px-8 max-w-4xl py-4 sm:py-8">
      {!articleId ? (
        <Card className="w-full">
          {/* Header Section */}
          <CardHeader className="border-b pb-4 mb-6">
            <div className="flex flex-col space-y-3">
              <CardTitle className="text-2xl font-semibold text-[rgb(186,73,73)]">
                Full Content Writer
              </CardTitle>
              <div className="flex flex-col space-y-2">
                <Label className="text-muted-foreground text-sm">Select a Preset</Label>
                <div className="w-full max-w-md">
                  <PresetManager
                    onLoad={handlePresetLoad}
                    onSave={handlePresetSave}
                    currentValues={form.getValues()}
                  />
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Navigation Tabs */}
              <Card className="p-4 bg-accent/10">
                <div className="flex gap-2">
                  <NavButton
                    active={selectedTab === "basic"}
                    onClick={() => handleTabChange("basic")}
                  >
                    Basic Settings
                  </NavButton>
                  <NavButton
                    active={selectedTab === "advanced"}
                    onClick={() => handleTabChange("advanced")}
                  >
                    Advanced Settings
                  </NavButton>
                  <NavButton
                    active={selectedTab === "optimization"}
                    onClick={() => handleTabChange("optimization")}
                  >
                    Optimization
                  </NavButton>
                  <NavButton
                    active={selectedTab === "prompts"}
                    onClick={() => handleTabChange("prompts")}
                  >
                    Custom Prompts
                  </NavButton>
                </div>
              </Card>

              {/* Tab Content */}
              <div className="mt-6">
                {selectedTab === "basic" && (
                  <div className="space-y-6">
                    <ModelAndTypeSelector
                      control={form.control}
                      watchArticleType={watchArticleType}
                    />
                    <MultimediaSettings
                      control={form.control}
                      watchImageOption={watchImageOption}
                    />
                    <ToneAndLanguageSettings
                      control={form.control}
                      languages={languages}
                      countries={countries}
                    />
                  </div>
                )}

                {selectedTab === "advanced" && (
                  <div className="space-y-6">
                    {watchArticleType === "listicle" && (
                      <ListicleSettings control={form.control} />
                    )}
                    <RealTimeDataSettings
                      control={form.control}
                      watchRealTimeSourceFilter={watchRealTimeSourceFilter}
                    />
                    <AdditionalSettings control={form.control} />
                  </div>
                )}

                {selectedTab === "optimization" && (
                  <div className="space-y-6">
                    <SEOOptimizationSettings control={form.control} />
                  </div>
                )}

                {selectedTab === "prompts" && (
                  <div className="space-y-6">
                    <CustomPromptSettings control={form.control} />
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-[rgb(186,73,73)] hover:bg-[rgb(186,73,73)]/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Article...
                  </>
                ) : (
                  <>
<Wand2 className="w-4 h-4 mr-2" />

                    Create Article

                  </>

                )}

              </Button>

              </form>
            </FormProvider>

          </CardContent>

        </Card>

      ) : (

        <>

          <div className="flex justify-end mb-4">

            <Button 

              onClick={handleReset}

              className="bg-[rgb(186,73,73)] hover:bg-[rgb(186,73,73)]/90"

            >

              <RefreshCcw className="w-4 h-4 mr-2" />

              Create New Article

            </Button>

          </div>

          <ArticleOutput 

            articleId={articleId} 

            apiKey={localStorage.getItem("koala_api_key") || ""}

            onClose={() => setArticleId(null)}

            onSaveToHistory={handleSaveToHistory}

          />

        </>

      )}

      <ArticleHistoryComponent

        articles={articles}

        onDelete={handleDeleteFromHistory}

      />

    </div>

  );

}
