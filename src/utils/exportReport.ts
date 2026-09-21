import * as htmlToImage from 'html-to-image';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

export interface ExportProgress {
  status:
    | 'idle'
    | 'capturing_page1'
    | 'capturing_page2'
    | 'capturing_page3'
    | 'generating_pdf'
    | 'downloading'
    | 'done'
    | 'error';
  message: string;
}

export interface ExportResult {
  page1DataUrl?: string;
  page2DataUrl?: string;
  page3DataUrl?: string;
  pdfBlobUrl?: string;
  fileName: string;
}

/**
 * Robustly captures an HTML element to a high-resolution PNG data URL
 * Uses a 3-tier fallback to ensure maximum compatibility with modern CSS (OKLCH, CSS vars, SVG charts)
 */
export async function captureElementToPng(element: HTMLElement): Promise<string> {
  // Filter out any elements marked with .no-export or .no-print
  const filter = (node: Node) => {
    if (node instanceof HTMLElement) {
      if (node.classList?.contains('no-export') || node.classList?.contains('no-print')) {
        return false;
      }
    }
    return true;
  };

  // Tier 1: html-to-image with full fidelity
  try {
    const dataUrl = await htmlToImage.toPng(element, {
      quality: 0.98,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      filter,
    });
    if (dataUrl && dataUrl.length > 200) {
      return dataUrl;
    }
  } catch (err) {
    console.warn('html-to-image tier 1 failed, trying skipFonts tier 2:', err);
  }

  // Tier 2: html-to-image skipping external font fetching (bypasses CORS font restrictions)
  try {
    const dataUrl = await htmlToImage.toPng(element, {
      quality: 0.98,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      skipFonts: true,
      filter,
    });
    if (dataUrl && dataUrl.length > 200) {
      return dataUrl;
    }
  } catch (err) {
    console.warn('html-to-image tier 2 failed, falling back to html2canvas-pro tier 3:', err);
  }

  // Tier 3: html2canvas-pro (native support for oklch, lab, color-mix)
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: 1120,
    ignoreElements: (el) => el.classList?.contains('no-export') || el.classList?.contains('no-print'),
  });

  return canvas.toDataURL('image/png', 1.0);
}

/**
 * Ultra memory-efficient element capture using JPEG compression and high-definition resolution.
 * Configured with pixelRatio: 2.0 and quality: 0.95 for crisp, clear text while preventing browser OOM crashes.
 * Enforces fixed width and no-wrap styling during capture to strictly eliminate line breaks.
 */
export async function captureElementToJpeg(
  element: HTMLElement,
  pixelRatio: number = 2.0,
  quality: number = 0.95
): Promise<{ dataUrl: string; width: number; height: number }> {
  const filter = (node: Node) => {
    if (node instanceof HTMLElement) {
      if (node.classList?.contains('no-export') || node.classList?.contains('no-print')) {
        return false;
      }
    }
    return true;
  };

  const clientW = element.offsetWidth || 1120;
  const clientH = element.offsetHeight || 1580;

  // Temporarily force light theme during rendering so PDF/image output is never dark/black
  const htmlEl = document.documentElement;
  const currentTheme = htmlEl.getAttribute('data-theme');
  const wasDark = currentTheme === 'dark';
  if (wasDark) {
    htmlEl.setAttribute('data-theme', 'light');
  }

  try {
    // Tier 1: html-to-image toJpeg with explicit dimensions and no-wrap styling
    try {
      const dataUrl = await htmlToImage.toJpeg(element, {
        quality,
        pixelRatio,
        backgroundColor: '#ffffff',
        filter,
        skipFonts: true,
        width: clientW,
        height: clientH,
        style: {
          width: `${clientW}px`,
          maxWidth: `${clientW}px`,
          margin: '0',
          backgroundColor: '#ffffff',
          color: '#0f172a',
        },
      });
      if (dataUrl && dataUrl.length > 200) {
        return { dataUrl, width: clientW, height: clientH };
      }
    } catch (err) {
      console.warn('html-to-image toJpeg tier 1 failed, trying html2canvas fallback:', err);
    }

    // Tier 2: html2canvas-pro with JPEG compression
    const canvas = await html2canvas(element, {
      scale: pixelRatio,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: clientW || 1120,
      ignoreElements: (el) => el.classList?.contains('no-export') || el.classList?.contains('no-print'),
    });

    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    const w = canvas.width;
    const h = canvas.height;

    // Crucial: immediately shrink canvas to 1x1 to release GPU texture buffers in Chromium
    canvas.width = 1;
    canvas.height = 1;

    return { dataUrl, width: w, height: h };
  } finally {
    if (wasDark) {
      htmlEl.setAttribute('data-theme', 'dark');
    }
  }
}

