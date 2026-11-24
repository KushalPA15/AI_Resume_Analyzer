import {Link, useNavigate, useParams} from "react-router";
import {useEffect, useState} from "react";
import {usePuterStore} from "~/lib/puter";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import { mockResumes } from "~/lib/mockResumes";

export const meta = () => ([
    { title: 'Resumind | Review ' },
    { name: 'description', content: 'Detailed overview of your resume' },
])

const Resume = () => {
    const { auth, isLoading, puterReady, fs, kv } = usePuterStore();
    const { id } = useParams();
    const [imageUrl, setImageUrl] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const navigate = useNavigate();

    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const resumeData = await kv.get(`resume:${id}`);
            if (resumeData) {
                const data = JSON.parse(resumeData);
                if (data.resumePath) {
                    try {
                        await fs.delete(data.resumePath);
                    } catch (err) {
                        console.warn("Could not delete resume file from Puter FS:", err);
                    }
                }
                if (data.imagePath) {
                    try {
                        await fs.delete(data.imagePath);
                    } catch (err) {
                        console.warn("Could not delete image file from Puter FS:", err);
                    }
                }
            }
            await kv.delete(`resume:${id}`);
            navigate('/');
        } catch (err) {
            console.error("Failed to delete resume from KV store:", err);
            alert("Failed to delete resume. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    useEffect(() => {
        if (id && id.startsWith('sample-')) return;
        if(!isLoading && !auth.isAuthenticated) navigate(`/auth?next=/resume/${id}`);
    }, [isLoading, id])

    useEffect(() => {
        const loadResume = async () => {
            if (id && id.startsWith('sample-')) {
                const sample = mockResumes.find(r => r.id === id);
                if (sample) {
                    setResumeUrl(sample.resumePath);
                    setImageUrl(sample.imagePath);
                    setFeedback(sample.feedback);
                }
                return;
            }

            if (!puterReady) return;

            const resume = await kv.get(`resume:${id}`);

            if(!resume) return;

            const data = JSON.parse(resume);

            const resumeBlob = await fs.read(data.resumePath);
            if(!resumeBlob) return;

            const pdfBlob = new Blob([resumeBlob], { type: 'application/pdf' });
            const resumeUrl = URL.createObjectURL(pdfBlob);
            setResumeUrl(resumeUrl);

            const imageBlob = await fs.read(data.imagePath);
            if(!imageBlob) return;
            const imageUrl = URL.createObjectURL(imageBlob);
            setImageUrl(imageUrl);

            setFeedback(data.feedback);
            console.log({resumeUrl, imageUrl, feedback: data.feedback });
        }

        loadResume();
    }, [id, puterReady]);

    return (
        <main className="!pt-0">
            <nav className="resume-nav">
                <Link to="/" className="back-button">
                    <img src="/icons/back.svg" alt="logo" className="w-2.5 h-2.5" />
                    <span className="text-gray-800 text-sm font-semibold">Back to Homepage</span>
                </Link>
                {id && !id.startsWith('sample-') && (
                    <div className="flex items-center gap-2">
                        {showConfirm ? (
                            <>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex flex-row items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg px-3 py-2 shadow-sm transition-colors cursor-pointer text-sm font-bold disabled:opacity-50"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                    </svg>
                                    <span>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</span>
                                </button>
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    disabled={isDeleting}
                                    className="flex flex-row items-center gap-1.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg px-3 py-2 shadow-sm transition-colors cursor-pointer text-sm font-semibold disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setShowConfirm(true)}
                                className="flex flex-row items-center gap-1.5 border border-red-200 hover:bg-red-50 text-red-600 rounded-lg px-3 py-2 shadow-sm transition-colors cursor-pointer text-sm font-semibold"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                </svg>
                                <span>Delete Resume</span>
                            </button>
                        )}
                    </div>
                )}
            </nav>
            <div className="flex flex-row w-full max-lg:flex-col-reverse">
                <section className="feedback-section bg-[url('/images/bg-small.svg')] bg-cover h-[100vh] sticky top-0 items-center justify-center">
                    {imageUrl && resumeUrl && (
                        <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-wxl:h-fit w-fit">
                            <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                                <img
                                    src={imageUrl}
                                    className="w-full h-full object-contain rounded-2xl"
                                    title="resume"
                                />
                            </a>
                        </div>
                    )}
                </section>
                <section className="feedback-section">
                    <h2 className="text-4xl !text-black font-bold">Resume Review</h2>
                    {feedback ? (
                        <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                            <Summary feedback={feedback} />
                            <ATS score={feedback.ATS.score || 0} suggestions={feedback.ATS.tips || []} />
                            <Details feedback={feedback} />
                        </div>
                    ) : (
                        <img src="/images/resume-scan-2.gif" className="w-full" />
                    )}
                </section>
            </div>
        </main>
    )
}
export default Resume
