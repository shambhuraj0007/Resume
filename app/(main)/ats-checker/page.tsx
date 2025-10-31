"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, CheckCircle, AlertCircle, ArrowLeft, Loader2, Coins, TrendingUp, Briefcase, FileText, Copy, Info, Sparkles, Target, AlertTriangle, XCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useCredits } from "@/hooks/useCredits";
import InsufficientCreditsModal from "@/components/credits/InsufficientCreditsModal";
import UpgradeModal from "@/components/credits/UpgradeModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

interface Suggestion {
  suggestion: string;
  originalText: string;
  improvedText: string;
  category: 'text' | 'keyword' | 'other';
}

interface CompatibilityResult {
  currentScore: number;
  potentialScore: number;
  currentCallback: number;
  potentialCallback: number;
  keywords: string[];
  topRequiredKeywords?: string[];
  missingKeywords?: string[];
  suggestions: Suggestion[];
  textSuggestions?: Suggestion[];
  keywordSuggestions?: Suggestion[];
  otherSuggestions?: Suggestion[];
  scoreBreakdown?: {
    requiredSkills: number;
    experience: number;
    responsibilities: number;
    education: number;
    industry: number;
  };
  confidence?: number;
  isValidJD?: boolean;
  isValidCV?: boolean;
  validationWarning?: string;
}

