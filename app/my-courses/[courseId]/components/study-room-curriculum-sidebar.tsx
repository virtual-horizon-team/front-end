import { ChevronUp, ChevronDown, CheckCircle2, Circle, ChevronRight, Play, FileText, Flame, HelpCircle, BookOpen } from "lucide-react";
import { CourseDetailDto, CourseLessonDto } from "@/features/courses/types";

interface StudyRoomCurriculumSidebarProps {
  course: CourseDetailDto;
  activeLesson: CourseLessonDto | null;
  completedLessons: Record<string, boolean>;
  expandedSections: Record<string, boolean>;
  toggleSection: (sectionId: string) => void;
  setActiveLesson: (lesson: CourseLessonDto) => void;
  allLessons: CourseLessonDto[];
}

export default function StudyRoomCurriculumSidebar({
  course,
  activeLesson,
  completedLessons,
  expandedSections,
  toggleSection,
  setActiveLesson,
  allLessons,
}: StudyRoomCurriculumSidebarProps) {
  const getLessonIcon = (type?: string) => {
    switch (type) {
      case "Video":
        return <Play className="w-3.5 h-3.5 text-brand-primary" />;
      case "Document":
        return <FileText className="w-3.5 h-3.5 text-blue-500" />;
      case "Scenario":
        return <Flame className="w-3.5 h-3.5 text-orange-500" />;
      case "Quiz":
        return <HelpCircle className="w-3.5 h-3.5 text-emerald-500" />;
      default:
        return <BookOpen className="w-3.5 h-3.5 text-brand-muted" />;
    }
  };

  return (
    <aside className="w-full md:w-80 bg-white border-t md:border-t-0 md:border-l border-brand-border flex flex-col flex-shrink-0 overflow-y-auto">
      <div className="p-5 border-b border-brand-border">
        <h3 className="font-extrabold text-[15px] text-brand-text">Course Curriculum</h3>
        <p className="text-xs text-brand-muted mt-1 font-semibold">
          {course.sections.length} Sections • {allLessons.length} Lessons
        </p>
      </div>

      <div className="divide-y divide-brand-border flex-grow">
        {course.sections.map((section) => {
          const isExpanded = expandedSections[section.id] !== false;
          return (
            <div key={section.id} className="flex flex-col">
              {/* Section Title Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-5 py-4 bg-brand-soft/50 hover:bg-brand-soft flex items-center justify-between text-left transition-colors cursor-pointer select-none"
              >
                <div className="max-w-[80%]">
                  <span className="text-[11px] text-brand-primary font-bold uppercase tracking-wider block mb-0.5">
                    Section {section.orderIndex}
                  </span>
                  <h4 className="text-sm font-bold text-brand-text line-clamp-1 leading-snug">
                    {section.title}
                  </h4>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-brand-muted" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-brand-muted" />
                )}
              </button>

              {/* Section Lessons List */}
              {isExpanded && (
                <div className="bg-white py-1">
                  {section.lessons.map((lesson) => {
                    const isActive = activeLesson?.id === lesson.id;
                    const isCompleted = completedLessons[lesson.id] === true;
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => setActiveLesson(lesson)}
                        className={`w-full px-5 py-3 flex items-center justify-between transition-colors text-left group cursor-pointer ${
                          isActive
                            ? "bg-brand-peach/40 text-brand-primary font-bold border-l-2 border-brand-primary"
                            : "text-brand-text hover:bg-brand-soft/40"
                        }`}
                      >
                        <div className="flex items-center gap-3 max-w-[85%]">
                          {/* Completed Checkbox */}
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-brand-muted/40 group-hover:text-brand-muted flex-shrink-0" />
                          )}
                          
                          <div className="overflow-hidden">
                            <span className={`text-[13px] leading-tight block truncate ${isActive ? "text-brand-primary font-bold" : "text-brand-text font-medium"}`}>
                              {lesson.title}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              {getLessonIcon(lesson.resourceType)}
                              <span className="text-[10px] text-brand-muted font-semibold">
                                {lesson.resourceType} {lesson.durationMinutes ? `• ${lesson.durationMinutes} min` : ""}
                              </span>
                            </div>
                          </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-brand-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
