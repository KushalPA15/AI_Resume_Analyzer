import {type FormEvent, useEffect, useState} from 'react'
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import {usePuterStore} from "~/lib/puter";
import {useNavigate} from "react-router";
import {convertPdfToImage, extractTextFromPdf} from "~/lib/pdf2img";
import {generateUUID} from "~/lib/utils";
import {prepareInstructions} from "../../constants";
import { mockResumes } from "~/lib/mockResumes";

const Upload = () => {
    const { auth, isLoading, fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [errorText, setErrorText] = useState('');
    const [file, setFile] = useState<File | null>(null);

    // Controlled form states
    const [companyName, setCompanyName] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [loadingSample, setLoadingSample] = useState(false);

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

    const handleUseSample = async (sampleId: string) => {
        const sample = mockResumes.find(r => r.id === sampleId);
        if (!sample) return;

        setLoadingSample(true);
        try {
            // Set fields
            setCompanyName(sample.companyName || '');
            setJobTitle(sample.jobTitle || '');
            
            // Set typical job description based on role
            let jobDesc = '';
            if (sampleId === 'sample-1') {
                jobDesc = 'We are seeking a Business Development Manager to drive revenue growth, build strategic partnerships, and identify new market opportunities. Requirements: Experience with CRMs, Excel, market research, and leading sales teams. MBA preferred.';
            } else if (sampleId === 'sample-2') {
                jobDesc = 'Looking for a creative Lead Copywriter to craft engaging copy for Facebook, Instagram, and weekly newsletters. Candidate should have 5+ years of experience, a strong SEO background, and experience establishing brand voice. WordPress experience is a plus.';
            } else if (sampleId === 'sample-3') {
                jobDesc = 'Looking for a Senior UX Designer to lead design for web and mobile applications. Requirements: Strong experience in user research, wireframing, and interactive prototyping. Proficiency in Figma, Sketch, and Adobe XD. Degree in HCI preferred.';
            }
            setJobDescription(jobDesc);

            // Fetch the PDF file
            const response = await fetch(sample.resumePath);
            const blob = await response.blob();
            const filename = sample.resumePath.split('/').pop() || 'resume.pdf';
            const sampleFile = new File([blob], filename, { type: 'application/pdf' });
            
            setFile(sampleFile);

            // Scroll form into view
            const formElement = document.getElementById('upload-form');
            if (formElement) {
                formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } catch (err) {
            console.error('Failed to load sample resume file:', err);
        } finally {
            setLoadingSample(false);
        }
    };

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
                        <>
                            <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
                                <div className="form-div">
                                    <label htmlFor="company-name">Company Name</label>
                                    <input 
                                        type="text" 
                                        name="company-name" 
                                        placeholder="Company Name" 
                                        id="company-name" 
                                        value={companyName}
                                        onChange={e => setCompanyName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-div">
                                    <label htmlFor="job-title">Job Title</label>
                                    <input 
                                        type="text" 
                                        name="job-title" 
                                        placeholder="Job Title" 
                                        id="job-title" 
                                        value={jobTitle}
                                        onChange={e => setJobTitle(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-div">
                                    <label htmlFor="job-description">Job Description</label>
                                    <textarea 
                                        rows={5} 
                                        name="job-description" 
                                        placeholder="Job Description" 
                                        id="job-description" 
                                        value={jobDescription}
                                        onChange={e => setJobDescription(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-div">
                                    <label htmlFor="uploader">Upload Resume</label>
                                    <FileUploader selectedFile={file} onFileSelect={handleFileSelect} />
                                </div>

                                <button className="primary-button" type="submit">
                                    Analyze Resume
                                </button>
                            </form>

                            <div className="w-full max-w-4xl mt-16 border-t border-gray-200/80 pt-12">
                                <h3 className="text-3xl font-bold text-gray-800 text-center mb-2">Don't have a resume?</h3>
                                <p className="text-center text-gray-500 mb-8 font-medium">Try checking the ATS score of these sample resumes</p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {mockResumes.map((sample) => (
                                        <div key={sample.id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] hover:border-gray-200/80 transition-all duration-300">
                                            <div className="flex flex-col gap-4">
                                                <div className="w-full h-48 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 flex items-center justify-center">
                                                    <img src={sample.imagePath} alt={sample.companyName} className="w-full h-full object-cover object-top" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 leading-tight text-lg">{sample.companyName}</h4>
                                                    <p className="text-sm text-gray-500 font-semibold mt-1">{sample.jobTitle}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2 mt-6">
                                                <button 
                                                    type="button" 
                                                    className="w-full text-center text-[#5171FF] font-bold border-2 border-[#5171FF]/20 rounded-full py-2 hover:bg-[#5171FF]/5 transition-colors cursor-pointer text-sm"
                                                    onClick={() => navigate(`/resume/${sample.id}`)}
                                                >
                                                    Quick Preview
                                                </button>
                                                <button 
                                                    type="button" 
                                                    className="w-full text-center text-white bg-[#5171FF] font-bold rounded-full py-2.5 hover:bg-[#3b5bdb] transition-colors cursor-pointer text-sm"
                                                    onClick={() => handleUseSample(sample.id)}
                                                    disabled={loadingSample}
                                                >
                                                    {loadingSample ? 'Loading...' : 'Use Sample'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </section>
        </main>
    )
}
export default Upload
