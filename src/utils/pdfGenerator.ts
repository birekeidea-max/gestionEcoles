import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Utility to convert OKLCH and OKLAB color strings to RGB/RGBA.
 * html2canvas/jsPDF has trouble rendering modern OKLCH color notations natively.
 */
export function convertModernColorsToRgb(colorStr: string): string {
  if (!colorStr) return colorStr;
  if (!colorStr.includes('oklch') && !colorStr.includes('oklab')) return colorStr;

  // Let's replace any oklch(...) with standard rgb/rgba
  const oklchParse = /oklch\s*\(([^)]+)\)/gi;
  let result = colorStr.replace(oklchParse, (fullMatch, content) => {
    try {
      // Normalise content: replace any '/' or ',' with spaces, and collapse double spaces
      const normalized = content.replace(/[\/,]/g, ' ').replace(/\s+/g, ' ').trim();
      const parts = normalized.split(' ');
      if (parts.length < 3) return fullMatch;
      
      const [lStr, cStr, hStr, aStr] = parts;
      
      let L = lStr.endsWith('%') ? parseFloat(lStr) / 100 : parseFloat(lStr);
      let C = cStr.endsWith('%') ? parseFloat(cStr) / 100 : parseFloat(cStr);
      let H = parseFloat(hStr);
      
      if (hStr.endsWith('rad')) {
        H = H * (180 / Math.PI);
      } else if (hStr.endsWith('turn')) {
        H = H * 360;
      } else if (hStr.endsWith('grad')) {
        H = H * 0.9;
      }
      
      let alpha = 1;
      if (aStr !== undefined) {
        alpha = aStr.endsWith('%') ? parseFloat(aStr) / 100 : parseFloat(aStr);
      }
      
      // Mathematical conversion from OKLCH to sRGB
      const hRad = (H * Math.PI) / 180;
      const aVal = C * Math.cos(hRad);
      const bOklch = C * Math.sin(hRad);

      const l_lms = L + 0.3963377774 * aVal + 0.2158037573 * bOklch;
      const m_lms = L - 0.1055613458 * aVal - 0.0638541728 * bOklch;
      const s_lms = L - 0.0894841775 * aVal - 1.2914855480 * bOklch;

      const l = Math.pow(Math.max(0, l_lms), 3);
      const m = Math.pow(Math.max(0, m_lms), 3);
      const s = Math.pow(Math.max(0, s_lms), 3);

      const r_lin = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
      const g_lin = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
      const b_lin = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

      const reqGamma = (c: number) => {
        if (c <= 0.0031308) {
          return 12.92 * c;
        }
        return 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
      };

      let rVal = Math.round(Math.min(1, Math.max(0, reqGamma(r_lin))) * 255);
      let gVal = Math.round(Math.min(1, Math.max(0, reqGamma(g_lin))) * 255);
      let bResultVal = Math.round(Math.min(1, Math.max(0, reqGamma(b_lin))) * 255);

      if (aStr !== undefined) {
        return `rgba(${rVal}, ${gVal}, ${bResultVal}, ${alpha})`;
      }
      return `rgb(${rVal}, ${gVal}, ${bResultVal})`;
    } catch (e) {
      console.error("Failed to convert OKLCH:", e);
      return fullMatch;
    }
  });

  // Let's do the same for oklab(...)
  const oklabParse = /oklab\s*\(([^)]+)\)/gi;
  result = result.replace(oklabParse, (fullMatch, content) => {
    try {
      const normalized = content.replace(/[\/,]/g, ' ').replace(/\s+/g, ' ').trim();
      const parts = normalized.split(' ');
      if (parts.length < 3) return fullMatch;
      
      const [lStr, aStrVal, bStrVal, alphaStr] = parts;
      
      let L = lStr.endsWith('%') ? parseFloat(lStr) / 100 : parseFloat(lStr);
      let aVal = aStrVal.endsWith('%') ? parseFloat(aStrVal) / 100 : parseFloat(aStrVal);
      let bOklab = bStrVal.endsWith('%') ? parseFloat(bStrVal) / 100 : parseFloat(bStrVal);
      let alpha = 1;
      if (alphaStr) {
        alpha = alphaStr.endsWith('%') ? parseFloat(alphaStr) / 100 : parseFloat(alphaStr);
      }

      const l_lms = L + 0.3963377774 * aVal + 0.2158037573 * bOklab;
      const m_lms = L - 0.1055613458 * aVal - 0.0638541728 * bOklab;
      const s_lms = L - 0.0894841775 * aVal - 1.2914855480 * bOklab;

      const l = Math.pow(Math.max(0, l_lms), 3);
      const m = Math.pow(Math.max(0, m_lms), 3);
      const s = Math.pow(Math.max(0, s_lms), 3);

      const r_lin = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
      const g_lin = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
      const b_lin = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

      const reqGamma = (c: number) => {
        if (c <= 0.0031308) return 12.92 * c;
        return 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
      };

      let rVal = Math.round(Math.min(1, Math.max(0, reqGamma(r_lin))) * 255);
      let gVal = Math.round(Math.min(1, Math.max(0, reqGamma(g_lin))) * 255);
      let bResultVal = Math.round(Math.min(1, Math.max(0, reqGamma(b_lin))) * 255);

      if (alphaStr !== undefined) {
        return `rgba(${rVal}, ${gVal}, ${bResultVal}, ${alpha})`;
      }
      return `rgb(${rVal}, ${gVal}, ${bResultVal})`;
    } catch (e) {
      console.error("Failed to convert OKLAB:", e);
      return fullMatch;
    }
  });

  return result;
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
        scale: 3, // Retain very high density for ultra sharp details
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        scrollX: 0,
        scrollY: 0,
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
    // Override styles to solve OKLCH/OKLAB issues during rendering
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

    let canvasFront;
    let canvasBack;
    try {
      canvasFront = await html2canvas(frontEl, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#0f172a'
      });

      canvasBack = await html2canvas(backEl, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#020617'
      });
    } finally {
      window.getComputedStyle = originalGetComputedStyle;
    }

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
    pdf.text("Garantie de signature electronique SyGEC RDC. Valide pour la session officielle.", 105, 205, { align: 'center' });

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
      img.crossOrigin = 'anonymous';
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

          // Draw the loaded image onto canvas to format it strictly as a standard PNG data URL.
          // This avoids "wrong PNG signature" errors for relative images, SVGs, JPEGs or webps.
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          let base64ToUse = imageDataUrl;
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            base64ToUse = canvas.toDataURL('image/png');
          }
          
          pdf.addImage(base64ToUse, 'PNG', 0, 0, pdfWidth, pdfHeight);
          
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
