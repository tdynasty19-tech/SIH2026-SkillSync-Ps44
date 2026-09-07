import { sequelize } from '../config/database';
import { applicationRepository, ApplicationRepository } from '../repositories/application.repository';
import { ApplicationStatus, OpportunityStatus, OpportunityType } from '../constants/enums';
import { UserRole } from '../constants/roles';
import { AuthenticatedUser } from '../types/auth.types';
import {
  SubmitApplicationInput,
  UpdateApplicationStatusInput,
  ApplicationQueryInput,
} from '../validators/application.validator';
import {
  NotFoundError,
  AuthorizationError,
  ConflictError,
  ValidationError,
} from '../errors/app.error';
import { appEvents, AppEventType } from '../events';

/**
 * State Transition Engine: Strictly enforces valid lifecycle transitions.
 * Terminal states (SELECTED, REJECTED) have empty transition arrays.
 */
export const ALLOWED_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  [ApplicationStatus.APPLIED]: [ApplicationStatus.UNDER_REVIEW],
  [ApplicationStatus.UNDER_REVIEW]: [ApplicationStatus.SHORTLISTED, ApplicationStatus.REJECTED],
  [ApplicationStatus.SHORTLISTED]: [ApplicationStatus.INTERVIEW, ApplicationStatus.REJECTED],
  [ApplicationStatus.INTERVIEW]: [ApplicationStatus.SELECTED, ApplicationStatus.REJECTED],
  [ApplicationStatus.SELECTED]: [],
  [ApplicationStatus.REJECTED]: [],
};

export class ApplicationService {
  constructor(private readonly repository: ApplicationRepository = applicationRepository) {}

  // ----------------------------------------------------
  // Helpers
  // ----------------------------------------------------
  private async resolveStudentProfile(userId: number) {
    const student = await this.repository.findStudentProfileByUserId(userId);
    if (!student) {
      throw new NotFoundError('Student profile not found. Please complete your student profile first.');
    }
    return student;
  }

  private async resolveOpportunityOrThrow(opportunityType: OpportunityType, opportunityId: number) {
    const opportunity = await this.repository.findOpportunity(opportunityType, opportunityId);
    if (!opportunity) {
      throw new NotFoundError(`Opportunity of type '${opportunityType}' with ID ${opportunityId} not found`);
    }
    return opportunity;
  }

