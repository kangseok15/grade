import { loadSchoolRecordStudents } from './dataStore';
import { PrintableReportView } from './components/PrintableReportView';

interface SchoolRecordPrintRouteProps {
  studentId: string;
}

// Standalone full-page print/PDF route opened from the 내신 상담 리포트 modal
// (?print=true&studentId=...), independent of the mock-exam ?student=/?print= route.
export function SchoolRecordPrintRoute({ studentId }: SchoolRecordPrintRouteProps) {
  const students = loadSchoolRecordStudents();
  const student = students.find((s) => s.id === studentId) || students[0];

  return (
    <PrintableReportView
      student={student}
      allStudents={students}
      conversionMethod="busan"
      onBackToApp={() => {
        const url = new URL(window.location.href);
        url.searchParams.delete('print');
        url.searchParams.delete('studentId');
        window.location.href = url.pathname;
      }}
    />
  );
}
