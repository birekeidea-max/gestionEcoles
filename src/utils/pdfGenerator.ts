import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Utility to convert OKLCH color strings to RGB
 * html2canvas has trouble rendering modern OKLCH color notations.
 */
export function convertModernColorsToRgb(colorStr: string): string {
  if (!colorStr) return colorStr;
  if (colorStr.includes('oklch') || colorStr.includes('oklab')) {
    // Return standard fallsbacks
    if (colorStr.includes('0.627 0.265 149') || colorStr.includes('red-600') || colorStr.includes('rose-600')) return 'rgb(220, 38, 38)';
    if (colorStr.includes('blue-600') || colorStr.includes('sky-500')) return 'rgb(37, 99, 235)';
    if (colorStr.includes('emerald') || colorStr.includes('green-600')) return 'rgb(5, 150, 105)';
    if (colorStr.includes('yellow-400')) return 'rgb(250, 204, 21)';
    return 'rgb(30, 41, 59)'; // slate dark replacement
  }
  return colorStr;
}

/**
 * Downloads any visible HTML element as a PDF document.
 */
export async function downloadElementAsPDF(
  elementId: string,
  filename: string,
  options: { orientation?: 'p' | 'l'; format?: string } = {}
): Promise<boolean> {
  const { orientation = 'p', format = 'a4' } = options;
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return false;
  }

  try {
    // Save original style
    const originalOverflow = element.style.overflow;
    const originalMaxHeight = element.style.maxHeight;
    const originalHeight = element.style.height;

    // Expand
    element.style.overflow = 'visible';
    element.style.maxHeight = 'none';
    element.style.height = 'auto';

    // Override styles to solve OKLCH issues during rendering
    const originalGetComputedStyle = window.getComputedStyle;
    window.getComputedStyle = function (elt, pseudoElt) {
      const style = originalGetComputedStyle.call(window, elt, pseudoElt);
      return new Proxy(style, {
        get(target, prop) {
          if (prop === 'getPropertyValue') {
            return function(propName: string) {
              const val = target.getPropertyValue(propName);
              return convertModernColorsToRgb(val);
            };
          }
          const val = target[prop as any];
          if (typeof val === 'function') {
            return (val as any).bind(target);
          }
          if (typeof val === 'string') {
            return convertModernColorsToRgb(val);
          }
          return val;
        }
      });
    };

    let canvas;
    try {
      canvas = await html2canvas(element, {
        scale: 2, // Retain high density
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
      });
    } finally {
      window.getComputedStyle = originalGetComputedStyle;
    }

    // Restore original styles
    element.style.overflow = originalOverflow;
    element.style.maxHeight = originalMaxHeight;
    element.style.height = originalHeight;

    const imgData = canvas.toDataURL('image/png');

    const pdfWidth = orientation === 'p' ? 210 : 297;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    // Create a custom page-size matching the aspect ratio perfectly with no vertical split cuts
    const pdf = new jsPDF(orientation, 'mm', [pdfWidth, pdfHeight]);
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

    pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
    return true;
  } catch (err) {
    console.error('Error in PDF creation:', err);
    return false;
  }
}

/**
 * Renders both front and back sides of an id-card cleanly together on a single A4 PDF.
 */
export async function downloadStudentCardAsPDF(
  frontId: string,
  backId: string,
  filename: string,
  customTitle: string = "CARTE SCOLAIRE SECURISEE"
): Promise<boolean> {
  const frontEl = document.getElementById(frontId);
  const backEl = document.getElementById(backId);
  if (!frontEl || !backEl) {
    console.error("ID Card elements not ready for rendering", frontId, backId);
    return false;
  }

  try {
    const canvasFront = await html2canvas(frontEl, {
      scale: 3,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#0f172a'
    });

    const canvasBack = await html2canvas(backEl, {
      scale: 3,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#020617'
    });

    const imgFront = canvasFront.toDataURL('image/png');
    const imgBack = canvasBack.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4'); // A4 Portrait: 210 x 297

    const cardW = 100; // Large 10cm card
    const cardH = 60; // 6cm height ratio
    const xOffset = (210 - cardW) / 2; // centered

    // Header layout RDC
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(30, 41, 59);
    pdf.text("REPUBLIQUE DEMOCRATIQUE DU CONGO", 105, 14, { align: 'center' });
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text("MINISTERE DE L'ENSEIGNEMENT PRIMAIRE, SECONDAIRE ET TECHNIQUE (EPST)", 105, 19, { align: 'center' });
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(37, 99, 235);
    pdf.text(customTitle, 105, 25, { align: 'center' });

    // Draw card borders and front
    pdf.setFillColor(248, 250, 252);
    pdf.roundedRect(xOffset - 2, 33, cardW + 4, cardH + 4, 3, 3, 'F');
    pdf.addImage(imgFront, 'PNG', xOffset, 35, cardW, cardH);

    // Verso side
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(30, 41, 59);
    pdf.text("REGLEMENTS SCOLAIRE ET CERTIFICATS DE GARANTIE (VERSO)", 105, 115, { align: 'center' });

    pdf.setFillColor(248, 250, 252);
    pdf.roundedRect(xOffset - 2, 121, cardW + 4, cardH + 4, 3, 3, 'F');
    pdf.addImage(imgBack, 'PNG', xOffset, 123, cardW, cardH);

    // Sceau national footer
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(148, 163, 184);
    pdf.text("Garantie de signature electronique SGESC RDC. Valide pour la session officielle.", 105, 205, { align: 'center' });

    pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
    return true;
  } catch (err) {
    console.error("Failed to generate student card PDF:", err);
    return false;
  }
}

/**
 * Converts a base64 image data-url into a high-quality PDF, fitting the layout perfectly.
 */
export function downloadImageAsPDF(imageDataUrl: string, filename: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.src = imageDataUrl;
      img.onload = () => {
        try {
          const w = img.naturalWidth || img.width || 800;
          const h = img.naturalHeight || img.height || 1100;
          const aspect = h / w;
          
          // Use A4 width (210mm) and calculate height based on original aspect ratio
          const pdfWidth = 210;
          const pdfHeight = pdfWidth * aspect;
          
          // Create PDF with custom page dimensions matching the image's aspect ratio
          const pdf = new jsPDF('p', 'mm', [pdfWidth, pdfHeight]);
          pdf.addImage(imageDataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
          
          const cleanName = filename.endsWith('.pdf') ? filename : `${filename.split('.')[0]}.pdf`;
          pdf.save(cleanName);
          resolve(true);
        } catch (innerErr) {
          console.error("Failed within image onload for PDF", innerErr);
          resolve(false);
        }
      };
      img.onerror = () => {
        try {
          const pdf = new jsPDF('p', 'mm', 'a4');
          pdf.addImage(imageDataUrl, 'PNG', 0, 0, 210, 297);
          const cleanName = filename.endsWith('.pdf') ? filename : `${filename.split('.')[0]}.pdf`;
          pdf.save(cleanName);
          resolve(true);
        } catch (fallbackErr) {
          console.error("Fallback PDF save failed", fallbackErr);
          resolve(false);
        }
      };
    } catch (err) {
      console.error("Error in downloadImageAsPDF:", err);
      resolve(false);
    }
  });
}
