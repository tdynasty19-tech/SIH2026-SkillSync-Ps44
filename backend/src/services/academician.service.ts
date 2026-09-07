import { academicianRepository, AcademicianRepository } from '../repositories/academician.repository';
import {
  CreateAcademicianProfileInput,
  UpdateAcademicianProfileInput,
  CreateInstitutionAssociationInput,
  UpdateInstitutionAssociationInput,
  AssociationQueryInput,
} from '../validators/academician.validator';
import { NotFoundError, ConflictError, ValidationError } from '../errors/app.error';

export class AcademicianService {
  constructor(private readonly repository: AcademicianRepository = academicianRepository) {}

  // ----------------------------------------------------
  // Helpers
  // ----------------------------------------------------
  private async resolveProfileOrThrow(userId: number) {
    const profile = await this.repository.findProfileByUserId(userId);
    if (!profile) {
      throw new NotFoundError(
        'Academician profile not found. Please complete your academician profile first.'
      );
    }
    return profile;
  }

  private validateDates(startDate?: string, endDate?: string | null) {
    if (startDate && endDate) {
      if (new Date(endDate) < new Date(startDate)) {
        throw new ValidationError('End date cannot be before start date');
      }
    }
  }

  // ----------------------------------------------------
  // Profile Operations
  // ----------------------------------------------------
  public async getMyProfile(userId: number) {
    const profile = await this.repository.findProfileByUserId(userId, {
      includeUser: true,
      includeInstitution: true,
      includeAssociations: true,
    });

    if (!profile) {
      throw new NotFoundError(
        'Academician profile not found. Please complete your academician profile first.'
      );
    }

    return profile.toJSON();
  }

  public async createMyProfile(userId: number, input: CreateAcademicianProfileInput) {
    const existing = await this.repository.findProfileByUserId(userId);
    if (existing) {
      throw new ConflictError('Academician profile already exists for this account');
    }

    if (input.institutionId) {
      const inst = await this.repository.findInstitutionById(input.institutionId);
      if (!inst) {
        throw new NotFoundError('Associated institution not found');
      }

      if (input.departmentId) {
        const department = await this.repository.findDepartmentByIdAndInstitution(
          input.departmentId,
          input.institutionId
        );
        if (!department) {
          throw new ValidationError('Selected department does not belong to the selected institution');
        }
      }
    } else if (input.departmentId) {
      throw new ValidationError('A department requires an associated institution');
    }

    const profile = await this.repository.createProfile({
      ...input,
      userId,
      verified: false,
    });

    return profile.toJSON();
  }

  public async updateMyProfile(userId: number, input: UpdateAcademicianProfileInput) {
    const profile = await this.resolveProfileOrThrow(userId);

    if (input.institutionId) {
      const inst = await this.repository.findInstitutionById(input.institutionId);
      if (!inst) {
        throw new NotFoundError('Associated institution not found');
      }
    }

    const institutionId = input.institutionId ?? profile.institutionId;
    if (input.departmentId) {
      if (!institutionId) {
        throw new ValidationError('A department requires an associated institution');
      }
      const department = await this.repository.findDepartmentByIdAndInstitution(
        input.departmentId,
        institutionId
      );
      if (!department) {
        throw new ValidationError('Selected department does not belong to the selected institution');
      }
    }

    await this.repository.updateProfile(profile.id, input);
    const updated = await this.repository.findProfileById(profile.id);
    return updated!.toJSON();
  }

  // ----------------------------------------------------
  // Association Operations
  // ----------------------------------------------------
  public async getAssociations(userId: number, query: AssociationQueryInput) {
    const profile = await this.resolveProfileOrThrow(userId);
    const offset = (query.page - 1) * query.limit;

    const { rows, count } = await this.repository.findAssociationsByAcademicianId(
      profile.id,
      query.limit,
      offset
    );

    return {
      associations: rows,
      pagination: {
        total: count,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(count / query.limit),
      },
    };
  }

  public async getAssociationById(userId: number, associationId: number) {
    const profile = await this.resolveProfileOrThrow(userId);
    const association = await this.repository.findAssociationById(associationId);

    // IDOR check: association must exist and belong to authenticated academician
    if (!association || association.academicianId !== profile.id) {
      throw new NotFoundError('Academic institution association not found');
    }

    return association.toJSON();
  }

  public async createAssociation(userId: number, input: CreateInstitutionAssociationInput) {
    const profile = await this.resolveProfileOrThrow(userId);

    const inst = await this.repository.findInstitutionById(input.institutionId);
    if (!inst) {
      throw new NotFoundError('Institution not found');
    }

    this.validateDates(input.startDate, input.endDate);

    const association = await this.repository.createAssociation({
      ...input,
      academicianId: profile.id,
      endDate: input.endDate ? input.endDate : null,
    });

    const created = await this.repository.findAssociationById(association.id);
    return created!.toJSON();
  }

  public async updateAssociation(
    userId: number,
    associationId: number,
    input: UpdateInstitutionAssociationInput
  ) {
    const profile = await this.resolveProfileOrThrow(userId);
    const association = await this.repository.findAssociationById(associationId);

    if (!association || association.academicianId !== profile.id) {
      throw new NotFoundError('Academic institution association not found');
    }

    if (input.institutionId) {
      const inst = await this.repository.findInstitutionById(input.institutionId);
      if (!inst) {
        throw new NotFoundError('Institution not found');
      }
    }

    const startDate = input.startDate || (association.startDate as string);
    const endDate = input.endDate !== undefined ? input.endDate : (association.endDate as string | null);
    this.validateDates(startDate, endDate);

    await this.repository.updateAssociation(associationId, {
      ...input,
      endDate: input.endDate ? input.endDate : null,
    });

    const updated = await this.repository.findAssociationById(associationId);
    return updated!.toJSON();
  }

  public async deleteAssociation(userId: number, associationId: number) {
    const profile = await this.resolveProfileOrThrow(userId);
    const association = await this.repository.findAssociationById(associationId);

    if (!association || association.academicianId !== profile.id) {
      throw new NotFoundError('Academic institution association not found');
    }

    await this.repository.deleteAssociation(associationId);
    return { message: 'Academic institution association removed successfully' };
  }
}

export const academicianService = new AcademicianService();
