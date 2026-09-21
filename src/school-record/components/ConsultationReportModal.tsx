import React, { useState } from 'react';
import { StudentProfile, ConversionMethod } from '../types';
import { ConsultationReportContent } from './ConsultationReportContent';
import {
  Printer,
  Download,
  Loader2,
  X,
  GraduationCap,
  ExternalLink,
  FileCheck,
  Info,
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import {
  calculateGpaSummary,
  calculateSemesterSummaries,
  calculateSubjectGroupCombinations,
  analyzeTrajectory,
  generateCohortComparativeComment,
} from '../utils/gradeConversion';
import { convertByEducationOffice } from '../data/educationOfficeConversions';

interface ConsultationReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile;
  allStudents?: StudentProfile[];
  conversionMethod: ConversionMethod;
  teacherComment?: string;
  onCommentChange?: (comment: string) => void;
}

export const ConsultationReportModal: React.FC<ConsultationReportModalProps> = ({
  isOpen,
  onClose,
  student,
  allStudents = [],
  conversionMethod,
  teacherComment: propTeacherComment,
  onCommentChange: propOnCommentChange,
}) => {
  if (!isOpen) return null;

  const allSummary = calculateGpaSummary(student.records, conversionMethod);
  const avgSummary = calculateGpaSummary(student.records, 'average');
  const semesterSummaries = calculateSemesterSummaries(student.records, conversionMethod);
  const trajectory = analyzeTrajectory(semesterSummaries);
  const combinations = calculateSubjectGroupCombinations(student.records, 'average');
  const kmesHistComb = combinations.find((c) => c.key === 'korean_math_eng_soc_sci_hist') || combinations[1];

  const officeKey =
    conversionMethod === 'busan' ||
    conversionMethod === 'gyeonggi' ||
    conversionMethod === 'gwangju' ||
    conversionMethod === 'average'
      ? conversionMethod
      : 'average';

  const cumRatio = convertByEducationOffice(allSummary.weightedGpa5, officeKey).cumulativeRatio;
  const distinctSemesters = Array.from(new Set(student.records.map((r) => r.semester))).sort();

  const defaultTeacherComment = generateCohortComparativeComment(
    student,
    allStudents,
    conversionMethod
  );

  const [localTeacherComment, setLocalTeacherComment] = useState(
    propTeacherComment || defaultTeacherComment
  );
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const teacherComment = propTeacherComment ?? localTeacherComment;
  const handleCommentUpdate = (c: string) => {
    setLocalTeacherComment(c);
    if (propOnCommentChange) {
      propOnCommentChange(c);
    }
  };

  const printUrl = `${window.location.origin}${window.location.pathname}?print=true&studentId=${student.id}`;

  const handleDownloadPdf = async () => {
    const page1 = document.getElementById('consultation-report-sheet-p1');
    const page2 = document.getElementById('consultation-report-sheet-p2');
    if ((!page1 && !page2) || isGeneratingPdf) return;

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
      console.error('PDF direct generation error:', err);
      setErrorMessage(
        '아이프레임 보안 제한으로 직접 다운로드가 차단될 수 있습니다. 상단의 [새 창에서 열기 / 인쇄]를 이용하시면 깨끗한 A4 PDF로 바로 저장할 수 있습니다.'
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    try {
      if (window.self !== window.top) {
        window.open(printUrl, '_blank');
        return;
      }
      window.print();
    } catch {
      // In sandboxed iframe, window.print might fail: open new window
      window.open(printUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      {/* Container */}
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-300 w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden animate-fade-in my-auto">
        {/* Modal Top Bar (Hidden on Print) */}
        <div className="p-4 bg-stone-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <GraduationCap className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <h2 className="text-sm font-black tracking-tight text-white flex items-center gap-2">
                <span>숭신고등학교 진로진학상담부 2028 대입 진학상담 리포트</span>
                {pdfSuccess && (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                    <FileCheck className="w-3 h-3" />
                    PDF 다운로드 완료
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-stone-300 font-medium">
                A4 규격 인쇄 및 PDF 저장용 정식 출력 양식 (고대비 가독성 강화)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Primary recommended option: Open in new tab for 100% native vector PDF & print */}
            <a
              href={printUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black rounded-lg text-xs transition-colors shadow-xs"
              title="새 탭에서 열어 브라우저 고화질 PDF 저장 및 A4 출력을 실행합니다."
            >
              <ExternalLink className="w-4 h-4" />
              <span>새 창에서 인쇄 / PDF 저장</span>
            </a>

            {/* In-page direct download */}
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-xs disabled:opacity-60"
              title="A4 규격의 고화질 PDF 파일로 바로 다운로드합니다."
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>PDF 생성 중...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>PDF 직접 저장</span>
                </>
              )}
            </button>

            {/* Standard browser print */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer border border-stone-700"
              title="브라우저 인쇄 대화상자를 호출합니다."
            >
              <Printer className="w-4 h-4 text-stone-300" />
              <span>A4 인쇄</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
              title="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Error message alert if iframe blocks direct generation */}
        {errorMessage && (
          <div className="bg-amber-500/10 border-b border-amber-300 text-amber-900 px-4 py-2 text-xs flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Printable Document Body */}
        <div className="flex-1 overflow-y-auto overflow-x-auto bg-stone-100/70 p-2 sm:p-4 md:p-6 flex justify-center">
          <div className="w-full max-w-[210mm]">
            <ConsultationReportContent
              student={student}
              allStudents={allStudents}
              conversionMethod={conversionMethod}
              teacherComment={teacherComment}
              onCommentChange={handleCommentUpdate}
              isPrintView={false}
            />
          </div>
        </div>

        {/* Modal Bottom Controls */}
        <div className="p-4 bg-stone-100 border-t border-stone-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 print:hidden text-xs">
          <div className="text-stone-600 text-[11px] font-medium leading-tight">
            * 숭신고 미래인재반 전용 양식입니다. 미리보기 창(아이프레임)에서 인쇄창이 열리지 않을 경우{' '}
            <a
              href={printUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-800 font-bold underline hover:text-amber-900 inline-flex items-center gap-0.5 ml-1"
            >
              [새 창에서 인쇄 / PDF 저장]
              <ExternalLink className="w-3 h-3" />
            </a>
            을 누르시면 브라우저의 "PDF로 저장" 기능을 바로 사용하실 수 있습니다.
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold rounded-lg cursor-pointer transition-colors"
            >
              닫기
            </button>
            <a
              href={printUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black rounded-lg cursor-pointer shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>새 창에서 인쇄 / PDF</span>
            </a>
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-black rounded-lg cursor-pointer shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-60"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>PDF 생성 중...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>PDF 직접 저장</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
