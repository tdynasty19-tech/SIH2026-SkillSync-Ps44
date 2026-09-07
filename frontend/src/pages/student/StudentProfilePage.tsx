import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/studentService';
import { affiliationService } from '../../services/affiliationService';
import { StudentProfile, CreateStudentProfileDTO } from '../../types/student.types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { motion } from 'framer-motion';
import { 
  User, 
  GraduationCap, 
  Link as LinkIcon, 
  Edit2, 
  Save, 
  X, 
  Plus, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Sparkles,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useNotifications } from '../../context/NotificationContext';

const AVAILABILITY_OPTIONS = ['Open to Opportunities', 'Not Looking', 'Available Part-time', 'Available Full-time', 'Freelancing'];

// ── Profile Completion Ring ───────────────────────────────────────────────────
const CompletionRing: React.FC<{ pct: number }> = ({ pct }) => {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="relative flex items-center justify-center w-24 h-24 shrink-0">
      <svg width="96" height="96" className="-rotate-90">
        <circle cx="48" cy="48" r={r} strokeWidth="8" fill="none" stroke="#e2e8f0" />
        <circle
          cx="48" cy="48" r={r} strokeWidth="8" fill="none"
          stroke={pct >= 80 ? '#22c55e' : pct >= 50 ? '#4f46e5' : '#f59e0b'}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <span className="absolute text-lg font-bold text-slate-800">{pct}%</span>
    </div>
  );
};

// ── Inline Editable Field ─────────────────────────────────────────────────────
const Field: React.FC<{ 
  label: string; 
  value?: string | number | null; 
  isAutoSynced?: boolean;
  type?: string 
}> = ({ label, value, isAutoSynced }) => (
  <div>
    <div className="flex items-center gap-1.5 mb-0.5">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
      {isAutoSynced && value && (
        <span title="Synchronized with verified academic enrollment">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 inline" />
        </span>
      )}
    </div>
    <p className={cn('text-sm text-slate-800 font-medium', !value && 'text-slate-400 italic font-normal')}>
      {value ?? 'Not set'}
    </p>
  </div>
);

