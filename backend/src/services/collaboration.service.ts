import { collaborationRepository, CollaborationRepository } from '../repositories/collaboration.repository';
import {
  CreateCollaborationInput,
  UpdateCollaborationInput,
  CreateWorkshopInput,
  UpdateWorkshopInput,
  CreateGuestLectureInput,
  UpdateGuestLectureInput,
  CreateIndustrialTrainingInput,
  UpdateIndustrialTrainingInput,
  CreateLiveProjectInput,
  UpdateLiveProjectInput,
  CollaborationQueryInput,
} from '../validators/collaboration.validator';
import { AuthenticatedUser } from '../types/auth.types';
import { UserRole } from '../constants/roles';
import { CollaborationStatus } from '../constants/enums';
import { NotFoundError, AuthorizationError, ValidationError } from '../errors/app.error';

export class CollaborationService {
  constructor(private readonly repository: CollaborationRepository = collaborationRepository) {}

  // ----------------------------------------------------
  // Helpers
  // ----------------------------------------------------
  private async resolveUserOrganization(user: AuthenticatedUser) {
    if (user.role === UserRole.INSTITUTION) {
      const inst = await this.repository.findInstitutionProfileByUserId(user.id);
      if (!inst) {
        throw new NotFoundError('Institution profile not found. Please complete your profile first.');
      }
      return { institutionId: inst.id, industryId: undefined };
    } else if (user.role === UserRole.INDUSTRY) {
      const ind = await this.repository.findIndustryProfileByUserId(user.id);
      if (!ind) {
        throw new NotFoundError('Industry profile not found. Please complete your profile first.');
      }
      return { industryId: ind.id, institutionId: undefined };
    } else {
      throw new AuthorizationError('Only Institutions and Industry organizations can manage collaborations');
    }
  }

  private async assertCollaborationParticipant(user: AuthenticatedUser, collaborationId: number) {
    const collab = await this.repository.findCollaborationById(collaborationId);
    if (!collab) {
      throw new NotFoundError('Collaboration not found');
    }

    const org = await this.resolveUserOrganization(user);
    const isParticipant =
      (org.institutionId && collab.institutionId === org.institutionId) ||
      (org.industryId && collab.industryId === org.industryId);

    if (!isParticipant) {
      throw new AuthorizationError('You are not authorized to access this collaboration');
    }

    return collab;
  }

  private validateDates(startDate?: string, endDate?: string) {
    if (startDate && endDate) {
      if (new Date(endDate) < new Date(startDate)) {
        throw new ValidationError('End date cannot be before start date');
      }
    }
  }

  // ----------------------------------------------------
  // 1. Collaboration Operations
  // ----------------------------------------------------
  public async getCollaborations(user: AuthenticatedUser, query: CollaborationQueryInput) {
    const org = await this.resolveUserOrganization(user);
    const offset = (query.page - 1) * query.limit;

    const { rows, count } = await this.repository.findCollaborations(
      {
        institutionId: org.institutionId,
        industryId: org.industryId,
        status: query.status,
        collaborationType: query.collaborationType,
        search: query.search,
      },
      query.limit,
      offset
    );

    return {
      collaborations: rows,
      pagination: {
        total: count,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(count / query.limit),
      },
    };
  }

  public async getCollaborationById(user: AuthenticatedUser, collaborationId: number) {
    const collab = await this.assertCollaborationParticipant(user, collaborationId);
    return collab.toJSON();
  }

  public async createCollaboration(user: AuthenticatedUser, input: CreateCollaborationInput) {
    let institutionId: number;
    let industryId: number;

    if (user.role === UserRole.INSTITUTION) {
      const org = await this.resolveUserOrganization(user);
      institutionId = org.institutionId!;

      if (!input.industryId) {
        throw new ValidationError('Industry partner ID (industryId) is required');
      }
      const ind = await this.repository.findIndustryProfileById(input.industryId);
      if (!ind) {
        throw new NotFoundError('Industry partner not found');
      }
      industryId = ind.id;
    } else if (user.role === UserRole.INDUSTRY) {
      const org = await this.resolveUserOrganization(user);
      industryId = org.industryId!;

      if (!input.institutionId) {
        throw new ValidationError('Institution partner ID (institutionId) is required');
      }
      const inst = await this.repository.findInstitutionProfileById(input.institutionId);
      if (!inst) {
        throw new NotFoundError('Institution partner not found');
      }
      institutionId = inst.id;
    } else {
      throw new AuthorizationError('Only Institutions or Industry can create collaborations');
    }

    this.validateDates(input.startDate, input.endDate);

    const collab = await this.repository.createCollaboration({
      ...input,
      institutionId,
      industryId,
      status: CollaborationStatus.PENDING,
    });

    const created = await this.repository.findCollaborationById(collab.id);
    return created!.toJSON();
  }

  public async updateCollaboration(
    user: AuthenticatedUser,
    collaborationId: number,
    input: UpdateCollaborationInput
  ) {
    const collab = await this.assertCollaborationParticipant(user, collaborationId);

    const start = input.startDate || (collab.startDate as string);
    const end = input.endDate || (collab.endDate as string);
    this.validateDates(start, end);

    await this.repository.updateCollaboration(collaborationId, input);
    const updated = await this.repository.findCollaborationById(collaborationId);
    return updated!.toJSON();
  }

  public async deleteCollaboration(user: AuthenticatedUser, collaborationId: number) {
    await this.assertCollaborationParticipant(user, collaborationId);
    await this.repository.deleteCollaboration(collaborationId);
    return { message: 'Collaboration deleted successfully' };
  }

