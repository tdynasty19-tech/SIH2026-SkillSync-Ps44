import { Transaction } from 'sequelize';
import '../models';
import {
  StudentProfile,
  StudentProfileAttributes,
  StudentProfileCreationAttributes,
} from '../models/student-profile.model';
import {
  StudentEducation,
  StudentEducationCreationAttributes,
} from '../models/student-education.model';
import {
  StudentSkill,
  StudentSkillCreationAttributes,
} from '../models/student-skill.model';
import { Skill } from '../models/skill.model';
import {
  StudentCertification,
  StudentCertificationCreationAttributes,
} from '../models/student-certification.model';
import {
  StudentExperience,
  StudentExperienceCreationAttributes,
} from '../models/student-experience.model';
import {
  StudentAchievement,
  StudentAchievementCreationAttributes,
} from '../models/student-achievement.model';
import {
  StudentInterest,
  StudentInterestCreationAttributes,
} from '../models/student-interest.model';
import {
  StudentLanguage,
  StudentLanguageCreationAttributes,
} from '../models/student-language.model';

export class StudentRepository {
  // ----------------------------------------------------
  // Profile
  // ----------------------------------------------------
  public async findProfileByUserId(userId: number): Promise<StudentProfile | null> {
    return StudentProfile.findOne({
      where: { userId },
    });
  }

  public async findProfileById(id: number): Promise<StudentProfile | null> {
    return StudentProfile.findByPk(id);
  }

  public async createProfile(
    data: StudentProfileCreationAttributes,
    transaction?: Transaction
  ): Promise<StudentProfile> {
    return StudentProfile.create(data, { transaction });
  }

  public async updateProfile(
    id: number,
    data: Partial<StudentProfileAttributes>,
    transaction?: Transaction
  ): Promise<[number]> {
    return StudentProfile.update(data, {
      where: { id },
      transaction,
    });
  }

  // ----------------------------------------------------
  // Education
  // ----------------------------------------------------
  public async getEducationList(studentId: number, limit = 20, offset = 0) {
    return StudentEducation.findAndCountAll({
      where: { studentId },
      limit,
      offset,
      order: [['startYear', 'DESC']],
    });
  }

  public async findEducationById(id: number, studentId: number) {
    return StudentEducation.findOne({
      where: { id, studentId },
    });
  }

  public async createEducation(data: StudentEducationCreationAttributes) {
    return StudentEducation.create(data);
  }

  public async updateEducation(
    id: number,
    studentId: number,
    data: Partial<StudentEducationCreationAttributes>
  ) {
    return StudentEducation.update(data, {
      where: { id, studentId },
    });
  }

  public async deleteEducation(id: number, studentId: number) {
    return StudentEducation.destroy({
      where: { id, studentId },
    });
  }

