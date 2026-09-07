import { Response, NextFunction } from 'express';
import { studentService, StudentService } from '../services/student.service';
import { AuthenticatedRequest } from '../types/auth.types';
import { sendSuccess } from '../utils/api-response';
import { HttpStatus } from '../constants/http-status';
import {
  createStudentProfileSchema,
  updateStudentProfileSchema,
  createEducationSchema,
  updateEducationSchema,
  createStudentSkillSchema,
  updateStudentSkillSchema,
  createCertificationSchema,
  updateCertificationSchema,
  createExperienceSchema,
  updateExperienceSchema,
  createAchievementSchema,
  updateAchievementSchema,
  createInterestSchema,
  updateInterestSchema,
  createLanguageSchema,
  updateLanguageSchema,
  paginationQuerySchema,
} from '../validators/student.validator';

export class StudentController {
  constructor(private readonly service: StudentService = studentService) {}

  // ----------------------------------------------------
  // Profile
  // ----------------------------------------------------
  public getProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getProfile(req.user!.id);
      sendSuccess(res, 'Student profile fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public createProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createStudentProfileSchema.parse(req.body);
      const result = await this.service.createProfile(req.user!.id, validated);
      sendSuccess(res, 'Student profile created successfully', result, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  };

  public updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = updateStudentProfileSchema.parse(req.body);
      const result = await this.service.updateProfile(req.user!.id, validated);
      sendSuccess(res, 'Student profile updated successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  // ----------------------------------------------------
  // Education
  // ----------------------------------------------------
  public getEducation = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit } = paginationQuerySchema.parse(req.query);
      const result = await this.service.getEducation(req.user!.id, page, limit);
      sendSuccess(res, 'Education records fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public addEducation = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createEducationSchema.parse(req.body);
      const result = await this.service.addEducation(req.user!.id, validated);
      sendSuccess(res, 'Education record added successfully', result, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  };

  public updateEducation = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const educationId = Number(req.params.educationId);
      const validated = updateEducationSchema.parse(req.body);
      const result = await this.service.updateEducation(req.user!.id, educationId, validated);
      sendSuccess(res, 'Education record updated successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public deleteEducation = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const educationId = Number(req.params.educationId);
      const result = await this.service.deleteEducation(req.user!.id, educationId);
      sendSuccess(res, result.message, result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  // ----------------------------------------------------
  // Skills
  // ----------------------------------------------------
  public getSkills = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit } = paginationQuerySchema.parse(req.query);
      const result = await this.service.getSkills(req.user!.id, page, limit);
      sendSuccess(res, 'Student skills fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public addSkill = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createStudentSkillSchema.parse(req.body);
      const result = await this.service.addSkill(req.user!.id, validated);
      sendSuccess(res, 'Skill added to profile successfully', result, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  };

  public updateSkill = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const skillId = Number(req.params.skillId);
      const validated = updateStudentSkillSchema.parse(req.body);
      const result = await this.service.updateSkill(req.user!.id, skillId, validated);
      sendSuccess(res, 'Student skill updated successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public deleteSkill = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const skillId = Number(req.params.skillId);
      const result = await this.service.deleteSkill(req.user!.id, skillId);
      sendSuccess(res, result.message, result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  // ----------------------------------------------------
  // Certifications
  // ----------------------------------------------------
  public getCertifications = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit } = paginationQuerySchema.parse(req.query);
      const result = await this.service.getCertifications(req.user!.id, page, limit);
      sendSuccess(res, 'Certifications fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public addCertification = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createCertificationSchema.parse(req.body);
      const result = await this.service.addCertification(req.user!.id, validated);
      sendSuccess(res, 'Certification added successfully', result, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  };

  public updateCertification = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const certificationId = Number(req.params.certificationId);
      const validated = updateCertificationSchema.parse(req.body);
      const result = await this.service.updateCertification(req.user!.id, certificationId, validated);
      sendSuccess(res, 'Certification updated successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public deleteCertification = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const certificationId = Number(req.params.certificationId);
      const result = await this.service.deleteCertification(req.user!.id, certificationId);
      sendSuccess(res, result.message, result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  // ----------------------------------------------------
  // Experience
  // ----------------------------------------------------
  public getExperience = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit } = paginationQuerySchema.parse(req.query);
      const result = await this.service.getExperience(req.user!.id, page, limit);
      sendSuccess(res, 'Experience records fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public addExperience = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createExperienceSchema.parse(req.body);
      const result = await this.service.addExperience(req.user!.id, validated);
      sendSuccess(res, 'Experience record added successfully', result, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  };

  public updateExperience = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const experienceId = Number(req.params.experienceId);
      const validated = updateExperienceSchema.parse(req.body);
      const result = await this.service.updateExperience(req.user!.id, experienceId, validated);
      sendSuccess(res, 'Experience record updated successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public deleteExperience = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const experienceId = Number(req.params.experienceId);
      const result = await this.service.deleteExperience(req.user!.id, experienceId);
      sendSuccess(res, result.message, result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  // ----------------------------------------------------
  // Achievements
  // ----------------------------------------------------
  public getAchievements = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit } = paginationQuerySchema.parse(req.query);
      const result = await this.service.getAchievements(req.user!.id, page, limit);
      sendSuccess(res, 'Achievements fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public addAchievement = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createAchievementSchema.parse(req.body);
      const result = await this.service.addAchievement(req.user!.id, validated);
      sendSuccess(res, 'Achievement added successfully', result, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  };

  public updateAchievement = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const achievementId = Number(req.params.achievementId);
      const validated = updateAchievementSchema.parse(req.body);
      const result = await this.service.updateAchievement(req.user!.id, achievementId, validated);
      sendSuccess(res, 'Achievement updated successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public deleteAchievement = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const achievementId = Number(req.params.achievementId);
      const result = await this.service.deleteAchievement(req.user!.id, achievementId);
      sendSuccess(res, result.message, result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  // ----------------------------------------------------
  // Interests
  // ----------------------------------------------------
  public getInterests = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit } = paginationQuerySchema.parse(req.query);
      const result = await this.service.getInterests(req.user!.id, page, limit);
      sendSuccess(res, 'Interests fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public addInterest = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createInterestSchema.parse(req.body);
      const result = await this.service.addInterest(req.user!.id, validated);
      sendSuccess(res, 'Interest added successfully', result, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  };

  public updateInterest = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const interestId = Number(req.params.interestId);
      const validated = updateInterestSchema.parse(req.body);
      const result = await this.service.updateInterest(req.user!.id, interestId, validated);
      sendSuccess(res, 'Interest updated successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public deleteInterest = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const interestId = Number(req.params.interestId);
      const result = await this.service.deleteInterest(req.user!.id, interestId);
      sendSuccess(res, result.message, result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  // ----------------------------------------------------
  // Languages
  // ----------------------------------------------------
  public getLanguages = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit } = paginationQuerySchema.parse(req.query);
      const result = await this.service.getLanguages(req.user!.id, page, limit);
      sendSuccess(res, 'Languages fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public addLanguage = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createLanguageSchema.parse(req.body);
      const result = await this.service.addLanguage(req.user!.id, validated);
      sendSuccess(res, 'Language added successfully', result, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  };

  public updateLanguage = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const languageId = Number(req.params.languageId);
      const validated = updateLanguageSchema.parse(req.body);
      const result = await this.service.updateLanguage(req.user!.id, languageId, validated);
      sendSuccess(res, 'Language updated successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public deleteLanguage = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const languageId = Number(req.params.languageId);
      const result = await this.service.deleteLanguage(req.user!.id, languageId);
      sendSuccess(res, result.message, result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };
}

export const studentController = new StudentController();
