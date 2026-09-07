import { studentRepository, StudentRepository } from '../repositories/student.repository';
import { Skill } from '../models/skill.model';
import { StudentSkillLevel } from '../constants/enums';
import {
  CreateStudentProfileInput,
  UpdateStudentProfileInput,
  CreateEducationInput,
  UpdateEducationInput,
  CreateStudentSkillInput,
  UpdateStudentSkillInput,
  CreateCertificationInput,
  UpdateCertificationInput,
  CreateExperienceInput,
  UpdateExperienceInput,
  CreateAchievementInput,
  UpdateAchievementInput,
  CreateInterestInput,
  UpdateInterestInput,
  CreateLanguageInput,
  UpdateLanguageInput,
} from '../validators/student.validator';
import {
  NotFoundError,
  ConflictError,
  AuthorizationError,
} from '../errors/app.error';
import { StudentProfile } from '../models/student-profile.model';

export class StudentService {
  constructor(private readonly repository: StudentRepository = studentRepository) {}

  /**
   * Helper: Resolves authenticated student profile or throws NotFoundError
   */
  private async getStudentOrThrow(userId: number): Promise<StudentProfile> {
    const student = await this.repository.findProfileByUserId(userId);
    if (!student) {
      throw new NotFoundError('Student profile not found. Please create your profile first.');
    }
    return student;
  }

  /**
   * Deterministic Profile Completion Calculation (0-100%)
   * Based strictly on Master Prompt fields and sub-entities
   */
  public async recalculateCompletion(student: StudentProfile): Promise<number> {
    let score = 0;

    // 1. Basic Details (20%)
    if (student.headline) score += 4;
    if (student.bio) score += 4;
    if (student.location || student.city) score += 4;
    if (student.gender) score += 4;
    if (student.dateOfBirth) score += 4;

    // 2. Academic Details (20%)
    if (student.collegeName) score += 4;
    if (student.department) score += 4;
    if (student.course) score += 4;
    if (student.currentSemester) score += 4;
    if (student.graduationYear || student.cgpa) score += 4;

    // 3. Social & Professional Links (15%)
    if (student.githubUrl) score += 4;
    if (student.linkedinUrl) score += 4;
    if (student.portfolioUrl) score += 3;
    if (student.resumeUrl) score += 4;

    // 4. Career Readiness (5%)
    if (student.careerGoal) score += 3;
    if (student.availabilityStatus) score += 2;

    // 5. Sub-entity counts from database
    const counts = await this.repository.getCountsForCompletion(student.id);

    // Education (10%)
    if (counts.educationCount > 0) score += 10;

    // Skills (15% - 5% per skill, up to 3 skills)
    score += Math.min(15, counts.skillsCount * 5);

    // Certifications, Experience, Achievements (15% - 5% each)
    if (counts.certCount > 0) score += 5;
    if (counts.expCount > 0) score += 5;
    if (counts.achieveCount > 0) score += 5;

    const finalCompletion = Math.min(100, Math.max(0, score));

    if (student.profileCompletion !== finalCompletion) {
      await this.repository.updateProfile(student.id, {
        profileCompletion: finalCompletion,
      });
      student.profileCompletion = finalCompletion;
    }

    return finalCompletion;
  }

  // ----------------------------------------------------
  // Profile
  // ----------------------------------------------------
  public async getProfile(userId: number) {
    const student = await this.getStudentOrThrow(userId);
    await this.recalculateCompletion(student);
    return student.toJSON();
  }

  public async createProfile(userId: number, input: CreateStudentProfileInput) {
    const existing = await this.repository.findProfileByUserId(userId);
    if (existing) {
      throw new ConflictError('Student profile already exists for this user');
    }

    const { dateOfBirth, ...rest } = input;
    const created = await this.repository.createProfile({
      ...rest,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      userId,
      profileCompletion: 0,
    });

    await this.recalculateCompletion(created);
    return created.toJSON();
  }

  public async updateProfile(userId: number, input: UpdateStudentProfileInput) {
    const student = await this.getStudentOrThrow(userId);

    const { dateOfBirth, ...rest } = input;
    const updates: any = { ...rest };
    if (dateOfBirth !== undefined) {
      updates.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    }

    await this.repository.updateProfile(student.id, updates);
    const updated = await this.getStudentOrThrow(userId);
    await this.recalculateCompletion(updated);

    return updated.toJSON();
  }