  // ----------------------------------------------------
  // Skills
  // ----------------------------------------------------
  public async getSkillsList(studentId: number, limit = 50, offset = 0) {
    return StudentSkill.findAndCountAll({
      where: { studentId },
      include: [
        {
          model: Skill,
          as: 'skill',
          attributes: ['id', 'name', 'slug', 'category_id', 'is_active'],
        },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
  }

  public async findSkillById(id: number, studentId: number) {
    return StudentSkill.findOne({
      where: { id, studentId },
      include: [
        {
          model: Skill,
          as: 'skill',
          attributes: ['id', 'name', 'slug', 'category_id', 'is_active'],
        },
      ],
    });
  }

  public async findSkillByStudentAndSkillId(studentId: number, skillId: number) {
    return StudentSkill.findOne({
      where: { studentId, skillId },
    });
  }

  public async createSkill(data: StudentSkillCreationAttributes) {
    return StudentSkill.create(data);
  }

  public async updateSkill(
    id: number,
    studentId: number,
    data: Partial<StudentSkillCreationAttributes>
  ) {
    return StudentSkill.update(data, {
      where: { id, studentId },
    });
  }

  public async deleteSkill(id: number, studentId: number) {
    return StudentSkill.destroy({
      where: { id, studentId },
    });
  }

  // ----------------------------------------------------
  // Certifications
  // ----------------------------------------------------
  public async getCertificationsList(studentId: number, limit = 20, offset = 0) {
    return StudentCertification.findAndCountAll({
      where: { studentId },
      limit,
      offset,
      order: [['issueDate', 'DESC']],
    });
  }

  public async findCertificationById(id: number, studentId: number) {
    return StudentCertification.findOne({
      where: { id, studentId },
    });
  }

  public async createCertification(data: StudentCertificationCreationAttributes) {
    return StudentCertification.create(data);
  }

  public async updateCertification(
    id: number,
    studentId: number,
    data: Partial<StudentCertificationCreationAttributes>
  ) {
    return StudentCertification.update(data, {
      where: { id, studentId },
    });
  }

  public async deleteCertification(id: number, studentId: number) {
    return StudentCertification.destroy({
      where: { id, studentId },
    });
  }

  // ----------------------------------------------------
  // Experience
  // ----------------------------------------------------
  public async getExperienceList(studentId: number, limit = 20, offset = 0) {
    return StudentExperience.findAndCountAll({
      where: { studentId },
      limit,
      offset,
      order: [['startDate', 'DESC']],
    });
  }

  public async findExperienceById(id: number, studentId: number) {
    return StudentExperience.findOne({
      where: { id, studentId },
    });
  }

  public async createExperience(data: StudentExperienceCreationAttributes) {
    return StudentExperience.create(data);
  }

  public async updateExperience(
    id: number,
    studentId: number,
    data: Partial<StudentExperienceCreationAttributes>
  ) {
    return StudentExperience.update(data, {
      where: { id, studentId },
    });
  }

  public async deleteExperience(id: number, studentId: number) {
    return StudentExperience.destroy({
      where: { id, studentId },
    });
  }

  // ----------------------------------------------------
  // Achievements
  // ----------------------------------------------------
  public async getAchievementsList(studentId: number, limit = 20, offset = 0) {
    return StudentAchievement.findAndCountAll({
      where: { studentId },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
  }

  public async findAchievementById(id: number, studentId: number) {
    return StudentAchievement.findOne({
      where: { id, studentId },
    });
  }

  public async createAchievement(data: StudentAchievementCreationAttributes) {
    return StudentAchievement.create(data);
  }

  public async updateAchievement(
    id: number,
    studentId: number,
    data: Partial<StudentAchievementCreationAttributes>
  ) {
    return StudentAchievement.update(data, {
      where: { id, studentId },
    });
  }

  public async deleteAchievement(id: number, studentId: number) {
    return StudentAchievement.destroy({
      where: { id, studentId },
    });
  }

  // ----------------------------------------------------
  // Interests
  // ----------------------------------------------------
  public async getInterestsList(studentId: number, limit = 20, offset = 0) {
    return StudentInterest.findAndCountAll({
      where: { studentId },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
  }

  public async findInterestById(id: number, studentId: number) {
    return StudentInterest.findOne({
      where: { id, studentId },
    });
  }

  public async createInterest(data: StudentInterestCreationAttributes) {
    return StudentInterest.create(data);
  }

  public async updateInterest(
    id: number,
    studentId: number,
    data: Partial<StudentInterestCreationAttributes>
  ) {
    return StudentInterest.update(data, {
      where: { id, studentId },
    });
  }

  public async deleteInterest(id: number, studentId: number) {
    return StudentInterest.destroy({
      where: { id, studentId },
    });
  }

  // ----------------------------------------------------
  // Languages
  // ----------------------------------------------------
  public async getLanguagesList(studentId: number, limit = 20, offset = 0) {
    return StudentLanguage.findAndCountAll({
      where: { studentId },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
  }

  public async findLanguageById(id: number, studentId: number) {
    return StudentLanguage.findOne({
      where: { id, studentId },
    });
  }

  public async createLanguage(data: StudentLanguageCreationAttributes) {
    return StudentLanguage.create(data);
  }

  public async updateLanguage(
    id: number,
    studentId: number,
    data: Partial<StudentLanguageCreationAttributes>
  ) {
    return StudentLanguage.update(data, {
      where: { id, studentId },
    });
  }

  public async deleteLanguage(id: number, studentId: number) {
    return StudentLanguage.destroy({
      where: { id, studentId },
    });
  }

  // ----------------------------------------------------
  // Sub-Entity Counts for Profile Completion
  // ----------------------------------------------------
  public async getCountsForCompletion(studentId: number) {
    const [educationCount, skillsCount, certCount, expCount, achieveCount] =
      await Promise.all([
        StudentEducation.count({ where: { studentId } }),
        StudentSkill.count({ where: { studentId } }),
        StudentCertification.count({ where: { studentId } }),
        StudentExperience.count({ where: { studentId } }),
        StudentAchievement.count({ where: { studentId } }),
      ]);

    return {
      educationCount,
      skillsCount,
      certCount,
      expCount,
      achieveCount,
    };
  }
}

export const studentRepository = new StudentRepository();