/**
 * Triggers browser file download, with iframe fallback safety
 */
export function triggerFileDownload(dataUrlOrBlobUrl: string, fileName: string): boolean {
  try {
    const link = document.createElement('a');
    link.href = dataUrlOrBlobUrl;
    link.download = fileName;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
    }, 500);
    return true;
  } catch (e) {
    console.error('File download failed:', e);
    return false;
  }
}

/**
 * Sanitizes strings for safe filenames
 */
export function sanitizeFileName(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, '_').trim();
}

/**
 * Export Page 1, Page 2, and optional Page 3 (모의고사 분석 리포트) as a combined A4 PDF
 */
export async function exportReportToPdf(
  page1Element: HTMLElement,
  page2Element: HTMLElement,
  page3Element?: HTMLElement | null,
  studentName: string = '학생',
  examLabel: string = '모의고사',
  onProgress?: (progress: ExportProgress) => void
): Promise<ExportResult> {
  try {
    onProgress?.({ status: 'capturing_page1', message: '1페이지 (성적 개요 및 추이) 렌더링 중...' });
    const page1Data = await captureElementToJpeg(page1Element, 2.0, 0.95);

    onProgress?.({ status: 'capturing_page2', message: '2페이지 (세부영역 및 오답 분석) 렌더링 중...' });
    const page2Data = await captureElementToJpeg(page2Element, 2.0, 0.95);

    let page3Data: { dataUrl: string; width: number; height: number } | undefined;
    if (page3Element) {
      onProgress?.({ status: 'capturing_page3', message: '3페이지 (모의고사 분석 리포트) 렌더링 중...' });
      page3Data = await captureElementToJpeg(page3Element, 2.0, 0.95);
    }

    const totalPages = page3Data ? 3 : 2;
    onProgress?.({ status: 'generating_pdf', message: `A4 규격 ${totalPages}페이지 PDF 생성 중...` });

    // Initialize A4 PDF (210 x 297 mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm
    const margin = 8; // 8mm margin
    const usableW = pageWidth - margin * 2; // 194mm
    const usableH = pageHeight - margin * 2; // 281mm

    const addPdfPage = (data: { dataUrl: string; width: number; height: number }, isFirst: boolean) => {
      if (!isFirst) {
        pdf.addPage('a4', 'portrait');
      }
      const ratio = data.height / (data.width || 1);
      let imgH = usableW * ratio;
      let imgW = usableW;
      if (imgH > usableH) {
        imgW = usableH / ratio;
        imgH = usableH;
      }
      const posX = margin + (usableW - imgW) / 2;
      const posY = margin + (usableH - imgH) / 2;
      pdf.addImage(data.dataUrl, 'JPEG', posX, posY, imgW, imgH, undefined, 'FAST');
    };

    // Page 1
    addPdfPage(page1Data, true);

    // Page 2
    addPdfPage(page2Data, false);

    // Page 3 (AI Consulting Report)
    if (page3Data) {
      addPdfPage(page3Data, false);
    }

    onProgress?.({ status: 'downloading', message: 'PDF 저장 중...' });

    const safeStudent = sanitizeFileName(studentName || '학생');
    const safeExam = sanitizeFileName(examLabel || '모의고사');
    const fileName = `[숭신고_미래인재반]_${safeStudent}_${safeExam}_성적분석표.pdf`;

    const blob = pdf.output('blob');
    const pdfBlobUrl = URL.createObjectURL(blob);
    triggerFileDownload(pdfBlobUrl, fileName);

    onProgress?.({ status: 'done', message: `${totalPages}페이지 PDF 다운로드가 완료되었습니다!` });

    return {
      page1DataUrl: page1Data.dataUrl,
      page2DataUrl: page2Data.dataUrl,
      page3DataUrl: page3Data?.dataUrl,
      pdfBlobUrl,
      fileName,
    };
  } catch (error) {
    console.error('PDF Export Error:', error);
    onProgress?.({ status: 'error', message: 'PDF 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' });
    throw error;
  }
}

/**
 * Creates an empty A4 PDF document
 */
export function createA4Pdf(): jsPDF {
  return new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });
}

/**
 * Appends 1st, 2nd, and optional 3rd page of a student report into an existing jsPDF document.
 * Uses ultra low-memory JPEG compression and direct aspect calculations to prevent tab crashes.
 */
