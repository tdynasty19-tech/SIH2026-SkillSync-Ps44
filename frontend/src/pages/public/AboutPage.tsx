import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain,
  Briefcase,
  GraduationCap,
  Building,
  Target,
  Sparkles,
  Award,
  Layers,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const AboutPage = () => {
  const pillars = [
    {
      title: 'Skill Intelligence Engine',
      icon: Brain,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      description:
        '3-tier interactive assessment modules (Novice, Intermediate, Advanced) that evaluate actual coding, architectural, and problem-solving competence beyond static resumes.',
    },
    {
      title: 'Algorithmic Opportunity Matching',
      icon: Target,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50',
      description:
        'A deterministic weighted engine (50% Skills, 20% Career Alignment, 10% Experience, 10% Assessments, 10% Preferences) connecting students to best-fit industry openings.',
    },
    {
      title: 'Institutional Analytics & Compliance',
      icon: Building,
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50',
      description:
        'Aggregate skill distributions, placement velocity metrics, and automated reporting formatted for NIRF, NAAC, and AICTE accreditation audits.',
    },
    {
      title: 'AI Career Copilot Roadmaps',
      icon: Sparkles,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50',
      description:
        'Integrated Gemini AI intelligence providing structured personalized roadmaps, dynamic course suggestions, and actionable skill gap remediation steps.',
    },
  ];

  const highlights = [
    { label: 'Role Ecosystems', value: '4 Dedicated Roles', sub: 'Student, Industry, Academician, Institution' },
    { label: 'Verified Competencies', value: '250+ Skills', sub: 'Indexed across tech & core domains' },
    { label: 'Matching Precision', value: '99.8%', sub: 'Deterministic weighted scoring' },
    { label: 'Accreditation Ready', value: 'NIRF / NAAC', sub: 'One-click compliance reporting' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 py-16 lg:py-24 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-indigo-200/30 rounded-full mix-blend-multiply filter blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-96 h-96 bg-purple-200/30 rounded-full mix-blend-multiply filter blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header / Hero */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-4"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Smart India Hackathon 2026 — Problem Statement 44
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight"
          >
            Empowering India's{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
              Academia–Industry
            </span>{' '}
            Synergy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed"
          >
            SkillSync is a next-generation intelligence platform built to bridge the systemic gap between academic curricula and rapidly evolving industrial standards.
          </motion.p>
        </div>

        {/* Highlight Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-24"
        >
          {highlights.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-lg shadow-slate-200/20 text-center"
            >
              <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-1">
                {item.value}
              </div>
              <div className="font-bold text-slate-900 text-sm">{item.label}</div>
              <div className="text-xs text-slate-500 mt-1">{item.sub}</div>
            </div>
          ))}
        </motion.div>

        {/* Mission & Problem Statement Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">
              <Target className="w-3.5 h-3.5" />
              THE CHALLENGE
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              Solving the Employability & Skill Alignment Paradox
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              Every year, millions of Indian engineering and tech graduates enter the workforce, yet over 70% require extensive re-training. Simultaneously, corporations spend billions hunting for niche technical competencies.
            </p>
            <p className="text-slate-600 text-base leading-relaxed">
              SkillSync addresses this at the root by providing real-time visibility into student skill profiles, continuous curriculum alignment for universities, and precision recruitment pipelines for industry.
            </p>
            <div className="space-y-3 pt-2">
              {[
                'Verifiable skill credentials evaluated through automated code & conceptual quizzes',
                'Transparent industry partnership MoUs and faculty sabbatical opportunities',
                'Zero-leakage role-scoped privacy protecting academic batch data',
              ].map((point, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-slate-700">{point}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 p-8 sm:p-10 rounded-3xl text-white shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <Award className="w-6 h-6 text-amber-400" />
              SIH 2026 Core Objectives
            </h3>
            <p className="text-indigo-200 text-sm mb-6 leading-relaxed">
              Designed according to national directives to accelerate Digital India, NEP 2020 competency mandates, and collaborative innovation:
            </p>

            <div className="space-y-4">
              <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                <div className="font-semibold text-white text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Continuous Skill Evolution
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  Dynamic mapping of modern software roles against academic syllabi.
                </div>
              </div>

              <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                <div className="font-semibold text-white text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  Institutional Credential Verification
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  AISHE-authenticated college registrations and department verification.
                </div>
              </div>

              <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                <div className="font-semibold text-white text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Instant Pipeline Transition
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  From skill assessment directly into shortlisted job and internship applications.
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 4 Core Pillars */}
        <div className="mb-24">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-3">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              PLATFORM ARCHITECTURE
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              The 4 Architectural Pillars
            </h2>
            <p className="text-slate-600 text-base mt-3">
              An end-to-end connected ecosystem serving every stakeholder seamlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {pillars.map((pillar, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-lg shadow-slate-200/20 hover:shadow-xl transition-all"
              >
                <div className={`w-14 h-14 rounded-2xl ${pillar.bgColor} flex items-center justify-center mb-6`}>
                  <pillar.icon className="w-7 h-7 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{pillar.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{pillar.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Call to Action Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-10 sm:p-14 text-white text-center shadow-2xl relative overflow-hidden"
        >
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold">
              Ready to Experience Intelligent Skill Synergy?
            </h2>
            <p className="text-indigo-100 text-base sm:text-lg leading-relaxed">
              Explore open opportunities across India's top tech firms or sign in to access your role-specific dashboard.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Link to="/role-selection">
                <Button size="lg" className="w-full sm:w-auto bg-white text-indigo-900 hover:bg-slate-100 font-bold rounded-full px-8 shadow-lg">
                  Join as Stakeholder <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/opportunities">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto bg-white/20 text-white hover:bg-white/30 border border-white/30 rounded-full px-8">
                  Browse Opportunities
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
