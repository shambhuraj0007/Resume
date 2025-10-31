import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import ResumeView from './resumeView';

// Types remain the same as in your original code
interface PersonalDetails {
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  website: string;
  location: string;
}

interface WorkExperience {
  jobTitle: string;
  companyName: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Education {
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Skill {
  skillType?: "group" | "individual";
  category: string;
  skills: string;
  skill: string;
}

interface Project {
  projectName: string;
  description: string;
  link: string;
}

interface Language {
  language: string;
  proficiency: string;
}

interface Certification {
  certificationName: string;
  issuingOrganization: string;
  issueDate: string;
}

interface CustomSection {
  sectionTitle: string;
  content: string;
}

interface ResumeData {
  personalDetails: PersonalDetails;
  objective: string;
  jobTitle: string;
  workExperience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  languages: Language[];
  certifications: Certification[];
  customSections: CustomSection[];
  accentColor?: string;
  fontFamily?: string;
  sectionOrder?: string[];
  showIcons?: boolean;
}

async function getResumeData(resumeId: string): Promise<ResumeData | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8888'}/api/resumes/${resumeId}`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      return null;
    }
    
    const resume = await response.json();
    return resume as ResumeData;
  } catch (error) {
    console.error('Error fetching resume:', error);
    return null;
  }
}

export default async function Page({
  params: { resumeId },
}: {
  params: { resumeId: string };
}) {
  const resumeData = await getResumeData(resumeId);
  const session = await getServerSession(authOptions);

  if (!resumeData) {
    return (
      <div className="p-8 text-center dark:bg-gray-800 min-h-[80vh]">
        <p className="text-gray-600 dark:text-gray-400">No resume data found</p>
        <p className="text-sm text-gray-500">ID: {resumeId}</p>
        <p className="text-sm text-gray-500">User: {session?.user?.email}</p>
      </div>
    );
  }

  return <ResumeView resumeData={resumeData} resumeId={resumeId} />;
}