export async function appendReportPagesToPdf(
  pdf: jsPDF,
  page1Element: HTMLElement,
  page2Element: HTMLElement,
  page3Element?: HTMLElement | null,
  isFirstStudentInDoc: boolean = false
): Promise<number> {
  const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
  const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm
  const margin = 8;
  const usableW = pageWidth - margin * 2; // 194mm
  const usableH = pageHeight - margin * 2; // 281mm

  const addPageImage = async (element: HTMLElement, isFirst: boolean) => {
    if (!isFirst) {
      pdf.addPage('a4', 'portrait');
    }

    const { dataUrl, width, height } = await captureElementToJpeg(element, 2.0, 0.95);
    const ratio = height / (width || 1);
    let imgH = usableW * ratio;
    let imgW = usableW;
    if (imgH > usableH) {
      imgW = usableH / ratio;
      imgH = usableH;
    }
    const posX = margin + (usableW - imgW) / 2;
    const posY = margin + (usableH - imgH) / 2;

    pdf.addImage(dataUrl, 'JPEG', posX, posY, imgW, imgH, undefined, 'FAST');

    // Yield control so Chrome GC can reclaim canvas memory
    await new Promise((r) => setTimeout(r, 80));
  };

  await addPageImage(page1Element, isFirstStudentInDoc);
  await addPageImage(page2Element, false);

  let count = 2;
  if (page3Element) {
    await addPageImage(page3Element, false);
    count = 3;
  }
  return count;
}

/**
 * Export a single page as PNG image (Page 1, 2, or 3)
 */
export async function exportPageToImage(
  element: HTMLElement,
  studentName: string,
  examLabel: string,
  pageNumber: 1 | 2 | 3,
  onProgress?: (progress: ExportProgress) => void
): Promise<ExportResult> {
  try {
    const pageDesc =
      pageNumber === 1
        ? '1페이지 (성적 추이)'
        : pageNumber === 2
        ? '2페이지 (오답 분석)'
        : '3페이지 (모의고사 분석 리포트)';
    onProgress?.({
      status: pageNumber === 1 ? 'capturing_page1' : pageNumber === 2 ? 'capturing_page2' : 'capturing_page3',
      message: `${pageDesc} 고해상도 렌더링 중...`,
    });

    const imgData = await captureElementToPng(element);

    onProgress?.({ status: 'downloading', message: `${pageDesc} 이미지 다운로드 중...` });

    const safeStudent = sanitizeFileName(studentName || '학생');
    const safeExam = sanitizeFileName(examLabel || '모의고사');
    const suffix =
      pageNumber === 1
        ? '1페이지_성적개요및추이'
        : pageNumber === 2
        ? '2페이지_세부영역및오답분석'
        : '3페이지_모의고사분석리포트';
    const fileName = `[숭신고_미래인재반]_${safeStudent}_${safeExam}_${suffix}.png`;

    triggerFileDownload(imgData, fileName);

    onProgress?.({ status: 'done', message: `${pageDesc} 이미지 저장이 완료되었습니다!` });

    return {
      page1DataUrl: pageNumber === 1 ? imgData : undefined,
      page2DataUrl: pageNumber === 2 ? imgData : undefined,
      page3DataUrl: pageNumber === 3 ? imgData : undefined,
      fileName,
    };
  } catch (error) {
    console.error('Image Export Error:', error);
    onProgress?.({ status: 'error', message: '이미지 저장 중 오류가 발생했습니다.' });
    throw error;
  }
}

/**
 * Export all pages (1, 2, and optional 3) as separate PNG images
 */
