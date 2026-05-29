import { useState } from "react";
import { Check, FileText, Download, Play, Flame, HelpCircle, BookOpen } from "lucide-react";
import { CourseDetailDto, CourseLessonDto } from "@/features/courses/types";

interface StudyRoomTabsProps {
  course: CourseDetailDto;
  activeLesson: CourseLessonDto;
  documentDownloadUrl: string | null;
}

export default function StudyRoomTabs({
  course,
  activeLesson,
  documentDownloadUrl,
}: StudyRoomTabsProps) {
  const [activeTab, setActiveTab] = useState<"course-info" | "lesson-details" | "resources">("course-info");

  const getLessonIcon = (type?: string) => {
    switch (type) {
      case "Video":
        return <Play className="w-4 h-4 text-brand-primary" />;
      case "Document":
        return <FileText className="w-4 h-4 text-blue-500" />;
      case "Scenario":
        return <Flame className="w-4 h-4 text-orange-500" />;
      case "Quiz":
        return <HelpCircle className="w-4 h-4 text-emerald-500" />;
      default:
        return <BookOpen className="w-4 h-4 text-brand-muted" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Premium Tab Navigation Bar */}
      <div className="flex items-center gap-1 border-b border-brand-border/60 pb-px">
        <button
          onClick={() => setActiveTab("course-info")}
          className={`px-5 py-3 text-xs font-extrabold uppercase tracking-wider transition-all relative cursor-pointer ${
            activeTab === "course-info"
              ? "text-brand-primary border-b-2 border-brand-primary"
              : "text-brand-muted hover:text-brand-text"
          }`}
        >
          Course Overview
        </button>
        <button
          onClick={() => setActiveTab("lesson-details")}
          className={`px-5 py-3 text-xs font-extrabold uppercase tracking-wider transition-all relative cursor-pointer ${
            activeTab === "lesson-details"
              ? "text-brand-primary border-b-2 border-brand-primary"
              : "text-brand-muted hover:text-brand-text"
          }`}
        >
          Lesson Details
        </button>
        <button
          onClick={() => setActiveTab("resources")}
          className={`px-5 py-3 text-xs font-extrabold uppercase tracking-wider transition-all relative cursor-pointer ${
            activeTab === "resources"
              ? "text-brand-primary border-b-2 border-brand-primary"
              : "text-brand-muted hover:text-brand-text"
          }`}
        >
          Lesson Resources
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "course-info" && (
        <div className="space-y-6 animate-fade-in pt-2">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Side: Short Description & Meta Grid */}
            <div className="flex-1 space-y-6">
              <div>
                <h3 className="text-lg font-black text-brand-text mb-2">About this Course</h3>
                <p className="text-sm font-semibold text-brand-primary italic leading-relaxed mb-4">
                  {course.subtitle}
                </p>
                <p className="text-sm text-brand-muted leading-relaxed whitespace-pre-line">
                  {course.description}
                </p>
              </div>

              {/* Learning Objectives Section */}
              {course.learningObjectives && course.learningObjectives.length > 0 && (
                <div className="space-y-3 border-t border-brand-border/60 pt-5">
                  <h4 className="text-sm font-extrabold text-brand-text uppercase tracking-wider">What you will learn</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {course.learningObjectives.map((obj, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-sm text-brand-muted">
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{obj}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Requirements Section */}
              {course.requirements && course.requirements.length > 0 && (
                <div className="space-y-3 border-t border-brand-border/60 pt-5">
                  <h4 className="text-sm font-extrabold text-brand-text uppercase tracking-wider">Requirements</h4>
                  <ul className="list-disc pl-5 text-sm text-brand-muted space-y-1.5">
                    {course.requirements.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Instructors Section */}
              {course.instructors && course.instructors.length > 0 && (
                <div className="space-y-4 border-t border-brand-border/60 pt-5">
                  <h4 className="text-sm font-extrabold text-brand-text uppercase tracking-wider">Your Instructors</h4>
                  <div className="grid grid-cols-1 gap-4">
                    {course.instructors.map((inst) => (
                      <div key={inst.id} className="flex flex-col sm:flex-row gap-4 bg-brand-soft/40 border border-brand-border/40 p-4 rounded-xl items-start">
                        {inst.avatarUrl ? (
                          <img
                            src={inst.avatarUrl}
                            alt={inst.fullName}
                            className="w-12 h-12 rounded-full object-cover border border-brand-border flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center font-bold text-brand-primary text-sm border border-brand-primary/20 flex-shrink-0">
                            {inst.fullName.split(' ').map(n => n[0]).join('')}
                          </div>
                        )}
                        <div className="space-y-1.5 flex-grow">
                          <h5 className="text-sm font-black text-brand-text">{inst.fullName}</h5>
                          {inst.bio && <p className="text-xs text-brand-muted leading-relaxed font-medium">{inst.bio}</p>}
                          {inst.averageRating > 0 && (
                            <div className="flex items-center gap-1 text-[10px] font-bold text-orange-500">
                              <span>★</span>
                              <span>{inst.averageRating.toFixed(1)} Instructor Rating</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-brand-soft border border-brand-border/60 rounded-2xl p-4">
                <div className="p-3 bg-white border border-brand-border/40 rounded-xl flex flex-col justify-center">
                  <span className="text-[10px] uppercase font-bold text-brand-muted tracking-wider block mb-1">Instructor</span>
                  <span className="text-xs font-extrabold text-brand-text line-clamp-1">
                    {course.instructors && course.instructors.length > 0 
                      ? course.instructors[0].fullName 
                      : "Expert Trainer"}
                  </span>
                </div>
                <div className="p-3 bg-white border border-brand-border/40 rounded-xl flex flex-col justify-center">
                  <span className="text-[10px] uppercase font-bold text-brand-muted tracking-wider block mb-1">Language</span>
                  <span className="text-xs font-extrabold text-brand-text">{course.language || "English"}</span>
                </div>
                <div className="p-3 bg-white border border-brand-border/40 rounded-xl flex flex-col justify-center">
                  <span className="text-[10px] uppercase font-bold text-brand-muted tracking-wider block mb-1">Difficulty</span>
                  <span className="text-xs font-extrabold text-brand-text">{course.level || "Intermediate"}</span>
                </div>
                <div className="p-3 bg-white border border-brand-border/40 rounded-xl flex flex-col justify-center">
                  <span className="text-[10px] uppercase font-bold text-brand-muted tracking-wider block mb-1">Total Lectures</span>
                  <span className="text-xs font-extrabold text-brand-text">{course.sections.flatMap(s => s.lessons).length} items</span>
                </div>
              </div>
            </div>

            {/* Right Side: Quick Specs Card */}
            <div className="w-full lg:w-72 bg-brand-soft/40 border border-brand-border/50 rounded-2xl p-6 space-y-4 h-fit">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-brand-text">Course Details</h4>
              
              <div className="space-y-3 divide-y divide-brand-border/40 text-xs">
                <div className="flex justify-between py-2.5">
                  <span className="text-brand-muted font-bold">Total Duration</span>
                  <span className="font-extrabold text-brand-text">{course.totalDurationMinutes ? `${course.totalDurationMinutes} mins` : "Self-paced"}</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-brand-muted font-bold">VR Immersive Support</span>
                  <span className={`font-extrabold flex items-center gap-1 ${course.hasVRScenarios ? "text-orange-655" : "text-brand-muted"}`}>
                    {course.hasVRScenarios ? "Enabled (3D Scenario)" : "Standard Video/Doc"}
                  </span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-brand-muted font-bold">Enrollments</span>
                  <span className="font-extrabold text-brand-text">{course.totalEnrollments || 1} Students</span>
                </div>
                {course.averageRating > 0 && (
                  <div className="flex justify-between py-2.5">
                    <span className="text-brand-muted font-bold">Rating</span>
                    <span className="font-extrabold text-brand-text">★ {course.averageRating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "lesson-details" && (
        <div className="space-y-4 animate-fade-in pt-2">
          <div className="bg-brand-soft/60 border border-brand-border/60 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-brand-peach border border-brand-primary/20 text-brand-primary rounded-xl mt-0.5">
                {getLessonIcon(activeLesson.resourceType)}
              </div>
              <div>
                <h3 className="text-lg font-black text-brand-text mb-1">{activeLesson.title}</h3>
                <p className="text-xs text-brand-muted font-bold uppercase tracking-wider mb-4">
                  Type: {activeLesson.resourceType} • Duration: {activeLesson.durationMinutes ? `${activeLesson.durationMinutes} min` : "Self-paced"}
                </p>
                <p className="text-sm text-brand-muted leading-relaxed">
                  This lesson is item #{activeLesson.orderIndex} in the curriculum sections. 
                  Make sure to fully read the documentation, watch the streaming lectures, or solve all quiz assessments. 
                  Once finished, make sure to click "Mark Lesson Complete" to check it off your progress sheet.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "resources" && (
        <div className="space-y-4 animate-fade-in pt-2">
          <div className="bg-brand-soft/60 border border-brand-border/60 rounded-2xl p-6">
            <h3 className="text-base font-black text-brand-text mb-3">Downloadable Lesson Resources</h3>
            {activeLesson.resourceType === "Document" && documentDownloadUrl ? (
              <div className="flex items-center justify-between p-4 bg-white border border-brand-border rounded-xl">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-blue-500" />
                  <div>
                    <p className="text-sm font-bold text-brand-text">{activeLesson.title}.pdf</p>
                    <p className="text-xs text-brand-muted font-semibold">Adobe PDF Document</p>
                  </div>
                </div>
                <a
                  href={documentDownloadUrl}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-white hover:bg-brand-soft text-brand-primary border border-brand-border rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </a>
              </div>
            ) : activeLesson.resourceType === "Video" ? (
              <p className="text-sm text-brand-muted">
                Watch the streaming HLS video above to learn. There are no static attachments for this video lecture.
              </p>
            ) : activeLesson.resourceType === "Scenario" ? (
              <p className="text-sm text-brand-muted">
                Launch the interactive 3D VR simulation scene using the controller above. No extra documents are attached.
              </p>
            ) : (
              <p className="text-sm text-brand-muted">
                No files or resources are attached to this lesson block.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
