import { ContentAnalyzer } from "@/utils/internal-linking/contentAnalyzer";
import { ContentMatcher } from "@/utils/internal-linking/contentMatcher";
import { useToast } from "@/hooks/use-toast";

interface LinkProcessorProps {
    urlDatabase: File | null;
    articleContent: string;
    linkingMethod: "manual" | "auto";
    manualLinkCount: string;
    onProcessComplete: (links: ProcessedLink[], content: string) => void;
    onProgress: (progress: number) => void;
}

export interface ProcessedLink {
    url: string;
    anchorText: string;
    position: string;
    similarityScore: number;
    paragraph: string;
}

export const useContentProcessor = () => {
    const { toast } = useToast();
    const contentMatcher = new ContentMatcher();

    const getParagraphs = (html: string): string[] => {
        const div = document.createElement('div');
        div.innerHTML = html;
        return Array.from(div.querySelectorAll('p'))
            .map(p => p.textContent || '')
            .filter(text => text.trim().length > 0);
    };

    const calculateLinkPositions = (paragraphCount: number, maxLinks: number): number[] => {
        if (paragraphCount < 3) return [];

        // İlk ve son paragrafları atla
        const effectiveParagraphs = Math.floor(paragraphCount * 0.85);
        if (effectiveParagraphs < maxLinks) return [];

        const spacing = Math.floor(effectiveParagraphs / maxLinks);
        const positions = [];

        // İlk linki 3. paragraftan önce ekleme
        let currentPos = Math.max(3, Math.floor(spacing / 2));
        positions.push(currentPos);

        // Diğer linkleri dağıt
        for (let i = 1; i < maxLinks; i++) {
            currentPos += spacing;
            if (i === maxLinks - 1) {
                currentPos = Math.min(currentPos, effectiveParagraphs - 2);
            }
            if (currentPos < paragraphCount - 1) {
                positions.push(currentPos);
            }
        }

        return positions;
    };

    const findBestAnchorText = (paragraph: string, concepts: string[]): string | null => {
        // Her kavramı deneyerek en iyi eşleşmeyi bul
        let bestMatch = null;
        let bestScore = 0;

        for (const concept of concepts) {
            // Kavram paragrafta geçiyor mu?
            const conceptLower = concept.toLowerCase();
            const paragraphLower = paragraph.toLowerCase();
            
            if (paragraphLower.includes(conceptLower)) {
                const position = paragraphLower.indexOf(conceptLower);
                const relativePosition = position / paragraph.length;
                
                // Pozisyon skoru (ortada olması tercih edilir)
                const positionScore = relativePosition >= 0.2 && relativePosition <= 0.8 ? 1 : 0.5;
                
                // Uzunluk skoru (2-5 kelime tercih edilir)
                const wordCount = concept.split(/\s+/).length;
                const lengthScore = wordCount >= 2 && wordCount <= 5 ? 1 : 0.7;
                
                const totalScore = positionScore * lengthScore;
                
                if (totalScore > bestScore) {
                    bestScore = totalScore;
                    // Orijinal metinden eşleşen kısmı al
                    bestMatch = paragraph.substr(position, concept.length);
                }
            }
        }

        return bestMatch;
    };

    const processContent = async ({
        urlDatabase,
        articleContent,
        linkingMethod,
        manualLinkCount,
        onProcessComplete,
        onProgress,
    }: LinkProcessorProps) => {
        if (!urlDatabase || !articleContent.trim()) {
            toast({
                title: "Hata",
                description: "Lütfen URL database dosyasını ve makale içeriğini girin",
                variant: "destructive",
            });
            return;
        }

        try {
            const apiKey = localStorage.getItem("openai_api_key");
            if (!apiKey) {
                toast({
                    title: "Hata",
                    description: "Lütfen OpenAI API anahtarınızı ayarlarda belirtin",
                    variant: "destructive",
                });
                return;
            }

            onProgress(10);
            console.log("İşlem başladı: URL database ve içerik okunuyor");

            // URL veritabanını oku
            const databaseContent = await urlDatabase.text();
            let urlData;
            try {
                urlData = JSON.parse(databaseContent);
            } catch (error) {
                toast({
                    title: "Hata",
                    description: "URL database dosyası geçerli bir JSON formatında değil",
                    variant: "destructive",
                });
                return;
            }

            onProgress(20);
            console.log("URL database okundu:", urlData.length, "URL bulundu");

            // Paragrafları çıkar
            const paragraphs = getParagraphs(articleContent);
            if (paragraphs.length < 3) {
                toast({
                    title: "Hata",
                    description: "Makale çok kısa, en az 3 paragraf gerekli",
                    variant: "destructive",
                });
                return;
            }

            onProgress(30);
            console.log("Makale", paragraphs.length, "paragrafa ayrıldı");

            // İçerik analizi
            const contentAnalyzer = new ContentAnalyzer(apiKey);
            const analysis = await contentAnalyzer.analyzeContent(articleContent);
            onProgress(50);
            console.log("İçerik analizi tamamlandı:", analysis);

            // Link sayısını belirle
            const maxLinks = linkingMethod === "manual"
                ? parseInt(manualLinkCount)
                : Math.max(1, Math.floor(paragraphs.length / 5));

            // Link pozisyonlarını hesapla
            const positions = calculateLinkPositions(paragraphs.length, maxLinks);
            if (!positions.length) {
                toast({
                    title: "Hata",
                    description: "Uygun link pozisyonu bulunamadı",
                    variant: "destructive",
                });
                return;
            }

            // İlgili içerikleri bul
            const relevantContent = contentMatcher.findRelevantContent(
                analysis,
                urlData,
                maxLinks
            );

            onProgress(70);
            console.log("İlgili içerikler bulundu:", relevantContent.length);

            if (!relevantContent.length) {
                toast({
                    description: "İçerikle alakalı link bulunamadı.",
                });
                onProgress(100);
                return;
            }

            // Her ilgili içerik için en uygun pozisyona link ekle
            const processedLinks: ProcessedLink[] = [];
            let modifiedContent = articleContent;

            for (let i = 0; i < Math.min(positions.length, relevantContent.length); i++) {
                const position = positions[i];
                const paragraph = paragraphs[position];
                const url = relevantContent[i];

                // En iyi anchor text'i bul
                const anchorText = findBestAnchorText(paragraph, url.combined_concepts);
                
                if (!anchorText) continue;

                // HTML içinde paragrafı bul ve link ekle
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = modifiedContent;
                const paragraphElements = tempDiv.querySelectorAll('p');

                if (position < paragraphElements.length) {
                    const targetParagraph = paragraphElements[position];
                    const paragraphHtml = targetParagraph.innerHTML;

                    // Link HTML'i oluştur
                    const linkHtml = `<a href="${url.url}" 
                        class="internal-link"
                        title="${anchorText}"
                        data-similarity="${url.similarity}"
                        style="color: var(--primary); text-decoration: underline;">
                            ${anchorText}
                    </a>`;

                    // Paragrafta anchor text'i bul ve değiştir
                    const regex = new RegExp(`(${escapeRegExp(anchorText)})`, 'i');
                    const updatedHtml = paragraphHtml.replace(regex, linkHtml);
                    targetParagraph.innerHTML = updatedHtml;

                    // İşlenmiş içeriği güncelle
                    modifiedContent = tempDiv.innerHTML;

                    // Link bilgisini kaydet
                    processedLinks.push({
                        url: url.url,
                        anchorText,
                        position: `paragraph_${position}`,
                        similarityScore: url.similarity,
                        paragraph
                    });
                }
            }

            onProgress(90);
            console.log("Link pozisyonları belirlendi:", processedLinks);

            onProcessComplete(processedLinks, modifiedContent);
            onProgress(100);

            toast({
                description: `${processedLinks.length} adet link başarıyla eklendi.`,
            });

        } catch (error) {
            console.error('İşlem hatası:', error);
            toast({
                title: "Hata",
                description: String(error),
                variant: "destructive",
            });
        }
    };

    return { processContent };
};