export async function exportAllPagesToImages(
  page1Element: HTMLElement,
  page2Element: HTMLElement,
  page3Element?: HTMLElement | null,
  studentName: string = '학생',
  examLabel: string = '모의고사',
  onProgress?: (progress: ExportProgress) => void
): Promise<ExportResult> {
  try {
    onProgress?.({ status: 'capturing_page1', message: '1페이지 렌더링 중...' });
    const imgData1 = await captureElementToPng(page1Element);

    onProgress?.({ status: 'capturing_page2', message: '2페이지 렌더링 중...' });
    const imgData2 = await captureElementToPng(page2Element);

    let imgData3: string | undefined;
    if (page3Element) {
      onProgress?.({ status: 'capturing_page3', message: '3페이지 렌더링 중...' });
      imgData3 = await captureElementToPng(page3Element);
    }

    const safeStudent = sanitizeFileName(studentName || '학생');
    const safeExam = sanitizeFileName(examLabel || '모의고사');

    const fn1 = `[숭신고_미래인재반]_${safeStudent}_${safeExam}_1페이지_성적개요및추이.png`;
    const fn2 = `[숭신고_미래인재반]_${safeStudent}_${safeExam}_2페이지_세부영역및오답분석.png`;

    triggerFileDownload(imgData1, fn1);
    await new Promise((r) => setTimeout(r, 600));
    triggerFileDownload(imgData2, fn2);

    if (imgData3) {
      await new Promise((r) => setTimeout(r, 600));
      const fn3 = `[숭신고_미래인재반]_${safeStudent}_${safeExam}_3페이지_모의고사분석리포트.png`;
      triggerFileDownload(imgData3, fn3);
    }

    const totalPages = imgData3 ? '1·2·3페이지' : '1·2페이지';
    onProgress?.({ status: 'done', message: `${totalPages} 이미지 저장이 모두 완료되었습니다!` });

    return {
      page1DataUrl: imgData1,
      page2DataUrl: imgData2,
      page3DataUrl: imgData3,
      fileName: `[숭신고_미래인재반]_${safeStudent}_${safeExam}_성적분석표`,
    };
  } catch (error) {
    console.error('Batch Image Export Error:', error);
    onProgress?.({ status: 'error', message: '이미지 일괄 저장 중 오류가 발생했습니다.' });
    throw error;
  }
}

export const exportBothPagesToImages = exportAllPagesToImages;

/**
 * Copies a PNG data URL directly to clipboard
 */
export async function copyDataUrlToClipboard(dataUrl: string): Promise<boolean> {
  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    if (navigator.clipboard && navigator.clipboard.write) {
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob,
        }),
      ]);
      return true;
    }
    return false;
  } catch (e) {
    console.warn('Clipboard copy failed:', e);
    return false;
  }
}

/**
 * Export AI Consulting Report as a standalone multi-page A4 PDF
 */
export async function exportAiReportToPdf(
  element: HTMLElement,
  studentName: string,
  examLabel: string,
  onProgress?: (progress: ExportProgress) => void
): Promise<ExportResult> {
  try {
    onProgress?.({ status: 'capturing_page1', message: '모의고사 분석 리포트 고해상도 렌더링 중...' });
    const imgData = await captureElementToPng(element);

    onProgress?.({ status: 'generating_pdf', message: 'A4 규격 리포트 PDF 생성 중...' });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm
    const margin = 10;
    const usableW = pageWidth - margin * 2; // 190mm
    const usableH = pageHeight - margin * 2; // 277mm

    const imgDims = await new Promise<{ w: number; h: number }>((resolve) => {
      const img = new window.Image();
      img.onload = () => resolve({ w: img.width, h: img.height });
      img.onerror = () => resolve({ w: 800, h: 1000 });
      img.src = imgData;
    });

    const ratio = imgDims.h / imgDims.w;
    const renderedH = usableW * ratio;

    if (renderedH <= usableH) {
      const posY = margin + Math.max(0, (usableH - renderedH) / 4);
      pdf.addImage(imgData, 'PNG', margin, posY, usableW, renderedH, undefined, 'FAST');
    } else {
      let remainingH = renderedH;
      let yOffset = 0;
      let pageNum = 1;

      while (remainingH > 0) {
        if (pageNum > 1) {
          pdf.addPage('a4', 'portrait');
        }

        pdf.addImage(
          imgData,
          'PNG',
          margin,
          margin - yOffset,
          usableW,
          renderedH,
          undefined,
          'FAST'
        );

        yOffset += usableH;
        remainingH -= usableH;
        pageNum++;
      }
    }

    onProgress?.({ status: 'downloading', message: 'PDF 저장 중...' });

    const safeStudent = sanitizeFileName(studentName || '학생');
    const safeExam = sanitizeFileName(examLabel || '모의고사');
    const fileName = `[숭신고_미래인재반]_${safeStudent}_${safeExam}_모의고사_분석리포트.pdf`;

    const blob = pdf.output('blob');
    const pdfBlobUrl = URL.createObjectURL(blob);
    triggerFileDownload(pdfBlobUrl, fileName);

    onProgress?.({ status: 'done', message: '모의고사 분석 리포트 PDF 저장이 완료되었습니다!' });

    return {
      pdfBlobUrl,
      page1DataUrl: imgData,
      fileName,
    };
  } catch (error) {
    console.error('AI Report PDF Export Error:', error);
    onProgress?.({ status: 'error', message: '리포트 PDF 저장 중 오류가 발생했습니다.' });
    throw error;
  }
}

/**
 * Export AI Consulting Report as a PNG image
 */
