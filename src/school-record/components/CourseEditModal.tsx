import React, { useState, useEffect } from 'react';
import { CourseRecord, SubjectCategory, CourseType, Achievement } from '../types';
import { X, Save, PlusCircle } from 'lucide-react';

interface CourseEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (course: CourseRecord) => void;
  initialCourse?: CourseRecord | null;
}

export const CourseEditModal: React.FC<CourseEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialCourse,
}) => {
  const [semester, setSemester] = useState<string>('2-1');
  const [category, setCategory] = useState<SubjectCategory>('과학');
  const [subjectName, setSubjectName] = useState<string>('');
  const [courseType, setCourseType] = useState<CourseType>('일반');
  const [units, setUnits] = useState<number>(3);
  const [rawScore, setRawScore] = useState<number | ''>(90);
  const [subjectMean, setSubjectMean] = useState<number | ''>(70);
  const [achievement, setAchievement] = useState<Achievement>('A');
  const [rankGrade5, setRankGrade5] = useState<number | ''>(1);
  const [studentCount, setStudentCount] = useState<number | ''>(190);

  useEffect(() => {
    if (initialCourse) {
      setSemester(initialCourse.semester);
      setCategory(initialCourse.category);
      setSubjectName(initialCourse.subjectName);
      setCourseType(initialCourse.courseType);
      setUnits(initialCourse.units);
      setRawScore(initialCourse.rawScore ?? '');
      setSubjectMean(initialCourse.subjectMean ?? '');
      setAchievement(initialCourse.achievement);
      setRankGrade5(initialCourse.rankGrade5 ?? '');
      setStudentCount(initialCourse.studentCount ?? '');
    } else {
      setSubjectName('');
      setUnits(3);
      setRawScore(90);
      setSubjectMean(70);
      setAchievement('A');
      setRankGrade5(1);
    }
  }, [initialCourse, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) return;

    const courseData: CourseRecord = {
      id: initialCourse ? initialCourse.id : `course_${Date.now()}`,
      semester,
      category,
      subjectName: subjectName.trim(),
      courseType,
      units: Number(units) || 1,
      rawScore: rawScore !== '' ? Number(rawScore) : undefined,
      subjectMean: subjectMean !== '' ? Number(subjectMean) : undefined,
      achievement,
      rankGrade5: rankGrade5 !== '' ? Number(rankGrade5) : undefined,
      studentCount: studentCount !== '' ? Number(studentCount) : undefined,
      achievementRatios: initialCourse?.achievementRatios,
    };

    onSave(courseData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-stone-900">
              {initialCourse ? '과목 성적 수정' : '새 과목 성적 등록'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">학기</label>
              <select
                aria-label="학기 선택"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900 font-medium"
              >
                <option value="1-1">1학년 1학기 (1-1)</option>
                <option value="1-2">1학년 2학기 (1-2)</option>
                <option value="2-1">2학년 1학기 (2-1)</option>
                <option value="2-2">2학년 2학기 (2-2)</option>
                <option value="3-1">3학년 1학기 (3-1)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">교과군</label>
              <select
                aria-label="교과군 선택"
                value={category}
                onChange={(e) => setCategory(e.target.value as SubjectCategory)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900 font-medium"
              >
                <option value="국어">국어</option>
                <option value="수학">수학</option>
                <option value="영어">영어</option>
                <option value="사회">사회(역사/도덕)</option>
                <option value="과학">과학</option>
                <option value="기술가정/정보">기술가정/정보</option>
                <option value="제2외국어/한문">제2외국어/한문</option>
                <option value="예술">예술</option>
                <option value="체육">체육</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="font-semibold text-stone-700 block mb-1">과목명 *</label>
              <input
                type="text"
                required
                placeholder="예: 생명과학, 대수, 문학"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900 font-medium"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">과목구분</label>
              <select
                aria-label="과목구분 선택"
                value={courseType}
                onChange={(e) => setCourseType(e.target.value as CourseType)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900 font-medium"
              >
                <option value="공통">공통</option>
                <option value="일반">일반</option>
                <option value="융합">융합</option>
                <option value="진로">진로</option>
                <option value="전문">전문</option>
                <option value="예체">예체</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">단위수</label>
              <input
                type="number"
                min="1"
                max="8"
                required
                value={units}
                onChange={(e) => setUnits(Number(e.target.value))}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900 font-medium"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">원점수</label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="95"
                value={rawScore}
                onChange={(e) => setRawScore(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900 font-medium"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">과목평균</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="74.2"
                value={subjectMean}
                onChange={(e) => setSubjectMean(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900 font-medium"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">성취도</label>
              <select
                aria-label="성취도 선택"
                value={achievement}
                onChange={(e) => setAchievement(e.target.value as Achievement)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900 font-bold"
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="E">E</option>
                <option value="P">P (이수)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-blue-800 block mb-1">
                5등급제 석차등급 (1~5)
              </label>
              <select
                aria-label="5등급제 석차등급 선택"
                value={rankGrade5}
                onChange={(e) => setRankGrade5(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-blue-50/50 border border-blue-300 rounded-lg p-2 text-blue-900 font-bold"
              >
                <option value="">등급 미산출 (P 등)</option>
                <option value="1">1등급 (상위 10%)</option>
                <option value="2">2등급 (10~34%)</option>
                <option value="3">3등급 (34~66%)</option>
                <option value="4">4등급 (66~90%)</option>
                <option value="5">5등급 (90~100%)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">수강자 수</label>
              <input
                type="number"
                min="1"
                placeholder="195"
                value={studentCount}
                onChange={(e) => setStudentCount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900 font-medium"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-stone-900 text-white font-semibold rounded-lg hover:bg-stone-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span>저장하기</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
