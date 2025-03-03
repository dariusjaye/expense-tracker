import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';

/**
 * Converts a PDF file to JPEG images
 * @param pdfBuffer The PDF file as a buffer
 * @param dpi The DPI for rendering (higher means better quality but larger file)
 * @returns An array of JPEG image buffers, one for each page of the PDF
 */
export async function convertPdfToJpeg(
  pdfBuffer: Buffer,
  dpi: number = 300
): Promise<Buffer[]> {
  try {
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfBuffer.buffer);
    const pageCount = pdfDoc.getPageCount();
    
    console.log(`Converting PDF with ${pageCount} pages to JPEG images`);
    
    // We'll use pdf-lib to extract each page as a separate PDF
    // Then use sharp to convert each page PDF to JPEG
    const jpegBuffers: Buffer[] = [];
    
    for (let i = 0; i < pageCount; i++) {
      // Create a new document with just this page
      const singlePageDoc = await PDFDocument.create();
      const [copiedPage] = await singlePageDoc.copyPages(pdfDoc, [i]);
      singlePageDoc.addPage(copiedPage);
      
      // Get the page dimensions
      const page = pdfDoc.getPage(i);
      const { width, height } = page.getSize();
      
      // Calculate pixel dimensions based on DPI
      const pixelWidth = Math.round((width / 72) * dpi);
      const pixelHeight = Math.round((height / 72) * dpi);
      
      // Save the single page as PDF
      const singlePagePdfBytes = await singlePageDoc.save();
      const singlePagePdfBuffer = Buffer.from(singlePagePdfBytes);
      
      // Use sharp to convert the PDF to JPEG
      // Note: Sharp doesn't directly support PDF, so we'll use a workaround
      // by using the PDF as input and specifying the output format as JPEG
      try {
        // Try using sharp with specific settings for PDF
        const jpegBuffer = await sharp(singlePagePdfBuffer, {
          density: dpi,
          pages: 1,
          page: 0,
        })
          .jpeg({
            quality: 90,
            chromaSubsampling: '4:4:4',
          })
          .toBuffer();
        
        jpegBuffers.push(jpegBuffer);
        console.log(`Converted page ${i + 1} to JPEG (${jpegBuffer.length} bytes)`);
      } catch (error) {
        console.error(`Error converting page ${i + 1} to JPEG:`, error);
        throw error;
      }
    }
    
    return jpegBuffers;
  } catch (error) {
    console.error('Error converting PDF to JPEG:', error);
    throw error;
  }
}

/**
 * Detects if a buffer is a PDF file
 * @param buffer The file buffer to check
 * @returns True if the buffer is a PDF file, false otherwise
 */
export function isPdfBuffer(buffer: Buffer): boolean {
  // Check for PDF signature at the beginning of the file
  // PDF files start with "%PDF-"
  if (buffer.length < 5) return false;
  
  const signature = buffer.slice(0, 5).toString();
  return signature === '%PDF-';
} 