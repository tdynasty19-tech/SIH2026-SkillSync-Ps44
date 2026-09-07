import { portfolioRepository, PortfolioRepository } from '../repositories/portfolio.repository';
import { studentRepository, StudentRepository } from '../repositories/student.repository';
import {
  CreatePortfolioInput,
  UpdatePortfolioInput,
  CreatePortfolioProjectInput,
  UpdatePortfolioProjectInput,
  CreatePortfolioCertificationInput,
  UpdatePortfolioCertificationInput,
  CreatePortfolioAchievementInput,
  UpdatePortfolioAchievementInput,
  CreatePortfolioExperienceInput,
  UpdatePortfolioExperienceInput,
  CreatePortfolioDocumentInput,
  UpdatePortfolioDocumentInput,
} from '../validators/portfolio.validator';
import { NotFoundError, ConflictError, AuthorizationError } from '../errors/app.error';

export class PortfolioService {
  constructor(
    private readonly repository: PortfolioRepository = portfolioRepository,
    private readonly studentRepo: StudentRepository = studentRepository
  ) {}

  private async getStudentPortfolioOrThrow(userId: number) {
    const student = await this.studentRepo.findProfileByUserId(userId);
    if (!student) {
      throw new NotFoundError('Student profile not found. Please create your profile first.');
    }

    const portfolio = await this.repository.findPortfolioByStudentId(student.id);
    if (!portfolio) {
      throw new NotFoundError('Portfolio not found. Please create your portfolio first.');
    }

    return { student, portfolio };
  }

  // ----------------------------------------------------
  // Root Portfolio Operations
  // ----------------------------------------------------
  public async getPortfolio(userId: number) {
    const { portfolio } = await this.getStudentPortfolioOrThrow(userId);
    return portfolio.toJSON();
  }

  public async getPortfolioByStudentId(studentId: number, requestingUserId?: number) {
    const portfolio = await this.repository.findPortfolioByStudentId(studentId);
    if (!portfolio) {
      throw new NotFoundError('Portfolio not found');
    }

    // If portfolio is not published, only the owner can view it
    if (!portfolio.isPublished) {
      if (!requestingUserId) {
        throw new AuthorizationError('This portfolio is private');
      }
      const student = await this.studentRepo.findProfileByUserId(requestingUserId);
      if (!student || student.id !== studentId) {
        throw new AuthorizationError('This portfolio is private');
      }
    }

    return portfolio.toJSON();
  }

  public async createPortfolio(userId: number, input: CreatePortfolioInput) {
    const student = await this.studentRepo.findProfileByUserId(userId);
    if (!student) {
      throw new NotFoundError('Student profile not found. Please create your profile first.');
    }

    const existing = await this.repository.findPortfolioByStudentId(student.id);
    if (existing) {
      throw new ConflictError('Portfolio already exists for this student');
    }

    const created = await this.repository.createPortfolio({
      studentId: student.id,
      customDomain: input.customDomain || null,
      theme: input.theme || 'modern',
      isPublished: input.isPublished !== undefined ? input.isPublished : false,
    });

    return created.toJSON();
  }

  public async updatePortfolio(userId: number, input: UpdatePortfolioInput) {
    const { portfolio } = await this.getStudentPortfolioOrThrow(userId);

    const updates: any = {};
    if (input.customDomain !== undefined) updates.customDomain = input.customDomain;
    if (input.theme) updates.theme = input.theme;
    if (input.isPublished !== undefined) {
      updates.isPublished = input.isPublished;
      if (input.isPublished && !portfolio.publishedAt) {
        updates.publishedAt = new Date();
      }
    }

    await this.repository.updatePortfolio(portfolio.id, updates);
    const updated = await this.repository.findPortfolioById(portfolio.id);
    return updated!.toJSON();
  }