  // ----------------------------------------------------
  // Education
  // ----------------------------------------------------
  public async getEducation(userId: number, page = 1, limit = 20) {
    const student = await this.getStudentOrThrow(userId);
    const offset = (page - 1) * limit;
    const { rows, count } = await this.repository.getEducationList(student.id, limit, offset);

    return {
      education: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  public async addEducation(userId: number, input: CreateEducationInput) {
    const student = await this.getStudentOrThrow(userId);
    const created = await this.repository.createEducation({
      ...input,
      studentId: student.id,
    });

    await this.recalculateCompletion(student);
    return created.toJSON();
  }

  public async updateEducation(userId: number, educationId: number, input: UpdateEducationInput) {
    const student = await this.getStudentOrThrow(userId);
    const education = await this.repository.findEducationById(educationId, student.id);
    if (!education) {
      throw new NotFoundError('Education record not found or does not belong to you');
    }

    await this.repository.updateEducation(educationId, student.id, input);
    const updated = await this.repository.findEducationById(educationId, student.id);
    return updated!.toJSON();
  }

  public async deleteEducation(userId: number, educationId: number) {
    const student = await this.getStudentOrThrow(userId);
    const education = await this.repository.findEducationById(educationId, student.id);
    if (!education) {
      throw new NotFoundError('Education record not found or does not belong to you');
    }

    await this.repository.deleteEducation(educationId, student.id);
    await this.recalculateCompletion(student);
    return { message: 'Education record deleted successfully' };
  }

  // ----------------------------------------------------
  // Skills
  // ----------------------------------------------------
  public async getSkills(userId: number, page = 1, limit = 50) {
    const student = await this.getStudentOrThrow(userId);
    const offset = (page - 1) * limit;
    const { rows, count } = await this.repository.getSkillsList(student.id, limit, offset);

    return {
      skills: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  public async addSkill(userId: number, input: CreateStudentSkillInput) {
    const student = await this.getStudentOrThrow(userId);

    // Verify skill exists and is active in platform catalog
    const globalSkill = await Skill.findByPk(input.skillId);
    if (!globalSkill || !globalSkill.isActive) {
      throw new NotFoundError('Skill not found or is inactive');
    }

    // Duplicate check
    const existing = await this.repository.findSkillByStudentAndSkillId(student.id, input.skillId);
    if (existing) {
      throw new ConflictError('This skill is already added to your profile');
    }

    // Enforce trusted score safety: self-reported skills are unverified with null assessment score
    const created = await this.repository.createSkill({
      studentId: student.id,
      skillId: input.skillId,
      level: input.level || StudentSkillLevel.BEGINNER,
      yearsOfExperience: input.yearsOfExperience || null,
      source: input.source || 'Self-Reported',
      verified: false,
      score: null,
    });

    await this.recalculateCompletion(student);
    return created.toJSON();
  }

  public async updateSkill(userId: number, skillId: number, input: UpdateStudentSkillInput) {
    const student = await this.getStudentOrThrow(userId);
    const studentSkill = await this.repository.findSkillById(skillId, student.id);
    if (!studentSkill) {
      throw new NotFoundError('Skill record not found or does not belong to you');
    }

    await this.repository.updateSkill(skillId, student.id, input);
    const updated = await this.repository.findSkillById(skillId, student.id);
    return updated!.toJSON();
  }

  public async deleteSkill(userId: number, skillId: number) {
    const student = await this.getStudentOrThrow(userId);
    const studentSkill = await this.repository.findSkillById(skillId, student.id);
    if (!studentSkill) {
      throw new NotFoundError('Skill record not found or does not belong to you');
    }

    await this.repository.deleteSkill(skillId, student.id);
    await this.recalculateCompletion(student);
    return { message: 'Skill deleted successfully from your profile' };
  }

  // ----------------------------------------------------
  // Certifications
  // ----------------------------------------------------
  public async getCertifications(userId: number, page = 1, limit = 20) {
    const student = await this.getStudentOrThrow(userId);
    const offset = (page - 1) * limit;
    const { rows, count } = await this.repository.getCertificationsList(student.id, limit, offset);

    return {
      certifications: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  public async addCertification(userId: number, input: CreateCertificationInput) {
    const student = await this.getStudentOrThrow(userId);
    const created = await this.repository.createCertification({
      ...input,
      studentId: student.id,
      issueDate: new Date(input.issueDate),
      expirationDate: input.expirationDate ? new Date(input.expirationDate) : null,
    });

    await this.recalculateCompletion(student);
    return created.toJSON();
  }

  public async updateCertification(
    userId: number,
    certificationId: number,
    input: UpdateCertificationInput
  ) {
    const student = await this.getStudentOrThrow(userId);
    const cert = await this.repository.findCertificationById(certificationId, student.id);
    if (!cert) {
      throw new NotFoundError('Certification not found or does not belong to you');
    }

    const updates: any = { ...input };
    if (input.issueDate) updates.issueDate = new Date(input.issueDate);
    if (input.expirationDate !== undefined) {
      updates.expirationDate = input.expirationDate ? new Date(input.expirationDate) : null;
    }

    await this.repository.updateCertification(certificationId, student.id, updates);
    const updated = await this.repository.findCertificationById(certificationId, student.id);
    return updated!.toJSON();
  }

  public async deleteCertification(userId: number, certificationId: number) {
    const student = await this.getStudentOrThrow(userId);
    const cert = await this.repository.findCertificationById(certificationId, student.id);
    if (!cert) {
      throw new NotFoundError('Certification not found or does not belong to you');
    }

    await this.repository.deleteCertification(certificationId, student.id);
    await this.recalculateCompletion(student);
    return { message: 'Certification deleted successfully' };
  }

  // ----------------------------------------------------
  // Experience
  // ----------------------------------------------------
  public async getExperience(userId: number, page = 1, limit = 20) {
    const student = await this.getStudentOrThrow(userId);
    const offset = (page - 1) * limit;
    const { rows, count } = await this.repository.getExperienceList(student.id, limit, offset);

    return {
      experience: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  public async addExperience(userId: number, input: CreateExperienceInput) {
    const student = await this.getStudentOrThrow(userId);
    const created = await this.repository.createExperience({
      title: input.title,
      companyName: input.companyName,
      location: input.location || null,
      startDate: new Date(input.startDate),
      endDate: input.endDate ? new Date(input.endDate) : null,
      isCurrent: input.isCurrent || false,
      description: input.description || null,
      studentId: student.id,
    });

    await this.recalculateCompletion(student);
    return created.toJSON();
  }

  public async updateExperience(
    userId: number,
    experienceId: number,
    input: UpdateExperienceInput
  ) {
    const student = await this.getStudentOrThrow(userId);
    const exp = await this.repository.findExperienceById(experienceId, student.id);
    if (!exp) {
      throw new NotFoundError('Experience record not found or does not belong to you');
    }

    const updates: any = {};
    if (input.title) updates.title = input.title;
    if (input.companyName) updates.companyName = input.companyName;
    if (input.location !== undefined) updates.location = input.location;
    if (input.startDate) updates.startDate = new Date(input.startDate);
    if (input.endDate !== undefined) updates.endDate = input.endDate ? new Date(input.endDate) : null;
    if (input.isCurrent !== undefined) updates.isCurrent = input.isCurrent;
    if (input.description !== undefined) updates.description = input.description;

    await this.repository.updateExperience(experienceId, student.id, updates);
    const updated = await this.repository.findExperienceById(experienceId, student.id);
    return updated!.toJSON();
  }

  public async deleteExperience(userId: number, experienceId: number) {
    const student = await this.getStudentOrThrow(userId);
    const exp = await this.repository.findExperienceById(experienceId, student.id);
    if (!exp) {
      throw new NotFoundError('Experience record not found or does not belong to you');
    }

    await this.repository.deleteExperience(experienceId, student.id);
    await this.recalculateCompletion(student);
    return { message: 'Experience record deleted successfully' };
  }

  // ----------------------------------------------------
  // Achievements
  // ----------------------------------------------------
  public async getAchievements(userId: number, page = 1, limit = 20) {
    const student = await this.getStudentOrThrow(userId);
    const offset = (page - 1) * limit;
    const { rows, count } = await this.repository.getAchievementsList(student.id, limit, offset);

    return {
      achievements: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  public async addAchievement(userId: number, input: CreateAchievementInput) {
    const student = await this.getStudentOrThrow(userId);
    const created = await this.repository.createAchievement({
      ...input,
      studentId: student.id,
      date: input.date ? new Date(input.date) : null,
    });

    await this.recalculateCompletion(student);
    return created.toJSON();
  }

  public async updateAchievement(
    userId: number,
    achievementId: number,
    input: UpdateAchievementInput
  ) {
    const student = await this.getStudentOrThrow(userId);
    const ach = await this.repository.findAchievementById(achievementId, student.id);
    if (!ach) {
      throw new NotFoundError('Achievement record not found or does not belong to you');
    }

    const updates: any = { ...input };
    if (input.date) updates.date = new Date(input.date);

    await this.repository.updateAchievement(achievementId, student.id, updates);
    const updated = await this.repository.findAchievementById(achievementId, student.id);
    return updated!.toJSON();
  }

  public async deleteAchievement(userId: number, achievementId: number) {
    const student = await this.getStudentOrThrow(userId);
    const ach = await this.repository.findAchievementById(achievementId, student.id);
    if (!ach) {
      throw new NotFoundError('Achievement record not found or does not belong to you');
    }

    await this.repository.deleteAchievement(achievementId, student.id);
    await this.recalculateCompletion(student);
    return { message: 'Achievement deleted successfully' };
  }

  // ----------------------------------------------------
  // Interests
  // ----------------------------------------------------
  public async getInterests(userId: number, page = 1, limit = 20) {
    const student = await this.getStudentOrThrow(userId);
    const offset = (page - 1) * limit;
    const { rows, count } = await this.repository.getInterestsList(student.id, limit, offset);

    return {
      interests: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  public async addInterest(userId: number, input: CreateInterestInput) {
    const student = await this.getStudentOrThrow(userId);
    const created = await this.repository.createInterest({
      interestArea: input.interestArea,
      studentId: student.id,
    });
    return created.toJSON();
  }

  public async updateInterest(userId: number, interestId: number, input: UpdateInterestInput) {
    const student = await this.getStudentOrThrow(userId);
    const interest = await this.repository.findInterestById(interestId, student.id);
    if (!interest) {
      throw new NotFoundError('Interest not found or does not belong to you');
    }

    await this.repository.updateInterest(interestId, student.id, {
      interestArea: input.interestArea,
    });
    const updated = await this.repository.findInterestById(interestId, student.id);
    return updated!.toJSON();
  }

  public async deleteInterest(userId: number, interestId: number) {
    const student = await this.getStudentOrThrow(userId);
    const interest = await this.repository.findInterestById(interestId, student.id);
    if (!interest) {
      throw new NotFoundError('Interest not found or does not belong to you');
    }

    await this.repository.deleteInterest(interestId, student.id);
    return { message: 'Interest removed successfully' };
  }

  // ----------------------------------------------------
  // Languages
  // ----------------------------------------------------
  public async getLanguages(userId: number, page = 1, limit = 20) {
    const student = await this.getStudentOrThrow(userId);
    const offset = (page - 1) * limit;
    const { rows, count } = await this.repository.getLanguagesList(student.id, limit, offset);

    return {
      languages: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  public async addLanguage(userId: number, input: CreateLanguageInput) {
    const student = await this.getStudentOrThrow(userId);
    const created = await this.repository.createLanguage({
      language: input.language,
      studentId: student.id,
      proficiency: input.proficiency || 'Proficient',
    });
    return created.toJSON();
  }

  public async updateLanguage(userId: number, languageId: number, input: UpdateLanguageInput) {
    const student = await this.getStudentOrThrow(userId);
    const lang = await this.repository.findLanguageById(languageId, student.id);
    if (!lang) {
      throw new NotFoundError('Language record not found or does not belong to you');
    }

    const updates: any = {};
    if (input.language) updates.language = input.language;
    if (input.proficiency) updates.proficiency = input.proficiency;

    await this.repository.updateLanguage(languageId, student.id, updates);
    const updated = await this.repository.findLanguageById(languageId, student.id);
    return updated!.toJSON();
  }

  public async deleteLanguage(userId: number, languageId: number) {
    const student = await this.getStudentOrThrow(userId);
    const lang = await this.repository.findLanguageById(languageId, student.id);
    if (!lang) {
      throw new NotFoundError('Language record not found or does not belong to you');
    }

    await this.repository.deleteLanguage(languageId, student.id);
    return { message: 'Language record removed successfully' };
  }
}

export const studentService = new StudentService();