export async function exportAiReportToImage(
  element: HTMLElement,
  studentName: string,
  examLabel: string,
  onProgress?: (progress: ExportProgress) => void
): Promise<ExportResult> {
  try {
    onProgress?.({ status: 'capturing_page1', message: '리포트 이미지 렌더링 중...' });
    const imgData = await captureElementToPng(element);

    const safeStudent = sanitizeFileName(studentName || '학생');
    const safeExam = sanitizeFileName(examLabel || '모의고사');
    const fileName = `[숭신고_미래인재반]_${safeStudent}_${safeExam}_모의고사_분석리포트.png`;

    triggerFileDownload(imgData, fileName);
    onProgress?.({ status: 'done', message: '리포트 이미지 저장이 완료되었습니다!' });

    return {
      page1DataUrl: imgData,
      fileName,
    };
  } catch (error) {
    console.error('AI Report Image Export Error:', error);
    onProgress?.({ status: 'error', message: '리포트 이미지 저장 중 오류가 발생했습니다.' });
    throw error;
  }
}

/**
 * Export Cohort Statistics Dashboard (미래인재반 학생별 진단 통계 분석표) as an A4 PDF
 * Default: 1-page A4 completed PDF (or optional 2-page separated PDF)
 */
export async function exportCohortDashboardToPdf(
  page1Element: HTMLElement,
  page2Element?: HTMLElement | null,
  grade: string = '1',
  examLabel: string = '모의고사',
  onProgress?: (progress: ExportProgress) => void
): Promise<ExportResult> {
  const isTwoPage = Boolean(page2Element);
  onProgress?.({
    status: 'generating_pdf',
    message: isTwoPage ? '진단 통계 분석표 2페이지 PDF 생성 중...' : '진단 통계 분석표 1페이지 PDF 생성 중...',
  });

  const htmlEl = document.documentElement;
  const currentTheme = htmlEl.getAttribute('data-theme');
  const wasDark = currentTheme === 'dark';
  if (wasDark) {
    htmlEl.setAttribute('data-theme', 'light');
  }

  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm
    const margin = 7;
    const usableW = pageWidth - margin * 2; // 196mm
    const usableH = pageHeight - margin * 2; // 283mm

    const addSectionToPdf = async (el: HTMLElement, isFirst: boolean) => {
      if (!isFirst) {
        pdf.addPage('a4', 'portrait');
      }
      const { dataUrl, width, height } = await captureElementToJpeg(el, 2.0, 0.95);
      const ratio = height / (width || 1);
      let imgH = usableW * ratio;
      let imgW = usableW;
      if (imgH > usableH) {
        imgH = usableH;
        imgW = usableH / ratio;
      }
      const posX = margin + (usableW - imgW) / 2;
      const posY = margin + (usableH - imgH) / 2;
      pdf.addImage(dataUrl, 'JPEG', posX, posY, imgW, imgH, undefined, 'FAST');
    };

    if (!isTwoPage) {
      // 📄 1-Page completed PDF
      onProgress?.({ status: 'capturing_page1', message: '통계 분석표 1페이지 렌더링 중...' });
      await addSectionToPdf(page1Element, true);
    } else {
      // 📄 2-Page separated PDF
      onProgress?.({ status: 'capturing_page1', message: '1면(지표 및 오답분석) 렌더링 중...' });
      await addSectionToPdf(page1Element, true);

      onProgress?.({ status: 'capturing_page2', message: '2면(학생별 일람표) 렌더링 중...' });
      if (page2Element) {
        await addSectionToPdf(page2Element, false);
      }
    }

    const safeGrade = grade === 'all' ? '전체학년' : `${grade}학년`;
    const safeExam = sanitizeFileName(examLabel || '종합');
    const suffix = isTwoPage ? '_(2페이지)' : '';
    const fileName = `[숭신고_미래인재반]_${safeGrade}_통계분석표_${safeExam}${suffix}.pdf`;

    const blob = pdf.output('blob');
    const pdfBlobUrl = URL.createObjectURL(blob);
    triggerFileDownload(pdfBlobUrl, fileName);

    onProgress?.({
      status: 'done',
      message: isTwoPage
        ? '통계 분석표 2페이지 PDF 다운로드가 완료되었습니다!'
        : '통계 분석표 1페이지 PDF 다운로드가 완료되었습니다!',
    });

    return {
      pdfBlobUrl,
      fileName,
    };
  } catch (error) {
    console.error('Cohort Dashboard PDF Export Error:', error);
    onProgress?.({ status: 'error', message: '통계표 PDF 생성 중 오류가 발생했습니다.' });
    throw error;
  } finally {
    if (wasDark) {
      htmlEl.setAttribute('data-theme', 'dark');
    }
  }
}
