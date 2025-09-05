"use client";
import { useMemo } from "react";
import type { TemplateProps } from "./types";
import { Mail, Phone, MapPin, Linkedin, Github, Globe } from "lucide-react";

export function CreativeTemplate({
  resumeData,
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

  return (
    <div className="w-full mx-auto bg-white px-8 py-6" style={{ fontFamily }}>
      {/* Header */}
      <div className="text-center mb-6">
        <h1
          className="text-4xl font-bold"
          style={{ fontFamily: headerFont, color: colors.sectionTitle }}
        >
          {resumeData.personalDetails.fullName}
        </h1>
        <p className="text-lg mt-1" style={{ color: colors.subheading }}>
          {resumeData.jobTitle}
        </p>

        {/* Contact Bar */}
        <div
          className="flex flex-wrap justify-center gap-6 text-sm mt-4"
          style={{ color: colors.tertiary }}
        >
          {resumeData.personalDetails.email && (
            <span className="flex items-center gap-1">
              {showIcons && <Mail className="w-4 h-4" />}
              {resumeData.personalDetails.email}
            </span>
          )}
          {resumeData.personalDetails.phone && (
            <span className="flex items-center gap-1">
              {showIcons && <Phone className="w-4 h-4" />}
              {resumeData.personalDetails.phone}
            </span>
          )}
          {resumeData.personalDetails.location && (
            <span className="flex items-center gap-1">
              {showIcons && <MapPin className="w-4 h-4" />}
              {resumeData.personalDetails.location}
            </span>
          )}
          {resumeData.personalDetails.linkedin && (
            <span className="flex items-center gap-1">
              {showIcons && <Linkedin className="w-4 h-4" />}
              {resumeData.personalDetails.linkedin}
            </span>
          )}
          {resumeData.personalDetails.github && (
            <span className="flex items-center gap-1">
              {showIcons && <Github className="w-4 h-4" />}
              {resumeData.personalDetails.github}
            </span>
          )}
          {resumeData.personalDetails.website && (
            <span className="flex items-center gap-1">
              {showIcons && <Globe className="w-4 h-4" />}
              {resumeData.personalDetails.website}
            </span>
          )}
        </div>
      </div>

      {/* Sections */}
      {sectionOrder.map((section) => (
        <div key={section} className="mb-6">
          {/* You can render section content here */}
        </div>
      ))}
    </div>
  );
}
