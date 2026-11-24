import {Link, useNavigate} from "react-router";
import ScoreCircle from "~/components/ScoreCircle";
import {useEffect, useState, type MouseEvent} from "react";
import {usePuterStore} from "~/lib/puter";

const ResumeCard = ({ resume: { id, companyName, jobTitle, feedback, imagePath, resumePath }, onDelete }: { resume: Resume, onDelete?: () => void }) => {
    const { fs, kv, puterReady } = usePuterStore();
    const [resumeUrl, setResumeUrl] = useState('');
    const navigate = useNavigate();

    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleDelete = async (e: MouseEvent) => {
        e.stopPropagation();
        setIsDeleting(true);
        try {
            if (resumePath) {
                try {
                    await fs.delete(resumePath);
                } catch (err) {
                    console.warn("Could not delete resume file from Puter FS:", err);
                }
            }
            if (imagePath) {
                try {
                    await fs.delete(imagePath);
                } catch (err) {
                    console.warn("Could not delete image file from Puter FS:", err);
                }
            }
            await kv.delete(`resume:${id}`);
            onDelete?.();
        } catch (err) {
            console.error("Failed to delete resume from KV store:", err);
            alert("Failed to delete resume. Please try again.");
            setIsDeleting(false);
        }
    };

    useEffect(() => {
        const loadResume = async () => {
            if (imagePath.startsWith('/images/')) {
                setResumeUrl(imagePath);
                return;
            }
            const blob = await fs.read(imagePath);
            if(!blob) return;
            let url = URL.createObjectURL(blob);
            setResumeUrl(url);
        }

        if (imagePath.startsWith('/images/')) {
            setResumeUrl(imagePath);
        } else if(puterReady) {
            loadResume();
        }
    }, [imagePath, puterReady]);

    return (
        <div className="resume-card group/card relative animate-in fade-in duration-1000">
            <div className="resume-card-header cursor-pointer group/header" onClick={() => navigate(`/resume/${id}`)}>
                <div className="flex flex-col gap-1 min-w-0">
                    {companyName ? (
                        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight break-words leading-tight group-hover/header:text-[#5171FF] transition-colors">
                            {companyName}
                        </h2>
                    ) : (
                        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-tight group-hover/header:text-[#5171FF] transition-colors">
                            Resume
                        </h2>
                    )}
                    {jobTitle && (
                        <span className="inline-flex items-center text-xs font-semibold text-[#5171FF] bg-[#5171FF]/5 border border-[#5171FF]/10 px-2.5 py-0.5 rounded-md w-fit mt-1 break-words">
                            {jobTitle}
                        </span>
                    )}
                </div>
                <div className="flex-shrink-0">
                    {feedback ? (
                        <ScoreCircle score={feedback.overallScore} />
                    ) : (
                        <div className="flex items-center justify-center w-[100px] h-[100px] rounded-full bg-gray-50 border border-gray-100">
                            <p className="text-xs text-gray-400 text-center font-medium">Processing...</p>
                        </div>
                    )}
                </div>
            </div>
            {resumeUrl && (
                <div className="preview-wrapper w-full relative overflow-hidden group/preview rounded-2xl animate-in fade-in duration-1000">
                    <div className="resume-preview-container w-full h-[328px] max-sm:h-[188px] overflow-y-auto rounded-xl border border-gray-200/40 shadow-[0_4px_12px_rgba(0,0,0,0.02)] bg-white">
                        <img
                            src={resumeUrl}
                            alt="resume"
                            className="w-full h-auto object-contain object-top transition-transform duration-300 group-hover/preview:scale-[1.01]"
                        />
                    </div>
                    {/* Floating Scroll Badge (visible on hover) */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-white/90 backdrop-blur-md border border-gray-200/60 text-gray-500 text-[10px] font-semibold tracking-wider rounded-full px-3 py-1.5 shadow-[0_8px_16px_rgba(0,0,0,0.06)] opacity-0 translate-y-1 group-hover/card:opacity-100 group-hover/card:translate-y-0 transition-all duration-300 pointer-events-none select-none max-sm:hidden">
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <rect x="5" y="3" width="14" height="18" rx="7" />
                            <path d="M12 6v4" strokeLinecap="round" className="animate-scroll-wheel" strokeWidth="2.5" />
                        </svg>
                        <span>Scroll to preview</span>
                    </div>
                </div>
            )}
            <div className="flex flex-row justify-between items-center mt-auto pt-4 w-full border-t border-gray-100/80">
                {!id.startsWith('sample-') ? (
                    <div className="flex items-center gap-1.5">
                        {showConfirm ? (
                            <div className="flex items-center gap-1 bg-red-50/50 p-0.5 rounded-full border border-red-100 animate-in fade-in slide-in-from-left-2 duration-200">
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="text-[11px] font-bold text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-full transition-all duration-200 cursor-pointer disabled:opacity-50 shadow-sm active:scale-95 flex items-center gap-1"
                                >
                                    Confirm
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowConfirm(false);
                                    }}
                                    disabled={isDeleting}
                                    className="text-[11px] font-semibold text-gray-500 hover:text-gray-700 hover:bg-white px-2.5 py-1 rounded-full transition-all duration-200 cursor-pointer disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowConfirm(true);
                                }}
                                className="text-xs font-semibold text-red-500 hover:text-white hover:bg-red-500 hover:border-red-500 border border-red-200/40 bg-red-50/5 px-3 py-1.5 rounded-full transition-all duration-300 flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                </svg>
                                <span>Delete</span>
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="w-4 h-4" />
                )}
                <Link to={`/resume/${id}`} className="text-sm font-extrabold text-[#5171FF] hover:text-[#3b5bdb] hover:underline flex items-center gap-1 transition-all group-hover/card:translate-x-0.5 duration-200">
                    View Analysis &rarr;
                </Link>
            </div>
        </div>
    )
}
export default ResumeCard

