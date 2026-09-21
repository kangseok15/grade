import React, { useState } from 'react';
import { StudentProfile, ConversionMethod } from '../types';
import { ConsultationReportContent } from './ConsultationReportContent';
import {
  Printer,
  Download,
  Loader2,
  ExternalLink,
  FileCheck,
  Info,
  Building2,
  Sparkles,
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

interface ConsultationReportSectionProps {
  student: StudentProfile;
  allStudents?: StudentProfile[];
  conversionMethod: ConversionMethod;
  teacherComment: string;
  onCommentChange: (comment: string) => void;
}

export const ConsultationReportSection: React.FC<ConsultationReportSectionProps> = ({
  student,
  allStudents = [],
  conversionMethod,
  teacherComment,
  onCommentChange,
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const printUrl = `${window.location.origin}${window.location.pathname}?print=true&studentId=${encodeURIComponent(student.id)}`;

  const handlePrint = () => {
    try {
      if (window.self !== window.top) {
        window.open(printUrl, '_blank');
        return;
      }
      window.print();
    } catch {
      window.open(printUrl, '_blank');
    }
  };

  const handleDownloadPdf = async () => {
    const page1 = document.getElementById('consultation-report-sheet-p1');
    const page2 = document.getElementById('consultation-report-sheet-p2');
    if (!page1 && !page2) return;

    try {
      setIsGeneratingPdf(true);
      setErrorMessage(null);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      if (page1) {
        const dataUrl1 = await toPng(page1, {
          quality: 0.98,
          pixelRatio: 2,
          backgroundColor: '#ffffff',
          skipFonts: true,
        });
        pdf.addImage(dataUrl1, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
      }

      if (page2) {
        if (page1) pdf.addPage('a4', 'portrait');
        const dataUrl2 = await toPng(page2, {
          quality: 0.98,
          pixelRatio: 2,
          backgroundColor: '#ffffff',
          skipFonts: true,
        });
        pdf.addImage(dataUrl2, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
      }

      const fileName = `숭신고_진로진학상담부_2028진학상담리포트_${student.name}.pdf`;
      const blob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }, 1500);

      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 5000);
    } catch (err: any) {
      console.error('PDF generation error:', err);
      setErrorMessage(
        '직접 다운로드 시 오류가 발생한 경우 상단의 [새 창에서 열기 / 인쇄]를 이용하시면 깨끗한 A4 PDF로 바로 저장할 수 있습니다.'
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Action & Guidance Strip (Hidden on Print) */}
      <div className="bg-[var(--ink)] text-white rounded-xl p-3 sm:p-4 shadow-sm border border-[var(--border-strong)] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[var(--accent)]/20 text-[var(--accent)] flex items-center justify-center font-bold shrink-0">
            <Building2 className="w-5 h-5 text-[var(--accent)]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-black tracking-tight text-white">
                {student.name} 학생 2028 대입 진학상담 종합 리포트
              </h2>
              <span className="text-[10px] bg-[var(--accent)] text-white font-black px-2 py-0.5 rounded-full">
                A4 1페이지 정식 양식
              </span>
              {pdfSuccess && (
                <span className="inline-flex items-center gap-1 text-[10px] bg-[var(--good)]/20 text-[var(--good)] px-2 py-0.5 rounded-full font-bold">
                  <FileCheck className="w-3 h-3" />
                  PDF 저장 완료
                </span>
              )}
            </div>
            <p className="text-[11px] text-[var(--muted)] font-medium mt-0.5">
              5등급제 종합 성적 • 9등급 환산 • 미래인재반 비교(70~100점 척도) • 학기별 추이 • 지도교사 상담의견
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap self-end md:self-auto shrink-0">
          <a
            href={printUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--ink)] hover:bg-[var(--ink-secondary)] text-[var(--paper)] hover:text-white font-bold rounded-lg text-xs transition-colors border border-[var(--border-strong)]"
            title="새 탭에서 열어 브라우저 고화질 PDF 저장 및 A4 출력을 실행합니다."
          >
            <ExternalLink className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>새 창에서 열기</span>
          </a>

          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--korean)] hover:bg-[var(--korean)] text-white font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-xs disabled:opacity-60"
            title="A4 규격 고화질 PDF 파일로 바로 다운로드합니다."
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>생성 중...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>PDF 직접 저장</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[var(--accent)] hover:bg-[var(--accent)]/80 text-white font-black rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
            title="브라우저 인쇄 대화상자(Ctrl+P)를 호출하여 A4 출력 또는 PDF로 저장합니다."
          >
            <Printer className="w-4 h-4" />
            <span>A4 인쇄 / PDF 저장</span>
          </button>
        </div>
      </div>

      {/* Tip Bar */}
      <div className="bg-[var(--accent-soft)] border border-[var(--accent)]/80 rounded-lg py-2 px-3 text-xs text-[var(--accent)] flex items-center justify-between gap-2 print:hidden">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--accent)] shrink-0" />
          <span className="text-[11.5px] font-medium leading-tight">
            <strong>실시간 작성 안내:</strong> 아래 <strong>[4. 지도교사 종합 상담 의견]</strong> 영역을 클릭하여 학생별 맞춤 지도 의견을 직접 입력하신 후 인쇄하시면 인쇄물에 그대로 반영됩니다.
          </span>
        </div>
        <span className="text-[10px] text-[var(--accent)] font-bold shrink-0 hidden sm:inline">
          학생부 5등급제 & 9등급제 환산 통합
        </span>
      </div>

      {errorMessage && (
        <div className="bg-[var(--critical)]/10 border border-[var(--critical)]/25 text-[var(--critical)] px-4 py-2 text-xs rounded-lg flex items-center gap-2 print:hidden">
          <Info className="w-4 h-4 text-[var(--critical)] shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Centered A4 Report Paper Frame */}
      <div className="bg-[var(--surface-alt)]/70 p-2 sm:p-5 md:p-8 rounded-2xl border border-[var(--border)]/80 flex justify-center overflow-x-auto shadow-inner print:p-0 print:m-0 print:border-none print:bg-[var(--surface)] print:shadow-none">
        <div className="w-full max-w-[210mm] print:border-none print:shadow-none print:m-0 print:p-0 print:w-full print:max-w-none">
          <ConsultationReportContent
            student={student}
            allStudents={allStudents}
            conversionMethod={conversionMethod}
            teacherComment={teacherComment}
            onCommentChange={onCommentChange}
            isPrintView={false}
          />
        </div>
      </div>
    </div>
  );
};
