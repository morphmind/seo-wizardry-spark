import { ImageGenerationOptions, Orientation } from "../types";
import { logger } from "./logger";

const IMAGE_SIZES = {
  horizontal: { width: 1280, height: 1024 },  // Facebook/Instagram/LinkedIn post
  vertical: { width: 1024, height: 1280 }     // Story/IGTV
};

class ImageService {
  private baseUrl = "https://external.api.recraft.ai/v1/images/generations";

  private validateApiKey(apiKey: string | null): string {
    logger.debug("Validating API key");
    if (!apiKey?.trim()) {
      logger.error("API key not found");
      throw new Error("Lütfen ayarlardan Recraft API anahtarınızı ekleyin");
    }
    
    const trimmedKey = apiKey.trim();
    if (trimmedKey.length < 10) {
      logger.error("API key too short");
      throw new Error("Geçersiz API anahtarı. Lütfen geçerli bir API anahtarı girin.");
    }
    
    logger.debug("API key validation successful");
    return trimmedKey;
  }

  private getImageSize(orientation: Orientation = "horizontal"): string {
    const size = IMAGE_SIZES[orientation];
    return `${size.width}x${size.height}`;
  }

  public async generateImages(
    promptText: string, 
    orientation: Orientation = "horizontal"
  ): Promise<string[]> {
    logger.info("Starting image generation", { promptLength: promptText.length });
    
    try {
      const apiKey = this.validateApiKey(localStorage.getItem("recraft_api_key"));
      const size = this.getImageSize(orientation);

      const requestBody = {
        prompt: promptText,
        size: size,
        n: 2,  // API'den 2 görsel isteyelim
        style: "realistic_image",
        model: "recraftv3",
        response_format: "url"
      };

      logger.debug("Request configuration", { requestBody });

      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "Accept": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      logger.info("Received API response", { 
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        logger.error("API error response", { status: response.status, errorData });
        
        if (response.status === 401) {
          throw new Error("Geçersiz API anahtarı. Lütfen ayarlardan API anahtarınızı kontrol edin.");
        } else if (response.status === 429) {
          throw new Error("Çok fazla istek gönderildi. Lütfen biraz bekleyin.");
        } else if (response.status === 400) {
          const errorMessage = errorData?.error?.message || "Geçersiz istek parametreleri. Lütfen tekrar deneyin.";
          console.error("Detailed error:", errorData);
          throw new Error(errorMessage);
        }
        
        throw new Error(errorData?.error?.message || "Görsel oluşturulamadı. Lütfen tekrar deneyin.");
      }

      const data = await response.json();
      logger.debug("API response data", { 
        imageCount: data.data?.length,
        hasImages: !!data.data?.length 
      });

      if (!data?.data?.length) {
        logger.error("Invalid API response - no images", { data });
        throw new Error("Görsel oluşturulamadı. Lütfen tekrar deneyin.");
      }

      return data.data.map((img: any) => img.url);

    } catch (error) {
      logger.error("Request failed", { error });
      throw error instanceof Error ? error : new Error("Beklenmeyen bir hata oluştu");
    }
  }
}

export const imageService = new ImageService();
