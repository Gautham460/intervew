import React from "react";
import { useUser } from "@clerk/clerk-react";
import { Facebook, Twitter, Instagram, Linkedin, Building2, ShieldCheck, Mail } from "lucide-react"; 
import { Link } from "react-router-dom";
import { MainRoutes } from "@/lib/helpers";

interface SocialLinkProps {
  href: string;
  icon: React.ReactNode;
  hoverColor: string;
}

const SocialLink: React.FC<SocialLinkProps> = ({ href, icon, hoverColor }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`hover:${hoverColor}`}
    >
      {icon}
    </a>
  );
};

interface FooterLinkProps {
  to: string;
  children: React.ReactNode;
}

const FooterLink: React.FC<FooterLinkProps> = ({ to, children }) => {
  return (
    <li>
      <Link
        to={to}
        className="hover:underline text-gray-300 hover:text-gray-100"
      >
        {children}
      </Link>
    </li>
  );
};

export const Footer = () => {
  const { user } = useUser();
  const isAdmin = user?.publicMetadata.role === "admin" || sessionStorage.getItem("admin_preauth") === "true";

  return (
    <div className="w-full bg-black text-gray-300 border-t border-white/5 py-12">
      <div className="container mx-auto px-6 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-white font-bold text-xl">
               <Building2 className="text-blue-500 w-6 h-6" /> intervue.ai
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Enterprise Grade AI Talent Assessment Platform. Empowering organizations to identify and nurture top talent through advanced simulations.
            </p>
          </div>

          {!isAdmin ? (
            <>
              {/* Quick Links */}
              <div>
                <h3 className="font-bold text-white text-md mb-4 uppercase tracking-wider">Quick Links</h3>
                <ul className="space-y-2">
                  {MainRoutes.map((route) => (
                    <FooterLink key={route.href} to={route.href}>
                      {route.label}
                    </FooterLink>
                  ))}
                </ul>
              </div>

              {/* Services */}
              <div>
                <h3 className="font-bold text-white text-md mb-4 uppercase tracking-wider">Services</h3>
                <ul className="space-y-2">
                  <FooterLink to="/services/interview-prep">Interview Prep</FooterLink>
                  <FooterLink to="/services/career-coaching">Career Coaching</FooterLink>
                  <FooterLink to="/services/resume-building">Resume Building</FooterLink>
                </ul>
              </div>
            </>
          ) : (
            <>
              {/* Admin Specific Links */}
              <div>
                <h3 className="font-bold text-white text-md mb-4 uppercase tracking-wider">Admin Resources</h3>
                <ul className="space-y-2">
                  <FooterLink to="/enterprise">Dashboard</FooterLink>
                  <FooterLink to="/setup">Database Setup</FooterLink>
                  <li className="flex items-center gap-2 text-slate-400 text-sm italic">
                    <ShieldCheck className="w-4 h-4" /> Secure Admin Access
                  </li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <h3 className="font-bold text-white text-md mb-4 uppercase tracking-wider">Enterprise Support</h3>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-center gap-2 pr-4">
                    <Mail className="w-4 h-4" /> enterprise@intervue.ai
                  </li>
                  <li>SLA Status: <span className="text-emerald-500">Active</span></li>
                </ul>
              </div>
            </>
          )}

          {/* Contact & Social */}
          <div>
            <h3 className="font-bold text-white text-md mb-4 uppercase tracking-wider">Connect</h3>
            <p className="mb-6 text-sm">VIT Chennai, India</p>
            <div className="flex gap-4">
              <SocialLink href="https://facebook.com" icon={<Facebook size={20} />} hoverColor="text-blue-500" />
              <SocialLink href="https://twitter.com" icon={<Twitter size={20} />} hoverColor="text-blue-400" />
              <SocialLink href="https://instagram.com" icon={<Instagram size={20} />} hoverColor="text-pink-500" />
              <SocialLink href="https://linkedin.com" icon={<Linkedin size={20} />} hoverColor="text-blue-700" />
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/5 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Intervue Enterprise. All rights reserved.
        </div>
      </div>
    </div>
  );
};
