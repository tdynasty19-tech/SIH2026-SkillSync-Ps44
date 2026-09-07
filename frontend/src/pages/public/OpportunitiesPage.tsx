import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Search,
  MapPin,
  DollarSign,
  Building,
  Clock,
  Filter,
  ArrowRight,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  X,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

interface PublicOpportunity {
  id: number;
  title: string;
  company: string;
  type: 'JOB' | 'INTERNSHIP' | 'PROJECT' | 'RESEARCH';
  location: string;
  workplace: 'REMOTE' | 'HYBRID' | 'ON_SITE';
  compensation: string;
  experienceLevel: string;
  skills: string[];
  description: string;
  responsibilities: string[];
  deadline: string;
}

const PUBLIC_OPPORTUNITIES: PublicOpportunity[] = [
  {
    id: 1,
    title: 'Distributed Systems & Cloud Engineer',
    company: 'Apex Cloud Systems',
    type: 'JOB',
    location: 'Bengaluru, Karnataka',
    workplace: 'HYBRID',
    compensation: '₹18,00,000 - ₹24,00,000 / yr',
    experienceLevel: 'Entry to Mid Level (0-2 Yrs)',
    skills: ['Node.js', 'Go', 'Distributed Systems', 'Kubernetes', 'MySQL', 'gRPC'],
    description:
      'Apex Cloud Systems is seeking enthusiastic engineers to build next-generation distributed object storage and low-latency cloud infrastructure. You will work on cluster coordination, consensus protocols, and microservices.',
    responsibilities: [
      'Design and deploy resilient backend microservices using Node.js and Go',
      'Optimize database queries and transaction throughput across sharded clusters',
      'Collaborate with university research partners on novel cache eviction algorithms',
    ],
    deadline: 'Oct 30, 2026',
  },
  {
    id: 2,
    title: 'AI / Neural Model Research Intern',
    company: 'Quantum AI Dynamics',
    type: 'INTERNSHIP',
    location: 'Hyderabad, Telangana',
    workplace: 'REMOTE',
    compensation: '₹45,000 / month Stipend',
    experienceLevel: 'Undergraduate / Masters Students',
    skills: ['Python', 'PyTorch', 'Transformers', 'NLP', 'Vector Databases', 'Deep Learning'],
    description:
      'Join our Advanced AI Lab to fine-tune open weights LLMs and develop retrieval-augmented generation (RAG) pipelines for enterprise knowledge systems.',
    responsibilities: [
      'Implement evaluation benchmarks for specialized Transformer architectures',
      'Preprocess large-scale multimodal tokenized datasets',
      'Present weekly findings during joint lab reviews with faculty mentors',
    ],
    deadline: 'Nov 15, 2026',
  },
  {
    id: 3,
    title: 'Full Stack Web Platform Developer',
    company: 'Nexus Web Labs',
    type: 'JOB',
    location: 'Pune, Maharashtra',
    workplace: 'REMOTE',
    compensation: '₹12,00,000 - ₹16,00,000 / yr',
    experienceLevel: 'Fresher to 1 Yr',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'PostgreSQL', 'REST APIs'],
    description:
      'Build responsive, high-performance web applications and interactive analytics dashboards for high-growth SaaS clients using modern React and TypeScript.',
    responsibilities: [
      'Develop modular and reusable UI components with Tailwind and Framer Motion',
      'Integrate authenticated backend REST APIs with optimal caching strategies',
      'Ensure WCAG 2.1 accessibility and cross-browser performance standards',
    ],
    deadline: 'Nov 05, 2026',
  },
  {
    id: 4,
    title: 'Low-Latency Algorithmic FinTech Engineer',
    company: 'Horizon FinTech Solutions',
    type: 'JOB',
    location: 'Mumbai, Maharashtra',
    workplace: 'ON_SITE',
    compensation: '₹22,00,000 - ₹28,00,000 / yr',
    experienceLevel: '0-2 Yrs Experience',
    skills: ['C++', 'Data Structures & Algorithms', 'Multithreading', 'Linux Systems', 'SQL'],
    description:
      'Work at the frontier of quantitative finance. Build high-frequency execution pipelines, market feed handlers, and high-throughput order routing infrastructure.',
    responsibilities: [
      'Develop microsecond-latency trading simulation engines in modern C++',
      'Conduct code profiling and memory leak audits using Valgrind and GDB',
      'Collaborate with quant researchers on risk modeling algorithms',
    ],
    deadline: 'Dec 01, 2026',
  },
  {
    id: 5,
    title: 'Faculty Industry Immersion: Big Data & NLP',
    company: 'Apex Cloud Systems & NITK Research CoE',
    type: 'RESEARCH',
    location: 'Surathkal & Bengaluru',
    workplace: 'HYBRID',
    compensation: 'Funded Fellowship & Grant (₹3,50,000)',
    experienceLevel: 'Faculty Members & Post-Docs',
    skills: ['Natural Language Processing', 'Distributed Computing', 'Applied R&D', 'Curriculum Design'],
    description:
      'A collaborative sabbatical opportunity for university academicians to engage with industrial cloud clusters and contribute to published research papers and industry-aligned curricula.',
    responsibilities: [
      'Conduct collaborative applied research in cloud telemetry processing',
      'Lead technical masterclasses for engineering students and interns',
      'Author joint IEEE / ACM research papers with corporate research scientists',
    ],
    deadline: 'Nov 20, 2026',
  },
];

