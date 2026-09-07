import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentService } from '../../services/studentService';
import { skillService } from '../../services/skillService';
import {
  StudentSkill,
  SkillCatalogItem,
  StudentSkillLevel,
  SKILL_LEVEL_LABELS,
  SKILL_LEVEL_SCORE,
  SKILL_LEVELS,
} from '../../types/skill.types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, CheckCircle2, AlertCircle, Search, Star, ChevronDown,
} from 'lucide-react';
import { cn } from '../../utils/cn';

// ── Level Badge ───────────────────────────────────────────────────────────────
const LevelBadge: React.FC<{ level: StudentSkillLevel }> = ({ level }) => {
  const colors: Record<StudentSkillLevel, string> = {
    BEGINNER: 'bg-slate-100 text-slate-700',
    INTERMEDIATE: 'bg-blue-100 text-blue-700',
    ADVANCED: 'bg-indigo-100 text-indigo-700',
    EXPERT: 'bg-purple-100 text-purple-700',
  };
  return (
    <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold', colors[level])}>
      {SKILL_LEVEL_LABELS[level]}
    </span>
  );
};

// ── Skill Bar ─────────────────────────────────────────────────────────────────
const SkillBar: React.FC<{ level: StudentSkillLevel; score: number | null }> = ({ level, score }) => {
  const pct = score !== null ? score : SKILL_LEVEL_SCORE[level];
  return (
    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div
        className={cn('h-full rounded-full transition-all duration-500', pct >= 75 ? 'bg-green-500' : pct >= 50 ? 'bg-indigo-500' : 'bg-amber-400')}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

// ── Add Skill Modal ───────────────────────────────────────────────────────────
const AddSkillModal: React.FC<{ onClose: () => void; onAdd: (skillId: number, level: StudentSkillLevel, yoe?: number) => Promise<void> }> = ({ onClose, onAdd }) => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<SkillCatalogItem | null>(null);
  const [level, setLevel] = useState<StudentSkillLevel>('BEGINNER');
  const [yoe, setYoe] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data, isFetching } = useQuery({
    queryKey: ['skills', 'catalog', search],
    queryFn: () => skillService.getSkills({ search: search || undefined, limit: 20 }),
    placeholderData: prev => prev,
  });

  const skills = data?.skills ?? [];

  const handleAdd = async () => {
    if (!selected) return;
    setError(null);
    setSaving(true);
    try {
      await onAdd(selected.id, level, yoe ? Number(yoe) : undefined);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add skill');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md bg-white rounded-2xl shadow-2xl">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">Add Skill from Catalogue</h3>
          <p className="text-sm text-slate-500 mt-1">Search and select a skill from the platform taxonomy.</p>
        </div>
        <div className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />{error}
            </div>
          )}
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setSelected(null); }}
              placeholder="Search skills (React, Python, SQL...)"
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Skill List */}
          {!selected && (
            <div className="max-h-52 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
              {isFetching && skills.length === 0 && <p className="p-3 text-sm text-slate-500">Loading...</p>}
              {!isFetching && skills.length === 0 && <p className="p-3 text-sm text-slate-500">No skills found. Try a different search.</p>}
              {skills.map(s => (
                <button key={s.id} onClick={() => setSelected(s)} className="w-full text-left px-3 py-2 hover:bg-indigo-50 text-sm font-medium text-slate-700 transition-colors flex items-center justify-between">
                  {s.name}
                  <span className="text-xs text-slate-400">ID #{s.id}</span>
                </button>
              ))}
            </div>
          )}

          {/* Selected Skill Config */}
          {selected && (
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-indigo-800">{selected.name}</p>
                <button onClick={() => setSelected(null)} className="text-xs text-indigo-600 hover:underline">Change</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Proficiency Level</label>
                  <select value={level} onChange={e => setLevel(e.target.value as StudentSkillLevel)} className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                    {SKILL_LEVELS.map(l => <option key={l} value={l}>{SKILL_LEVEL_LABELS[l]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Years of Experience</label>
                  <input type="number" min="0" max="50" step="0.5" value={yoe} onChange={e => setYoe(e.target.value)} placeholder="e.g. 1.5" className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="p-6 pt-0 flex gap-3">
          <Button onClick={handleAdd} disabled={!selected || saving} isLoading={saving} className="flex-1">
            <Plus className="w-4 h-4 mr-2" />Add Skill
          </Button>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
        </div>
      </motion.div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export const SkillProfilePage: React.FC = () => {
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editLevel, setEditLevel] = useState<StudentSkillLevel>('BEGINNER');
  const [removeConfirm, setRemoveConfirm] = useState<number | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['student', 'skills'],
    queryFn: () => studentService.getSkills(),
  });

  const skills: StudentSkill[] = data?.skills ?? [];

  const addMutation = useMutation({
    mutationFn: ({ skillId, level, yoe }: { skillId: number; level: StudentSkillLevel; yoe?: number }) =>
      studentService.addSkill({ skillId, level, yearsOfExperience: yoe }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['student', 'skills'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ skillId, level }: { skillId: number; level: StudentSkillLevel }) =>
      studentService.updateSkill(skillId, { level }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['student', 'skills'] }); setEditingId(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (skillId: number) => studentService.deleteSkill(skillId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['student', 'skills'] }); setRemoveConfirm(null); },
  });

  const handleAdd = async (skillId: number, level: StudentSkillLevel, yoe?: number) => {
    await addMutation.mutateAsync({ skillId, level, yoe });
  };

  const handleStartEdit = (s: StudentSkill) => {
    setEditingId(s.id);
    setEditLevel(s.level);
  };

  const handleSaveEdit = async (s: StudentSkill) => {
    await updateMutation.mutateAsync({ skillId: s.id, level: editLevel });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-48" />
        {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-slate-200 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Skills</h1>
          <p className="text-slate-500 mt-1">
            {skills.length > 0 ? `${skills.length} skill${skills.length > 1 ? 's' : ''} in your profile` : 'Build your skill profile to get personalised insights.'}
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4 mr-2" />Add Skill
        </Button>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          {(error as Error).message || 'Failed to load skills. Make sure your student profile is created first.'}
        </div>
      )}

      {/* Empty State */}
      {!error && skills.length === 0 && (
        <Card className="border-dashed border-2 border-indigo-200">
          <CardContent className="flex flex-col items-center justify-center py-14 text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <Star className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No skills yet</h3>
            <p className="text-slate-500 mb-6 max-w-sm">Add your skills to start building your profile and get matched with the right opportunities.</p>
            <Button onClick={() => setShowAdd(true)}><Plus className="w-4 h-4 mr-2" />Add Your First Skill</Button>
          </CardContent>
        </Card>
      )}

      {/* Skill Cards Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        <AnimatePresence>
          {skills.map(s => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
              <Card className="group hover:shadow-md transition-shadow">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900">{s.skill?.name ?? `Skill #${s.skillId}`}</span>
                      {s.verified && (
                        <span title="Verified by assessment">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleStartEdit(s)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors text-xs font-medium">Edit</button>
                      <button onClick={() => setRemoveConfirm(s.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Inline Edit */}
                  {editingId === s.id ? (
                    <div className="flex items-center gap-2 mt-1">
                      <select value={editLevel} onChange={e => setEditLevel(e.target.value as StudentSkillLevel)} className="flex-1 px-2 py-1 border border-indigo-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-500 outline-none">
                        {SKILL_LEVELS.map(l => <option key={l} value={l}>{SKILL_LEVEL_LABELS[l]}</option>)}
                      </select>
                      <Button size="sm" onClick={() => handleSaveEdit(s)} isLoading={updateMutation.isPending}><Save className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>×</Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <LevelBadge level={s.level} />
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          {s.score !== null && <span className="font-semibold text-indigo-600">{s.score}%</span>}
                          {s.yearsOfExperience && <span>{s.yearsOfExperience}yr exp</span>}
                          <span className="text-slate-400">{s.source ?? 'Self-Reported'}</span>
                        </div>
                      </div>
                      <SkillBar level={s.level} score={s.score} />
                    </div>
                  )}

                  {/* Remove Confirm */}
                  {removeConfirm === s.id && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700 mb-2">Remove <strong>{s.skill?.name}</strong> from your profile?</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="danger" onClick={() => deleteMutation.mutate(s.id)} isLoading={deleteMutation.isPending}>Remove</Button>
                        <Button size="sm" variant="outline" onClick={() => setRemoveConfirm(null)}>Cancel</Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Stats */}
      {skills.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="text-center py-4">
            <p className="text-2xl font-bold text-indigo-600">{skills.length}</p>
            <p className="text-xs text-slate-500 mt-1">Total Skills</p>
          </Card>
          <Card className="text-center py-4">
            <p className="text-2xl font-bold text-green-600">{skills.filter(s => s.verified).length}</p>
            <p className="text-xs text-slate-500 mt-1">Verified</p>
          </Card>
          <Card className="text-center py-4">
            <p className="text-2xl font-bold text-purple-600">{skills.filter(s => s.level === 'ADVANCED' || s.level === 'EXPERT').length}</p>
            <p className="text-xs text-slate-500 mt-1">Advanced+</p>
          </Card>
        </div>
      )}

      {showAdd && <AddSkillModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />}
    </div>
  );
};

// helper icon (used inline)
const Save: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
  </svg>
);

export default SkillProfilePage;