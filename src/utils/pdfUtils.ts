import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { PDFContent, PDFGenerationOptions, IdeaContent } from "@/types/pdf";

// Helper function to convert Turkish characters to their ASCII equivalents
const turkishToAscii = (text: string): string => {
  const charMap: { [key: string]: string } = {
    'ç': 'c', 'Ç': 'C',
    'ğ': 'g', 'Ğ': 'G',
    'ı': 'i', 'İ': 'I',
    'ö': 'o', 'Ö': 'O',
    'ş': 's', 'Ş': 'S',
    'ü': 'u', 'Ü': 'U'
  };
  return text.replace(/[çÇğĞıİöÖşŞüÜ]/g, char => charMap[char] || char);
};

const defaultOptions = {
  margin: 20,
  fontSize: {
    title: 16,
    header: 14,
    content: 12
  },
  lineHeight: 7
};

export const generateContentIdeasPDF = (
  content: PDFContent,
  options: PDFGenerationOptions = defaultOptions
): jsPDF => {
  const pdf = new jsPDF();
  pdf.setLanguage("tr");

  const { margin = 20 } = options;
  const pageWidth = pdf.internal.pageSize.width;
  const contentWidth = pageWidth - (margin * 2);
  let yPos = margin;

  // Add title
  pdf.setFontSize(options.fontSize?.title || 16);
  pdf.text(`Icerik Fikirleri: ${turkishToAscii(content.topic)}`, margin, yPos);
  yPos += 20;

  // Helper function to add content section
  const addContentSection = (ideas: IdeaContent[], header: string) => {
    // Add section header
    pdf.setFontSize(options.fontSize?.header || 14);
    pdf.text(turkishToAscii(header), margin, yPos);
    yPos += 15;

    // Add ideas
    pdf.setFontSize(options.fontSize?.content || 12);
    ideas.forEach((idea, index) => {
      // Check if we need a new page
      if (yPos > pdf.internal.pageSize.height - margin) {
        pdf.addPage();
        yPos = margin;
      }

      // Add idea title
      pdf.setFont("helvetica", "bold");
      const titleText = `${index + 1}. ${turkishToAscii(idea.title)}`;
      const titleLines = pdf.splitTextToSize(titleText, contentWidth);
      pdf.text(titleLines, margin, yPos);
      yPos += titleLines.length * 10;

      // Add idea description
      pdf.setFont("helvetica", "normal");
      const descLines = pdf.splitTextToSize(turkishToAscii(idea.description), contentWidth);
      pdf.text(descLines, margin, yPos);
      yPos += descLines.length * 8;

      yPos += 10; // Add some space between ideas
    });

    yPos += 15; // Add space after section
  };

  // Add GPT-4 content
  addContentSection(content.gpt4Ideas, "Oneriler 1");

  // Add GPT-Mini content
  addContentSection(content.gptMiniIdeas, "Oneriler 2");

  return pdf;
};
