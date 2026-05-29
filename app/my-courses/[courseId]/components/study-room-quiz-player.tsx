import { HelpCircle, Award, Loader2 } from "lucide-react";
import { QuizQuestionsResponse, QuizAttemptPreviewDto } from "@/features/courses/lib/my-courses-api";

interface StudyRoomQuizPlayerProps {
  quizQuestions: QuizQuestionsResponse;
  quizStarted: boolean;
  setQuizStarted: (started: boolean) => void;
  currentQuestionIndex: number;
  setCurrentQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
  selectedAnswers: Record<string, number>;
  setSelectedAnswers: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  quizResult: QuizAttemptPreviewDto | null;
  setQuizResult: (res: QuizAttemptPreviewDto | null) => void;
  isSubmittingQuiz: boolean;
  handleQuizSubmit: () => Promise<void>;
}

export default function StudyRoomQuizPlayer({
  quizQuestions,
  quizStarted,
  setQuizStarted,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  selectedAnswers,
  setSelectedAnswers,
  quizResult,
  setQuizResult,
  isSubmittingQuiz,
  handleQuizSubmit,
}: StudyRoomQuizPlayerProps) {
  return (
    <div className="absolute inset-0 flex flex-col justify-between bg-slate-50 p-6 md:p-8 overflow-y-auto">
      {!quizStarted && !quizResult && (
        <div className="flex-grow flex flex-col items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-2xl border border-brand-border p-8 shadow-sm flex flex-col items-center text-center animate-fade-in">
            <div className="p-4 bg-brand-peach border border-brand-primary/20 text-brand-primary rounded-2xl mb-4">
              <HelpCircle className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-black text-brand-text">Lesson Assessment Quiz</h3>
            <p className="text-xs text-brand-muted mt-1.5 mb-6 max-w-xs leading-relaxed">
              Verify your understanding of the concepts covered in this lesson. You will receive your score immediately upon submission.
            </p>
            <div className="w-full grid grid-cols-2 gap-4 text-xs font-bold text-brand-muted bg-brand-soft rounded-xl p-4 mb-6 border border-brand-border/60">
              <div className="text-center border-r border-brand-border">
                <span className="block text-[10px] uppercase tracking-wider text-brand-muted mb-0.5">Questions</span>
                <span className="text-sm font-extrabold text-brand-text">{quizQuestions.numberOfQuestions} Items</span>
              </div>
              <div className="text-center">
                <span className="block text-[10px] uppercase tracking-wider text-brand-muted mb-0.5">Time Limit</span>
                <span className="text-sm font-extrabold text-brand-text">{quizQuestions.durationInMinutes} Mins</span>
              </div>
            </div>
            <button
              onClick={() => setQuizStarted(true)}
              className="w-full bg-brand-primary hover:bg-brand-hover text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              Start Assessment
            </button>
          </div>
        </div>
      )}

      {quizStarted && !quizResult && (
        <div className="flex flex-col h-full justify-between gap-4">
          {/* Quiz Header Progress */}
          <div className="flex justify-between items-center text-xs font-bold text-brand-muted border-b border-brand-border pb-3 flex-shrink-0">
            <span className="bg-white border border-brand-border px-3 py-1 rounded-full text-brand-text">
              Question {currentQuestionIndex + 1} of {quizQuestions.questions.length}
            </span>
            <span className="text-brand-primary uppercase tracking-wider text-[10px] font-extrabold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
              Assessment Active
            </span>
          </div>

          {/* Quiz Body */}
          <div className="flex-grow flex flex-col justify-center py-4">
            <h4 className="text-lg font-bold mb-6 text-brand-text leading-snug">
              {quizQuestions.questions[currentQuestionIndex]?.question}
            </h4>

            <div className="grid grid-cols-1 gap-3">
              {quizQuestions.questions[currentQuestionIndex]?.choices.map((choice, idx) => {
                const questionId = quizQuestions.questions[currentQuestionIndex].id;
                const isSelected = selectedAnswers[questionId] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedAnswers(prev => ({ ...prev, [questionId]: idx }))}
                    className={`w-full text-left p-4 rounded-xl border text-sm font-semibold transition-all duration-150 cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? "bg-brand-peach border-brand-primary text-brand-primary shadow-xs"
                        : "bg-white border-brand-border text-brand-text hover:bg-brand-soft hover:border-brand-primary/45"
                    }`}
                  >
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-extrabold transition-colors flex-shrink-0 ${
                      isSelected 
                        ? "bg-brand-primary text-white" 
                        : "bg-brand-soft text-brand-muted"
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="leading-tight">{choice}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quiz Navigation Actions */}
          <div className="flex justify-between items-center border-t border-brand-border pt-3 flex-shrink-0">
            <button
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
              className="px-4 py-2 text-xs font-bold text-brand-muted hover:text-brand-text disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              ← Previous Question
            </button>
            
            {currentQuestionIndex < quizQuestions.questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                className="bg-white hover:bg-brand-soft border border-brand-border text-brand-text px-5 py-2.5 rounded-lg text-xs font-bold cursor-pointer transition-all"
              >
                Next Question
              </button>
            ) : (
              <button
                onClick={handleQuizSubmit}
                disabled={isSubmittingQuiz}
                className="bg-brand-primary hover:bg-brand-hover text-white px-6 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
              >
                {isSubmittingQuiz ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  "Submit Quiz"
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quiz Results Panel */}
      {quizResult && (
        <div className="flex-grow flex flex-col items-center justify-center animate-fade-in">
          <div className="max-w-md w-full bg-white rounded-2xl border border-brand-border p-8 shadow-sm flex flex-col items-center text-center">
            <div className="p-4 bg-emerald-50 border border-emerald-250 text-emerald-600 rounded-2xl mb-4">
              <Award className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-extrabold text-brand-text">Assessment Submitted!</h3>
            <p className="text-brand-muted text-xs mt-1 mb-6 max-w-xs font-medium">
              Your answers have been checked against the records. Here is your performance details:
            </p>
            
            <div className="grid grid-cols-2 gap-4 bg-brand-soft border border-brand-border p-4 rounded-xl mb-6 w-full">
              <div className="text-center border-r border-brand-border">
                <span className="block text-[10px] font-bold text-brand-muted uppercase tracking-wider mb-0.5">Score</span>
                <span className="text-xl font-black text-emerald-600">{Math.round(quizResult.scorePercent)}%</span>
              </div>
              <div className="text-center">
                <span className="block text-[10px] font-bold text-brand-muted uppercase tracking-wider mb-0.5">Correct</span>
                <span className="text-xl font-black text-brand-text">{quizResult.correctAnswers} / {quizResult.totalQuestions}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setQuizResult(null);
                setQuizStarted(true);
                setCurrentQuestionIndex(0);
                setSelectedAnswers({});
              }}
              className="w-full bg-brand-primary hover:bg-brand-hover text-white py-3.5 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer uppercase tracking-wider"
            >
              Retake Assessment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
