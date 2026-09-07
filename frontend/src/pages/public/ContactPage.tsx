import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, Building2, CheckCircle2, Sparkles, HelpCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'STUDENT',
    subject: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 800);
  };

  const faqs = [
    {
      q: 'How does an educational institution onboard its students onto SkillSync?',
      a: 'Institution administrators can register their institute with their AISHE code, create department batches, and bulk-approve student affiliations with one click.',
    },
    {
      q: 'How are student skills verified on the platform?',
      a: 'Students undergo timed 3-tier difficulty interactive skill assessments (Novice, Intermediate, Advanced) and can upload validated project portfolios.',
    },
    {
      q: 'Can industry partners directly post jobs and shortlist candidates?',
      a: 'Yes. Recruiters can publish opportunities with mandatory skill thresholds and utilize our 50/20/10/10/10 weighted algorithmic matching engine.',
    },
    {
      q: 'Is the platform compliant with national accreditation standards?',
      a: 'SkillSync provides one-click exportable analytical reporting ready for NAAC, NIRF, and AICTE compliance audits.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 py-16 lg:py-24 relative overflow-hidden">
      {/* Background Glow Blobs */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-indigo-200/40 rounded-full mix-blend-multiply filter blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-200/40 rounded-full mix-blend-multiply filter blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-4"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Smart India Hackathon 2026 — PS 44 Support
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight"
          >
            Get in Touch with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
              SkillSync
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-lg text-slate-600 leading-relaxed"
          >
            Have queries about institutional onboarding, talent recruitment, or platform integration? Our team is here to assist you 24/7.
          </motion.p>
        </div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-20">
          {/* Left Column: Contact Cards */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl" />
              <h3 className="text-2xl font-bold mb-2">Collaboration Hub</h3>
              <p className="text-indigo-200 text-sm mb-8">
                Connect directly with our nodal officers and technical desk for rapid response.
              </p>

              <div className="space-y-6 text-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 text-indigo-300">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-indigo-300 font-medium">Email Support</div>
                    <div className="font-semibold text-white mt-0.5">support@skillsync.sih.gov.in</div>
                    <div className="text-xs text-slate-400">collaboration@skillsync.sih.gov.in</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 text-indigo-300">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-indigo-300 font-medium">Toll-Free Helpline</div>
                    <div className="font-semibold text-white mt-0.5">+91 (011) 2958-1000</div>
                    <div className="text-xs text-slate-400">Mon - Sat, 9:00 AM - 6:00 PM IST</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 text-indigo-300">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-indigo-300 font-medium">Headquarters</div>
                    <div className="font-semibold text-white mt-0.5">AICTE / Ministry of Education Cell</div>
                    <div className="text-xs text-slate-400">Nelson Mandela Marg, Vasant Kunj, New Delhi 110070</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 text-indigo-300">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-indigo-300 font-medium">Participating Nodes</div>
                    <div className="font-semibold text-white mt-0.5">NITK Surathkal & IIT Bombay CoEs</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick stats box */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-2xl font-black text-slate-900">&lt; 2 Hours</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">Average Response Time</div>
              </div>
              <div className="h-10 w-px bg-slate-200" />
              <div>
                <div className="text-2xl font-black text-indigo-600">99.8%</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">Resolution SLA</div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-7"
          >
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/30">
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 text-center"
                >
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Message Received!</h3>
                  <p className="text-slate-600 max-w-md mx-auto mt-2 text-sm leading-relaxed">
                    Thank you for reaching out to SkillSync. A representative from our academia-industry nodal team will connect with you shortly.
                  </p>
                  <Button
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({ name: '', email: '', role: 'STUDENT', subject: '', message: '' });
                    }}
                    className="mt-6 rounded-full px-6"
                    variant="secondary"
                  >
                    Send Another Message
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                    <MessageSquare className="w-5 h-5 text-indigo-600" />
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Send us a Message</h3>
                      <p className="text-xs text-slate-500">Fill out the form below and we'll respond right away.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                        Your Full Name *
                      </label>
                      <Input
                        required
                        placeholder="e.g. Arjun Sharma"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                        Email Address *
                      </label>
                      <Input
                        type="email"
                        required
                        placeholder="name@organization.edu.in"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                        Stakeholder Role
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      >
                        <option value="STUDENT">Student / Learner</option>
                        <option value="INDUSTRY">Industry / Corporate Recruiter</option>
                        <option value="ACADEMICIAN">Academician / Faculty Member</option>
                        <option value="INSTITUTION">Institution / University Admin</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                        Subject *
                      </label>
                      <Input
                        required
                        placeholder="e.g. Campus Onboarding Inquiry"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Detailed Message *
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Write your message or inquiry here..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      'Transmitting...'
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Send Message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </div>

        {/* FAQs Section */}
        <div className="border-t border-slate-200/80 pt-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-3">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
              Frequently Asked Questions
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Got Questions? We Have Answers.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm"
              >
                <h4 className="font-bold text-slate-900 text-base mb-2">{faq.q}</h4>
                <p className="text-slate-600 text-sm leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