export const OpportunitiesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedWorkplace, setSelectedWorkplace] = useState<string>('ALL');
  const [activeModalOpportunity, setActiveModalOpportunity] = useState<PublicOpportunity | null>(null);

  const filteredOpportunities = useMemo(() => {
    return PUBLIC_OPPORTUNITIES.filter((opp) => {
      const matchesSearch =
        opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesType = selectedType === 'ALL' || opp.type === selectedType;
      const matchesWorkplace = selectedWorkplace === 'ALL' || opp.workplace === selectedWorkplace;

      return matchesSearch && matchesType && matchesWorkplace;
    });
  }, [searchTerm, selectedType, selectedWorkplace]);

  return (
    <div className="min-h-screen bg-slate-50/50 py-16 lg:py-24 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-indigo-200/30 rounded-full mix-blend-multiply filter blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-200/30 rounded-full mix-blend-multiply filter blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-4"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Verified Industry Postings & Research Projects
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight"
          >
            Public Opportunities{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
              Board
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-slate-600 text-lg leading-relaxed"
          >
            Explore live job openings, paid internships, and academic-industry collaborations. Sign in to evaluate your personalized match score.
          </motion.p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-lg shadow-slate-200/30 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Search Input */}
            <div className="md:col-span-6 relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by role, company, or skill (e.g. Node.js, Python, Apex)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>

            {/* Type Selector */}
            <div className="md:col-span-3">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
              >
                <option value="ALL">All Opportunity Types</option>
                <option value="JOB">Full-Time Jobs</option>
                <option value="INTERNSHIP">Internships</option>
                <option value="RESEARCH">Research Collaborations</option>
              </select>
            </div>

            {/* Workplace Selector */}
            <div className="md:col-span-3">
              <select
                value={selectedWorkplace}
                onChange={(e) => setSelectedWorkplace(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
              >
                <option value="ALL">All Workplace Formats</option>
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ON_SITE">On-Site</option>
              </select>
            </div>
          </div>
        </div>

        {/* Opportunities List */}
        <div className="space-y-6 mb-16">
          {filteredOpportunities.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-200">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900">No matching opportunities found</h3>
              <p className="text-slate-500 text-sm mt-1">Try tweaking your search terms or filter selections.</p>
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('ALL');
                  setSelectedWorkplace('ALL');
                }}
                variant="secondary"
                className="mt-4 rounded-full px-6"
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            filteredOpportunities.map((opp, idx) => (
              <motion.div
                key={opp.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-md shadow-slate-200/20 hover:shadow-xl transition-all duration-300 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        opp.type === 'JOB'
                          ? 'bg-blue-100 text-blue-700'
                          : opp.type === 'INTERNSHIP'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {opp.type}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                      {opp.workplace}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 ml-auto lg:ml-0">
                      <Clock className="w-3.5 h-3.5" /> Deadline: {opp.deadline}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900">{opp.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mt-1.5">
                      <span className="flex items-center gap-1.5 font-medium text-slate-800">
                        <Building className="w-4 h-4 text-indigo-600" /> {opp.company}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-slate-400" /> {opp.location}
                      </span>
                      <span className="flex items-center gap-1.5 font-semibold text-emerald-600">
                        <DollarSign className="w-4 h-4" /> {opp.compensation}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">{opp.description}</p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {opp.skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-row lg:flex-col gap-3 lg:w-48 flex-shrink-0">
                  <Button
                    onClick={() => setActiveModalOpportunity(opp)}
                    variant="secondary"
                    className="flex-1 rounded-xl text-xs font-semibold py-2.5"
                  >
                    View Details
                  </Button>
                  <Link to="/login" className="flex-1">
                    <Button className="w-full rounded-xl text-xs font-semibold py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20">
                      Sign In to Apply <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Opportunity Detail Modal */}
        <AnimatePresence>
          {activeModalOpportunity && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-3xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative"
              >
                <button
                  onClick={() => setActiveModalOpportunity(null)}
                  className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="space-y-6">
                  <div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700">
                      {activeModalOpportunity.type}
                    </span>
                    <h2 className="text-2xl font-bold text-slate-900 mt-2">{activeModalOpportunity.title}</h2>
                    <div className="text-base font-semibold text-indigo-600 mt-1">{activeModalOpportunity.company}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 text-sm">
                    <div>
                      <div className="text-xs text-slate-500 font-medium">Location & Mode</div>
                      <div className="font-semibold text-slate-900 mt-0.5">
                        {activeModalOpportunity.location} ({activeModalOpportunity.workplace})
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 font-medium">Compensation</div>
                      <div className="font-semibold text-emerald-600 mt-0.5">
                        {activeModalOpportunity.compensation}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-2">Role Overview</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">{activeModalOpportunity.description}</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-2">
                      Key Responsibilities
                    </h4>
                    <ul className="space-y-2">
                      {activeModalOpportunity.responsibilities.map((resp, rIdx) => (
                        <li key={rIdx} className="flex items-start gap-2.5 text-sm text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-2">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {activeModalOpportunity.skills.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-semibold"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                    <div className="text-xs text-slate-500">
                      Application Deadline: <strong className="text-slate-800">{activeModalOpportunity.deadline}</strong>
                    </div>
                    <Link to="/login">
                      <Button className="rounded-xl px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2">
                        Sign In to Apply <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
