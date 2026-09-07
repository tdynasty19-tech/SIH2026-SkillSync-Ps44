import { Op } from 'sequelize';
import '../models';
import { Job } from '../models/job.model';
import { Internship } from '../models/internship.model';
import { Project } from '../models/project.model';
import { LearningProgram } from '../models/learning-program.model';
import { Mentor } from '../models/mentor.model';
import { Skill } from '../models/skill.model';
import { CareerRole } from '../models/career-role.model';
import { IndustryProfile } from '../models/industry-profile.model';
import { InstitutionProfile } from '../models/institution-profile.model';
import { User } from '../models/user.model';
import { OpportunityStatus } from '../constants/enums';
import { SearchCategory, SearchResultItem } from '../validators/search.validator';

export class SearchRepository {
  /**
   * Helper to escape SQL LIKE wildcard characters for secure parameterization
   */
  private escapeLike(term: string): string {
    return term.replace(/[%_\\]/g, '\\$&');
  }

  // 1. Search Jobs
  public async searchJobs(query: string, limit: number, offset: number): Promise<{ rows: SearchResultItem[]; count: number }> {
    const escaped = this.escapeLike(query);
    const likePattern = `%${escaped}%`;

    const { rows, count } = await Job.findAndCountAll({
      where: {
        status: OpportunityStatus.OPEN,
        [Op.or]: [
          { title: { [Op.like]: likePattern } },
          { description: { [Op.like]: likePattern } },
          { requirements: { [Op.like]: likePattern } },
          { location: { [Op.like]: likePattern } },
          { city: { [Op.like]: likePattern } },
        ],
      },
      include: [
        {
          model: IndustryProfile,
          as: 'industry',
          attributes: ['id', 'companyName', 'verified'],
        },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    const mapped: SearchResultItem[] = rows.map((job) => ({
      id: job.id,
      type: SearchCategory.JOBS,
      title: job.title,
      description: job.description,
      location: job.location || job.city || null,
      metadata: {
        companyName: (job as any).industry?.companyName || null,
        companyVerified: (job as any).industry?.verified || false,
        workplaceType: job.workplaceType,
        employmentType: job.employmentType,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        openings: job.openings,
        applicationDeadline: job.applicationDeadline,
      },
      createdAt: job.createdAt,
    }));

    return { rows: mapped, count };
  }

  // 2. Search Internships
  public async searchInternships(query: string, limit: number, offset: number): Promise<{ rows: SearchResultItem[]; count: number }> {
    const escaped = this.escapeLike(query);
    const likePattern = `%${escaped}%`;

    const { rows, count } = await Internship.findAndCountAll({
      where: {
        status: OpportunityStatus.OPEN,
        [Op.or]: [
          { title: { [Op.like]: likePattern } },
          { description: { [Op.like]: likePattern } },
          { requirements: { [Op.like]: likePattern } },
          { location: { [Op.like]: likePattern } },
        ],
      },
      include: [
        {
          model: IndustryProfile,
          as: 'industry',
          attributes: ['id', 'companyName', 'verified'],
        },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    const mapped: SearchResultItem[] = rows.map((internship) => ({
      id: internship.id,
      type: SearchCategory.INTERNSHIPS,
      title: internship.title,
      description: internship.description,
      location: internship.location || null,
      metadata: {
        companyName: (internship as any).industry?.companyName || null,
        companyVerified: (internship as any).industry?.verified || false,
        workplaceType: internship.workplaceType,
        durationMonths: internship.durationMonths,
        stipend: internship.stipend,
        openings: internship.openings,
        applicationDeadline: internship.applicationDeadline,
      },
      createdAt: internship.createdAt,
    }));

    return { rows: mapped, count };
  }

  // 3. Search Projects
  public async searchProjects(query: string, limit: number, offset: number): Promise<{ rows: SearchResultItem[]; count: number }> {
    const escaped = this.escapeLike(query);
    const likePattern = `%${escaped}%`;

    const { rows, count } = await Project.findAndCountAll({
      where: {
        status: OpportunityStatus.OPEN,
        [Op.or]: [
          { title: { [Op.like]: likePattern } },
          { description: { [Op.like]: likePattern } },
          { deliverables: { [Op.like]: likePattern } },
        ],
      },
      include: [
        {
          model: IndustryProfile,
          as: 'industry',
          attributes: ['id', 'companyName', 'verified'],
        },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    const mapped: SearchResultItem[] = rows.map((project) => ({
      id: project.id,
      type: SearchCategory.PROJECTS,
      title: project.title,
      description: project.description,
      metadata: {
        companyName: (project as any).industry?.companyName || null,
        companyVerified: (project as any).industry?.verified || false,
        durationWeeks: project.durationWeeks,
        budget: project.budget,
        deliverables: project.deliverables,
      },
      createdAt: project.createdAt,
    }));

    return { rows: mapped, count };
  }

  // 4. Search Learning Programs
  public async searchLearningPrograms(query: string, limit: number, offset: number): Promise<{ rows: SearchResultItem[]; count: number }> {
    const escaped = this.escapeLike(query);
    const likePattern = `%${escaped}%`;

    const { rows, count } = await LearningProgram.findAndCountAll({
      where: {
        status: OpportunityStatus.OPEN,
        [Op.or]: [
          { title: { [Op.like]: likePattern } },
          { description: { [Op.like]: likePattern } },
          { curriculum: { [Op.like]: likePattern } },
        ],
      },
      include: [
        {
          model: IndustryProfile,
          as: 'industry',
          attributes: ['id', 'companyName', 'verified'],
        },
        {
          model: InstitutionProfile,
          as: 'institution',
          attributes: ['id', 'institutionName', 'verified'],
        },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    const mapped: SearchResultItem[] = rows.map((lp) => ({
      id: lp.id,
      type: SearchCategory.LEARNING_PROGRAMS,
      title: lp.title,
      description: lp.description,
      metadata: {
        providerName: (lp as any).industry?.companyName || (lp as any).institution?.institutionName || 'Platform Partner',
        durationHours: lp.durationHours,
        mode: lp.mode,
        cost: Number(lp.cost),
      },
      createdAt: lp.createdAt,
    }));

    return { rows: mapped, count };
  }

  // 5. Search Mentors
  public async searchMentors(query: string, limit: number, offset: number): Promise<{ rows: SearchResultItem[]; count: number }> {
    const escaped = this.escapeLike(query);
    const likePattern = `%${escaped}%`;

    const { rows, count } = await Mentor.findAndCountAll({
      where: {
        isAvailable: true,
        [Op.or]: [
          { expertiseAreas: { [Op.like]: likePattern } },
          { '$user.first_name$': { [Op.like]: likePattern } },
          { '$user.last_name$': { [Op.like]: likePattern } },
        ],
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'role', 'avatarUrl'],
          where: { isActive: true },
        },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    const mapped: SearchResultItem[] = rows.map((mentor) => {
      const user = (mentor as any).user;
      const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Verified Mentor';
      return {
        id: mentor.id,
        type: SearchCategory.MENTORS,
        title: fullName,
        description: `Expertise: ${mentor.expertiseAreas}`,
        metadata: {
          expertiseAreas: mentor.expertiseAreas,
          availableSlots: Math.max(0, mentor.maxMentees - mentor.currentMentees),
          role: user?.role,
          avatarUrl: user?.avatarUrl,
        },
        createdAt: mentor.createdAt,
      };
    });

    return { rows: mapped, count };
  }

  // 6. Search Skills
  public async searchSkills(query: string, limit: number, offset: number): Promise<{ rows: SearchResultItem[]; count: number }> {
    const escaped = this.escapeLike(query);
    const likePattern = `%${escaped}%`;

    const { rows, count } = await Skill.findAndCountAll({
      where: {
        isActive: true,
        [Op.or]: [
          { name: { [Op.like]: likePattern } },
          { slug: { [Op.like]: likePattern } },
          { description: { [Op.like]: likePattern } },
        ],
      },
      limit,
      offset,
      order: [['name', 'ASC']],
    });

    const mapped: SearchResultItem[] = rows.map((skill) => ({
      id: skill.id,
      type: SearchCategory.SKILLS,
      title: skill.name,
      description: skill.description || null,
      metadata: {
        slug: skill.slug,
        categoryId: skill.categoryId,
      },
      createdAt: skill.createdAt,
    }));

    return { rows: mapped, count };
  }

  // 7. Search Career Roles
  public async searchCareerRoles(query: string, limit: number, offset: number): Promise<{ rows: SearchResultItem[]; count: number }> {
    const escaped = this.escapeLike(query);
    const likePattern = `%${escaped}%`;

    const { rows, count } = await CareerRole.findAndCountAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: likePattern } },
          { slug: { [Op.like]: likePattern } },
          { description: { [Op.like]: likePattern } },
        ],
      },
      limit,
      offset,
      order: [['title', 'ASC']],
    });

    const mapped: SearchResultItem[] = rows.map((role) => ({
      id: role.id,
      type: SearchCategory.CAREER_ROLES,
      title: role.title,
      description: role.description || null,
      metadata: {
        slug: role.slug,
      },
      createdAt: role.createdAt,
    }));

    return { rows: mapped, count };
  }

  // 8. Search Companies (Industry Profiles)
  public async searchCompanies(query: string, limit: number, offset: number): Promise<{ rows: SearchResultItem[]; count: number }> {
    const escaped = this.escapeLike(query);
    const likePattern = `%${escaped}%`;

    const { rows, count } = await IndustryProfile.findAndCountAll({
      where: {
        [Op.or]: [
          { companyName: { [Op.like]: likePattern } },
          { industryType: { [Op.like]: likePattern } },
          { description: { [Op.like]: likePattern } },
          { location: { [Op.like]: likePattern } },
          { city: { [Op.like]: likePattern } },
        ],
      },
      limit,
      offset,
      order: [['companyName', 'ASC']],
    });

    const mapped: SearchResultItem[] = rows.map((company) => ({
      id: company.id,
      type: SearchCategory.COMPANIES,
      title: company.companyName,
      description: company.description || null,
      location: company.location || company.city || null,
      metadata: {
        industryType: company.industryType,
        verified: company.verified,
        websiteUrl: company.websiteUrl,
      },
      createdAt: company.createdAt,
    }));

    return { rows: mapped, count };
  }

  // 9. Search Institutions
  public async searchInstitutions(query: string, limit: number, offset: number): Promise<{ rows: SearchResultItem[]; count: number }> {
    const escaped = this.escapeLike(query);
    const likePattern = `%${escaped}%`;

    const { rows, count } = await InstitutionProfile.findAndCountAll({
      where: {
        [Op.or]: [
          { institutionName: { [Op.like]: likePattern } },
          { institutionType: { [Op.like]: likePattern } },
          { description: { [Op.like]: likePattern } },
          { location: { [Op.like]: likePattern } },
          { city: { [Op.like]: likePattern } },
        ],
      },
      limit,
      offset,
      order: [['institutionName', 'ASC']],
    });

    const mapped: SearchResultItem[] = rows.map((inst) => ({
      id: inst.id,
      type: SearchCategory.INSTITUTIONS,
      title: inst.institutionName,
      description: inst.description || null,
      location: inst.location || inst.city || null,
      metadata: {
        institutionType: inst.institutionType,
        verified: inst.verified,
        websiteUrl: inst.websiteUrl,
        aisheCode: inst.aisheCode,
      },
      createdAt: inst.createdAt,
    }));

    return { rows: mapped, count };
  }
}

export const searchRepository = new SearchRepository();