  // ----------------------------------------------------
  // 2. Workshop Operations
  // ----------------------------------------------------
  public async createWorkshop(
    user: AuthenticatedUser,
    collaborationId: number,
    input: CreateWorkshopInput
  ) {
    await this.assertCollaborationParticipant(user, collaborationId);
    const workshop = await this.repository.createWorkshop({
      ...input,
      collaborationId,
    });
    return workshop.toJSON();
  }

  public async updateWorkshop(
    user: AuthenticatedUser,
    workshopId: number,
    input: UpdateWorkshopInput
  ) {
    const workshop = await this.repository.getWorkshopById(workshopId);
    if (!workshop) throw new NotFoundError('Workshop not found');

    await this.assertCollaborationParticipant(user, workshop.collaborationId);
    await this.repository.updateWorkshop(workshopId, input);
    const updated = await this.repository.getWorkshopById(workshopId);
    return updated!.toJSON();
  }

  public async deleteWorkshop(user: AuthenticatedUser, workshopId: number) {
    const workshop = await this.repository.getWorkshopById(workshopId);
    if (!workshop) throw new NotFoundError('Workshop not found');

    await this.assertCollaborationParticipant(user, workshop.collaborationId);
    await this.repository.deleteWorkshop(workshopId);
    return { message: 'Workshop deleted successfully' };
  }

  // ----------------------------------------------------
  // 3. Guest Lecture Operations
  // ----------------------------------------------------
  public async createGuestLecture(
    user: AuthenticatedUser,
    collaborationId: number,
    input: CreateGuestLectureInput
  ) {
    await this.assertCollaborationParticipant(user, collaborationId);
    const lecture = await this.repository.createGuestLecture({
      ...input,
      collaborationId,
    });
    return lecture.toJSON();
  }

  public async updateGuestLecture(
    user: AuthenticatedUser,
    lectureId: number,
    input: UpdateGuestLectureInput
  ) {
    const lecture = await this.repository.getGuestLectureById(lectureId);
    if (!lecture) throw new NotFoundError('Guest lecture not found');

    await this.assertCollaborationParticipant(user, lecture.collaborationId);
    await this.repository.updateGuestLecture(lectureId, input);
    const updated = await this.repository.getGuestLectureById(lectureId);
    return updated!.toJSON();
  }

  public async deleteGuestLecture(user: AuthenticatedUser, lectureId: number) {
    const lecture = await this.repository.getGuestLectureById(lectureId);
    if (!lecture) throw new NotFoundError('Guest lecture not found');

    await this.assertCollaborationParticipant(user, lecture.collaborationId);
    await this.repository.deleteGuestLecture(lectureId);
    return { message: 'Guest lecture deleted successfully' };
  }

  // ----------------------------------------------------
  // 4. Industrial Training Operations
  // ----------------------------------------------------
  public async createIndustrialTraining(
    user: AuthenticatedUser,
    collaborationId: number,
    input: CreateIndustrialTrainingInput
  ) {
    await this.assertCollaborationParticipant(user, collaborationId);
    const training = await this.repository.createIndustrialTraining({
      ...input,
      collaborationId,
    });
    return training.toJSON();
  }

  public async updateIndustrialTraining(
    user: AuthenticatedUser,
    trainingId: number,
    input: UpdateIndustrialTrainingInput
  ) {
    const training = await this.repository.getIndustrialTrainingById(trainingId);
    if (!training) throw new NotFoundError('Industrial training not found');

    await this.assertCollaborationParticipant(user, training.collaborationId);
    await this.repository.updateIndustrialTraining(trainingId, input);
    const updated = await this.repository.getIndustrialTrainingById(trainingId);
    return updated!.toJSON();
  }

  public async deleteIndustrialTraining(user: AuthenticatedUser, trainingId: number) {
    const training = await this.repository.getIndustrialTrainingById(trainingId);
    if (!training) throw new NotFoundError('Industrial training not found');

    await this.assertCollaborationParticipant(user, training.collaborationId);
    await this.repository.deleteIndustrialTraining(trainingId);
    return { message: 'Industrial training deleted successfully' };
  }

  // ----------------------------------------------------
  // 5. Live Project Operations
  // ----------------------------------------------------
  public async createLiveProject(
    user: AuthenticatedUser,
    collaborationId: number,
    input: CreateLiveProjectInput
  ) {
    await this.assertCollaborationParticipant(user, collaborationId);
    const project = await this.repository.createLiveProject({
      ...input,
      collaborationId,
      deadline: input.deadline ? input.deadline : null,
    });
    return project.toJSON();
  }

  public async updateLiveProject(
    user: AuthenticatedUser,
    projectId: number,
    input: UpdateLiveProjectInput
  ) {
    const project = await this.repository.getLiveProjectById(projectId);
    if (!project) throw new NotFoundError('Live project not found');

    await this.assertCollaborationParticipant(user, project.collaborationId);
    await this.repository.updateLiveProject(projectId, {
      ...input,
      deadline: input.deadline ? input.deadline : null,
    });
    const updated = await this.repository.getLiveProjectById(projectId);
    return updated!.toJSON();
  }

  public async deleteLiveProject(user: AuthenticatedUser, projectId: number) {
    const project = await this.repository.getLiveProjectById(projectId);
    if (!project) throw new NotFoundError('Live project not found');

    await this.assertCollaborationParticipant(user, project.collaborationId);
    await this.repository.deleteLiveProject(projectId);
    return { message: 'Live project deleted successfully' };
  }
}

export const collaborationService = new CollaborationService();
