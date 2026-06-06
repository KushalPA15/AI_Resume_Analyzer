import {type FormEvent, useEffect, useState} from 'react'
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import {usePuterStore} from "~/lib/puter";
import {useNavigate} from "react-router";
import {convertPdfToImage, extractTextFromPdf} from "~/lib/pdf2img";
import {generateUUID} from "~/lib/utils";
import {prepareInstructions} from "../../constants";

const Upload = () => {
    const { auth, isLoading, fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [errorText, setErrorText] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const setError = (msg: string) => {
        setStatusText('');
        setErrorText(msg);
        setIsProcessing(false);
    };

    const handleFileSelect = (file: File | null) => {
        setFile(file)
    }

    // Redirect to auth if not signed in
    useEffect(() => {
        if(!isLoading && !auth.isAuthenticated) navigate('/auth?next=/upload');
    }, [isLoading, auth.isAuthenticated]);

    const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }: { companyName: string, jobTitle: string, jobDescription: string, file: File  }) => {
        // Clear previous errors and check auth
        setErrorText('');
        if(!auth.isAuthenticated) {
            navigate('/auth?next=/upload');
            return;
        }

        setIsProcessing(true);

        try {
            setStatusText('Reading resume content...');
            const resumeText = await extractTextFromPdf(file);

            let feedbackResponse: any;
            let uploadedFile: any;
            let uploadedImage: any;
            const uuid = generateUUID();

            if (resumeText && resumeText.trim().length >= 50) {
                setStatusText('Analyzing resume & uploading files...');
                
                // Fast path: Extract text, and start AI chat concurrently with file uploads and image conversions
                const chatPromise = ai.chat(
                    prepareInstructions({ jobTitle, jobDescription, resumeText }),
                    { model: 'gpt-4o-mini' } as any
                );

                const uploadPromise = (async () => {
                    const [upFile, imgFile] = await Promise.all([
                        fs.upload([file]),
                        convertPdfToImage(file)
                    ]);
                    
                    if (!upFile) throw new Error('Failed to upload PDF file.');
                    if (!imgFile.file) throw new Error('Failed to convert PDF to image.');

                    const upImg = await fs.upload([imgFile.file]);
                    if (!upImg) throw new Error('Failed to upload resume preview image.');

                    return { upFile, upImg };
                })();

                const [chatRes, uploadRes] = await Promise.all([chatPromise, uploadPromise]);
                feedbackResponse = chatRes;
                uploadedFile = uploadRes.upFile;
                uploadedImage = uploadRes.upImg;
            } else {
                // Fallback path: PDF text could not be extracted (likely scanned PDF)
                setStatusText('Converting PDF to image...');
                const imageFile = await convertPdfToImage(file);
                if (!imageFile.file) { setError('Failed to convert PDF to image. Please try again.'); return; }

                setStatusText('Uploading files...');
                const [upFile, upImg] = await Promise.all([
                    fs.upload([file]),
                    fs.upload([imageFile.file])
                ]);
                if (!upFile) { setError('Failed to upload PDF file. Please try again.'); return; }
                if (!upImg) { setError('Failed to upload resume preview image. Please try again.'); return; }

                uploadedFile = upFile;
                uploadedImage = upImg;

                setStatusText('Running OCR on scanned resume...');
                const ocrText = await ai.img2txt(imageFile.file);
                if (!ocrText) { setError('Could not read resume content. Please make sure the PDF is readable.'); return; }

                setStatusText('Analyzing resume with AI...');
                feedbackResponse = await ai.chat(
                    prepareInstructions({ jobTitle, jobDescription, resumeText: ocrText }),
                    { model: 'gpt-4o-mini' } as any
                );
            }

            if (!feedbackResponse) { setError('AI analysis failed. Please try again.'); return; }

            const feedbackText = typeof feedbackResponse.message.content === 'string'
                ? feedbackResponse.message.content
                : feedbackResponse.message.content[0].text;

            let parsedFeedback;
            try {
                const cleaned = feedbackText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
                parsedFeedback = JSON.parse(cleaned);
            } catch {
                setError('AI returned an unexpected response. Please try again.');
                return;
            }

            const data = {
                id: uuid,
                resumePath: uploadedFile.path,
                imagePath: uploadedImage.path,
                companyName, jobTitle, jobDescription,
                feedback: parsedFeedback,
            };

            await kv.set(`resume:${uuid}`, JSON.stringify(data));
            setStatusText('Analysis complete! Redirecting...');
            navigate(`/resume/${uuid}`);

        } catch (err) {
            let msg = 'An unexpected error occurred.';
            if (err instanceof Error) {
                msg = err.message;
            } else if (typeof err === 'object' && err !== null) {
                msg = (err as any).message || (err as any).error || JSON.stringify(err);
            } else if (typeof err === 'string') {
                msg = err;
            }
            setError(msg);
        }
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        if(!form) return;
        const formData = new FormData(form);

        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if(!file) return;

        handleAnalyze({ companyName, jobTitle, jobDescription, file });
    }

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />

            <section className="main-section">
                <div className="page-heading py-16">
                    <h1>Smart feedback for your dream job</h1>
                    {isProcessing ? (
                        <>
                            <h2>{statusText}</h2>
                            <img src="/images/resume-scan.gif" className="w-full" />
                        </>
                    ) : (
                        <h2>Drop your resume for an ATS score and improvement tips</h2>
                    )}
                    {!isProcessing && errorText && (
                        <p className="text-red-500 font-medium bg-red-50 border border-red-200 rounded-xl px-4 py-3 w-full text-left">
                            ⚠️ {errorText}
                        </p>
                    )}
                    {!isProcessing && (
                        <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
                            <div className="form-div">
                                <label htmlFor="company-name">Company Name</label>
                                <input type="text" name="company-name" placeholder="Company Name" id="company-name" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-title">Job Title</label>
                                <input type="text" name="job-title" placeholder="Job Title" id="job-title" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-description">Job Description</label>
                                <textarea rows={5} name="job-description" placeholder="Job Description" id="job-description" />
                            </div>

                            <div className="form-div">
                                <label htmlFor="uploader">Upload Resume</label>
                                <FileUploader onFileSelect={handleFileSelect} />
                            </div>

                            <button className="primary-button" type="submit">
                                Analyze Resume
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </main>
    )
}
export default Upload
