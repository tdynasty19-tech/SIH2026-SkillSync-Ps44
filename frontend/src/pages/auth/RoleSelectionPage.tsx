import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const RoleSelectionPage = () => {
  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Join Skill Intelligence</h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">Select how you want to use the platform to get a customized registration experience.</p>
      </motion.div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {[
          { role: 'student', title: 'Student', desc: 'Build your portfolio, assess skills, and apply for opportunities.' },
          { role: 'industry', title: 'Company / Industry', desc: 'Post jobs, discover talent, and track applicants.' },
          { role: 'academician', title: 'Faculty / Academician', desc: 'Manage mentorships, and collaborate on research.' },
          { role: 'institution', title: 'Institution Admin', desc: 'Track placements and manage university partnerships.' }
        ].map((item, i) => (
          <motion.div key={item.role} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Link 
              to={`/register/${item.role}`} 
              className="block p-8 h-full bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1 transition-all duration-300 group"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{item.title}</h3>
              <p className="text-slate-500 leading-relaxed">{item.desc}</p>
              <div className="mt-6 flex items-center text-sm font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                Continue as {item.title} &rarr;
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
      
      <div className="text-center mt-12">
        <p className="text-slate-500">Already have an account? <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Log in here</Link></p>
      </div>
    </div>
  );
};
