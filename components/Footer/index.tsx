"use client";

import { Github, Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface SocialLink {
  platform: string;
  href: string;
  icon: JSX.Element;
}

const productLinks: FooterSection = {
  title: "Explore",
  links: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Create Resume", href: "/resume/create" },
  ],
};

const supportLinks: FooterSection = {
  title: "Support",
  links: [
    {
      label: "Contact Developer",
      href: "gadhaveshambhuraj@gmail.com",
      external: true,
    },
  ],
};

const socialLinks: SocialLink[] = [
  {
    platform: "GitHub",
    href: "https://github.com/shambhuraj0007",
    icon: <Github className="h-6 w-6" />,
  },
  {
    platform: "Email",
    href: "gadhaveshambhuraj@gmail.com",
    icon: <Mail className="h-6 w-6" />,
  },
];

const FooterSection = ({ section }: { section: FooterSection }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.2 }}
    className="bg-gray-800/90 backdrop-blur-md rounded-xl p-6 shadow-lg border border-gray-700"
  >
    <h3 className="font-bold text-lg text-gray-100 mb-4">{section.title}</h3>
    <ul className="space-y-3">
      {section.links.map((link) => (
        <motion.li
          key={link.label}
          whileHover={{ x: 6, color: "#60a5fa" }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <Link
            href={link.href}
            target={link.external ? "_blank" : undefined}
            rel={link.external ? "noopener noreferrer" : undefined}
            className="text-gray-300 text-sm font-medium hover:text-blue-400 transition-colors duration-200"
          >
            {link.label}
          </Link>
        </motion.li>
      ))}
    </ul>
  </motion.div>
);

const SocialLinks = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.4 }}
    className="bg-gray-800/90 backdrop-blur-md rounded-xl p-6 shadow-lg border border-gray-700"
  >
    <h3 className="font-bold text-lg text-gray-100 mb-4">Connect With Us</h3>
    <div className="flex space-x-6">
      <TooltipProvider>
        {socialLinks.map(({ platform, href, icon }) => (
          <Tooltip key={platform}>
            <TooltipTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.3, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
              >
                <Link
                  href={href}
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={platform}
                >
                  {icon}
                </Link>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent className="bg-blue-500 text-white rounded-lg px-3 py-1.5">
              <p className="text-xs font-medium">{platform}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  </motion.div>
);

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-blue-950 to-purple-950 py-16">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center md:items-start"
          >
            <Link href="/" className="group mb-4">
              <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 group-hover:opacity-90 transition-opacity">
                ResumeAI
              </h2>
            </Link>
            <p className="text-sm text-gray-400 mb-6 text-center md:text-left max-w-sm">
              Craft professional, ATS-friendly resumes effortlessly with our AI-powered platform.
            </p>
            <Button
              variant="default"
              size="sm"
              className="rounded-full bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              Back to Top
            </Button>
          </motion.div>
          <FooterSection section={productLinks} />
          <FooterSection section={supportLinks} />
          <SocialLinks />
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="border-t border-gray-700 pt-6"
        >
          <p className="text-center text-sm text-gray-400">
            © {currentYear} ResumeAI. All rights reserved to ShambhuRaj Gadhave.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