const insertLinks = (content: string, links: ProcessedLink[]): string => {
    if (!links.length) return content;

    const div = document.createElement('div');
    div.innerHTML = content;
    
    const styles = document.createElement('style');
    styles.textContent = `
      .related-content {
        margin: 20px 0;
        padding: 15px;
        background-color: var(--bg-color, #f8f9fa);
        border-left: 3px solid var(--primary-color, #7952b3);
        border-radius: 3px;
        font-style: italic;
        color: var(--text-color, #000000);
        position: relative;
        transition: all 0.3s ease;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      }

      .related-content:hover {
        background-color: var(--bg-hover-color, #f3f4f6);
        transform: translateX(5px);
        box-shadow: 2px 4px 8px rgba(0,0,0,0.1);
      }

      .related-content::before {
        content: '';
        position: absolute;
        top: 0;
        left: -3px;
        height: 100%;
        width: 3px;
        background: linear-gradient(to bottom, #7952b3, #9b6fdf);
        border-radius: 3px 0 0 3px;
        opacity: 0.8;
      }

      .related-content i {
        margin-right: 8px;
        color: var(--primary-color, #7952b3);
        font-size: 1em;
        transition: transform 0.3s ease;
      }

      .related-content:hover i {
        transform: translateX(3px);
      }

      .related-content a {
        color: var(--primary-color, #7952b3);
        text-decoration: none;
        font-weight: 500;
        transition: all 0.2s ease;
        padding: 2px 5px;
        border-radius: 3px;
        background-color: transparent;
      }

      .related-content a:hover {
        background-color: rgba(121, 82, 179, 0.1);
        color: var(--primary-dark-color, #5a3d8c);
      }

      @media (prefers-color-scheme: dark) {
        .related-content {
          --bg-color: rgba(121, 82, 179, 0.1);
          --bg-hover-color: rgba(121, 82, 179, 0.15);
          --text-color: #000000;
          --primary-color: #9b6fdf;
          --primary-dark-color: #b794f4;
        }
      }
    `;
    
    div.appendChild(styles);

    links.forEach(link => {
        const position = parseInt(link.position.split('_')[1]);
        const paragraphs = Array.from(div.querySelectorAll('p'));

        if (position < paragraphs.length) {
            const paragraph = paragraphs[position];

            const linkContainer = document.createElement('div');
            linkContainer.className = 'related-content';

            // Icon ekle
            const icon = document.createElement('i');
            icon.className = 'fa-solid fa-arrow-right';
            linkContainer.appendChild(icon);

            // Pre-text ekle
            if (link.pre_text) {
                const preText = document.createElement('span');
                preText.textContent = link.pre_text + ' ';
                linkContainer.appendChild(preText);
            }

            // Link ekle
            const a = document.createElement('a');
            a.href = link.url;
            a.textContent = link.anchor_text;
            linkContainer.appendChild(a);

            // Post-text ekle
            if (link.post_text) {
                const postText = document.createElement('span');
                postText.textContent = ' ' + link.post_text;
                linkContainer.appendChild(postText);
            }

            paragraph.insertAdjacentElement('afterend', linkContainer);
        }
    });

    return div.innerHTML;
};

function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
