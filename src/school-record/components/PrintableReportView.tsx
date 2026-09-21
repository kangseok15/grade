import React, { useState, useEffect } from 'react';
import { StudentProfile, ConversionMethod } from '../types';
import { ConsultationReportContent } from './ConsultationReportContent';
import {
  Printer,
  Download,
  Loader2,
  ArrowLeft,
  FileCheck,
  CheckCircle2,
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

interface PrintableReportViewProps {
  student: StudentProfile;
  allStudents?: StudentProfile[];
  conversionMethod: ConversionMethod;
  onBackToApp?: () => void;
}

export const PrintableReportView: React.FC<PrintableReportViewProps> = ({
  student,
  allStudents = [],
  conversionMethod,
  onBackToApp,
}) => {
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

  const defaultComment = generateCohortComparativeComment(
    student,
    allStudents,
    conversionMethod
  );

  const [teacherComment, setTeacherComment] = useState(defaultComment);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);

  // Auto trigger print dialog once component mounts and layout stabilizes
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        window.print();
      } catch (err) {
        console.warn('Auto print call failed:', err);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handlePrint = () => {
    try {
      window.print();
    } catch {
      handleDownloadPdf();
    }
  };

  const handleDownloadPdf = async () => {
    const element = document.getElementById('consultation-report-sheet');
    if (!element || isGeneratingPdf) return;

    try {
      setIsGeneratingPdf(true);

      const dataUrl = await toPng(element, {
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        skipFonts: true,
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // The sheet is already 210mm x 297mm with built-in 10mm padding
      pdf.addImage(dataUrl, 'PNG', 0, 0, 210, 297, undefined, 'FAST');

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
    } catch (err) {
      console.error('PDF direct generation failed:', err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center">
      {/* Top Floating Control Bar (Hidden on print) */}
      <header className="sticky top-0 z-50 w-full bg-stone-900 text-white shadow-md border-b border-stone-800 print:hidden">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {onBackToApp ? (
              <button
                onClick={onBackToApp}
                className="p-1.5 hover:bg-stone-800 rounded-lg text-stone-300 hover:text-white transition-colors cursor-pointer"
                title="메인 화면으로 이동"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <a
                href={window.location.pathname}
                className="p-1.5 hover:bg-stone-800 rounded-lg text-stone-300 hover:text-white transition-colors"
                title="메인 화면으로 이동"
              >
                <ArrowLeft className="w-5 h-5" />
              </a>
            )}
            <div>
              <h1 className="text-sm font-black text-white flex items-center gap-2">
                <span>숭신고등학교 진로진학상담부 2028 진학상담 리포트</span>
                {pdfSuccess && (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                    <FileCheck className="w-3 h-3" />
                    PDF 다운로드 완료
                  </span>
                )}
              </h1>
              <p className="text-[11px] text-stone-400 font-medium">
                {student.name} 학생 ({student.grade}학년 {student.classNum}반) A4 인쇄 및 고화질 PDF 저장
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black rounded-lg text-xs cursor-pointer shadow-md transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>A4 인쇄 / PDF로 저장 (Ctrl+P)</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-600 text-white font-bold rounded-lg text-xs cursor-pointer transition-all disabled:opacity-60"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>PDF 생성 중...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>PDF 직접 다운로드</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Helpful browser tip bar */}
        <div className="bg-stone-800 border-t border-stone-700 py-1.5 px-4 text-center text-[11px] text-stone-300 font-medium flex items-center justify-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            <strong>브라우저 인쇄 안내:</strong> 인쇄 창(Ctrl+P)에서 <strong>[대상: PDF로 저장]</strong>을 선택하시면 글자가 깨지지 않는 최고 품질의 벡터 A4 PDF로 저장됩니다.
          </span>
        </div>
      </header>

      {/* Printable Sheet Container */}
      <div className="w-full max-w-[210mm] my-2 sm:my-5 px-2 sm:px-4 md:px-0 flex justify-center print:m-0 print:p-0 print:border-none print:shadow-none print:max-w-none print:w-full">
        <div className="w-full max-w-[210mm] print:border-none print:shadow-none print:m-0 print:p-0 print:max-w-none print:w-full">
          <ConsultationReportContent
            student={student}
            allStudents={allStudents}
            conversionMethod={conversionMethod}
            teacherComment={teacherComment}
            onCommentChange={setTeacherComment}
            isPrintView={true}
          />
        </div>
      </div>
    </div>
  );
};
