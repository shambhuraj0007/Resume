"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import CountUp from "react-countup";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Sparkles, CheckCircle2, Layout, Rocket } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

async function getResumesCreated(): Promise<number> {
  try {
    const response = await fetch('/api/info/resumes-count');
    if (!response.ok) return 0;
    const data = await response.json();
    return data.count || 0;
  } catch (error) {
    console.error("Error fetching resumes count:", error);
    return 0;
  }
}

const FeatureCard = ({ icon, title, features }: { icon: React.ReactNode; title: string; features: string[] }) => (
  <motion.div
    whileHover={{ scale: 1.03, y: -5 }}
    transition={{ type: "spring", stiffness: 300 }}
    className="group"
  >
    <Card className="relative overflow-hidden bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-700 shadow-md hover:shadow-xl transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 dark:from-blue-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader>
        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600/60 dark:from-blue-400 dark:to-blue-500/60 flex items-center justify-center mb-4 shadow-sm">
          {icon}
        </div>
        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
              <CheckCircle2 className="h-5 w-5 text-blue-500 dark:text-blue-400 shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  </motion.div>
);

const TemplateTabs = ({ templates }: { templates: string[] }) => (
  <Tabs defaultValue="modern" className="w-full max-w-4xl">
    <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 rounded-full p-1.5 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm mb-8">
      {templates.map((template) => (
        <TabsTrigger
          key={template}
          value={template.toLowerCase()}
          className="rounded-full py-2 text-sm font-medium transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 data-[state=active]:shadow-sm hover:bg-gray-200/50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300"
        >
          {template}
        </TabsTrigger>
      ))}
    </TabsList>

    <br />
    <br />
    {templates.map((template) => (
      <TabsContent key={template} value={template.toLowerCase()}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-xl rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
            <CardContent className="p-0">
              <div className="aspect-[4/3] relative">
                <Image
                  src={`/assets/${template}.png`}
                  alt={`${template} template`}
                  fill
                  className="object-cover rounded-t-2xl"
                  sizes="(max-width: 768px) 100vw, 800px"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </TabsContent>
    ))}
  </Tabs>
);

export default function HomePage() {
  const templatesRef = useRef<HTMLDivElement>(null);
  const [resumesCreated, setResumesCreated] = useState(0);
  const templates = ["Modern", "Professional", "Minimal"];
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.7]);

  useEffect(() => {
    const fetchCount = async () => {
      const count = await getResumesCreated();
      setResumesCreated(count);
    };
    fetchCount();
  }, []);

  const scrollToTemplates = () => {
    templatesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <motion.section
        style={{ opacity: heroOpacity }}
        className="flex flex-col items-center justify-center px-4 py-28 text-center bg-gradient-to-b from-white to-blue-50/50 dark:from-gray-800 dark:to-blue-950/50 backdrop-blur-lg rounded-3xl mx-4 sm:mx-8 lg:mx-16 mt-8"
      >
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
          Craft Your Dream Resume
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
          Build stunning, ATS-friendly resumes in minutes with our free, AI-powered platform designed for success.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/resume/create"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400 px-8 py-3 text-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Start Building <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <Button
            variant="outline"
            size="lg"
            onClick={scrollToTemplates}
            className="rounded-full border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold"
          >
            Explore Templates
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 mt-12 text-center">
          <div>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              <CountUp start={0} end={resumesCreated} duration={2.5} separator="," enableScrollSpy />
              +
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Resumes Created</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">100%</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Free to Use</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">ATS</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Optimized</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">10+</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Templates Available</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">98%</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">User Satisfaction</p>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-gray-800 flex flex-col items-center">
        <div className="container px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">Why ResumeAI Stands Out</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Create professional resumes effortlessly with modern tools, no watermarks, and zero hidden fees.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Layout className="h-6 w-6 text-blue-500 dark:text-blue-400" />}
              title="Stunning Templates"
              features={["ATS-optimized designs", "Variety of layouts", "Fully customizable", "Print-ready PDFs"]}
            />
            <FeatureCard
              icon={<Sparkles className="h-6 w-6 text-blue-500 dark:text-blue-400" />}
              title="AI-Driven Tools"
              features={["Smart content suggestions", "Automated formatting", "Keyword optimization", "Powered by Llama 3.1"]}
            />
            <FeatureCard
              icon={<Rocket className="h-6 w-6 text-blue-500 dark:text-blue-400" />}
              title="User-Friendly"
              features={["No account needed", "Completely free", "PDF exports", "Open-source platform"]}
            />
          </div>
        </div>
      </section>

      {/* Templates Preview */}
      <section ref={templatesRef} className="py-24 bg-gray-50 dark:bg-gray-900 flex flex-col items-center scroll-mt-16">
        <div className="container px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">Explore Our Templates</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Select from modern, ATS-friendly, and customizable templates designed to make you stand out.
            </p>
          </div>
          <br />  
          <br />
          <div>

          </div>
          <div className="flex justify-center ">
            <TemplateTabs templates={templates} />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white flex flex-col items-center">
        <div className="container px-4 max-w-3xl text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to Shine?</h2>
          <p className="text-white/90 mb-8 leading-relaxed">
            Join thousands who’ve built their perfect resume with ResumeAI. Start now, no credit card needed.
          </p>
          <Link
            href="/resume/create"
            className="inline-flex items-center justify-center rounded-full bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Create Your Resume <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </main>
  );
}