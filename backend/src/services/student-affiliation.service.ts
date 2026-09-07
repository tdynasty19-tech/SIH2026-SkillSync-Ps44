import { ConflictError, AuthorizationError, NotFoundError, ValidationError } from '../errors/app.error';
import { StudentAffiliationStatus } from '../constants/enums';
import { InstitutionProfile } from '../models/institution-profile.model';
import { studentRepository, StudentRepository } from '../repositories/student.repository';
import {
  studentAffiliationRepository,
  StudentAffiliationRepository,
} from '../repositories/student-affiliation.repository';
import {
  CreateStudentAffiliationInput,
  AffiliationStatusQueryInput,
  RejectStudentAffiliationInput,
} from '../validators/student-affiliation.validator';

export class StudentAffiliationService {
  constructor(
    private readonly repository: StudentAffiliationRepository = studentAffiliationRepository,
    private readonly students: StudentRepository = studentRepository
  ) {}

  private normalizeEnrollmentNumber(value: string) {
    return value.trim().toUpperCase();
  }

  private async resolveStudent(userId: number) {
    const student = await this.students.findProfileByUserId(userId);
    if (!student) {
      throw new NotFoundError('Student profile not found. Please complete your profile first.');
    }
    return student;
  }

  private async validateInstitutionAndDepartment(institutionId: number, departmentId: number) {
    const institution = await this.repository.findInstitutionById(institutionId);
    if (!institution || !institution.verified) {
      throw new ValidationError('Selected institution is not available for affiliation requests');
    }

    const department = await this.repository.findDepartmentByIdAndInstitution(departmentId, institutionId);
    if (!department) {
      throw new ValidationError('Selected department does not belong to the selected institution');
    }

    return { institution, department };
  }

  public async getAvailableInstitutions() {
    return this.repository.findAvailableInstitutions();
  }

  public async getInstitutionDepartments(institutionId: number) {
    const institution = await this.repository.findInstitutionById(institutionId);
    if (!institution || !institution.verified) {
      throw new NotFoundError('Institution not found');
    }
    return this.repository.findDepartmentsByInstitution(institutionId);
  }

  public async createRequest(userId: number, input: CreateStudentAffiliationInput) {
    const student = await this.resolveStudent(userId);
    const enrollmentNumber = this.normalizeEnrollmentNumber(input.enrollmentNumber);
    await this.validateInstitutionAndDepartment(input.institutionId, input.departmentId);

    const enrollmentRecord = await this.repository.findByInstitutionAndEnrollment(
      input.institutionId,
      enrollmentNumber
    );
    if (enrollmentRecord && enrollmentRecord.studentId !== student.id) {
      throw new ConflictError('Enrollment number is already used in this institution');
    }

    const existingActive = await this.repository.findActiveByStudent(student.id);
    if (existingActive) {
      if (
        existingActive.institutionId === input.institutionId &&
        existingActive.enrollmentNumber === enrollmentNumber &&
        existingActive.status === StudentAffiliationStatus.PENDING
      ) {
        throw new ConflictError('A pending affiliation request already exists');
      }
      throw new ConflictError('Student already has a pending or verified affiliation');
    }

    if (enrollmentRecord && enrollmentRecord.studentId === student.id) {
      if (enrollmentRecord.status !== StudentAffiliationStatus.REJECTED) {
        throw new ConflictError('An active affiliation already uses this enrollment number');
      }

      const updated = await this.repository.update(enrollmentRecord.id, {
        departmentId: input.departmentId,
        status: StudentAffiliationStatus.PENDING,
        requestedAt: new Date(),
        reviewedAt: null,
        reviewedByUserId: null,
        rejectionReason: null,
      });
      return updated!.toJSON();
    }

    const created = await this.repository.create({
      studentId: student.id,
      institutionId: input.institutionId,
      departmentId: input.departmentId,
      enrollmentNumber,
      status: StudentAffiliationStatus.PENDING,
      requestedAt: new Date(),
    });

    return (await this.repository.findById(created.id))!.toJSON();
  }

  public async getMyAffiliations(userId: number, query: AffiliationStatusQueryInput) {
    const student = await this.resolveStudent(userId);
    const affiliations = await this.repository.findByStudentId(student.id, query.status);
    return {
      affiliations: affiliations.map((affiliation) => affiliation.toJSON()),
      pagination: {
        total: affiliations.length,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(affiliations.length / query.limit),
      },
    };
  }

  public async getCurrentAffiliation(userId: number) {
    const student = await this.resolveStudent(userId);
    const affiliation = await this.repository.findCurrentByStudentId(student.id);
    return affiliation ? affiliation.toJSON() : null;
  }

  public async getInstitutionRequests(userId: number, query: AffiliationStatusQueryInput) {
    const institution = await this.resolveInstitutionProfile(userId);
    const offset = (query.page - 1) * query.limit;
    const result = await this.repository.findForInstitution(
      institution.id,
      query.status,
      query.limit,
      offset
    );

    return {
      affiliations: result.rows.map((affiliation) => affiliation.toJSON()),
      pagination: {
        total: result.count,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(result.count / query.limit),
      },
    };
  }

  private async resolveInstitutionProfile(userId: number) {
    const institution = await InstitutionProfile.findOne({ where: { userId } });
    if (!institution) {
      throw new NotFoundError('Institution profile not found');
    }
    if (!institution.verified) {
      throw new AuthorizationError('Institution profile is not verified');
    }
    return institution;
  }

  public async getInstitutionRequest(userId: number, affiliationId: number) {
    const institution = await this.resolveInstitutionProfile(userId);
    const affiliation = await this.repository.findById(affiliationId, institution.id);
    if (!affiliation) {
      throw new NotFoundError('Student affiliation not found');
    }
    return affiliation.toJSON();
  }

  public async verify(userId: number, affiliationId: number) {
    const institution = await this.resolveInstitutionProfile(userId);
    const affiliation = await this.repository.findById(affiliationId, institution.id);
    if (!affiliation) {
      throw new NotFoundError('Student affiliation not found');
    }
    if (affiliation.status !== StudentAffiliationStatus.PENDING) {
      throw new ConflictError('Only pending affiliations can be verified');
    }

    await this.validateInstitutionAndDepartment(affiliation.institutionId, affiliation.departmentId);
    const conflicting = await this.repository.findActiveByStudent(affiliation.studentId, affiliation.id);
    if (conflicting) {
      throw new ConflictError('Student already has another pending or verified affiliation');
    }

    const updated = await this.repository.update(affiliation.id, {
      status: StudentAffiliationStatus.VERIFIED,
      reviewedAt: new Date(),
      reviewedByUserId: userId,
      rejectionReason: null,
    });
    return updated!.toJSON();
  }

  public async reject(userId: number, affiliationId: number, input: RejectStudentAffiliationInput) {
    const institution = await this.resolveInstitutionProfile(userId);
    const affiliation = await this.repository.findById(affiliationId, institution.id);
    if (!affiliation) {
      throw new NotFoundError('Student affiliation not found');
    }
    if (affiliation.status !== StudentAffiliationStatus.PENDING) {
      throw new ConflictError('Only pending affiliations can be rejected');
    }

    const updated = await this.repository.update(affiliation.id, {
      status: StudentAffiliationStatus.REJECTED,
      reviewedAt: new Date(),
      reviewedByUserId: userId,
      rejectionReason: input.rejectionReason.trim(),
    });
    return updated!.toJSON();
  }
}

export const studentAffiliationService = new StudentAffiliationService();
