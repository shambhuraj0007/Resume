"use client";
import { useCallback, useMemo } from "react";
import type { TemplateProps } from "./types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Linkedin, Github, Globe, Link2, Building2, GraduationCap } from "lucide-react";

export function CreativeTemplate({
  resumeData,
  isEditing,
  updateField,
  accentColor = "#1E3A8A",
  fontFamily = "Lato, sans-serif",
  headerFont = "Merriweather, serif",
  sectionOrder = [
    "objective",
    "workExperience",
    "projects",
    "education",
    "skills",
    "certifications",
    "languages",
    "customSections",
  ],
  showIcons,
}: TemplateProps & {
  accentColor?: string;
  fontFamily?: string;
  headerFont?: string;
  sectionOrder?: string[];
  showIcons?: boolean;
}) {
  const colors = useMemo(
    () => ({
      sectionTitle: accentColor,
      subheading: accentColor,
      tertiary: accentColor,
    }),
    [accentColor]
  );

  const renderMarkdown = (text: string): string => {
    if (!text) return "";
    return text
      .split("\n")
      .map((line, index) => {
        line = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        if (line.trim().startsWith("- ") && index === 0) {
          line = `• ${line.substring(2)}`;
        } else if (line.trim().startsWith("- ") && index > 0) {
          line = `<br/>• ${line.substring(2)}`;
        }
        return line;
      })
      .join("\n");
  };

  const renderInput = useCallback(
    ({
      value,
      onChange,
      multiline = false,
      className = "",
      type = "",
      ariaLabel = "",
      textColor = "text-gray-700",
      inlineStyle = {},
    }: {
      value: string;
      onChange: (value: string) => void;
      multiline?: boolean;
      className?: string;
      type?: string;
      ariaLabel?: string;
      textColor?: string;
      inlineStyle?: React.CSSProperties;
    }) => {
      if (!isEditing) {
        if (type === "link") {
          return (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className={`hover:underline ${textColor} ${className}`}
              style={inlineStyle}
              aria-label={ariaLabel}
            >
              {value}
            </a>
          );
        }
        if (type === "mail") {
          return (
            <a
              href={`mailto:${value}`}
              className={`hover:underline ${textColor} ${className}`}
              style={inlineStyle}
              aria-label={ariaLabel}
            >
              {value}
            </a>
          );
        }
        if (type === "phone") {
          return (
            <a
              href={`tel:${value}`}
              className={`hover:underline ${textColor} ${className}`}
              style={inlineStyle}
              aria-label={ariaLabel}
            >
              {value}
            </a>
          );
        }
        return (
          <div
            className={`${textColor} ${className}`}
            style={inlineStyle}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
          />
        );
      }

      if (multiline) {
        return (
          <Textarea
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full min-h-[60px] ${textColor} ${className}`}
            style={inlineStyle}
            aria-label={ariaLabel}
          />
        );
      }

      return (
        <Input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className={`focus-visible:ring-2 ${textColor} ${className}`}
          style={inlineStyle}
          aria-label={ariaLabel}
        />
      );
    },
    [isEditing]
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="flex items-center gap-2 text-lg font-semibold mb-3">
      <h2 style={{ color: colors.sectionTitle }}>{title}</h2>
      <div className="w-full h-1 mt-1" style={{ background: `linear-gradient(90deg, ${colors.sectionTitle}, transparent)` }} />
    </div>
  );

  const hasContent = (section: unknown): boolean => {
    if (!section) return false;
    if (Array.isArray(section)) return section.length > 0;
    if (typeof section === "object" && section !== null) {
      return Object.values(section).some((value) =>
        typeof value === "string" ? value.trim() !== "" : Boolean(value)
      );
    }
    return typeof section === "string" ? section.trim() !== "" : Boolean(section);
  };

  return (
    <div className="w-full mx-auto bg-white px-8 py-6" style={{ fontFamily }}>
      {/* Header */}
      <div className="text-center mb-6">
        <h1
          className="text-4xl font-bold"
          style={{ fontFamily: headerFont, color: colors.sectionTitle }}
        >
          {renderInput({
            value: resumeData.personalDetails.fullName,
            onChange: (value) => updateField("personalDetails", null, "fullName", value),
            className: "text-center",
            textColor: "text-gray-900",
            ariaLabel: "Full name",
          })}
        </h1>
        <p className="text-lg mt-1" style={{ color: colors.subheading }}>
          {renderInput({
            value: resumeData.jobTitle,
            onChange: (value) => updateField("jobTitle", null, "jobTitle", value),
            className: "text-center",
            inlineStyle: { color: colors.subheading },
            ariaLabel: "Job Title",
          })}
        </p>

        {/* Contact Bar */}
        <div
          className="flex flex-wrap justify-center gap-6 text-sm mt-4"
          style={{ color: colors.tertiary }}
        >
          {resumeData.personalDetails.email && (
            <span className="flex items-center gap-1">
              {showIcons && <Mail className="w-4 h-4" />}
              {renderInput({
                value: resumeData.personalDetails.email,
                onChange: (value) => updateField("personalDetails", null, "email", value),
                type: "mail",
                ariaLabel: "Email",
                textColor: "text-gray-600",
              })}
            </span>
          )}
          {resumeData.personalDetails.phone && (
            <span className="flex items-center gap-1">
              {showIcons && <Phone className="w-4 h-4" />}
              {renderInput({
                value: resumeData.personalDetails.phone,
                onChange: (value) => updateField("personalDetails", null, "phone", value),
                type: "phone",
                ariaLabel: "Phone",
                textColor: "text-gray-600",
              })}
            </span>
          )}
          {resumeData.personalDetails.location && (
            <span className="flex items-center gap-1">
              {showIcons && <MapPin className="w-4 h-4" />}
              {renderInput({
                value: resumeData.personalDetails.location,
                onChange: (value) => updateField("personalDetails", null, "location", value),
                ariaLabel: "Location",
                textColor: "text-gray-600",
              })}
            </span>
          )}
          {resumeData.personalDetails.linkedin && (
            <span className="flex items-center gap-1">
              {showIcons && <Linkedin className="w-4 h-4" />}
              {renderInput({
                value: resumeData.personalDetails.linkedin,
                onChange: (value) => updateField("personalDetails", null, "linkedin", value),
                type: "link",
                ariaLabel: "LinkedIn",
                textColor: "text-gray-600",
              })}
            </span>
          )}
          {resumeData.personalDetails.github && (
            <span className="flex items-center gap-1">
              {showIcons && <Github className="w-4 h-4" />}
              {renderInput({
                value: resumeData.personalDetails.github,
                onChange: (value) => updateField("personalDetails", null, "github", value),
                type: "link",
                ariaLabel: "GitHub",
                textColor: "text-gray-600",
              })}
            </span>
          )}
          {resumeData.personalDetails.website && (
            <span className="flex items-center gap-1">
              {showIcons && <Globe className="w-4 h-4" />}
              {renderInput({
                value: resumeData.personalDetails.website,
                onChange: (value) => updateField("personalDetails", null, "website", value),
                type: "link",
                ariaLabel: "Website",
                textColor: "text-gray-600",
              })}
            </span>
          )}
        </div>
      </div>

      {/* Sections */}
      {sectionOrder.map((section) => (
        <div key={section} className="mb-6">
          {section === "objective" && hasContent(resumeData.objective) && (
            <div>
              <SectionHeader title="Professional Summary" />
              {renderInput({
                value: (resumeData as any).objective,
                onChange: (value) => updateField("objective", null, "objective", value),
                multiline: true,
                className: "text-sm leading-relaxed text-justify",
                textColor: "text-gray-700",
                ariaLabel: "Professional summary",
              })}
            </div>
          )}

          {section === "workExperience" && hasContent(resumeData.workExperience) && (
            <div>
              <SectionHeader title="Work Experience" />
              <div className="space-y-3">
                {resumeData.workExperience.map((experience, idx) => (
                  <div key={idx} className="pb-3 last:pb-0 border-b border-dashed" style={{ borderColor: colors.sectionTitle }}>
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex-1">
                        {renderInput({
                          value: experience.jobTitle,
                          onChange: (value) => updateField("workExperience", idx, "jobTitle", value),
                          className: "font-semibold",
                          inlineStyle: { color: colors.subheading },
                          ariaLabel: "Job title",
                        })}
                      </div>
                      <div className="text-sm flex items-center gap-1" style={{ color: colors.tertiary }}>
                        {renderInput({
                          value: experience.startDate,
                          onChange: (value) => updateField("workExperience", idx, "startDate", value),
                          inlineStyle: { color: colors.tertiary },
                          ariaLabel: "Start date",
                        })}
                        <span>-</span>
                        {renderInput({
                          value: experience.endDate,
                          onChange: (value) => updateField("workExperience", idx, "endDate", value),
                          inlineStyle: { color: colors.tertiary },
                          ariaLabel: "End date",
                        })}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        {showIcons && <Building2 className="w-4 h-4" style={{ color: colors.tertiary }} />}
                        {renderInput({
                          value: experience.companyName,
                          onChange: (value) => updateField("workExperience", idx, "companyName", value),
                          className: "font-medium text-sm",
                          inlineStyle: { color: colors.subheading },
                          ariaLabel: "Company name",
                        })}
                        {experience.location && (
                          <div className="flex items-center">
                            {showIcons && <MapPin className="w-4 h-4" style={{ color: colors.tertiary }} />}
                            {renderInput({
                              value: experience.location,
                              onChange: (value) => updateField("workExperience", idx, "location", value),
                              className: "text-xs ml-1",
                              inlineStyle: { color: colors.tertiary },
                              ariaLabel: "Location",
                            })}
                          </div>
                        )}
                      </div>
                      {renderInput({
                        value: experience.description,
                        onChange: (value) => updateField("workExperience", idx, "description", value),
                        multiline: true,
                        className: "text-sm ml-4 text-justify",
                        textColor: "text-gray-600",
                        ariaLabel: "Job description",
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === "projects" && hasContent(resumeData.projects) && (
            <div>
              <SectionHeader title="Projects" />
              <div className="space-y-3">
                {resumeData.projects.map((project, idx) => (
                  <div key={idx} className="pb-3 last:pb-0 border-b border-dashed" style={{ borderColor: colors.sectionTitle }}>
                    <div className="flex items-center justify-between mb-1">
                      {renderInput({
                        value: project.projectName,
                        onChange: (value) => updateField("projects", idx, "projectName", value),
                        className: "font-semibold",
                        inlineStyle: { color: colors.subheading },
                        ariaLabel: "Project name",
                      })}
                      {project.link && (
                        <div className="flex items-center gap-1">
                          {showIcons && <Link2 className="w-4 h-4" style={{ color: colors.tertiary }} />}
                          {renderInput({
                            value: project.link,
                            onChange: (value) => updateField("projects", idx, "link", value),
                            className: "text-sm italic",
                            type: "link",
                            inlineStyle: { color: colors.tertiary },
                            ariaLabel: "Project link",
                          })}
                        </div>
                      )}
                    </div>
                    {renderInput({
                      value: project.description,
                      onChange: (value) => updateField("projects", idx, "description", value),
                      multiline: true,
                      className: "text-sm ml-4 text-justify",
                      textColor: "text-gray-600",
                      ariaLabel: "Project description",
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === "education" && hasContent(resumeData.education) && (
            <div>
              <SectionHeader title="Education" />
              <div className="space-y-3">
                {resumeData.education.map((edu, idx) => (
                  <div key={idx} className="pb-3 last:pb-0">
                    <div className="flex justify-between items-start">
                      {renderInput({
                        value: edu.degree,
                        onChange: (value) => updateField("education", idx, "degree", value),
                        className: "font-semibold",
                        inlineStyle: { color: colors.subheading },
                        ariaLabel: "Degree",
                      })}
                      <div className="text-sm flex items-center gap-1" style={{ color: colors.tertiary }}>
                        {renderInput({
                          value: edu.startDate,
                          onChange: (value) => updateField("education", idx, "startDate", value),
                          inlineStyle: { color: colors.tertiary },
                          ariaLabel: "Start date",
                        })}
                        {edu.startDate && <span>-</span>}
                        {renderInput({
                          value: edu.endDate,
                          onChange: (value) => updateField("education", idx, "endDate", value),
                          inlineStyle: { color: colors.tertiary },
                          ariaLabel: "End date",
                        })}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {showIcons && <GraduationCap className="w-4 h-4" style={{ color: colors.tertiary }} />}
                      <div className="flex items-center gap-1">
                        {renderInput({
                          value: edu.institution,
                          onChange: (value) => updateField("education", idx, "institution", value),
                          className: "font-medium text-sm",
                          inlineStyle: { color: colors.subheading },
                          ariaLabel: "Institution",
                        })}
                        {edu.location && (
                          <div className="flex items-center">
                            {showIcons && <MapPin className="w-4 h-4" style={{ color: colors.tertiary }} />}
                            {renderInput({
                              value: edu.location,
                              onChange: (value) => updateField("education", idx, "location", value),
                              className: "text-xs ml-1",
                              inlineStyle: { color: colors.tertiary },
                              ariaLabel: "Location",
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                    {edu.description && (
                      <div className="text-sm">
                        {renderInput({
                          value: edu.description,
                          onChange: (value) => updateField("education", idx, "description", value),
                          className: "inline-block",
                          textColor: "text-gray-600",
                          ariaLabel: "Education description",
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === "skills" && hasContent(resumeData.skills) && (
            <div>
              <SectionHeader title="Skills" />
              <div className="space-y-1">
                {resumeData.skills.map((skill, idx) => (
                  <div key={idx} className="break-inside-avoid">
                    {skill.skillType === "individual" ? (
                      renderInput({
                        value: skill.skill,
                        onChange: (value) => updateField("skills", idx, "skill", value),
                        className: "text-sm font-semibold",
                        inlineStyle: { color: colors.subheading },
                        ariaLabel: "Skill",
                      })
                    ) : (
                      <div className="flex items-start">
                        {renderInput({
                          value: skill.category,
                          onChange: (value) => updateField("skills", idx, "category", value),
                          className: "text-sm font-semibold",
                          inlineStyle: { color: colors.subheading },
                          ariaLabel: "Skill category",
                        })}
                        <span className="mx-2 text-sm font-semibold" style={{ color: colors.subheading }}>:</span>
                        {renderInput({
                          value: skill.skills,
                          onChange: (value) => updateField("skills", idx, "skills", value),
                          className: "text-sm",
                          textColor: "text-gray-700",
                          ariaLabel: "Skills",
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === "certifications" && hasContent(resumeData.certifications) && (
            <div>
              <SectionHeader title="Certifications" />
              <div className="space-y-2">
                {resumeData.certifications.map((cert, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-start">
                      {renderInput({
                        value: cert.certificationName,
                        onChange: (value) => updateField("certifications", idx, "certificationName", value),
                        className: "font-medium text-sm",
                        inlineStyle: { color: colors.tertiary },
                        ariaLabel: "Certification name",
                      })}
                      <div className="flex items-center gap-1">
                        {renderInput({
                          value: cert.issueDate,
                          onChange: (value) => updateField("certifications", idx, "issueDate", value),
                          className: "text-sm",
                          inlineStyle: { color: colors.tertiary },
                          ariaLabel: "Certification date",
                        })}
                      </div>
                    </div>
                    {renderInput({
                      value: cert.issuingOrganization,
                      onChange: (value) => updateField("certifications", idx, "issuingOrganization", value),
                      className: "text-sm",
                      inlineStyle: { color: colors.sectionTitle },
                      ariaLabel: "Issuing organization",
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === "languages" && hasContent(resumeData.languages) && (
            <div>
              <SectionHeader title="Languages" />
              <div className="space-y-1">
                {resumeData.languages.map((language, idx) => (
                  <div key={idx} className="text-sm flex items-center gap-2">
                    {renderInput({
                      value: language.language,
                      onChange: (value) => updateField("languages", idx, "language", value),
                      className: "font-medium",
                      inlineStyle: { color: colors.subheading },
                      ariaLabel: "Language name",
                    })}
                    <span style={{ color: colors.tertiary }}>-</span>
                    {renderInput({
                      value: language.proficiency,
                      onChange: (value) => updateField("languages", idx, "proficiency", value),
                      inlineStyle: { color: colors.tertiary },
                      ariaLabel: "Language proficiency",
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === "customSections" && hasContent((resumeData as any).customSections) && (
            <div>
              {((resumeData as any).customSections || []).map((custom: any, idx: number) => (
                <div key={idx} className="mb-4">
                  <SectionHeader title={custom.sectionTitle} />
                  {renderInput({
                    value: custom.content,
                    onChange: (value) => updateField("customSections", idx, "content", value),
                    multiline: true,
                    className: "text-sm",
                    textColor: "text-gray-700",
                    ariaLabel: `${custom.sectionTitle} content`,
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