  private validateOpportunityActiveAndDeadline(opportunity: any) {
    if (opportunity.status !== OpportunityStatus.OPEN) {
      throw new ConflictError('This opportunity is not currently open for applications');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Check applicationDeadline if defined (e.g. Job, Internship, FacultyOpportunity)
    if (opportunity.applicationDeadline) {
      const deadline = new Date(opportunity.applicationDeadline);
      if (deadline < today) {
        throw new ConflictError('The application deadline for this opportunity has passed');
      }
    }

    // 2. Check startDate if defined (e.g. FDP)
    if (opportunity.startDate) {
      const start = new Date(opportunity.startDate);
      if (start < today) {
        throw new ConflictError('This program has already commenced and is no longer accepting applications');
      }
    }
  }

  private async assertOpportunityOwnership(user: AuthenticatedUser, opportunity: any) {
    if (user.role === UserRole.STUDENT) {
      throw new AuthorizationError('Students are not authorized to perform opportunity owner operations');
    }

    let isOwner = false;

    if (user.role === UserRole.INDUSTRY) {
      const industry = await this.repository.findIndustryProfileByUserId(user.id);
      if (industry && opportunity.industryId && opportunity.industryId === industry.id) {
        isOwner = true;
      }
    } else if (user.role === UserRole.INSTITUTION) {
      const institution = await this.repository.findInstitutionProfileByUserId(user.id);
      if (institution && opportunity.institutionId && opportunity.institutionId === institution.id) {
        isOwner = true;
      }
    }

    if (!isOwner) {
      throw new AuthorizationError('You are not authorized to manage applications for this opportunity');
    }
  }

  // ----------------------------------------------------
  // 1. Submit Application (Student)
  // ----------------------------------------------------
  public async submitApplication(userId: number, input: SubmitApplicationInput) {
    const student = await this.resolveStudentProfile(userId);
    const opportunity = await this.resolveOpportunityOrThrow(input.opportunityType, input.opportunityId);

    // Verify opportunity is open and deadline has not passed
    this.validateOpportunityActiveAndDeadline(opportunity);

    // Verify student has not already applied
    const existing = await this.repository.findApplicationByStudentAndOpportunity(
      student.id,
      input.opportunityId,
      input.opportunityType
    );
    if (existing) {
      throw new ConflictError('You have already submitted an application for this opportunity');
    }

    // Transactional creation of Application and initial APPLIED history record
    const result = await sequelize.transaction(async (t) => {
      try {
        const application = await this.repository.createApplication(
          {
            studentId: student.id,
            opportunityId: input.opportunityId,
            opportunityType: input.opportunityType,
            status: ApplicationStatus.APPLIED,
            coverLetter: input.coverLetter || null,
            resumeUrl: input.resumeUrl || null,
            appliedAt: new Date(),
          },
          t
        );

        await this.repository.createStatusHistory(
          {
            applicationId: application.id,
            fromStatus: null,
            toStatus: ApplicationStatus.APPLIED,
            changedByUserId: userId,
            reason: 'Initial application submitted',
          },
          t
        );

        return application.toJSON();
      } catch (error: any) {
        if (error.name === 'SequelizeUniqueConstraintError') {
          throw new ConflictError('You have already submitted an application for this opportunity');
        }
        throw error;
      }
    });

    appEvents.emitSafe(AppEventType.APPLICATION_SUBMITTED, {
      studentUserId: userId,
      opportunityTitle: (opportunity as any).title,
      applicationId: result.id,
    });

    return result;
  }

  // ----------------------------------------------------
  // 2. View My Applications (Student)
  // ----------------------------------------------------
  public async getMyApplications(userId: number, query: ApplicationQueryInput) {
    const student = await this.resolveStudentProfile(userId);
    const offset = (query.page - 1) * query.limit;

    const { rows, count } = await this.repository.findStudentApplications(
      student.id,
      query,
      query.limit,
      offset
    );

    // Eagerly resolve basic opportunity details for each application
    const items = await Promise.all(
      rows.map(async (app) => {
        const opp = await this.repository.findOpportunity(
          app.opportunityType as OpportunityType,
          app.opportunityId
        );
        return {
          ...app.toJSON(),
          opportunity: opp
            ? {
                id: (opp as any).id,
                title: (opp as any).title,
                status: (opp as any).status,
                industry: (opp as any).industry || null,
                institution: (opp as any).institution || null,
              }
            : null,
        };
      })
    );

    return {
      applications: items,
      pagination: {
        total: count,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(count / query.limit),
      },
    };
  }

  // ----------------------------------------------------
  // 3. View My Single Application (Student)
  // ----------------------------------------------------
  public async getMyApplicationById(userId: number, applicationId: number) {
    const student = await this.resolveStudentProfile(userId);
    const application = await this.repository.findApplicationById(applicationId);

    if (!application) {
      throw new NotFoundError('Application not found');
    }

    // IDOR Protection: Student can only view their own application
    if (application.studentId !== student.id) {
      throw new NotFoundError('Application not found');
    }

    const opp = await this.repository.findOpportunity(
      application.opportunityType as OpportunityType,
      application.opportunityId
    );

    return {
      ...application.toJSON(),
      opportunity: opp
        ? {
            id: (opp as any).id,
            title: (opp as any).title,
            status: (opp as any).status,
            industry: (opp as any).industry || null,
            institution: (opp as any).institution || null,
          }
        : null,
    };
  }

  // ----------------------------------------------------
  // 4. View Applications for Opportunity (Opportunity Owner)
  // ----------------------------------------------------
  public async getOpportunityApplications(
    user: AuthenticatedUser,
    opportunityType: OpportunityType,
    opportunityId: number,
    query: ApplicationQueryInput
  ) {
    const opportunity = await this.resolveOpportunityOrThrow(opportunityType, opportunityId);
    await this.assertOpportunityOwnership(user, opportunity);

    const offset = (query.page - 1) * query.limit;
    const { rows, count } = await this.repository.findOpportunityApplications(
      opportunityId,
      opportunityType,
      query,
      query.limit,
      offset
    );

    return {
      applications: rows,
      pagination: {
        total: count,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(count / query.limit),
      },
    };
  }

  // ----------------------------------------------------
  // 5. View Single Application for Opportunity Owner
  // ----------------------------------------------------
  public async getOpportunityApplicationById(user: AuthenticatedUser, applicationId: number) {
    const application = await this.repository.findApplicationById(applicationId);
    if (!application) {
      throw new NotFoundError('Application not found');
    }

    const opportunity = await this.resolveOpportunityOrThrow(
      application.opportunityType as OpportunityType,
      application.opportunityId
    );
    await this.assertOpportunityOwnership(user, opportunity);

    return {
      ...application.toJSON(),
      opportunity: {
        id: (opportunity as any).id,
        title: (opportunity as any).title,
        status: (opportunity as any).status,
      },
    };
  }

  // ----------------------------------------------------
  // 6. Update Application Status (Opportunity Owner)
  // ----------------------------------------------------
  public async updateApplicationStatus(
    user: AuthenticatedUser,
    applicationId: number,
    input: UpdateApplicationStatusInput
  ) {
    const application = await this.repository.findApplicationById(applicationId);
    if (!application) {
      throw new NotFoundError('Application not found');
    }

    const opportunity = await this.resolveOpportunityOrThrow(
      application.opportunityType as OpportunityType,
      application.opportunityId
    );
    await this.assertOpportunityOwnership(user, opportunity);

    // Validate status transition against the centralized transition state machine
    const allowed = ALLOWED_TRANSITIONS[application.status];
    if (!allowed.includes(input.status)) {
      const allowedStr = allowed.length > 0 ? allowed.join(', ') : 'none (terminal status)';
      throw new ConflictError(
        `Invalid status transition from '${application.status}' to '${input.status}'. Allowed next transitions: [${allowedStr}]`
      );
    }

    // Atomically update status and insert immutable history record
    const result = await sequelize.transaction(async (t) => {
      await this.repository.updateApplicationStatus(applicationId, input.status, t);

      await this.repository.createStatusHistory(
        {
          applicationId,
          fromStatus: application.status,
          toStatus: input.status,
          changedByUserId: user.id,
          reason: input.reason || null,
        },
        t
      );

      const updated = await this.repository.findApplicationById(applicationId, t);
      return updated!.toJSON();
    });

    const studentUserId = (result as any).student?.userId;
    if (studentUserId) {
      appEvents.emitSafe(AppEventType.APPLICATION_STATUS_CHANGED, {
        applicationId,
        studentUserId,
        opportunityTitle: (opportunity as any).title,
        previousStatus: application.status,
        newStatus: input.status,
        actorUserId: user.id,
      });
    }

    return result;
  }
}

export const applicationService = new ApplicationService();
