import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Compass,
  Sparkles,
  BookOpen,
  Briefcase,
  Target,
  ArrowRight,
  Clock,
  Award,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  GraduationCap,
  Calendar,
  Check,
  Search,
  Zap,
} from 'lucide-react';
import { careerService } from '../../services/careerService';
import { aiService } from '../../services/aiService';
import { learningService } from '../../services/learningService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useNotifications } from '../../hooks/useNotifications';
import { cn } from '../../utils/cn';

export const CareerExplorerPage: React.FC = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { addNotification } = useNotifications();
  const [selectedRoleTitle, setSelectedRoleTitle] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. Fetch Student's Current Active Career Goals
  const { data: currentInterests = [], isLoading: isInterestsLoading } = useQuery({
    queryKey: ['student', 'career-interests'],
    queryFn: () => careerService.getStudentCareerInterests(),
    staleTime: 30_000,
  });

  const activeGoal = currentInterests[0];
  const activeGoalRoleId = activeGoal?.careerRoleId;
  const activeGoalTitle = activeGoal?.careerRole?.title;

  // 2. Fetch Career Recommendations
  const {
    data: careerData,
    isLoading: isCareerLoading,
    error: careerError,
  } = useQuery({
    queryKey: ['student', 'career-recommendations'],
    queryFn: () => careerService.getCareerRecommendations({ limit: 12 }),
    staleTime: 60_000,
  });

  // 3. Fetch Full Career Roles Catalog
  const { data: rolesData } = useQuery({
    queryKey: ['catalog', 'career-roles'],
    queryFn: () => careerService.getCareerRoles({ limit: 50 }),
    staleTime: 120_000,
  });

  const recommendations = careerData?.careerRecommendations || [];
  const catalogRoles = rolesData?.careerRoles || [];

  // Determine active roadmap role
  const activeRole = selectedRoleTitle || activeGoalTitle || recommendations[0]?.careerRole?.title || catalogRoles[0]?.title || 'Full Stack Web Developer';

  // 4. Fetch AI Learning Roadmap for active target role
  const {
    data: roadmapData,
    isLoading: isRoadmapLoading,
    isFetching: isRoadmapFetching,
  } = useQuery({
    queryKey: ['student', 'learning-roadmap', activeRole],
    queryFn: () => aiService.getLearningRoadmap({ targetRole: activeRole, timeframeWeeks: 8 }),
    enabled: !!activeRole,
    staleTime: 120_000,
  });

  // 5. Fetch Learning Course Recommendations
  const {
    data: learningData,
    isLoading: isLearningLoading,
  } = useQuery({
    queryKey: ['student', 'learning-recommendations'],
    queryFn: () => learningService.getLearningRecommendations({ limit: 6 }),
    staleTime: 60_000,
  });

  // 6. Mutation: Set / Switch Primary Career Goal
  const setGoalMutation = useMutation({
    mutationFn: async (roleId: number) => {
      // Remove previous interests if setting a new primary goal
      const current = await careerService.getStudentCareerInterests();
      for (const item of current) {
        if (item.careerRoleId !== roleId) {
          try {
            await careerService.deleteCareerInterest(item.id);
          } catch (_) {}
        }
      }
      const existing = current.find((c) => c.careerRoleId === roleId);
      if (!existing) {
        await careerService.addCareerInterest(roleId, 1);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['student', 'career-interests'] });
      qc.invalidateQueries({ queryKey: ['student', 'skill-gaps'] });
      qc.invalidateQueries({ queryKey: ['student', 'ai-skill-gap-assistance'] });
      qc.invalidateQueries({ queryKey: ['student', 'career-recommendations'] });
      qc.invalidateQueries({ queryKey: ['student', 'dashboard'] });
      addNotification({
        type: 'success',
        message: 'Target career goal updated! Skill gaps and learning milestones have been re-aligned.',
      });
    },
    onError: (err: any) => {
      addNotification({
        type: 'error',
        message: err?.message || 'Failed to update career goal.',
      });
    },
  });

  const learningRecs = learningData?.learningRecommendations || [];
  const roadmap = roadmapData?.roadmap;

  // Filter recommendations or catalog
  const filteredRecs = recommendations.filter((r: any) => {
    const title = r.roleTitle || r.careerRole?.title || r.title || '';
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-500/30 text-indigo-200 rounded-full border border-indigo-400/20 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5" /> Career Intelligence Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mt-2">Career & Learning Roadmap</h1>
            <p className="text-indigo-200 text-sm mt-1 max-w-2xl leading-relaxed">
              Explore algorithmic career recommendations, set your active career goal for skill gap analysis, and follow AI-generated learning milestones.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => navigate('/student/skill-gap')}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Target className="w-4 h-4 mr-2" /> View Skill Gaps
            </Button>
            <Button
              onClick={() => navigate('/student/jobs')}
              className="bg-indigo-500 hover:bg-indigo-600 text-white shadow-md"
            >
              <Briefcase className="w-4 h-4 mr-2" /> Matching Opportunities
            </Button>
          </div>
        </div>
      </div>

      {/* Active Goal Highlight Banner */}
      {activeGoalTitle && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-white border border-emerald-200 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Currently Active Career Goal</span>
                <span className="px-2 py-0.2 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">Primary</span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">{activeGoalTitle}</h3>
            </div>
          </div>
          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <Button
              size="sm"
              onClick={() => navigate('/student/skill-gap')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
            >
              <Target className="w-4 h-4 mr-1.5" /> Analyze Skill Gaps
            </Button>
          </div>
        </div>
      )}

      {/* Section 1: Algorithmic Career Recommendations & Selection */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              Recommended Career Pathways & Goal Setting
            </h2>
            <p className="text-xs text-slate-500">
              Set any role as your active career goal to benchmark your skills and compute custom skill gap metrics.
            </p>
          </div>
          <div className="relative min-w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search career roles..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        {isCareerLoading ? (
          <div className="grid md:grid-cols-3 gap-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-56 bg-slate-100 rounded-2xl" />
            ))}
          </div>
        ) : careerError || filteredRecs.length === 0 ? (
          <div className="space-y-4">
            <Card className="border-dashed border-2 border-slate-200">
              <CardContent className="py-8 text-center">
                <Compass className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h3 className="text-base font-semibold text-slate-800">
                  {searchQuery ? 'No matching career pathways found' : 'Available Industry Career Roles'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Select a standard industry role below to activate your skill gap analysis and roadmap.
                </p>
              </CardContent>
            </Card>

            {/* Fallback to standard catalog roles if recommendations empty */}
            {catalogRoles.length > 0 && (
              <div className="grid md:grid-cols-3 gap-4">
                {catalogRoles.map((role: any) => {
                  const isPrimaryGoal = role.id === activeGoalRoleId;
                  const isSelectedForRoadmap = role.title === activeRole;

                  return (
                    <Card
                      key={role.id}
                      className={cn(
                        'p-5 transition-all relative flex flex-col justify-between',
                        isPrimaryGoal ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/10' :
                        isSelectedForRoadmap ? 'border-indigo-500 ring-1 ring-indigo-500/20' : 'border-slate-200'
                      )}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-slate-900 text-base">{role.title}</h3>
                          {isPrimaryGoal && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                              <Check className="w-3 h-3" /> Active Goal
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                          {role.description || 'Standard industry career pathway.'}
                        </p>
                      </div>

                      <div className="mt-5 pt-3 border-t border-slate-100 space-y-2">
                        <Button
                          size="sm"
                          className={cn(
                            'w-full text-xs font-semibold',
                            isPrimaryGoal ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'
                          )}
                          onClick={() => setGoalMutation.mutate(role.id)}
                          isLoading={setGoalMutation.isPending && setGoalMutation.variables === role.id}
                          disabled={setGoalMutation.isPending}
                        >
                          {isPrimaryGoal ? (
                            <>
                              <Check className="w-3.5 h-3.5 mr-1.5" /> Selected as Goal
                            </>
                          ) : (
                            <>
                              <Target className="w-3.5 h-3.5 mr-1.5" /> Set as Active Career Goal
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs"
                          onClick={() => setSelectedRoleTitle(role.title)}
                        >
                          View AI Roadmap <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-5">
            {filteredRecs.map((rec: any, idx: number) => {
              const roleId = rec.careerRoleId || rec.careerRole?.id || rec.id;
              const title = rec.roleTitle || rec.careerRole?.title || rec.title || 'Technical Specialist';
              const readiness = Math.round(Number(rec.readiness ?? rec.readinessScore ?? rec.matchScore ?? 65));
              const isPrimaryGoal = (activeGoalRoleId && roleId === activeGoalRoleId) || title === activeGoalTitle;
              const isSelectedForRoadmap = title === activeRole;
              const matched = rec.reasoning?.matchedSkills || [];
              const missing = rec.reasoning?.missingSkills || [];

              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.15 }}
                  className={cn(
                    'p-5 rounded-2xl border transition-all relative flex flex-col justify-between bg-white shadow-sm',
                    isPrimaryGoal
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-gradient-to-b from-emerald-50/20 to-white'
                      : isSelectedForRoadmap
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-indigo-200'
                  )}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-slate-900 text-base leading-snug">{title}</h3>
                      {isPrimaryGoal ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 flex-shrink-0">
                          <Check className="w-3 h-3" /> Active Goal
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 flex-shrink-0">
                          Recommended
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Readiness Score</span>
                      <span className="font-bold text-indigo-600">{readiness}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1.5">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          readiness >= 75 ? 'bg-emerald-500' : readiness >= 50 ? 'bg-indigo-600' : 'bg-amber-500'
                        )}
                        style={{ width: `${Math.min(100, readiness)}%` }}
                      />
                    </div>

                    {rec.whyItFits && (
                      <p className="text-xs text-slate-600 mt-3 line-clamp-2 italic leading-relaxed">
                        "{rec.whyItFits}"
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                      <span>{matched.length} verified • {missing.length} gaps</span>
                      <button
                        onClick={() => setSelectedRoleTitle(title)}
                        className="text-indigo-600 font-semibold flex items-center hover:underline"
                      >
                        AI Roadmap <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                      </button>
                    </div>

                    <Button
                      size="sm"
                      className={cn(
                        'w-full text-xs font-semibold shadow-sm',
                        isPrimaryGoal
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      )}
                      onClick={() => {
                        if (roleId) {
                          setGoalMutation.mutate(Number(roleId));
                        }
                      }}
                      isLoading={setGoalMutation.isPending && setGoalMutation.variables === Number(roleId)}
                      disabled={setGoalMutation.isPending}
                    >
                      {isPrimaryGoal ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1.5" /> Selected Target Goal
                        </>
                      ) : (
                        <>
                          <Target className="w-3.5 h-3.5 mr-1.5" /> Set as Target Career Goal
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: AI-Generated Learning Roadmap Milestones */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-bold text-slate-900">
                Personalized Learning Roadmap: {activeRole}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Structured milestone progression generated based on your verified baseline and missing prerequisites
            </p>
          </div>
          {roadmap && (
            <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl self-start sm:self-auto">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{roadmap.totalDurationWeeks} Weeks</span>
              <span>•</span>
              <span>{roadmap.weeklyCommitmentHours} hrs/week commitment</span>
            </div>
          )}
        </div>

        {isRoadmapLoading || isRoadmapFetching ? (
          <Card>
            <CardContent className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin mb-3" />
              <p className="text-sm font-semibold text-slate-800">Generating AI Milestone Roadmap...</p>
              <p className="text-xs text-slate-400 mt-1">Analyzing prerequisites for {activeRole}</p>
            </CardContent>
          </Card>
        ) : !roadmap || !roadmap.milestones?.length ? (
          <Card>
            <CardContent className="py-10 text-center">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">Roadmap will appear once role is selected.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {roadmap.milestones.map((ms, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-5 bg-white border border-slate-200/90 rounded-2xl hover:shadow-sm transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 font-bold text-xs border border-indigo-100">
                      W{ms.weekNumber}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{ms.topic || `Week ${ms.weekNumber} Milestone`}</h4>
                      {ms.projectIdea && (
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          <strong>Project:</strong> {ms.projectIdea}
                        </p>
                      )}
                      {ms.learningObjectives && ms.learningObjectives.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {ms.learningObjectives.map((obj: string, oi: number) => (
                            <Badge key={oi} variant="default" className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-700 border-indigo-200">
                              {obj}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {ms.assessmentTopic && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 flex-shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{ms.assessmentTopic}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Section 3: Recommended Course Resources */}
      {learningRecs.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" /> Recommended Learning Resources
            </h2>
            <p className="text-xs text-slate-500">
              Curated coursework aligned with closing your highest priority competency gaps
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {learningRecs.map((course: any, idx: number) => (
              <Card key={idx} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <Badge variant="outline" className="w-fit text-[10px] mb-1">
                    {course.provider || 'Self-Paced Learning'}
                  </Badge>
                  <CardTitle className="text-sm leading-snug line-clamp-2">{course.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {course.description || 'Comprehensive module designed to master industry required competencies.'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {course.durationHours || 10} hours
                    </span>
                    <span className="font-semibold text-indigo-600 capitalize">{course.level || 'Intermediate'}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerExplorerPage;