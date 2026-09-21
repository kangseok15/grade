import { useEffect, useState } from 'react';
import { Student } from '../types';
import { StudentProfile, CourseRecord, ConversionMethod } from './types';
import { loadSchoolRecordStudents, saveSchoolRecordStudents, findByName, createEmptyProfile } from './dataStore';
import { SchoolRecordNav, SchoolRecordTab } from './SchoolRecordNav';
import { StudentSummaryCard } from './components/StudentSummaryCard';
import { ConsultationReportSection } from './components/ConsultationReportSection';
import { AnalysisHub } from './components/AnalysisHub';
import { SimulatorHub } from './components/SimulatorHub';
import { TranscriptTable } from './components/TranscriptTable';
import { StudentComparisonModal } from './components/StudentComparisonModal';
import { CourseEditModal } from './components/CourseEditModal';
import { ConsultationReportModal } from './components/ConsultationReportModal';
import { generateCohortComparativeComment } from './utils/gradeConversion';
import { Check } from 'lucide-react';

interface SchoolRecordViewProps {
  mockStudent: Student;
}

export function SchoolRecordView({ mockStudent }: SchoolRecordViewProps) {
  const [students, setStudents] = useState<StudentProfile[]>(() => loadSchoolRecordStudents());
  const [activeTab, setActiveTab] = useState<SchoolRecordTab>('report');
  const [gradeSystemMode, setGradeSystemMode] = useState<'5grade' | '9grade' | 'both'>('both');
  const [conversionMethod, setConversionMethod] = useState<ConversionMethod>('busan');
  const [teacherComments, setTeacherComments] = useState<Record<string, string>>({});

  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    saveSchoolRecordStudents(students);
  }, [students]);

  // Keep the 내신 roster in sync with students newly registered on the mock-exam side,
  // and auto-create an empty 내신 profile the first time a student without one is selected.
  useEffect(() => {
    const existing = findByName(students, mockStudent.name);
    if (!existing) {
      const newProfile = createEmptyProfile({
        name: mockStudent.name,
        grade: mockStudent.grade,
        classNum: mockStudent.class,
        studentNum: mockStudent.number,
        track: mockStudent.track,
        school: mockStudent.school,
      });
      setStudents((prev) => [...prev, newProfile]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mockStudent.name]);

  const currentStudent = findByName(students, mockStudent.name) || students[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const currentComment =
    teacherComments[currentStudent.id] !== undefined
      ? teacherComments[currentStudent.id]
      : generateCohortComparativeComment(currentStudent, students, conversionMethod);

  const handleCommentChange = (newComment: string) => {
    setTeacherComments((prev) => ({ ...prev, [currentStudent.id]: newComment }));
  };

  const handleSaveCourse = (course: CourseRecord) => {
    setStudents((prev) =>
      prev.map((st) => {
        if (st.id !== currentStudent.id) return st;
        const exists = st.records.some((r) => r.id === course.id);
        const newRecords = exists
          ? st.records.map((r) => (r.id === course.id ? course : r))
          : [...st.records, course];
        return { ...st, records: newRecords };
      })
    );
    showToast(
      editingCourse
        ? `[${course.subjectName}] 성적이 수정되었습니다.`
        : `[${course.subjectName}] 과목이 성공적으로 추가되었습니다.`
    );
    setEditingCourse(null);
  };

  const handleDeleteCourse = (courseId: string) => {
    setStudents((prev) =>
      prev.map((st) => {
        if (st.id !== currentStudent.id) return st;
        return { ...st, records: st.records.filter((r) => r.id !== courseId) };
      })
    );
    showToast('과목 성적이 삭제되었습니다.');
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in">
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[var(--ink)] text-[var(--paper)] px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold animate-fade-in no-print">
          <Check className="w-4 h-4 text-[var(--accent)]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <SchoolRecordNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        gradeSystemMode={gradeSystemMode}
        onGradeSystemModeChange={setGradeSystemMode}
        onOpenCompare={() => setIsCompareOpen(true)}
        onOpenAddCourse={() => {
          setEditingCourse(null);
          setIsCourseModalOpen(true);
        }}
        onOpenReport={() => setIsReportModalOpen(true)}
      />

      {activeTab !== 'report' && (
        <StudentSummaryCard
          student={currentStudent}
          allStudents={students}
          gradeSystemMode={gradeSystemMode}
          conversionMethod={conversionMethod}
        />
      )}

      {activeTab === 'report' && (
        <ConsultationReportSection
          student={currentStudent}
          allStudents={students}
          conversionMethod={conversionMethod}
          teacherComment={currentComment}
          onCommentChange={handleCommentChange}
        />
      )}

      {activeTab === 'analysis' && (
        <AnalysisHub
          student={currentStudent}
          allStudents={students}
          gradeSystemMode={gradeSystemMode}
          conversionMethod={conversionMethod}
          setConversionMethod={setConversionMethod}
        />
      )}

      {activeTab === 'simulator' && (
        <SimulatorHub student={currentStudent} conversionMethod={conversionMethod} />
      )}

      {activeTab === 'transcript' && (
        <TranscriptTable
          student={currentStudent}
          gradeSystemMode={gradeSystemMode}
          conversionMethod={conversionMethod}
          onEditCourse={(course) => {
            setEditingCourse(course);
            setIsCourseModalOpen(true);
          }}
          onDeleteCourse={handleDeleteCourse}
        />
      )}

      <StudentComparisonModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        students={students}
        currentStudent={currentStudent}
        conversionMethod={conversionMethod}
      />

      <CourseEditModal
        isOpen={isCourseModalOpen}
        onClose={() => {
          setIsCourseModalOpen(false);
          setEditingCourse(null);
        }}
        onSave={handleSaveCourse}
        initialCourse={editingCourse}
      />

      <ConsultationReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        student={currentStudent}
        allStudents={students}
        conversionMethod={conversionMethod}
        teacherComment={currentComment}
        onCommentChange={handleCommentChange}
      />
    </div>
  );
}
