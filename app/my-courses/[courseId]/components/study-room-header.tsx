import { ArrowLeft } from "lucide-react";

interface StudyRoomHeaderProps {
  courseTitle: string;
  categoryName: string | null;
  completedCount: number;
  totalLessons: number;
  progressPercent: number;
}

export default function StudyRoomHeader({
  courseTitle,
  categoryName,
  completedCount,
  totalLessons,
  progressPercent,
}: StudyRoomHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row items-center justify-between px-6 py-3 bg-[#111827] border-b border-gray-850 flex-shrink-0 gap-3 md:gap-6 z-20 shadow-md">
      {/* Left: Back Link & Course Title */}
      <div className="flex items-center gap-4 w-full md:w-auto">
        <button
          onClick={() => {
            window.location.href = "/my-courses";
          }}
          className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-all border border-gray-700/50 cursor-pointer"
          title="Back to my courses"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
        </button>
        <div className="overflow-hidden">
          <h1 className="font-extrabold text-[15px] leading-tight text-white line-clamp-1">
            {courseTitle}
          </h1>
          <p className="text-xs text-gray-400 line-clamp-1 font-semibold uppercase tracking-wider mt-0.5">
            Course Study Room
          </p>
        </div>
      </div>

      {/* Center: Overall Progress */}
      <div className="flex items-center gap-4 w-full md:max-w-md flex-1">
        <div className="flex-1 space-y-1">
          <div className="flex justify-between items-center text-xs font-bold text-gray-400">
            <span>Overall Progress ({completedCount} / {totalLessons} completed)</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-primary rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Right: Category Tag */}
      <div className="hidden lg:flex items-center gap-2">
        {categoryName && (
          <span className="px-3.5 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-bold uppercase tracking-wider">
            {categoryName}
          </span>
        )}
      </div>
    </header>
  );
}
