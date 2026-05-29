import { api } from "@/features/auth/lib/api-client";
import { PagedResult, CourseDetailDto } from "../types";

export interface EnrolledCourseDto {
  enrollmentId: string;
  courseId: string;
  title: string;
  subtitle: string | null;
  thumbnailUrl: string | null;
  price: number;
  currency: string;
  totalLectures: number;
  totalDurationMinutes: number;
  averageRating: number;
  level: string;
  courseStatus: string;
  enrollmentStatus: string;
  completedLectures: number;
  progressPercent: number;
  enrolledAt: string;
  completedAt: string | null;
}

export interface VideoStreamingResponse {
  streamUrl: string;
  expiredAt: string;
}

export interface LessonDocumentUrlResponse {
  downloadUrl: string;
  expiredAt: string;
}

export interface QuestionWithoutAnswerDto {
  id: string;
  question: string;
  choices: string[];
  indexOrder: number;
}

export interface QuizQuestionsResponse {
  quizId: string;
  numberOfQuestions: number;
  durationInMinutes: number;
  questions: QuestionWithoutAnswerDto[];
}

export interface ContentProgressDto {
  lessonId: string;
  watchedSeconds: number;
  isCompleted: boolean;
  completedAt: string | null;
  lastWatchedAt: string | null;
}

export interface EnrollmentProgressDto {
  progressPercent: number;
  completedLessons: number;
}

export interface QuizAttemptPreviewDto {
  attemptId: string;
  quizId: string;
  correctAnswers: number;
  totalQuestions: number;
  scorePercent: number;
  attemptedAt: string;
}

export interface ContentProgressResultDto {
  progress: ContentProgressDto;
  enrollment: EnrollmentProgressDto;
  quizAttempt?: QuizAttemptPreviewDto | null;
}

export interface QuizAnswerDto {
  questionId: string;
  selectedIndex: number;
}

export interface ContentProgressCompleteDto {
  watchedSeconds?: number;
  quizAnswers?: QuizAnswerDto[];
}

export async function getMyCourses(params: {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
} = {}): Promise<PagedResult<EnrolledCourseDto>> {
  const query = new URLSearchParams();
  if (params.pageNumber) query.append("pageNumber", String(params.pageNumber));
  if (params.pageSize) query.append("pageSize", String(params.pageSize));
  if (params.search) query.append("search", params.search);
  
  const queryString = query.toString();
  return api<PagedResult<EnrolledCourseDto>>(`/api/my-courses${queryString ? `?${queryString}` : ""}`);
}

export async function getCourseCurriculum(courseId: string): Promise<CourseDetailDto> {
  return api<CourseDetailDto>(`/api/my-courses/${courseId}/curriculum`);
}

export async function getLessonVideoStream(lessonId: string): Promise<VideoStreamingResponse> {
  return api<VideoStreamingResponse>(`/api/my-courses/lessons/${lessonId}/video`);
}

export async function getLessonDocumentDownload(lessonId: string): Promise<LessonDocumentUrlResponse> {
  return api<LessonDocumentUrlResponse>(`/api/my-courses/lessons/${lessonId}/document`);
}

export async function getQuizQuestions(lessonId: string): Promise<QuizQuestionsResponse> {
  return api<QuizQuestionsResponse>(`/api/my-courses/lessons/${lessonId}/quiz-questions`);
}

export async function getLessonProgress(lessonId: string): Promise<ContentProgressDto> {
  return api<ContentProgressDto>(`/api/lessons/${lessonId}/progress`);
}

export async function sendHeartbeat(lessonId: string, watchedSeconds: number): Promise<ContentProgressResultDto> {
  return api<ContentProgressResultDto>(`/api/lessons/${lessonId}/progress/heartbeat`, {
    method: "POST",
    body: JSON.stringify({ watchedSeconds }),
  });
}

export async function markLessonComplete(
  lessonId: string,
  payload: ContentProgressCompleteDto
): Promise<ContentProgressResultDto> {
  return api<ContentProgressResultDto>(`/api/lessons/${lessonId}/progress/complete`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