export default function JobMatchPage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [inputMode, setInputMode] = useState<"upload" | "paste">("upload");
  
  const { balance, checkCredits, refreshBalance } = useCredits();
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };
  
  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent Match";
    if (score >= 60) return "Good Match";
    if (score >= 40) return "Partial Match";
    return "Weak Match";
  };
  
  const validateFile = (file: File) => {
    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid File",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
      return false;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File Too Large",
        description: "Maximum file size is 5MB.",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setPdfFile(file);
      setResumeText("");
      toast({
        title: "Resume Selected",
        description: `${file.name} uploaded successfully!`,
      });
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && validateFile(file)) {
      setPdfFile(file);
      setResumeText("");
      toast({
        title: "Resume Uploaded",
        description: `${file.name} uploaded successfully!`,
      });
    }
  };

  const toggleInputMode = () => {
    const newMode = inputMode === "upload" ? "paste" : "upload";
    setInputMode(newMode);
    
    if (newMode === "upload") {
      setResumeText("");
    } else {
      setPdfFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputMode === "upload" && !pdfFile) {
      toast({
        title: "Missing Resume",
        description: "Please upload your resume PDF.",
        variant: "destructive",
      });
      return;
    }

    if (inputMode === "paste" && !resumeText.trim()) {
      toast({
        title: "Missing Resume",
        description: "Please paste your resume text.",
        variant: "destructive",
      });
      return;
    }

    if (!jobDescription.trim()) {
      toast({
        title: "Missing Job Description",
        description: "Please paste the job description to analyze compatibility.",
        variant: "destructive",
      });
      return;
    }

    const hasSufficientCredits = await checkCredits(1);
    if (!hasSufficientCredits) {
      setShowInsufficientModal(true);
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleConfirmAnalysis = async () => {
    setShowConfirmDialog(false);
    setLoading(true);
    
    const formData = new FormData();
    
    if (inputMode === "upload" && pdfFile) {
      formData.append("resume", pdfFile);
    } else if (inputMode === "paste" && resumeText.trim()) {
      const blob = new Blob([resumeText], { type: "text/plain" });
      const textFile = new File([blob], "resume.txt", { type: "text/plain" });
      formData.append("resume", textFile);
    }
    
    formData.append("jobDescription", jobDescription.trim());

    try {
      const response = await fetch("/api/ats-check", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Analysis failed");
      }

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setResult(data);
      refreshBalance();
      
      // Show validation warning if present
      if (data.validationWarning) {
        toast({
          title: "Validation Warning",
          description: data.validationWarning,
          variant: "destructive",
        });
      }
      
      toast({
        title: "Analysis Complete",
        description: "Job compatibility check completed! 1 credit used.",
      });
    } catch (error) {
      console.error("Error checking compatibility:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setResult(null);
    setPdfFile(null);
    setResumeText("");
    setJobDescription("");
    setInputMode("upload");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
    });
  };

  return (
    <div className="container min-h-screen mx-auto py-8 px-4">
      {/* Header */}
      {/* <div className="max-w-2xl mx-auto mb-8 text-center space-y-4">
        <h1 className="text-4xl font-bold">Job Match Analyzer</h1>
        <p className="text-muted-foreground">
          Check how well your resume matches the job description
        </p>
        
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
          <Coins className="h-5 w-5 text-primary" />
          <span className="font-medium">
            {balance?.credits ?? 0} {balance?.credits === 1 ? 'Credit' : 'Credits'}
          </span>
          <Button size="sm" variant="outline" onClick={() => setShowUpgradeModal(true)}>
            Buy More
          </Button>
        </div>
      </div> */}
      
      {/* Main Content */}
      {!result ? (
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Resume Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">
                    Your Resume <span className="text-red-500">*</span>
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={toggleInputMode}
                    className="text-xs"
                  >
                    {inputMode === "upload" ? (
                      <>
                        <Copy className="h-3 w-3 mr-1" />
                        Paste Text Instead
                      </>
                    ) : (
                      <>
                        <FileText className="h-3 w-3 mr-1" />
                        Upload PDF Instead
                      </>
                    )}
                  </Button>
                </div>

                {inputMode === "upload" ? (
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                      pdfFile ? 'border-green-400 bg-green-50/10' : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                    }`}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    <Upload className={`w-10 h-10 mx-auto mb-3 ${pdfFile ? 'text-green-500' : 'text-muted-foreground'}`} />
                    <p className="text-sm font-medium mb-1">
                      {pdfFile ? pdfFile.name : "Drag & drop your resume PDF here"}
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      {pdfFile ? `${(pdfFile.size / (1024 * 1024)).toFixed(2)} MB` : "or click to browse (max 5MB)"}
                    </p>
                    <Input
                      id="resume"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="resume">
                      <Button type="button" variant="outline" size="sm" asChild>
                        <span>Choose File</span>
                      </Button>
                    </label>
                  </div>
                ) : (
                  <div>
                    <textarea
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      placeholder="Paste your complete resume text here including all sections: contact info, summary, experience, education, skills, etc..."
                      className="w-full p-4 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background resize-y min-h-[200px]"
                      rows={12}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Paste the complete text from your resume for best results
                    </p>
                  </div>
                )}
              </div>

              {/* Job Description */}
              <div>
                <label htmlFor="jobDescription" className="block text-sm font-medium mb-2">
                  Job Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="jobDescription"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the complete job description here including responsibilities, requirements, and qualifications..."
                  className="w-full p-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background resize-y min-h-[160px]"
                  rows={8}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Include all job requirements, skills, and qualifications for accurate matching
                </p>
              </div>

              <Button 
                type="submit" 
                disabled={
                  loading || 
                  (inputMode === "upload" && !pdfFile) || 
                  (inputMode === "paste" && !resumeText.trim()) || 
                  !jobDescription.trim()
                } 
                className="w-full" 
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Match...
                  </>
                ) : (
                  "Analyze Job Match (1 Credit)"
                )}
              </Button>
              
              <p className="text-xs text-center text-muted-foreground">
                This analysis uses 1 credit and provides detailed compatibility insights
              </p>
            </form>
          </CardContent>
        </Card>
      ) : loading ? (
        <Card className="max-w-2xl mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
            <h3 className="text-lg font-medium">Analyzing job compatibility...</h3>
            <p className="text-sm text-muted-foreground mt-2">Comparing your resume with job requirements</p>
          </CardContent>
        </Card>
      ) : (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Validation Warning */}
          {result.validationWarning && (!result.isValidCV || !result.isValidJD) && (
            <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-amber-900 dark:text-amber-100">Input Validation Warning</h3>
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      {result.validationWarning}
                    </p>
                    <div className="flex gap-2 text-xs text-amber-700 dark:text-amber-300">
                      <span className={result.isValidCV ? "text-green-600" : "text-red-600"}>
                        {result.isValidCV ? "✓ Resume Valid" : "✗ Resume Invalid"}
                      </span>
                      <span>•</span>
                      <span className={result.isValidJD ? "text-green-600" : "text-red-600"}>
                        {result.isValidJD ? "✓ Job Description Valid" : "✗ Job Description Invalid"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Low Match Score Warning */}
          {result.currentScore < 30 && (
            <Card className="border-red-500 bg-red-50 dark:bg-red-950/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <XCircle className="h-6 w-6 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-red-900 dark:text-red-100">Not Recommended to Apply</h3>
                    <p className="text-sm text-red-800 dark:text-red-200">
                      Your current match score is <strong>{result.currentScore}%</strong>, which is below the recommended threshold. 
                      This job may not align well with your skills and experience. Consider:
                    </p>
                    <ul className="text-sm text-red-800 dark:text-red-200 list-disc list-inside space-y-1 ml-2">
                      <li>Looking for positions that better match your current skillset</li>
                      <li>Acquiring the missing skills before applying</li>
                      <li>Focusing on roles where you have a higher match score (60%+)</li>
                    </ul>
                    <p className="text-xs text-red-700 dark:text-red-300 mt-3">
                      💡 If you still want to apply, review the improvement suggestions below to maximize your chances.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Match Score Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-600" />
                Job Match Score
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Current Match</span>
                  <span className="text-xs text-muted-foreground">{getScoreLabel(result.currentScore)}</span>
                </div>
                <div className={`text-5xl font-bold ${getScoreColor(result.currentScore)}`}>
                  {result.currentScore}%
                </div>
                <Progress value={result.currentScore} className="h-3" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Potential Match</span>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-xs text-muted-foreground">{getScoreLabel(result.potentialScore)}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-5xl font-bold ${getScoreColor(result.potentialScore)}`}>
                    {result.potentialScore}%
                  </span>
                  {result.potentialScore > result.currentScore && (
                    <span className="text-sm text-green-600 font-medium">
                      +{result.potentialScore - result.currentScore}%
                    </span>
                  )}
                </div>
                <Progress value={result.potentialScore} className="h-3" />
              </div>
            </CardContent>
          </Card>

          {/* Interview Probability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-purple-500" />
                Interview Probability
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <span className="text-sm font-medium">Current Chances</span>
                <div className="flex items-baseline gap-2">
                  <span className={`text-5xl font-bold ${getScoreColor(result.currentCallback)}`}>
                    {result.currentCallback}%
                  </span>
                  <span className="text-sm text-muted-foreground">interview</span>
                </div>
                <Progress value={result.currentCallback} className="h-3" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">After Improvements</span>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-5xl font-bold ${getScoreColor(result.potentialCallback)}`}>
                    {result.potentialCallback}%
                  </span>
                  {result.potentialCallback > result.currentCallback && (
                    <span className="text-sm text-green-600 font-medium">
                      +{result.potentialCallback - result.currentCallback}%
                    </span>
                  )}
                </div>
                <Progress value={result.potentialCallback} className="h-3" />
              </div>
            </CardContent>
          </Card>

          {/* Keywords Section */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Matched Keywords */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Matched Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.keywords.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {result.keywords.map((keyword, idx) => (
                      <span 
                        key={idx} 
                        className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-sm rounded-full"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No matching keywords found</p>
                )}
              </CardContent>
            </Card>

            {/* Top Required Keywords */}
            {result.topRequiredKeywords && result.topRequiredKeywords.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Target className="h-5 w-5 text-blue-500" />
                    Top Required Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {result.topRequiredKeywords.map((keyword, idx) => (
                      <span 
                        key={idx} 
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm rounded-full"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Missing Keywords */}
            {result.missingKeywords && result.missingKeywords.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    Missing Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {result.missingKeywords.map((keyword, idx) => (
                      <span 
                        key={idx} 
                        className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-sm rounded-full"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Improvement Suggestions with Categorized Tabs */}
          {result.suggestions && result.suggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  Improvement Suggestions ({result.suggestions.length} Total)
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Comprehensive recommendations categorized by type. Click each to see before/after text.
                </p>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">
                      All ({result.suggestions.length})
                    </TabsTrigger>
                    <TabsTrigger value="text">
                      Text ({result.textSuggestions?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="keyword">
                      Keywords ({result.keywordSuggestions?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="other">
                      Other ({result.otherSuggestions?.length || 0})
                    </TabsTrigger>
                  </TabsList>

                  {/* All Suggestions Tab */}
                  <TabsContent value="all" className="mt-4">
                    <Accordion type="single" collapsible className="w-full">
                      {result.suggestions.map((item, idx) => (
                        <AccordionItem key={idx} value={`all-${idx}`}>
                          <AccordionTrigger className="text-left">
                            <div className="flex items-start gap-2 w-full">
                              <span className="text-amber-500 mt-0.5 shrink-0">{idx + 1}.</span>
                              <div className="flex-1">
                                <span className="text-sm">{item.suggestion}</span>
                                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                                  item.category === 'text' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                                  item.category === 'keyword' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
                                  'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300'
                                }`}>
                                  {item.category}
                                </span>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4 pt-2">
                              {/* Original Text */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <label className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide">
                                    {item.originalText === "MISSING" ? "Missing from Resume" : "Current Text (Replace This)"}
                                  </label>
                                  {item.originalText !== "MISSING" && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => copyToClipboard(item.originalText)}
                                      className="h-6 text-xs"
                                    >
                                      <Copy className="h-3 w-3 mr-1" />
                                      Copy
                                    </Button>
                                  )}
                                </div>
                                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
                                  <p className="text-sm text-red-900 dark:text-red-100">
                                    {item.originalText === "MISSING" 
                                      ? "⚠️ This content is not present in your current resume"
                                      : item.originalText}
                                  </p>
                                </div>
                              </div>

                              {/* Improved Text */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <label className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">
                                    Improved Text (Use This)
                                  </label>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => copyToClipboard(item.improvedText)}
                                    className="h-6 text-xs"
                                  >
                                    <Copy className="h-3 w-3 mr-1" />
                                    Copy
                                  </Button>
                                </div>
                                <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md">
                                  <p className="text-sm text-green-900 dark:text-green-100">
                                    {item.improvedText}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-md">
                                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                                <p className="text-xs text-blue-900 dark:text-blue-100">
                                  Copy the improved text and replace it in your resume for better ATS optimization
                                </p>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </TabsContent>

                  {/* Text Improvements Tab */}
                  <TabsContent value="text" className="mt-4">
                    {result.textSuggestions && result.textSuggestions.length > 0 ? (
                      <Accordion type="single" collapsible className="w-full">
                        {result.textSuggestions.map((item, idx) => (
                          <AccordionItem key={idx} value={`text-${idx}`}>
                            <AccordionTrigger className="text-left">
                              <div className="flex items-start gap-2">
                                <span className="text-blue-500 mt-0.5 shrink-0">{idx + 1}.</span>
                                <span className="text-sm">{item.suggestion}</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-4 pt-2">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide">
                                      {item.originalText === "MISSING" ? "Missing from Resume" : "Current Text"}
                                    </label>
                                    {item.originalText !== "MISSING" && (
                                      <Button size="sm" variant="ghost" onClick={() => copyToClipboard(item.originalText)} className="h-6 text-xs">
                                        <Copy className="h-3 w-3 mr-1" />Copy
                                      </Button>
                                    )}
                                  </div>
                                  <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
                                    <p className="text-sm text-red-900 dark:text-red-100">
                                      {item.originalText === "MISSING" ? "⚠️ This content is not present in your current resume" : item.originalText}
                                    </p>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">Improved Text</label>
                                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(item.improvedText)} className="h-6 text-xs">
                                      <Copy className="h-3 w-3 mr-1" />Copy
                                    </Button>
                                  </div>
                                  <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md">
                                    <p className="text-sm text-green-900 dark:text-green-100">{item.improvedText}</p>
                                  </div>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">No text improvement suggestions available.</p>
                    )}
                  </TabsContent>

                  {/* Keyword Improvements Tab */}
                  <TabsContent value="keyword" className="mt-4">
                    {result.keywordSuggestions && result.keywordSuggestions.length > 0 ? (
                      <Accordion type="single" collapsible className="w-full">
                        {result.keywordSuggestions.map((item, idx) => (
                          <AccordionItem key={idx} value={`keyword-${idx}`}>
                            <AccordionTrigger className="text-left">
                              <div className="flex items-start gap-2">
                                <span className="text-purple-500 mt-0.5 shrink-0">{idx + 1}.</span>
                                <span className="text-sm">{item.suggestion}</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-4 pt-2">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide">
                                      {item.originalText === "MISSING" ? "Missing from Resume" : "Current Text"}
                                    </label>
                                    {item.originalText !== "MISSING" && (
                                      <Button size="sm" variant="ghost" onClick={() => copyToClipboard(item.originalText)} className="h-6 text-xs">
                                        <Copy className="h-3 w-3 mr-1" />Copy
                                      </Button>
                                    )}
                                  </div>
                                  <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
                                    <p className="text-sm text-red-900 dark:text-red-100">
                                      {item.originalText === "MISSING" ? "⚠️ This content is not present in your current resume" : item.originalText}
                                    </p>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">Improved Text</label>
                                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(item.improvedText)} className="h-6 text-xs">
                                      <Copy className="h-3 w-3 mr-1" />Copy
                                    </Button>
                                  </div>
                                  <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md">
                                    <p className="text-sm text-green-900 dark:text-green-100">{item.improvedText}</p>
                                  </div>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">No keyword improvement suggestions available.</p>
                    )}
                  </TabsContent>

                  {/* Other Improvements Tab */}
                  <TabsContent value="other" className="mt-4">
                    {result.otherSuggestions && result.otherSuggestions.length > 0 ? (
                      <Accordion type="single" collapsible className="w-full">
                        {result.otherSuggestions.map((item, idx) => (
                          <AccordionItem key={idx} value={`other-${idx}`}>
                            <AccordionTrigger className="text-left">
                              <div className="flex items-start gap-2">
                                <span className="text-gray-500 mt-0.5 shrink-0">{idx + 1}.</span>
                                <span className="text-sm">{item.suggestion}</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-4 pt-2">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide">
                                      {item.originalText === "MISSING" ? "Missing from Resume" : "Current Text"}
                                    </label>
                                    {item.originalText !== "MISSING" && (
                                      <Button size="sm" variant="ghost" onClick={() => copyToClipboard(item.originalText)} className="h-6 text-xs">
                                        <Copy className="h-3 w-3 mr-1" />Copy
                                      </Button>
                                    )}
                                  </div>
                                  <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
                                    <p className="text-sm text-red-900 dark:text-red-100">
                                      {item.originalText === "MISSING" ? "⚠️ This content is not present in your current resume" : item.originalText}
                                    </p>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">Improved Text</label>
                                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(item.improvedText)} className="h-6 text-xs">
                                      <Copy className="h-3 w-3 mr-1" />Copy
                                    </Button>
                                  </div>
                                  <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md">
                                    <p className="text-sm text-green-900 dark:text-green-100">{item.improvedText}</p>
                                  </div>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">No other improvement suggestions available.</p>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Action Button */}
          <Button onClick={resetForm} variant="outline" className="w-full" size="lg">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Analyze Another Job (1 Credit)
          </Button>
        </div>
      )}
      
      {/* Dialogs */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              Confirm Job Match Analysis
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will use <strong>1 credit</strong> to analyze how well your resume matches this job. 
              <br /><br />
              You currently have <strong>{balance?.credits ?? 0}</strong> {balance?.credits === 1 ? 'credit' : 'credits'} remaining.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAnalysis}>
              Use 1 Credit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <InsufficientCreditsModal
        open={showInsufficientModal}
        onOpenChange={setShowInsufficientModal}
        onUpgrade={() => {
          setShowInsufficientModal(false);
          setShowUpgradeModal(true);
        }}
        requiredCredits={1}
      />
      
      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        onSuccess={() => {
          refreshBalance();
          toast({
            title: "Credits Added!",
            description: "You can now analyze job compatibility.",
          });
        }}
      />
    </div>
  );
}
