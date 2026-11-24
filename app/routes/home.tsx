import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import {usePuterStore} from "~/lib/puter";
import {Link, useNavigate} from "react-router";
import {useEffect, useState} from "react";
import { mockResumes } from "~/lib/mockResumes";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart feedback for your dream job!" },
  ];
}

export default function Home() {
  const { auth, kv, isLoading, puterReady } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);

  useEffect(() => {
    if(!isLoading && !auth.isAuthenticated) navigate('/auth?next=/');
  }, [isLoading, auth.isAuthenticated])

  useEffect(() => {
    const loadResumes = async () => {
      setLoadingResumes(true);

      const resumes = (await kv.list('resume:*', true)) as KVItem[];

      const parsedResumes = resumes?.map((resume) => (
          JSON.parse(resume.value) as Resume
      ))

      setResumes(parsedResumes || []);
      setLoadingResumes(false);
    }

    if(puterReady) loadResumes();
  }, [puterReady]);

  return <main className="bg-[url('/images/bg-main.svg')] bg-cover">
    <Navbar />

    <section className="main-section">
      <div className="page-heading py-12">
        <h1 className="text-5xl font-extrabold tracking-tight">Track Your Applications & Resume Ratings</h1>
      </div>

      {/* Row 1: User's Uploaded Resumes */}
      <div className="w-full max-w-[1600px] flex flex-col gap-6 items-center">
        <div className="w-full flex flex-row justify-between items-center px-4 max-w-[1200px] mx-auto border-b border-gray-100 pb-4">
          <h2 className="text-2xl font-bold text-gray-800">Your Uploaded Resumes</h2>
          {resumes.length > 0 && (
            <Link to="/upload" className="text-sm font-bold text-[#5171FF] hover:underline flex items-center gap-1">
              + Upload New Resume
            </Link>
          )}
        </div>

        {loadingResumes ? (
          <div className="flex flex-col items-center justify-center py-10">
            <img src="/images/resume-scan-2.gif" className="w-[200px]" />
          </div>
        ) : resumes.length > 0 ? (
          <div className="resumes-section mt-4">
            {resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} onDelete={() => setResumes(prev => prev.filter(r => r.id !== resume.id))} />
            ))}
          </div>
        ) : (
          <div className="w-full max-w-[1200px] bg-white/50 backdrop-blur-md rounded-3xl p-8 border border-gray-100/80 flex flex-col items-center justify-center text-center py-16 gap-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)] mt-2">
            <div className="size-16 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100">
              <img src="/icons/info.svg" className="size-8 opacity-60" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-950">No resumes analyzed yet</h3>
              <p className="text-gray-500 max-w-md mt-2 font-medium">Upload your resume and get immediate feedback on how it scores against your target job listing.</p>
            </div>
            <Link to="/upload" className="primary-button w-fit text-lg font-bold py-3 px-8 shadow-md hover:primary-gradient-hover transition-all">
              Upload & Analyze Resume
            </Link>
          </div>
        )}
      </div>

      {/* Row 2: Explore Sample Resumes */}
      <div className="w-full max-w-[1600px] mt-16 border-t border-gray-200/80 pt-16 pb-12 flex flex-col gap-6 items-center">
        <div className="flex flex-col items-center gap-3 text-center mb-8">
          <h2 className="text-4xl font-extrabold text-gray-950 tracking-tight">Explore Sample Resumes</h2>
          <p className="text-gray-500 font-medium max-w-xl">Preview the ATS score and detailed AI reviews on these pre-analyzed profiles instantly without uploading anything.</p>
        </div>
        <div className="resumes-section">
          {mockResumes.map((resume) => (
            <ResumeCard key={resume.id} resume={resume} />
          ))}
        </div>
      </div>
    </section>
  </main>
}
