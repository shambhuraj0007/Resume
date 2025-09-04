"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, CheckCircle, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Maximum file size: 5MB in bytes
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function ATSCheckerPage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<{
    score: number;
    keywords: string[];
    suggestions: string[];
  } | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Handle file selection via input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid File",
        description: "Please upload a valid PDF resume!",
        duration: 3000,
        variant: "destructive",
      });
      return;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File Too Large",
        description: "Maximum file size is 5MB.",
        duration: 3000,
        variant: "destructive",
      });
      return;
    }
    
    setPdfFile(file);
    toast({
      title: "File Selected",
      description: `${file.name} selected successfully!`,
      duration: 3000,
    });
  };

  // Handle drag-and-drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    const file = e.dataTransfer.files?.[0];
    
    if (!file) return;
    
    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid File",
        description: "Please drop a valid PDF resume!",
        duration: 3000,
        variant: "destructive",
      });
      return;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File Too Large",
        description: "Maximum file size is 5MB.",
        duration: 3000,
        variant: "destructive",
      });
      return;
    }
    
    setPdfFile(file);
    toast({
      title: "File Uploaded",
      description: `${file.name} uploaded successfully!`,
      duration: 3000,
    });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pdfFile) {
      toast({
        title: "No Resume",
        description: "Please upload a resume PDF!",
        duration: 3000,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setSubmitted(true);
    
    const formData = new FormData();
    formData.append("resume", pdfFile);
    if (jobDescription.trim()) formData.append("jobDescription", jobDescription.trim());

    try {
      const response = await fetch("/api/ats-check", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("API request failed");

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setResult(data);
      toast({
        title: "Success",
        description: "ATS check completed!",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error checking ATS:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong.",
        duration: 3000,
        variant: "destructive",
      });
      setSubmitted(false); // Return to form view on error
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setResult(null);
    setPdfFile(null);
    setJobDescription("");
  };

  return (
    <div className="container min-h-screen mx-auto py-8">
      <div className="flex flex-col items-center justify-center mb-8">
        <h1 className="text-4xl font-bold text-center underline">
          ATS Resume Checker.
        </h1>
        <p>Check your resume against your job description.</p>
      </div>
      
      {!submitted ? (
        // Upload Form
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Drop Zone */}
              <div>
                <label htmlFor="resume" className="block text-sm font-medium mb-2">
                  Upload Resume (PDF, max 5MB)
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${pdfFile ? 'border-green-400 bg-green-50/10' : ''}`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  <Upload className={`w-8 h-8 mx-auto mb-2 ${pdfFile ? 'text-green-500' : 'text-muted-foreground'}`} />
                  <p className="text-sm text-muted-foreground">
                    {pdfFile ? pdfFile.name : "Drag & drop your PDF here or click to upload"}
                  </p>
                  {pdfFile && (
                    <p className="text-xs text-green-600 mt-1">
                      {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  )}
                  <Input
                    id="resume"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="resume"
                    className="mt-2 inline-block cursor-pointer text-blue-600 hover:underline"
                  >
                    Choose File
                  </label>
                </div>
              </div>

              {/* Job Description Textarea */}
              <div>
                <label htmlFor="jobDescription" className="block text-sm font-medium mb-2">
                  Job Description (Optional)
                </label>
                <textarea
                  id="jobDescription"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here for better keyword matching..."
                  className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-popover resize-y"
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <Button type="submit" disabled={loading || !pdfFile} className="w-full">
                {loading ? "Checking..." : "Check ATS Score"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        // Results Section
        <div className="max-w-2xl mx-auto space-y-6">
          {loading ? (
            // Loading Card
            <Card className="border border-blue-200">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
                <h3 className="text-lg font-medium text-center">Analyzing your resume...</h3>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  We&apos;re checking your resume against ATS criteria. This may take a moment.
                </p>
              </CardContent>
            </Card>
          ) : (
            // Results Cards
            <>
              {/* Score Card */}
              <Card className="border-t-4 border-t-blue-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">ATS Compatibility Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-4xl font-bold">{result?.score}%</span>
                    <span className="text-sm text-muted-foreground pb-1">
                      {result?.score && result.score >= 70 
                        ? "Good chance of passing ATS" 
                        : "May need improvements"}
                    </span>
                  </div>
                  <Progress 
                    value={result?.score || 0} 
                    className="h-3 mt-1" 
                  />
                </CardContent>
              </Card>

              {/* Keywords Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Matched Keywords</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {result?.keywords && result.keywords.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {result.keywords.map((keyword, idx) => (
                        <span 
                          key={idx} 
                          className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No keywords matched.</p>
                  )}
                </CardContent>
              </Card>

              {/* Suggestions Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    <span>Improvement Suggestions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {result?.suggestions && result.suggestions.length > 0 ? (
                    <ul className="space-y-2">
                      {result.suggestions.map((suggestion, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <span className="text-amber-500 mt-0.5">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">Your resume looks good! No suggestions available.</p>
                  )}
                </CardContent>
              </Card>

              {/* Back Button */}
              <Button 
                onClick={resetForm} 
                variant="outline" 
                className="w-full flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Check Another Resume
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}