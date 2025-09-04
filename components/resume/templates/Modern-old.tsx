import { Input } from '@/components/ui/input';
import type { TemplateProps } from './types';
import { Textarea } from '@/components/ui/textarea';
import { Montserrat } from 'next/font/google';

const raleway = Montserrat({
  subsets: ['latin'],
  weight: ['400', '700'],
});

export function OldModernTemplate({ resumeData, isEditing, updateField }: TemplateProps) {
  const renderMarkdown = (text: string): string => {
    if (!text) return '';
    
    return text
      .split('\n')
      .map((line, index) => {
        // Convert bold text
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Convert bullet points
        if (line.trim().startsWith('- ') && index === 0) {
          line = `• ${line.substring(2)}`;
        } else if(line.trim().startsWith('- ') && index > 0){
          line = `<br/>• ${line.substring(2)}`;
        }
        return line;
      })
      .join('\n');
  };
  
  const renderInput = ({ 
    value, 
    onChange, 
    multiline = false,
    className = "",
    link = false,
    ariaLabel = ""
  }: { 
    value: string, 
    onChange: (value: string) => void,
    multiline?: boolean,
    className?: string,
    link?: boolean,
    ariaLabel?: string
  }) => {
    if (!isEditing) {
      if (link) {
        return (
          <a 
            href={value} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={`hover:text-blue-700 ${className}`}
            aria-label={ariaLabel}
          >
            {value}
          </a>
        );
      }
      
      return (
        <div 
          className={className}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
        />
      );
    }

    if (multiline) {
      return (
        <Textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full min-h-[60px] ${className}`}
          aria-label={ariaLabel}
        />
      );
    }

    return (
      <Input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={`focus-visible:ring-2 ${className}`}
        aria-label={ariaLabel}
      />
    );
  };

  const hasContent = (section: unknown): boolean => {
    if (!section) return false;
    if (Array.isArray(section)) return section.length > 0;
    if (typeof section === 'object' && section !== null) {
      return Object.values(section).some(value => 
        typeof value === 'string' ? value.trim() !== '' : Boolean(value)
      );
    }
    return typeof section === 'string' ? section.trim() !== '' : Boolean(section);
  };

  return (
    <div className={`w-full mx-auto bg-white px-6 py-4 ${raleway.className}`}>
      {/* Personal Details Section */}
      <div className="mb-8 break-inside-avoid">
        <div className="flex items-center space-x-2">
          <h1 className="text-4xl font-bold text-gray-800 text-left mb-3">
            {renderInput({
              value: resumeData.personalDetails.fullName,
              onChange: (value) => updateField('personalDetails', null, 'fullName', value),
              className: "text-left text-cyan-700",
              ariaLabel: "Full name"
            })}
          </h1>
          <p>
          {renderInput({
              value: resumeData.jobTitle,
              onChange: (value) => updateField('jobTitle',null, 'jobTitle', value),
              className: "text-left text-cyan-800",
              ariaLabel: "Job Title"
            })}
          </p>
        </div>
        <div className="text-left text-gray-600 text-sm">
          {resumeData.personalDetails.email && (
            <div className="inline-flex items-center gap-1 mx-2">
              {renderInput({
                value: resumeData.personalDetails.email,
                onChange: (value) => updateField('personalDetails', null, 'email', value),
                className: "inline-block",
                ariaLabel: "Email address"
              })}
            </div>
          )}
          {resumeData.personalDetails.phone && (
            <div className="inline-flex items-center gap-1 mx-2">
              {renderInput({
                value: resumeData.personalDetails.phone,
                onChange: (value) => updateField('personalDetails', null, 'phone', value),
                className: "inline-block",
                ariaLabel: "Phone number"
              })}
            </div>
          )}
          {resumeData.personalDetails.location && (
            <div className="inline-flex items-center gap-1 mx-2">
              {renderInput({
                value: resumeData.personalDetails.location,
                onChange: (value) => updateField('personalDetails', null, 'location', value),
                className: "inline-block",
                ariaLabel: "Location"
              })}
            </div>
          )}
        </div>
        <div className="text-left mt-2">
          {resumeData.personalDetails.linkedin && (
            <div className="inline-flex items-center gap-1 mx-2">
              {renderInput({
                value: resumeData.personalDetails.linkedin,
                onChange: (value) => updateField('personalDetails', null, 'linkedin', value),
                className: "text-blue-600 hover:underline inline-block text-sm",
                link: true,
                ariaLabel: "LinkedIn profile"
              })}
            </div>
          )}
          {resumeData.personalDetails.github && (
            <div className="inline-flex items-center gap-1 mx-2">
              {renderInput({
                value: resumeData.personalDetails.github,
                onChange: (value) => updateField('personalDetails', null, 'github', value),
                className: "text-blue-600 hover:underline inline-block text-sm",
                link: true,
                ariaLabel: "GitHub profile"
              })}
            </div>
          )}
        </div>
      </div>

      {/* Professional Summary */}
      {hasContent(resumeData.objective) && (
        <div className="mb-6 text-cyan-700 break-inside-avoid">
          <div className="flex items-center gap-2 text-nowrap text-lg font-semibold mb-3 pb-1">
            <h2>Professional Summary</h2>
            <div className="w-full h-1 mt-1 bg-cyan-700"></div>
          </div>
          {renderInput({
            value: resumeData.objective,
            onChange: (value) => updateField('objective', null, 'objective', value),
            multiline: true,
            className: "text-gray-700 text-sm leading-relaxed text-justify",
            ariaLabel: "Professional summary"
          })}
        </div>
      )}

      {/* Work Experience Section */}
      {hasContent(resumeData.workExperience) && (
        <div className="mb-6 text-cyan-700 flex-1">
          <div className="flex items-center gap-2 text-nowrap text-lg font-semibold mb-3 pb-1">
            <h2>Work Experience</h2>
            <div className="w-full h-1 mt-1 bg-cyan-700"></div>
          </div>
          {resumeData.workExperience.map((experience, index) => (
            <div 
              key={index} 
              className={`pb-4 break-inside-avoid ${
                index !== resumeData.workExperience.length - 1 
                  ? "mb-4 border-b border-dashed border-cyan-700" 
                  : "last:mb-0"
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="flex-1">
                  {renderInput({
                    value: experience.jobTitle,
                    onChange: (value) => updateField('workExperience', index, 'jobTitle', value),
                    className: "font-semibold text-gray-800",
                    ariaLabel: "Job title"
                  })}
                </div>
                <div className="text-cyan-700 text-sm flex items-center gap-1">
                  {renderInput({
                    value: experience.startDate,
                    onChange: (value) => updateField('workExperience', index, 'startDate', value),
                    ariaLabel: "Start date"
                  })}
                  <span>-</span>
                  {renderInput({
                    value: experience.endDate,
                    onChange: (value) => updateField('workExperience', index, 'endDate', value),
                    ariaLabel: "End date"
                  })}
                </div>
              </div>
              <div className="flex flex-col">
                {experience.location ? <div className="flex mb-1 items-center">
                  {renderInput({
                    value: experience.companyName,
                    onChange: (value) => updateField('workExperience', index, 'companyName', value),
                    className: "text-cyan-700 font-medium text-sm",
                    ariaLabel: "Company name"
                  })}
                  <span className='ml-[2px] mr-1'>,</span>
                  {renderInput({
                    value: experience.location,
                    onChange: (value) => updateField('workExperience', index, 'location', value),
                    className: "text-cyan-900 text-xs mt-[2px]",
                    ariaLabel: "Location"
                  })}
                </div> :
                <>
                {renderInput({
                    value: experience.companyName,
                    onChange: (value) => updateField('workExperience', index, 'companyName', value),
                    className: "text-cyan-700 font-medium text-sm mb-1",
                    ariaLabel: "Company name"
                  })}
                </>
                }
                {renderInput({
                  value: experience.description,
                  onChange: (value) => updateField('workExperience', index, 'description', value),
                  multiline: true,
                  className: "text-gray-600 text-sm ml-4 text-justify",
                  ariaLabel: "Job description"
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Projects Section */}
      {hasContent(resumeData.projects) && (
        <div className="mb-6 text-cyan-700">
          <div className="flex items-center gap-2 text-nowrap text-lg font-semibold mb-3 pb-1">
            <h2>Projects</h2>
            <div className="w-full h-1 mt-1 bg-cyan-700"></div>
          </div>
          {resumeData.projects.map((project, index) => (
            <div 
              key={index} 
              className={`pb-4 break-inside-avoid ${
                index !== resumeData.projects.length - 1 
                  ? "mb-4 border-b border-dashed border-cyan-700" 
                  : "last:mb-0"
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                {renderInput({
                  value: project.projectName,
                  onChange: (value) => updateField('projects', index, 'projectName', value),
                  className: "text-cyan-700",
                  ariaLabel: "Project name"
                })}
                {project.link && renderInput({
                  value: project.link,
                  onChange: (value) => updateField('projects', index, 'link', value),
                  className: "text-blue-600 hover:underline text-sm italic",
                  link: true,
                  ariaLabel: "Project link"
                })}
              </div>
              {renderInput({
                value: project.description,
                onChange: (value) => updateField('projects', index, 'description', value),
                multiline: true,
                className: "text-gray-600 text-sm ml-4 text-justify",
                ariaLabel: "Project description"
              })}
            </div>
          ))}
        </div>
      )}

      {/* Education Section */}
      {hasContent(resumeData.education) && (
        <div className="mb-6 text-cyan-700 break-inside-avoid">
          <div className="flex items-center gap-2 text-nowrap text-lg font-semibold mb-3 pb-1">
            <h2>Education</h2>
            <div className="w-full h-1 mt-1 bg-cyan-700"></div>
          </div>
          {resumeData.education.map((edu, index) => (
            <div key={index} className="mb-4 last:mb-0">
              <div className="flex justify-between items-start">
                {renderInput({
                  value: edu.degree,
                  onChange: (value) => updateField('education', index, 'degree', value),
                  className: "font-semibold text-gray-800",
                  ariaLabel: "Degree"
                })}
                <div className="text-cyan-700 text-sm flex items-center gap-1">
                  {renderInput({
                    value: edu.startDate,
                    onChange: (value) => updateField('education', index, 'startDate', value),
                    ariaLabel: "Start date"
                  })}
                  {edu.startDate && <span>-</span>}
                  {renderInput({
                    value: edu.endDate,
                    onChange: (value) => updateField('education', index, 'endDate', value),
                    ariaLabel: "End date"
                  })}
                </div>
              </div>
              <div className="flex items-center">
                {renderInput({
                  value: edu.institution + " -",
                  onChange: (value) => updateField('education', index, 'institution', value),
                  className: "text-cyan-700 font-medium text-sm",
                  ariaLabel: "Institution"
                })}
                {renderInput({
                  value: edu.location,
                  onChange: (value) => updateField('education', index, 'location', value),
                  className: "text-cyan-900 font-light text-xs align-bottom ml-1",
                  ariaLabel: "Location"
                })}
              </div>
              {edu.description && (
                <div className="text-gray-600 text-sm">
                  {renderInput({
                    value: edu.description,
                    onChange: (value) => updateField('education', index, 'description', value),
                    className: "inline-block",
                    ariaLabel: ""
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Skills Section */}
      {hasContent(resumeData.skills) && (
        <div className="mb-6 text-cyan-700">
          <div className="flex items-center gap-2 text-nowrap text-lg font-semibold mb-3 pb-1">
            <h2>Skills</h2>
            <div className="w-full h-1 mt-1 bg-cyan-700"></div>
          </div>
          <div className="space-y-2">
            {resumeData.skills.map((skill, index) => (
              <div key={index} className="flex items-start break-inside-avoid">
                {skill.skillType === 'individual' ? (
                  <>
                    {renderInput({
                      value: skill.skill,
                      onChange: (value) => updateField('skills', index, 'skill', value),
                      className: "text-cyan-800 text-sm font-semibold",
                      ariaLabel: "Skill"
                    })}
                  </>
                ) : (
                  <>
                    {renderInput({
                      value: skill.category,
                      onChange: (value) => updateField('skills', index, 'category', value),
                      className: "text-cyan-800 text-sm font-semibold",
                      ariaLabel: "Skill category"
                    })}
                    <span className="text-cyan-800 text-sm font-semibold mx-2">:</span>
                    {renderInput({
                      value: skill.skills,
                      onChange: (value) => updateField('skills', index, 'skills', value),
                      className: "text-gray-700 text-sm",
                      ariaLabel: "Skills"
                    })}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications Section */}
      {hasContent(resumeData.certifications) && (
        <div className="mb-6 text-cyan-700">
          <div className="flex items-center gap-2 text-nowrap text-lg font-semibold mb-3 pb-1">
            <h2>Certifications</h2>
            <div className="w-full h-1 mt-1 bg-cyan-700"></div>
          </div>
          {resumeData.certifications.map((cert, index) => (
            <div key={index} className="mb-3 last:mb-0">
              <div className="flex justify-between items-start">
                {renderInput({
                  value: cert.certificationName,
                  onChange: (value) => updateField('certifications', index, 'certificationName', value),
                  className: "font-medium text-gray-800 text-sm",
                  ariaLabel: "Certification name"
                })}
                <div className="flex items-center gap-1">
                  {renderInput({
                    value: cert.issueDate,
                    onChange: (value) => updateField('certifications', index, 'issueDate', value),
                    className: "text-cyan-700 text-sm",
                    ariaLabel: "Certification date"
                  })}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {renderInput({
                  value: cert.issuingOrganization,
                  onChange: (value) => updateField('certifications', index, 'issuingOrganization', value),
                  className: "text-cyan-800 text-sm",
                  ariaLabel: "Issuing organization"
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Languages Section */}
      {hasContent(resumeData.languages) && (
        <div className="mb-6 text-cyan-700">
          <div className="flex items-center gap-2 text-nowrap text-lg font-semibold mb-3 pb-1">
            <h2>Languages</h2>
            <div className="w-full h-1 mt-1 bg-cyan-700"></div>
          </div>
          <div className="flex flex-col">
            {resumeData.languages.map((language, index) => (
              <div key={index} className="text-sm flex items-center gap-2 p-1 text-nowrap rounded-md">
                {renderInput({
                  value: language.language,
                  onChange: (value) => updateField('languages', index, 'language', value),
                  className: "font-medium text-gray-800",
                  ariaLabel: "Language name"
                })}
                <span>-</span>
                {renderInput({
                  value: language.proficiency,
                  onChange: (value) => updateField('languages', index, 'proficiency', value),
                  className: "text-cyan-700",
                  ariaLabel: "Language proficiency"
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