  // ----------------------------------------------------
  // 1. Projects
  // ----------------------------------------------------
  public async getProjects(userId: number, page = 1, limit = 20) {
    const { portfolio } = await this.getStudentPortfolioOrThrow(userId);
    const offset = (page - 1) * limit;
    const { rows, count } = await this.repository.getProjectsList(portfolio.id, limit, offset);

    return {
      projects: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  public async getProjectById(userId: number, projectId: number) {
    const { portfolio } = await this.getStudentPortfolioOrThrow(userId);
    const project = await this.repository.findProjectById(projectId, portfolio.id);
    if (!project) {
      throw new NotFoundError('Portfolio project not found');
    }
    return project.toJSON();
  }

  public async addProject(userId: number, input: CreatePortfolioProjectInput) {
    const { portfolio } = await this.getStudentPortfolioOrThrow(userId);
    const created = await this.repository.createProject({
      portfolioId: portfolio.id,
      title: input.title,
      description: input.description,
      role: input.role || null,
      technologies: input.technologies || null,
      projectUrl: input.projectUrl || null,
      githubUrl: input.githubUrl || null,
      order: input.order || 1,
    });
    return created.toJSON();
  }

  public async updateProject(userId: number, projectId: number, input: UpdatePortfolioProjectInput) {
    const { portfolio } = await this.getStudentPortfolioOrThrow(userId);
    const project = await this.repository.findProjectById(projectId, portfolio.id);
    if (!project) {
      throw new NotFoundError('Portfolio project not found');
    }

    const updates: any = {};
    if (input.title) updates.title = input.title;
    if (input.description) updates.description = input.description;
    if (input.role !== undefined) updates.role = input.role;
    if (input.technologies !== undefined) updates.technologies = input.technologies;
    if (input.projectUrl !== undefined) updates.projectUrl = input.projectUrl;
    if (input.githubUrl !== undefined) updates.githubUrl = input.githubUrl;
    if (input.order !== undefined) updates.order = input.order;

    await this.repository.updateProject(projectId, portfolio.id, updates);
    const updated = await this.repository.findProjectById(projectId, portfolio.id);
    return updated!.toJSON();
  }

  public async deleteProject(userId: number, projectId: number) {
    const { portfolio } = await this.getStudentPortfolioOrThrow(userId);
    const project = await this.repository.findProjectById(projectId, portfolio.id);
    if (!project) {
      throw new NotFoundError('Portfolio project not found');
    }
    await this.repository.deleteProject(projectId, portfolio.id);
    return { message: 'Portfolio project deleted successfully' };
  }

  // ----------------------------------------------------
  // 2. Certifications
  // ----------------------------------------------------
  public async getCertifications(userId: number, page = 1, limit = 20) {
    const { portfolio } = await this.getStudentPortfolioOrThrow(userId);
    const offset = (page - 1) * limit;
    const { rows, count } = await this.repository.getCertificationsList(portfolio.id, limit, offset);

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

  public async getCertificationById(userId: number, certId: number) {
    const { portfolio } = await this.getStudentPortfolioOrThrow(userId);
    const cert = await this.repository.findCertificationById(certId, portfolio.id);
    if (!cert) {
      throw new NotFoundError('Portfolio certification not found');
    }
    return cert.toJSON();
  }

  public async addCertification(userId: number, input: CreatePortfolioCertificationInput) {
    const { portfolio } = await this.getStudentPortfolioOrThrow(userId);
    const created = await this.repository.createCertification({
      portfolioId: portfolio.id,
      title: input.title,
      issuer: input.issuer,
      issueDate: input.issueDate,
      credentialUrl: input.credentialUrl || null,
      order: input.order || 1,
    });
    return created.toJSON();
  }

  public async updateCertification(userId: number, certId: number, input: UpdatePortfolioCertificationInput) {
    const { portfolio } = await this.getStudentPortfolioOrThrow(userId);
    const cert = await this.repository.findCertificationById(certId, portfolio.id);
    if (!cert) {
      throw new NotFoundError('Portfolio certification not found');
    }

    const updates: any = {};
    if (input.title) updates.title = input.title;
    if (input.issuer) updates.issuer = input.issuer;
    if (input.issueDate) updates.issueDate = input.issueDate;
    if (input.credentialUrl !== undefined) updates.credentialUrl = input.credentialUrl;
    if (input.order !== undefined) updates.order = input.order;

    await this.repository.updateCertification(certId, portfolio.id, updates);
    const updated = await this.repository.findCertificationById(certId, portfolio.id);
    return updated!.toJSON();
  }

  public async deleteCertification(userId: number, certId: number) {
    const { portfolio } = await this.getStudentPortfolioOrThrow(userId);
    const cert = await this.repository.findCertificationById(certId, portfolio.id);
    if (!cert) {
      throw new NotFoundError('Portfolio certification not found');
    }
    await this.repository.deleteCertification(certId, portfolio.id);
    return { message: 'Portfolio certification deleted successfully' };
  }

  // ----------------------------------------------------
  // 3. Achievements
  // ----------------------------------------------------
  public async getAchievements(userId: number, page = 1, limit = 20) {
    const { portfolio } = await this.getStudentPortfolioOrThrow(userId);
    const offset = (page - 1) * limit;
    const { rows, count } = await this.repository.getAchievementsList(portfolio.id, limit, offset);

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

  public async getAchievementById(userId: number, achievementId: number) {
    const { portfolio } = await this.getStudentPortfolioOrThrow(userId);
    const item = await this.repository.findAchievementById(achievementId, portfolio.id);
    if (!item) {
      throw new NotFoundError('Portfolio achievement not found');
    }
    return item.toJSON();
  }

  public async addAchievement(userId: number, input: CreatePortfolioAchievementInput) {
    const { portfolio } = await this.getStudentPortfolioOrThrow(userId);
    const created = await this.repository.createAchievement({
      portfolioId: portfolio.id,
      title: input.title,
      description: input.description || null,
      date: input.date || null,
      order: input.order || 1,
    });
    return created.toJSON();
  }

  public async updateAchievement(userId: number, achievementId: number, input: UpdatePortfolioAchievementInput) {
    const { portfolio } = await this.getStudentPortfolioOrThrow(userId);
    const item = await this.repository.findAchievementById(achievementId, portfolio.id);
    if (!item) {
      throw new NotFoundError('Portfolio achievement not found');
    }

    const updates: any = {};
    if (input.title) updates.title = input.title;
    if (input.description !== undefined) updates.description = input.description;
    if (input.date !== undefined) updates.date = input.date;
    if (input.order !== undefined) updates.order = input.order;

    await this.repository.updateAchievement(achievementId, portfolio.id, updates);
    const updated = await this.repository.findAchievementById(achievementId, portfolio.id);
    return updated!.toJSON();
  }

  public async deleteAchievement(userId: number, achievementId: number) {
    const { portfolio } = await this.getStudentPortfolioOrThrow(userId);
    const item = await this.repository.findAchievementById(achievementId, portfolio.id);
    if (!item) {
      throw new NotFoundError('Portfolio achievement not found');
    }
    await this.repository.deleteAchievement(achievementId, portfolio.id);
    return { message: 'Portfolio achievement deleted successfully' };
  }

  // ----------------------------------------------------
  // 4. Experiences
  // ----------------------------------------------------
  public async getExperiences(userId: number, page = 1, limit = 20) {
    const { portfolio } = await this.getStudentPortfolioOrThrow(userId);
    const offset = (page - 1) * limit;
    const { rows, count } = await this.repository.getExperiencesList(portfolio.id, limit, offset);

    return {
      experiences: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  public async getExperienceById(userId: number, expId: number) {
    const { portfolio } = await this.getStudentPortfolioOrThrow(userId);
    const item = await this.repository.findExperienceById(expId, portfolio.id);
    if (!item) {
      throw new NotFoundError('Portfolio experience not found');
    }
    return item.toJSON();
  }

  public async addExperience(userId: number, input: CreatePortfolioExperienceInput) {
    const { portfolio } = await this.getStudentPortfolioOrThrow(userId);
    const created = await this.repository.createExperience({
      portfolioId: portfolio.id,
      title: input.title,
      organization: input.organization,
      startDate: input.startDate,
      endDate: input.endDate || null,
      description: input.description || null,
      order: input.order || 1,
    });
    return created.toJSON();
  }

  public async updateExperience(userId: number, expId: number, input: UpdatePortfolioExperienceInput) {
    const { portfolio } = await this.getStudentPortfolioOrThrow(userId);
    const item = await this.repository.findExperienceById(expId, portfolio.id);
    if (!item) {
      throw new NotFoundError('Portfolio experience not found');
    }

    const updates: any = {};
    if (input.title) updates.title = input.title;
    if (input.organization) updates.organization = input.organization;
    if (input.startDate) updates.startDate = input.startDate;
    if (input.endDate !== undefined) updates.endDate = input.endDate;
    if (input.description !== undefined) updates.description = input.description;
    if (input.order !== undefined) updates.order = input.order;

    await this.repository.updateExperience(expId, portfolio.id, updates);
    const updated = await this.repository.findExperienceById(expId, portfolio.id);
    return updated!.toJSON();
  }

  public async deleteExperience(userId: number, expId: number) {
    const { portfolio } = await this.getStudentPortfolioOrThrow(userId);
    const item = await this.repository.findExperienceById(expId, portfolio.id);
    if (!item) {
      throw new NotFoundError('Portfolio experience not found');
    }
    await this.repository.deleteExperience(expId, portfolio.id);
    return { message: 'Portfolio experience deleted successfully' };
  }

  // ----------------------------------------------------
  // 5. Documents
  // ----------------------------------------------------
  public async getDocuments(userId: number, page = 1, limit = 20) {
    const { portfolio } = await this.getStudentPortfolioOrThrow(userId);
    const offset = (page - 1) * limit;
    const { rows, count } = await this.repository.getDocumentsList(portfolio.id, limit, offset);

    return {
      documents: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  public async getDocumentById(userId: number, docId: number) {
    const { portfolio } = await this.getStudentPortfolioOrThrow(userId);
    const item = await this.repository.findDocumentById(docId, portfolio.id);
    if (!item) {
      throw new NotFoundError('Portfolio document not found');
    }
    return item.toJSON();
  }

  public async addDocument(userId: number, input: CreatePortfolioDocumentInput) {
    const { portfolio } = await this.getStudentPortfolioOrThrow(userId);
    const created = await this.repository.createDocument({
      portfolioId: portfolio.id,
      name: input.name,
      documentUrl: input.documentUrl,
      order: input.order || 1,
    });
    return created.toJSON();
  }

  public async updateDocument(userId: number, docId: number, input: UpdatePortfolioDocumentInput) {
    const { portfolio } = await this.getStudentPortfolioOrThrow(userId);
    const item = await this.repository.findDocumentById(docId, portfolio.id);
    if (!item) {
      throw new NotFoundError('Portfolio document not found');
    }

    const updates: any = {};
    if (input.name) updates.name = input.name;
    if (input.documentUrl) updates.documentUrl = input.documentUrl;
    if (input.order !== undefined) updates.order = input.order;

    await this.repository.updateDocument(docId, portfolio.id, updates);
    const updated = await this.repository.findDocumentById(docId, portfolio.id);
    return updated!.toJSON();
  }

  public async deleteDocument(userId: number, docId: number) {
    const { portfolio } = await this.getStudentPortfolioOrThrow(userId);
    const item = await this.repository.findDocumentById(docId, portfolio.id);
    if (!item) {
      throw new NotFoundError('Portfolio document not found');
    }
    await this.repository.deleteDocument(docId, portfolio.id);
    return { message: 'Portfolio document deleted successfully' };
  }
}

export const portfolioService = new PortfolioService();
