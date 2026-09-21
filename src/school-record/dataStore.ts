import { StudentProfile } from './types';
import { SAMPLE_STUDENTS } from './data/sampleStudents';
import { sortStudentsByHakbeon } from './utils/gradeConversion';

const STORAGE_KEY = 'future_talent_school_records_v1';

export function loadSchoolRecordStudents(): StudentProfile[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed: StudentProfile[] = JSON.parse(saved);
      const names = new Set(parsed.map((s) => s.name));
      const missing = SAMPLE_STUDENTS.filter((s) => !names.has(s.name));
      return sortStudentsByHakbeon([...parsed, ...missing]);
    }
  } catch (e) {
    console.warn('Failed to load school-record students from localStorage', e);
  }
  return sortStudentsByHakbeon(SAMPLE_STUDENTS);
}

export function saveSchoolRecordStudents(students: StudentProfile[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  } catch (e) {
    console.warn('Failed to save school-record students to localStorage', e);
  }
}

// Deterministic id for a school-record profile auto-created from the mock-exam roster,
// keyed by student name so the two programs' student pickers stay linked.
export function schoolRecordIdFor(name: string): string {
  return `sr_${name}`;
}

export function findByName(students: StudentProfile[], name: string): StudentProfile | undefined {
  return students.find((s) => s.name === name || s.id === schoolRecordIdFor(name));
}

export function createEmptyProfile(params: {
  name: string;
  grade?: string;
  classNum?: string;
  studentNum?: string;
  track?: '인문' | '자연';
  school?: string;
}): StudentProfile {
  const { name, grade, classNum, studentNum, track, school } = params;
  return {
    id: schoolRecordIdFor(name),
    name,
    school: school || '숭신고등학교',
    grade: Number(grade) || 1,
    classNum: Number(classNum) || 0,
    studentNum: Number(studentNum) || 0,
    track: track ? `${track}계열` : '자연계열',
    records: [],
  };
}
