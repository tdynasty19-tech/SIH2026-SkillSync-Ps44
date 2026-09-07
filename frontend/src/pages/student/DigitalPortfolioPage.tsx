import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { SkillBadge } from '../../components/ui/SkillBadge';
import { Modal } from '../../components/ui/Modal';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { portfolioService } from '../../services/portfolioService';
import { studentService } from '../../services/studentService';
import { StudentSkill } from '../../types/skill.types';
import { Plus, Award, FolderGit2, AlertCircle } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export const DigitalPortfolioPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '', technologies: '' });

  // 1. Fetch live student skills
  const {
    data: skillsData,
    isLoading: isSkillsLoading,
    isError: isSkillsError,
  } = useQuery({
    queryKey: ['studentSkills', user?.id],
    queryFn: () => studentService.getSkills(1, 50),
    enabled: !!user?.id,
  });

  const skills: StudentSkill[] = skillsData?.skills || [];
  const verifiedSkills = skills.filter((s) => s.verified);
  const otherSkills = skills.filter((s) => !s.verified);

  // 2. Fetch student portfolio projects
  const {
    data: projects,
    isLoading: isProjectsLoading,
  } = useQuery({
    queryKey: ['portfolio', user?.id],
    queryFn: () => portfolioService.getStudentProjects(user?.id as string),
    enabled: !!user?.id,
  });

  const addProjectMutation = useMutation({
    mutationFn: (project: any) => portfolioService.addProject(project),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      setIsModalOpen(false);
      setNewProject({ title: '', description: '', technologies: '' });
      addNotification({ type: 'success', message: 'Project added to portfolio!' });
    },
  });

  const handleAddProject = () => {
    if (!newProject.title || !newProject.description) {
      addNotification({ type: 'error', message: 'Title and description are required.' });
      return;
    }
    addProjectMutation.mutate({
      studentId: user?.id,
      title: newProject.title,
      description: newProject.description,
      technologies: newProject.technologies.split(',').map((t) => t.trim()).filter(Boolean),
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Digital Portfolio</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your verifiable skills, projects, and public credentials showcase.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus size={16} /> Add Project
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Verified Skills Showcase */}
        <Card className="border border-slate-200 shadow-sm rounded-2xl">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              Assessed & Verified Skills
            </CardTitle>
            <span className="text-xs font-semibold text-slate-400">
              {verifiedSkills.length} Verified
            </span>
          </CardHeader>
          <CardContent className="p-5">
            {isSkillsLoading ? (
              <div className="flex flex-wrap gap-2 py-2">
                <LoadingSkeleton className="h-7 w-24 rounded-full" />
                <LoadingSkeleton className="h-7 w-28 rounded-full" />
                <LoadingSkeleton className="h-7 w-20 rounded-full" />
              </div>
            ) : isSkillsError ? (
              <div className="py-6 text-center text-xs text-red-500">
                Failed to load skills profile.
              </div>
            ) : skills.length === 0 ? (
              <div className="py-8 text-center text-slate-400 space-y-1">
                <p className="text-sm font-medium text-slate-600">No skills added yet.</p>
                <p className="text-xs">Add skills in your profile and take assessments to earn verified badges.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {verifiedSkills.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Verified by Assessment
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {verifiedSkills.map((s) => (
                        <SkillBadge
                          key={s.id}
                          name={s.skill?.name || `Skill #${s.skillId}`}
                          level={s.level}
                          verified={true}
                          isVerified={true}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {otherSkills.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Self-Declared Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {otherSkills.map((s) => (
                        <SkillBadge
                          key={s.id}
                          name={s.skill?.name || `Skill #${s.skillId}`}
                          level={s.level}
                          verified={false}
                          isVerified={false}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Portfolio Projects */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-indigo-600" />
            Featured Projects & Engineering Work
          </h2>
          {isProjectsLoading ? (
            <div className="space-y-3">
              <LoadingSkeleton className="h-32 rounded-2xl" />
              <LoadingSkeleton className="h-32 rounded-2xl" />
            </div>
          ) : !projects || projects.length === 0 ? (
            <Card className="border border-slate-200 shadow-sm rounded-2xl">
              <CardContent className="py-12 text-center text-slate-400 space-y-2">
                <FolderGit2 className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-sm font-medium text-slate-600">No projects added yet.</p>
                <p className="text-xs">Showcase your practical coursework, capstone, or open-source repositories.</p>
              </CardContent>
            </Card>
          ) : (
            projects.map((project: any) => (
              <Card key={project.id} className="border border-slate-200 shadow-sm rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold text-slate-900">{project.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-5 pt-0 space-y-3">
                  <p className="text-xs text-slate-600 leading-relaxed">{project.description}</p>
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {project.technologies.map((tech: string) => (
                        <span
                          key={tech}
                          className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Add Project Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Project">
        <div className="space-y-4">
          <Input
            label="Project Title"
            value={newProject.title}
            onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
            placeholder="e.g. Distributed Consensus Engine"
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Description</label>
            <textarea
              className="w-full px-3 py-2 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              rows={3}
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              placeholder="Describe problem statement, tech stack, and key achievements..."
            />
          </div>
          <Input
            label="Technologies (comma separated)"
            placeholder="e.g. React, TypeScript, Node.js, Docker"
            value={newProject.technologies}
            onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value })}
          />
          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button isLoading={addProjectMutation.isPending} onClick={handleAddProject}>
              Save Project
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