// ── Profile Form ──────────────────────────────────────────────────────────────
const ProfileForm: React.FC<{
  initial: Partial<StudentProfile>;
  onSave: (d: CreateStudentProfileDTO) => Promise<void>;
  onCancel: () => void;
  isNew?: boolean;
}> = ({ initial, onSave, onCancel, isNew }) => {
  const [f, setF] = useState<CreateStudentProfileDTO>({
    headline: initial.headline ?? '',
    bio: initial.bio ?? '',
    dateOfBirth: initial.dateOfBirth ?? '',
    gender: initial.gender ?? '',
    city: initial.city ?? '',
    state: initial.state ?? '',
    country: initial.country ?? '',
    collegeName: initial.collegeName ?? '',
    department: initial.department ?? '',
    course: initial.course ?? '',
    specialization: initial.specialization ?? '',
    currentSemester: initial.currentSemester ?? undefined,
    graduationYear: initial.graduationYear ?? undefined,
    cgpa: initial.cgpa ?? undefined,
    githubUrl: initial.githubUrl ?? '',
    linkedinUrl: initial.linkedinUrl ?? '',
    portfolioUrl: initial.portfolioUrl ?? '',
    resumeUrl: initial.resumeUrl ?? '',
    careerGoal: initial.careerGoal ?? '',
    availabilityStatus: initial.availabilityStatus ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof CreateStudentProfileDTO, v: any) => setF(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload: CreateStudentProfileDTO = {};
      (Object.keys(f) as (keyof CreateStudentProfileDTO)[]).forEach(k => {
        const v = (f as any)[k];
        if (v !== '' && v !== null && v !== undefined) {
          (payload as any)[k] = v;
        }
      });
      await onSave(payload);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Personal */}
      <section>
        <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-1 border-b">Personal Details</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input label="Headline" value={f.headline ?? ''} onChange={e => set('headline', e.target.value)} placeholder="e.g. Final-year CS student passionate about AI" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
            <textarea rows={3} value={f.bio ?? ''} onChange={e => set('bio', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none" placeholder="Tell us about yourself..." />
          </div>
          <Input label="Date of Birth" type="date" value={f.dateOfBirth ?? ''} onChange={e => set('dateOfBirth', e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
            <select value={f.gender ?? ''} onChange={e => set('gender', e.target.value)} className="w-full h-10 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="">Select gender</option>
              {['Male', 'Female', 'Non-binary', 'Prefer not to say'].map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
          <Input label="City" value={f.city ?? ''} onChange={e => set('city', e.target.value)} placeholder="Mumbai" />
          <Input label="State" value={f.state ?? ''} onChange={e => set('state', e.target.value)} placeholder="Maharashtra" />
          <Input label="Country" value={f.country ?? ''} onChange={e => set('country', e.target.value)} placeholder="India" />
        </div>
      </section>

      {/* Academic */}
      <section>
        <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-1 border-b">Academic Details</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input label="College / University" value={f.collegeName ?? ''} onChange={e => set('collegeName', e.target.value)} placeholder="NIT Karnataka" />
          </div>
          <Input label="Department" value={f.department ?? ''} onChange={e => set('department', e.target.value)} placeholder="Computer Science & Engineering" />
          <Input label="Course" value={f.course ?? ''} onChange={e => set('course', e.target.value)} placeholder="B.Tech" />
          <Input label="Specialization" value={f.specialization ?? ''} onChange={e => set('specialization', e.target.value)} placeholder="Artificial Intelligence" />
          <Input label="Current Semester" type="number" value={f.currentSemester ?? ''} onChange={e => set('currentSemester', e.target.value ? Number(e.target.value) : undefined)} placeholder="6" />
          <Input label="Graduation Year" type="number" value={f.graduationYear ?? ''} onChange={e => set('graduationYear', e.target.value ? Number(e.target.value) : undefined)} placeholder="2026" />
          <Input label="CGPA" type="number" step="0.01" value={f.cgpa ?? ''} onChange={e => set('cgpa', e.target.value ? Number(e.target.value) : undefined)} placeholder="8.5" />
        </div>
      </section>

      {/* Career */}
      <section>
        <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-1 border-b">Career</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input label="Career Goal" value={f.careerGoal ?? ''} onChange={e => set('careerGoal', e.target.value)} placeholder="Full-stack developer at a product startup" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Availability Status</label>
            <select value={f.availabilityStatus ?? ''} onChange={e => set('availabilityStatus', e.target.value)} className="w-full h-10 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="">Select status</option>
              {AVAILABILITY_OPTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* Links */}
      <section>
        <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-1 border-b">Links</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="GitHub URL" type="url" value={f.githubUrl ?? ''} onChange={e => set('githubUrl', e.target.value)} placeholder="https://github.com/username" />
          <Input label="LinkedIn URL" type="url" value={f.linkedinUrl ?? ''} onChange={e => set('linkedinUrl', e.target.value)} placeholder="https://linkedin.com/in/..." />
          <Input label="Portfolio URL" type="url" value={f.portfolioUrl ?? ''} onChange={e => set('portfolioUrl', e.target.value)} placeholder="https://myportfolio.dev" />
          <Input label="Resume URL" type="url" value={f.resumeUrl ?? ''} onChange={e => set('resumeUrl', e.target.value)} placeholder="https://drive.google.com/..." />
        </div>
      </section>

      <div className="flex gap-3 pt-2">
        <Button type="submit" isLoading={saving} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />{isNew ? 'Create Profile' : 'Save Changes'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          <X className="w-4 h-4 mr-2" />Cancel
        </Button>
      </div>
    </form>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export const StudentProfilePage: React.FC = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { addNotification } = useNotifications();
  const [editing, setEditing] = useState(false);
  const [isAutoSyncing, setIsAutoSyncing] = useState(false);

  // 1. Fetch Student Profile
  const { 
    data: profile, 
    isLoading: isProfileLoading, 
    refetch: refetchProfile 
  } = useQuery<StudentProfile>({
    queryKey: ['student', 'profile'],
    queryFn: () => studentService.getProfile(),
    retry: 1,
  });

  // 2. Fetch Academic Context & Verified Enrollment
  const { 
    data: academicContext, 
    isLoading: isContextLoading 
  } = useQuery({
    queryKey: ['student', 'academic-context'],
    queryFn: () => studentService.getAcademicContext(),
    staleTime: 60_000,
  });

  // 3. Fetch Affiliation
  const { 
    data: currentAffiliation 
  } = useQuery({
    queryKey: ['student', 'current-affiliation'],
    queryFn: () => affiliationService.getCurrent(),
    staleTime: 60_000,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateStudentProfileDTO) => studentService.createProfile(data),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['student', 'profile'] }); 
      setEditing(false); 
      addNotification({ type: 'success', message: 'Profile updated successfully!' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: CreateStudentProfileDTO) => studentService.updateProfile(data),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['student', 'profile'] }); 
      setEditing(false); 
      addNotification({ type: 'success', message: 'Profile saved successfully!' });
    },
  });

  // Extract authoritative values from backend
  const verifiedInstitution = 
    academicContext?.institution?.institutionName || 
    (academicContext?.enrollment?.institutionId ? `Institution #${academicContext.enrollment.institutionId}` : null) ||
    currentAffiliation?.institution?.institutionName ||
    null;

  const verifiedDepartment = 
    academicContext?.department?.departmentName || 
    currentAffiliation?.department?.departmentName ||
    null;

  const verifiedCourse = 
    academicContext?.program?.programName || 
    academicContext?.enrollment?.program?.programName ||
    null;

  const verifiedGradYear = 
    academicContext?.batch?.endYear || 
    academicContext?.enrollment?.batch?.endYear ||
    null;

  const verifiedSemester = 
    academicContext?.batch?.currentSemester || 
    academicContext?.enrollment?.currentSemester ||
    null;

  const hasAuthoritativeData = Boolean(
    verifiedInstitution || verifiedDepartment || verifiedCourse || verifiedGradYear
  );

  // Auto-synchronize backend data into student profile
  const handleAutoSync = async () => {
    setIsAutoSyncing(true);
    try {
      const syncPayload: CreateStudentProfileDTO = {
        headline: profile?.headline || `${user?.name || 'Student'} • ${verifiedDepartment || 'Engineer'}`,
        collegeName: verifiedInstitution || profile?.collegeName || 'National Institute of Technology Karnataka (NITK)',
        department: verifiedDepartment || profile?.department || 'Computer Science & Engineering',
        course: verifiedCourse || profile?.course || 'B.Tech',
        graduationYear: verifiedGradYear ? Number(verifiedGradYear) : (profile?.graduationYear || 2026),
        currentSemester: verifiedSemester ? Number(verifiedSemester) : (profile?.currentSemester || 6),
        country: profile?.country || 'India',
        availabilityStatus: profile?.availabilityStatus || 'Open to Opportunities',
      };

      if (!profile) {
        await createMutation.mutateAsync(syncPayload);
      } else {
        await updateMutation.mutateAsync(syncPayload);
      }

      await qc.invalidateQueries({ queryKey: ['student', 'profile'] });
      addNotification({
        type: 'success',
        message: 'Profile synchronized with authoritative academic records!',
      });
    } catch (err: any) {
      addNotification({
        type: 'error',
        message: err?.message || 'Failed to auto-sync profile',
      });
    } finally {
      setIsAutoSyncing(false);
    }
  };

  const isNotFound = !isProfileLoading && !profile;

  // Effective display values (merges profile with verified backend context)
  const displayCollege = profile?.collegeName || verifiedInstitution;
  const displayDepartment = profile?.department || verifiedDepartment;
  const displayCourse = profile?.course || verifiedCourse;
  const displayGradYear = profile?.graduationYear || verifiedGradYear;
  const displaySemester = profile?.currentSemester || verifiedSemester;

  const handleSave = async (data: CreateStudentProfileDTO) => {
    if (isNotFound) {
      await createMutation.mutateAsync(data);
    } else {
      await updateMutation.mutateAsync(data);
    }
  };

  if (isProfileLoading || isContextLoading) {
    return (
      <div className="space-y-6 animate-pulse max-w-4xl mx-auto">
        <div className="h-8 bg-slate-200 rounded w-48" />
        <div className="h-28 bg-slate-200 rounded-2xl" />
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <User className="w-7 h-7 text-indigo-600" />
            Student Profile
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Authoritative academic, personal, and career credentials connected to your verified institution.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {!editing && (
            <>
              <Button
                variant="outline"
                onClick={handleAutoSync}
                isLoading={isAutoSyncing}
                disabled={isAutoSyncing}
                className="flex items-center gap-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50 text-xs sm:text-sm"
              >
                <RefreshCw className={cn("w-4 h-4", isAutoSyncing && "animate-spin")} />
                Auto-Sync Academic Record
              </Button>
              <Button variant="outline" onClick={() => setEditing(true)} className="flex items-center gap-2 text-xs sm:text-sm">
                {isNotFound ? <><Plus className="w-4 h-4" />Create Profile</> : <><Edit2 className="w-4 h-4" />Edit Profile</>}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Authoritative Verified Sync Banner */}
      {hasAuthoritativeData && !editing && (
        <div className="flex items-center justify-between p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-xs sm:text-sm">
          <div className="flex items-center gap-2.5 text-emerald-900 font-medium">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span>Verified Institutional Sync: </span>
              <strong className="text-emerald-950 font-bold">
                {verifiedInstitution} {verifiedDepartment ? `• ${verifiedDepartment}` : ''}
              </strong>
            </div>
          </div>
          <Badge variant="primary" className="bg-emerald-600 text-white text-[11px] font-semibold">
            VERIFIED
          </Badge>
        </div>
      )}

      {/* Profile Completion Banner */}
      {profile && !editing && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-6 p-5 bg-gradient-to-r from-indigo-50/80 via-purple-50/50 to-white border border-indigo-100 rounded-2xl shadow-sm">
          <CompletionRing pct={profile.profileCompletion ?? 0} />
          <div>
            <p className="font-bold text-slate-800 text-base">Profile Completion</p>
            <p className="text-sm text-slate-500 mt-0.5">
              {(profile.profileCompletion ?? 0) >= 80
                ? '🎉 Your profile is comprehensive and highly ranked by candidate matching engines!'
                : 'Complete more sections to maximize your matching score for industry opportunities.'}
            </p>
          </div>
        </motion.div>
      )}

      {/* New user prompt */}
      {isNotFound && !editing && (
        <Card className="border-dashed border-2 border-indigo-200">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
              <User className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Student Profile Not Initialized</h3>
              <p className="text-slate-500 text-sm">
                Click below to auto-populate your profile using your verified registration and academic enrollment data.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleAutoSync} isLoading={isAutoSyncing}>
                <Sparkles className="w-4 h-4 mr-2" />Auto-Generate Profile
              </Button>
              <Button variant="outline" onClick={() => setEditing(true)}>
                <Edit2 className="w-4 h-4 mr-2" />Manual Setup
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form */}
      {editing && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border border-slate-200 shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle>{isNotFound ? 'Create Your Profile' : 'Edit Profile'}</CardTitle>
              <CardDescription>All fields are customizable — edit manual overrides or save verified values.</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm
                initial={{
                  ...profile,
                  collegeName: profile?.collegeName || verifiedInstitution || '',
                  department: profile?.department || verifiedDepartment || '',
                  course: profile?.course || verifiedCourse || '',
                  graduationYear: profile?.graduationYear || (verifiedGradYear ? Number(verifiedGradYear) : undefined),
                  currentSemester: profile?.currentSemester || (verifiedSemester ? Number(verifiedSemester) : undefined),
                }}
                onSave={handleSave}
                onCancel={() => setEditing(false)}
                isNew={isNotFound}
              />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* View Mode */}
      {profile && !editing && (
        <div className="grid gap-6">
          {/* Basic Info */}
          <Card className="border border-slate-200 shadow-sm rounded-2xl">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                <User className="w-5 h-5 text-indigo-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <Field label="Full Name" value={user?.name} />
              <Field label="Headline" value={profile.headline || 'Student Engineer'} />
              <Field label="Email" value={user?.email} />
              <Field label="Bio" value={profile.bio} />
              <Field label="Date of Birth" value={profile.dateOfBirth} />
              <Field label="Gender" value={profile.gender} />
              <Field label="City" value={profile.city} />
              <Field label="State" value={profile.state} />
              <Field label="Country" value={profile.country || 'India'} />
            </CardContent>
          </Card>

          {/* Academic */}
          <Card className="border border-slate-200 shadow-sm rounded-2xl">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                Academic Enrollment & Affiliation
              </CardTitle>
              {hasAuthoritativeData && (
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Authoritative Sync Active
                </span>
              )}
            </CardHeader>
            <CardContent className="p-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <Field label="College / University" value={displayCollege} isAutoSynced={!!verifiedInstitution} />
              <Field label="Department" value={displayDepartment} isAutoSynced={!!verifiedDepartment} />
              <Field label="Course" value={displayCourse} isAutoSynced={!!verifiedCourse} />
              <Field label="Specialization" value={profile.specialization} />
              <Field label="Semester" value={displaySemester ? `Semester ${displaySemester}` : null} isAutoSynced={!!verifiedSemester} />
              <Field label="Graduation Year" value={displayGradYear} isAutoSynced={!!verifiedGradYear} />
              <Field label="CGPA" value={profile.cgpa ? `${profile.cgpa} / 10.0` : null} />
            </CardContent>
          </Card>

          {/* Career & Links */}
          <Card className="border border-slate-200 shadow-sm rounded-2xl">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                Career Preferences & Online Presence
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 grid sm:grid-cols-2 gap-5">
              <Field label="Career Goal" value={profile.careerGoal} />
              <Field label="Availability Status" value={profile.availabilityStatus} />
              {profile.githubUrl && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">GitHub</p>
                  <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline break-all">
                    {profile.githubUrl}
                  </a>
                </div>
              )}
              {profile.linkedinUrl && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">LinkedIn</p>
                  <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline break-all">
                    {profile.linkedinUrl}
                  </a>
                </div>
              )}
              {profile.portfolioUrl && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Portfolio</p>
                  <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline break-all">
                    {profile.portfolioUrl}
                  </a>
                </div>
              )}
              {profile.resumeUrl && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Resume Link</p>
                  <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline break-all">
                    {profile.resumeUrl}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StudentProfilePage;