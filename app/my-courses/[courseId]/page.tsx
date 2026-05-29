"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Check,
  Flame,
  Download
} from "lucide-react";
import {
  getCourseCurriculum,
  getLessonVideoStream,
  getLessonDocumentDownload,
  getQuizQuestions,
  getLessonProgress,
  sendHeartbeat,
  markLessonComplete,
  QuizQuestionsResponse,
  QuizAnswerDto,
  QuizAttemptPreviewDto
} from "@/features/courses/lib/my-courses-api";
import { CourseDetailDto, CourseLessonDto } from "@/features/courses/types";
import VideoPlayer from "@/app/components/video-player";

// Split subcomponents
import StudyRoomHeader from "./components/study-room-header";
import StudyRoomTabs from "./components/study-room-tabs";
import StudyRoomCurriculumSidebar from "./components/study-room-curriculum-sidebar";
import StudyRoomQuizPlayer from "./components/study-room-quiz-player";
import ScenarioMetadataCard from "./components/scenario-metadata-card";

export default function CourseStudyRoom() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.courseId as string;

  // Course Details State
  const [course, setCourse] = useState<CourseDetailDto | null>(null);
  const [activeLesson, setActiveLesson] = useState<CourseLessonDto | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  
  // Progress states
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({});
  const [overallProgress, setOverallProgress] = useState({
    progressPercent: 0,
    completedLectures: 0,
  });

  // UI States
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Active Content States
  const [videoStreamUrl, setVideoStreamUrl] = useState<string | null>(null);
  const [videoTokenExpiry, setVideoTokenExpiry] = useState<string | null>(null);
  const [documentDownloadUrl, setDocumentDownloadUrl] = useState<string | null>(null);
  
  // Quiz active states
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestionsResponse | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<QuizAttemptPreviewDto | null>(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);



  // Video Heartbeat ref
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastHeartbeatSecondsRef = useRef<number>(0);

  // Load Course and initial curriculum
  const loadCourseData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const curriculum = await getCourseCurriculum(courseId);
      setCourse(curriculum);

      // Expand all sections by default
      const initialExpanded: Record<string, boolean> = {};
      curriculum.sections.forEach((sec) => {
        initialExpanded[sec.id] = true;
      });
      setExpandedSections(initialExpanded);

      // Select first lesson by default if available
      let firstLesson: CourseLessonDto | null = null;
      for (const section of curriculum.sections) {
        if (section.lessons.length > 0) {
          firstLesson = section.lessons[0];
          break;
        }
      }
      
      // Load completed lessons list and overall progress from the fetched curriculum
      const initialCompleted: Record<string, boolean> = {};
      let completedCount = 0;
      curriculum.sections.forEach((sec) => {
        sec.lessons.forEach((les) => {
          if (les.progress?.isCompleted) {
            initialCompleted[les.id] = true;
            completedCount++;
          }
        });
      });
      setCompletedLessons(initialCompleted);

      setOverallProgress({
        progressPercent: curriculum.totalLectures > 0 
          ? (completedCount / curriculum.totalLectures) * 100 
          : 0,
        completedLectures: completedCount
      });

      if (firstLesson) {
        setActiveLesson(firstLesson);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to load course details. Ensure you are enrolled.");
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) {
      loadCourseData();
    }
  }, [courseId, loadCourseData]);

  // Clean up heartbeats on unmount or lesson change
  const clearHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    lastHeartbeatSecondsRef.current = 0;
  }, []);

  useEffect(() => {
    return () => clearHeartbeat();
  }, [clearHeartbeat]);

  // Load content for active lesson
  const loadLessonContent = useCallback(async (lesson: CourseLessonDto) => {
    setIsLoadingContent(true);
    clearHeartbeat();
    
    // Reset specific content states
    setVideoStreamUrl(null);
    setDocumentDownloadUrl(null);
    setQuizQuestions(null);
    setQuizStarted(false);
    setQuizResult(null);
    setSelectedAnswers({});

    try {
      // 1. Get Progress for the lesson
      const progress = await getLessonProgress(lesson.id);
      if (progress.isCompleted) {
        setCompletedLessons(prev => ({ ...prev, [lesson.id]: true }));
      }

      // 2. Fetch resource specific urls / questions
      if (lesson.resourceType === "Video") {
        const streamData = await getLessonVideoStream(lesson.id);
        setVideoStreamUrl(streamData.streamUrl);
        setVideoTokenExpiry(streamData.expiredAt);
        lastHeartbeatSecondsRef.current = progress.watchedSeconds || 0;
      } else if (lesson.resourceType === "Document") {
        const docData = await getLessonDocumentDownload(lesson.id);
        setDocumentDownloadUrl(docData.downloadUrl);
      } else if (lesson.resourceType === "Quiz") {
        const quizData = await getQuizQuestions(lesson.id);
        setQuizQuestions(quizData);
      }
    } catch (err) {
      console.error("Failed to load lesson content:", err);
    } finally {
      setIsLoadingContent(false);
    }
  }, [clearHeartbeat]);

  useEffect(() => {
    if (activeLesson) {
      loadLessonContent(activeLesson);
    }
  }, [activeLesson, loadLessonContent]);

  // Sync overall progress dynamically based on local completedLessons state and course sections lessons
  useEffect(() => {
    if (!course) return;
    
    // Count all lessons across all sections of the course
    const total = course.sections.reduce((acc, sec) => acc + sec.lessons.length, 0);
    
    // Count how many of these lessons are completed in local state
    const completed = course.sections.reduce(
      (acc, sec) => acc + sec.lessons.filter((les) => completedLessons[les.id] === true).length,
      0
    );

    setOverallProgress({
      progressPercent: total > 0 ? (completed / total) * 100 : 0,
      completedLectures: completed
    });
  }, [completedLessons, course]);

  // Trigger heartbeat for video progress tracking
  const handleVideoTimeUpdate = useCallback(async (currentTime: number, duration: number) => {
    if (!activeLesson || activeLesson.resourceType !== "Video") return;

    const currentSec = Math.floor(currentTime);
    // Send heartbeat every 10 seconds of new watch duration
    if (currentSec > 0 && currentSec % 10 === 0 && currentSec !== lastHeartbeatSecondsRef.current) {
      lastHeartbeatSecondsRef.current = currentSec;
      try {
        const result = await sendHeartbeat(activeLesson.id, currentSec);
        
        // Update sidebar and overall progress
        if (result.progress.isCompleted) {
          setCompletedLessons(prev => ({ ...prev, [activeLesson.id]: true }));
        }
        setOverallProgress({
          progressPercent: result.enrollment.progressPercent,
          completedLectures: result.enrollment.completedLessons
        });
      } catch (err) {
        console.error("Failed to post video heartbeat progress:", err);
      }
    }
  }, [activeLesson]);

  // Handle video complete or manual complete
  const handleMarkComplete = async () => {
    if (!activeLesson) return;
    
    setIsLoadingContent(true);
    try {
      const payload = {
        watchedSeconds: activeLesson.resourceType === "Video" ? lastHeartbeatSecondsRef.current : 0
      };
      
      const result = await markLessonComplete(activeLesson.id, payload);
      
      // Update local completed state
      setCompletedLessons(prev => ({ ...prev, [activeLesson.id]: true }));
      setOverallProgress({
        progressPercent: result.enrollment.progressPercent,
        completedLectures: result.enrollment.completedLessons
      });
    } catch (err: any) {
      alert(err?.message || "Failed to mark lesson complete.");
    } finally {
      setIsLoadingContent(false);
    }
  };

  // Submit Quiz
  const handleQuizSubmit = async () => {
    if (!activeLesson || !quizQuestions) return;

    const quizAnswersList: QuizAnswerDto[] = quizQuestions.questions.map((q) => ({
      questionId: q.id,
      selectedIndex: selectedAnswers[q.id] !== undefined ? selectedAnswers[q.id] : -1,
    }));

    // Ensure all questions are answered
    const unanswered = quizAnswersList.some(ans => ans.selectedIndex === -1);
    if (unanswered) {
      alert("Please answer all questions before submitting.");
      return;
    }

    setIsSubmittingQuiz(true);
    try {
      const result = await markLessonComplete(activeLesson.id, {
        watchedSeconds: 0,
        quizAnswers: quizAnswersList,
      });

      // Update local completed state
      setCompletedLessons(prev => ({ ...prev, [activeLesson.id]: true }));
      setOverallProgress({
        progressPercent: result.enrollment.progressPercent,
        completedLectures: result.enrollment.completedLessons
      });

      if (result.quizAttempt) {
        setQuizResult(result.quizAttempt);
      }
    } catch (err: any) {
      alert(err?.message || "Failed to submit quiz.");
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  // Toggle curriculum section
  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  // Launch VR Scenario — navigate to pair-device page
  const handleLaunchVR = () => {
    router.push("/pair-device");
  };

  // Navigate to Next/Prev lesson
  const navigateLesson = useCallback((direction: "prev" | "next") => {
    if (!course || !activeLesson) return;

    const allLessons = course.sections.flatMap((s) => s.lessons);
    const currentIndex = allLessons.findIndex((l) => l.id === activeLesson.id);

    if (direction === "prev" && currentIndex > 0) {
      setActiveLesson(allLessons[currentIndex - 1]);
    } else if (direction === "next" && currentIndex < allLessons.length - 1) {
      setActiveLesson(allLessons[currentIndex + 1]);
    }
  }, [course, activeLesson]);

  // Keyboard navigation for switching lessons
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in inputs/editable content
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      if (!course || !activeLesson) return;

      const isVideo = activeLesson.resourceType === "Video";
      const isModifierPressed = e.ctrlKey || e.altKey;

      if (e.key === "ArrowLeft") {
        if (isModifierPressed || !isVideo) {
          e.preventDefault();
          navigateLesson("prev");
        }
      } else if (e.key === "ArrowRight") {
        if (isModifierPressed || !isVideo) {
          e.preventDefault();
          navigateLesson("next");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [course, activeLesson, navigateLesson]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white">
        <Loader2 className="w-12 h-12 text-brand-primary animate-spin mb-4" />
        <p className="text-slate-400 font-medium">Preparing your study room...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-6 text-center">
        <div className="bg-red-950/40 border border-red-900/50 p-8 rounded-3xl max-w-md shadow-2xl">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error Accessing Study Room</h2>
          <p className="text-slate-300 mb-6">{error || "Could not fetch curriculum data."}</p>
          <button
            onClick={() => router.push("/my-courses")}
            className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-hover px-6 py-3 rounded-xl font-bold transition-all shadow-lg text-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const allLessons = course.sections.flatMap((s) => s.lessons);
  const currentLessonIndex = activeLesson ? allLessons.findIndex((l) => l.id === activeLesson.id) : -1;
  const isFirstLesson = currentLessonIndex === 0;
  const isLastLesson = currentLessonIndex === allLessons.length - 1;

  return (
    <div className="flex flex-col h-screen bg-brand-bg text-brand-text font-sans overflow-hidden">
      {/* Top Navigation Bar */}
      <StudyRoomHeader
        courseTitle={course.title}
        categoryName={course.categoryName}
        completedCount={overallProgress.completedLectures}
        totalLessons={course.totalLectures}
        progressPercent={overallProgress.progressPercent}
      />

      {/* Main Study Split Panel */}
      <div className="flex flex-col md:flex-row flex-grow overflow-hidden relative">
        {/* Left/Center Panel: Media Player & Content */}
        <div className="flex-grow overflow-y-auto bg-brand-bg p-4 md:p-8">
          {activeLesson ? (
            <div className="max-w-5xl mx-auto w-full flex flex-col gap-6">
              
              {/* Media Container: rounded box, aspect-video, md:h-[65vh], border-brand-border, shadow-md */}
              <div className="relative flex items-center w-full">
                {/* Previous Lesson Left Arrow Overlay */}
                <button
                  disabled={isFirstLesson}
                  onClick={() => navigateLesson("prev")}
                  className="hidden xl:flex absolute -left-16 z-20 w-11 h-11 rounded-full bg-white hover:bg-brand-primary border border-brand-border hover:border-transparent text-brand-text hover:text-white items-center justify-center transition-all cursor-pointer shadow-sm hover:shadow-md disabled:opacity-30 disabled:pointer-events-none hover:scale-105 active:scale-95"
                  title="Previous Lesson"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="relative w-full aspect-video md:h-[65vh] md:aspect-auto rounded-2xl overflow-hidden bg-black shadow-md border border-brand-border flex flex-col justify-center">
                  {isLoadingContent ? (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                      <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
                    </div>
                  ) : null}

                  {/* VIDEO RESOURCE */}
                  {activeLesson.resourceType === "Video" && videoStreamUrl && (
                    <VideoPlayer
                      src={videoStreamUrl}
                      onTimeUpdate={handleVideoTimeUpdate}
                      onEnded={handleMarkComplete}
                    />
                  )}

                  {/* DOCUMENT RESOURCE */}
                  {activeLesson.resourceType === "Document" && (
                    <div className="absolute inset-0 flex flex-col bg-white">
                      {documentDownloadUrl ? (
                        <div className="flex flex-col h-full w-full">
                          {/* Header Bar inside viewer */}
                          <div className="flex items-center justify-between px-4 py-2 bg-brand-soft border-b border-brand-border flex-shrink-0">
                            <span className="text-xs font-bold text-brand-text uppercase tracking-wider">Document Preview</span>
                            <a
                              href={documentDownloadUrl}
                              download
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-brand-text hover:text-brand-primary bg-white border border-brand-border hover:bg-brand-soft px-3 py-1.5 rounded-lg transition-all"
                            >
                              <Download className="w-3.5 h-3.5 text-brand-primary" />
                              Download PDF
                            </a>
                          </div>
                          {/* Embedded PDF Viewer */}
                          <iframe
                            src={documentDownloadUrl}
                            className="flex-grow w-full h-full border-none bg-brand-bg"
                            title={activeLesson.title}
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full">
                          <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* VR SCENARIO RESOURCE */}
                  {activeLesson.resourceType === "Scenario" && (
                    <div className="absolute inset-0 overflow-y-auto bg-brand-bg">
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                        {(activeLesson.scenarioId || activeLesson.resourceId) ? (
                          <ScenarioMetadataCard
                            scenarioId={(activeLesson.scenarioId || activeLesson.resourceId)!}
                            lessonTitle={activeLesson.title}
                          />
                        ) : (
                          <div className="p-8 bg-white border border-dashed border-brand-border rounded-2xl text-center text-sm text-brand-muted">
                            <span className="material-symbols-outlined text-4xl block mb-3 opacity-40">vrpano</span>
                            No additional metadata available for this scenario.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* QUIZ RESOURCE */}
                  {activeLesson.resourceType === "Quiz" && quizQuestions && (
                    <StudyRoomQuizPlayer
                      quizQuestions={quizQuestions}
                      quizStarted={quizStarted}
                      setQuizStarted={setQuizStarted}
                      currentQuestionIndex={currentQuestionIndex}
                      setCurrentQuestionIndex={setCurrentQuestionIndex}
                      selectedAnswers={selectedAnswers}
                      setSelectedAnswers={setSelectedAnswers}
                      quizResult={quizResult}
                      setQuizResult={setQuizResult}
                      isSubmittingQuiz={isSubmittingQuiz}
                      handleQuizSubmit={handleQuizSubmit}
                    />
                  )}
                </div>

                {/* Next Lesson Right Arrow Overlay */}
                <button
                  disabled={isLastLesson}
                  onClick={() => navigateLesson("next")}
                  className="hidden xl:flex absolute -right-16 z-20 w-11 h-11 rounded-full bg-white hover:bg-brand-primary border border-brand-border hover:border-transparent text-brand-text hover:text-white items-center justify-center transition-all cursor-pointer shadow-sm hover:shadow-md disabled:opacity-30 disabled:pointer-events-none hover:scale-105 active:scale-95"
                  title="Next Lesson"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Lesson Info Details Bar: Title, Completion, Navigation */}
              <div className="bg-white border border-brand-border rounded-2xl p-5 md:p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-brand-primary">Currently playing</span>
                    <h2 className="text-base font-extrabold text-brand-text leading-snug">{activeLesson.title}</h2>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={handleMarkComplete}
                      className={`flex-grow sm:flex-grow-0 px-6 py-3.5 rounded-xl font-bold text-xs transition-all tracking-wider uppercase cursor-pointer flex items-center justify-center gap-2 ${
                        completedLessons[activeLesson.id]
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/10"
                          : "bg-brand-primary hover:bg-brand-hover text-white shadow-md shadow-brand-primary/10"
                      }`}
                    >
                      {completedLessons[activeLesson.id] ? (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" />
                          Completed
                        </>
                      ) : (
                        "Mark Lesson Complete"
                      )}
                    </button>
                  </div>
                </div>

                {/* Sub-tabs panel under player */}
                <div className="mt-8 pt-2 border-t border-brand-border/60">
                  <StudyRoomTabs
                    course={course}
                    activeLesson={activeLesson}
                    documentDownloadUrl={documentDownloadUrl}
                  />
                  {/* Lesson Nav Footer: Previous / Next Buttons */}
                  <div className="flex justify-between items-center mt-8 pt-6 border-t border-brand-border">
                    <button
                      disabled={isFirstLesson}
                      onClick={() => navigateLesson("prev")}
                      className="px-5 py-3 bg-white hover:bg-brand-soft disabled:opacity-40 disabled:pointer-events-none rounded-xl text-xs font-bold text-brand-text hover:text-brand-primary transition-all cursor-pointer flex items-center gap-1.5 border border-brand-border"
                    >
                      ← Prev Lesson
                    </button>
                    <button
                      disabled={isLastLesson}
                      onClick={() => navigateLesson("next")}
                      className="px-5 py-3 bg-white hover:bg-brand-soft disabled:opacity-40 disabled:pointer-events-none rounded-xl text-xs font-bold text-brand-text hover:text-brand-primary transition-all cursor-pointer flex items-center gap-1.5 border border-brand-border"
                    >
                      Next Lesson →
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-brand-muted bg-white rounded-2xl border border-brand-border p-8">
              <BookOpen className="w-16 h-16 opacity-20 mb-4 text-brand-primary" />
              <p className="font-semibold text-brand-text">No lesson selected</p>
              <p className="text-xs text-brand-muted mt-1">Select a lesson from the curriculum outline on the right to start learning.</p>
            </div>
          )}
        </div>

        {/* Right Panel: Curriculum Outline Navigation */}
        <StudyRoomCurriculumSidebar
          course={course}
          activeLesson={activeLesson}
          completedLessons={completedLessons}
          expandedSections={expandedSections}
          toggleSection={toggleSection}
          setActiveLesson={setActiveLesson}
          allLessons={allLessons}
        />
      </div>
    </div>
  );
}
