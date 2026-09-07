import { institutionRepository, InstitutionRepository } from '../repositories/institution.repository';
import {
  CreateInstitutionProfileInput,
  UpdateInstitutionProfileInput,
  CreateInstitutionDepartmentInput,
  UpdateInstitutionDepartmentInput,
  CreateAcademicProgramInput,
  UpdateAcademicProgramInput,
  AcademicProgramQueryInput,
  CreateAcademicBatchInput,
  UpdateAcademicBatchInput,
  AcademicBatchQueryInput,
  CreateStudentAcademicEnrollmentInput,
  UpdateStudentAcademicEnrollmentInput,
  StudentAcademicEnrollmentQueryInput,
  CreatePlacementInput,
  UpdatePlacementInput,
  CreatePlacementRecordInput,
  UpdatePlacementRecordInput,
  InstitutionQueryInput,
} from '../validators/institution.validator';
import { NotFoundError, ConflictError, ValidationError } from '../errors/app.error';
import { appEvents, AppEventType } from '../events';
import { StudentInstitutionAffiliation } from '../models/student-institution-affiliation.model';
import { StudentProfile } from '../models/student-profile.model';

export class InstitutionService {
  constructor(private readonly repository: InstitutionRepository = institutionRepository) {}

  // ----------------------------------------------------
  // Helpers
  // ----------------------------------------------------
  private async resolveProfileOrThrow(userId: number) {
    const profile = await this.repository.findProfileByUserId(userId);
    if (!profile) {
      throw new NotFoundError('Institution profile not found. Please complete your profile first.');
    }
    return profile;
  }

  // ----------------------------------------------------
  // 1. Profile Operations
  // ----------------------------------------------------
  public async getMyProfile(userId: number) {
    const profile = await this.repository.findProfileByUserId(userId, {
      includeUser: true,
      includeDepartments: true,
      includePlacements: true,
    });
    if (!profile) {
      throw new NotFoundError('Institution profile not found. Please complete your profile first.');
    }
    return profile.toJSON();
  }

  public async getInstitutionById(institutionId: number) {
    const profile = await this.repository.findProfileById(institutionId);
    if (!profile) {
      throw new NotFoundError('Institution not found');
    }
    return profile.toJSON();
  }

  public async createMyProfile(userId: number, input: CreateInstitutionProfileInput) {
    const existing = await this.repository.findProfileByUserId(userId);
    if (existing) {
      throw new ConflictError('Institution profile already exists for this account');
    }

    const profile = await this.repository.createProfile({
      ...input,
      userId,
      verified: false,
    });
    return profile.toJSON();
  }

  public async updateMyProfile(userId: number, input: UpdateInstitutionProfileInput) {
    const profile = await this.resolveProfileOrThrow(userId);
    await this.repository.updateProfile(profile.id, input);
    const updated = await this.repository.findProfileById(profile.id);
    return updated!.toJSON();
  }

  // ----------------------------------------------------
  // 2. Department Operations
  // ----------------------------------------------------
  public async getDepartments(userId: number, query: InstitutionQueryInput) {
    const profile = await this.resolveProfileOrThrow(userId);
    const offset = (query.page - 1) * query.limit;

    const { rows, count } = await this.repository.findDepartments(
      profile.id,
      query.limit,
      offset,
      query.search
    );

    return {
      departments: rows,
      pagination: {
        total: count,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(count / query.limit),
      },
    };
  }

  public async getDepartmentById(userId: number, departmentId: number) {
    const profile = await this.resolveProfileOrThrow(userId);
    const dept = await this.repository.findDepartmentById(departmentId);

    if (!dept || dept.institutionId !== profile.id) {
      throw new NotFoundError('Department not found');
    }

    return dept.toJSON();
  }

  public async createDepartment(userId: number, input: CreateInstitutionDepartmentInput) {
    const profile = await this.resolveProfileOrThrow(userId);

    const existing = await this.repository.findDepartmentByName(profile.id, input.departmentName);
    if (existing) {
      throw new ConflictError(`Department '${input.departmentName}' already exists in your institution`);
    }

    const dept = await this.repository.createDepartment({
      ...input,
      institutionId: profile.id,
    });

    return dept.toJSON();
  }

  public async updateDepartment(
    userId: number,
    departmentId: number,
    input: UpdateInstitutionDepartmentInput
  ) {
    const profile = await this.resolveProfileOrThrow(userId);
    const dept = await this.repository.findDepartmentById(departmentId);

    if (!dept || dept.institutionId !== profile.id) {
      throw new NotFoundError('Department not found');
    }

    if (input.departmentName && input.departmentName !== dept.departmentName) {
      const existing = await this.repository.findDepartmentByName(profile.id, input.departmentName);
      if (existing) {
        throw new ConflictError(`Department '${input.departmentName}' already exists in your institution`);
      }
    }

    await this.repository.updateDepartment(departmentId, input);
    const updated = await this.repository.findDepartmentById(departmentId);
    return updated!.toJSON();
  }

  public async deleteDepartment(userId: number, departmentId: number) {
    const profile = await this.resolveProfileOrThrow(userId);
    const dept = await this.repository.findDepartmentById(departmentId);

    if (!dept || dept.institutionId !== profile.id) {
      throw new NotFoundError('Department not found');
    }

    await this.repository.deleteDepartment(departmentId);
    return { message: 'Department deleted successfully' };
  }

  // ----------------------------------------------------
  // 2.5 Academic Program Operations
  // ----------------------------------------------------
  public async getPrograms(userId: number, query: AcademicProgramQueryInput) {
    const profile = await this.resolveProfileOrThrow(userId);
    const offset = (query.page - 1) * query.limit;

    const { rows, count } = await this.repository.findPrograms(profile.id, {
      limit: query.limit,
      offset,
      departmentId: query.departmentId,
      degreeLevel: query.degreeLevel,
      isActive: query.isActive,
      search: query.search,
    });

    return {
      programs: rows,
      pagination: {
        total: count,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(count / query.limit),
      },
    };
  }

  public async getProgramById(userId: number, programId: number) {
    const profile = await this.resolveProfileOrThrow(userId);
    const program = await this.repository.findProgramById(programId);

    if (!program || program.institutionId !== profile.id) {
      throw new NotFoundError('Academic program not found');
    }

    return program.toJSON();
  }

  public async createProgram(userId: number, input: CreateAcademicProgramInput) {
    const profile = await this.resolveProfileOrThrow(userId);

    // Verify department belongs to this institution
    const dept = await this.repository.findDepartmentById(input.departmentId);
    if (!dept || dept.institutionId !== profile.id) {
      throw new ValidationError('Department does not belong to your institution');
    }

    // Check duplicate program name in same department
    const existing = await this.repository.findProgramByName(input.departmentId, input.programName);
    if (existing) {
      throw new ConflictError(
        `Academic program '${input.programName}' already exists in this department`
      );
    }

    const program = await this.repository.createProgram({
      ...input,
      institutionId: profile.id,
    });

    return program.toJSON();
  }

  public async updateProgram(
    userId: number,
    programId: number,
    input: UpdateAcademicProgramInput
  ) {
    const profile = await this.resolveProfileOrThrow(userId);
    const program = await this.repository.findProgramById(programId);

    if (!program || program.institutionId !== profile.id) {
      throw new NotFoundError('Academic program not found');
    }

    const targetDeptId = input.departmentId ?? program.departmentId;

    if (input.departmentId && input.departmentId !== program.departmentId) {
      const dept = await this.repository.findDepartmentById(input.departmentId);
      if (!dept || dept.institutionId !== profile.id) {
        throw new ValidationError('Department does not belong to your institution');
      }
    }

    if (
      (input.programName && input.programName !== program.programName) ||
      (input.departmentId && input.departmentId !== program.departmentId)
    ) {
      const targetName = input.programName ?? program.programName;
      const existing = await this.repository.findProgramByName(targetDeptId, targetName);
      if (existing && existing.id !== programId) {
        throw new ConflictError(
          `Academic program '${targetName}' already exists in the target department`
        );
      }
    }

    await this.repository.updateProgram(programId, input);
    const updated = await this.repository.findProgramById(programId);
    return updated!.toJSON();
  }

  public async deleteProgram(userId: number, programId: number) {
    const profile = await this.resolveProfileOrThrow(userId);
    const program = await this.repository.findProgramById(programId);

    if (!program || program.institutionId !== profile.id) {
      throw new NotFoundError('Academic program not found');
    }

    await this.repository.deleteProgram(programId);
    return { message: 'Academic program deleted successfully' };
  }

  public async getDepartmentPrograms(institutionId: number, departmentId: number) {
    const dept = await this.repository.findDepartmentById(departmentId);
    if (!dept || dept.institutionId !== institutionId) {
      throw new NotFoundError('Department not found in the specified institution');
    }

    const { rows } = await this.repository.findPrograms(institutionId, {
      departmentId,
      isActive: true,
      limit: 100,
    });

    return rows;
  }

  // ----------------------------------------------------
  // 2.6 Academic Batch Operations
  // ----------------------------------------------------
  public async getBatches(userId: number, query: AcademicBatchQueryInput) {
    const profile = await this.resolveProfileOrThrow(userId);
    const offset = (query.page - 1) * query.limit;

    const { rows, count } = await this.repository.findBatches(profile.id, {
      limit: query.limit,
      offset,
      departmentId: query.departmentId,
      programId: query.programId,
      startYear: query.startYear,
      endYear: query.endYear,
      isActive: query.isActive,
      search: query.search,
    });

    return {
      batches: rows,
      pagination: {
        total: count,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(count / query.limit),
      },
    };
  }

  public async getBatchById(userId: number, batchId: number) {
    const profile = await this.resolveProfileOrThrow(userId);
    const batch = await this.repository.findBatchById(batchId);

    if (!batch || batch.institutionId !== profile.id) {
      throw new NotFoundError('Academic batch not found');
    }

    return batch.toJSON();
  }

  public async createBatch(userId: number, input: CreateAcademicBatchInput) {
    const profile = await this.resolveProfileOrThrow(userId);

    const program = await this.repository.findProgramById(input.programId);
    if (!program || program.institutionId !== profile.id) {
      throw new ValidationError('Program does not belong to your institution');
    }

    if (input.endYear < input.startYear) {
      throw new ValidationError('End year cannot be before start year');
    }

    const existing = await this.repository.findBatchByName(input.programId, input.batchName);
    if (existing) {
      throw new ConflictError(
        `Academic batch '${input.batchName}' already exists in this program`
      );
    }

    const batch = await this.repository.createBatch({
      ...input,
      institutionId: profile.id,
      departmentId: program.departmentId,
    });

    return batch.toJSON();
  }

  public async updateBatch(
    userId: number,
    batchId: number,
    input: UpdateAcademicBatchInput
  ) {
    const profile = await this.resolveProfileOrThrow(userId);
    const batch = await this.repository.findBatchById(batchId);

    if (!batch || batch.institutionId !== profile.id) {
      throw new NotFoundError('Academic batch not found');
    }

    const targetProgId = input.programId ?? batch.programId;

    if (input.programId && input.programId !== batch.programId) {
      const program = await this.repository.findProgramById(input.programId);
      if (!program || program.institutionId !== profile.id) {
        throw new ValidationError('Target program does not belong to your institution');
      }
    }

    if (
      (input.batchName && input.batchName !== batch.batchName) ||
      (input.programId && input.programId !== batch.programId)
    ) {
      const targetName = input.batchName ?? batch.batchName;
      const existing = await this.repository.findBatchByName(targetProgId, targetName);
      if (existing && existing.id !== batchId) {
        throw new ConflictError(
          `Academic batch '${targetName}' already exists in the target program`
        );
      }
    }

    await this.repository.updateBatch(batchId, input);
    const updated = await this.repository.findBatchById(batchId);
    return updated!.toJSON();
  }

  public async deleteBatch(userId: number, batchId: number) {
    const profile = await this.resolveProfileOrThrow(userId);
    const batch = await this.repository.findBatchById(batchId);

    if (!batch || batch.institutionId !== profile.id) {
      throw new NotFoundError('Academic batch not found');
    }

    await this.repository.deleteBatch(batchId);
    return { message: 'Academic batch deleted successfully' };
  }

  public async getProgramBatches(institutionId: number, programId: number) {
    const program = await this.repository.findProgramById(programId);
    if (!program || program.institutionId !== institutionId) {
      throw new NotFoundError('Program not found in the specified institution');
    }

    const { rows } = await this.repository.findBatches(institutionId, {
      programId,
      isActive: true,
      limit: 100,
    });

    return rows;
  }

  // ----------------------------------------------------
  // 2.7 Student Academic Enrollment Operations
  // ----------------------------------------------------
  public async getEnrollments(userId: number, query: StudentAcademicEnrollmentQueryInput) {
    const profile = await this.resolveProfileOrThrow(userId);
    const offset = (query.page - 1) * query.limit;

    const { rows, count } = await this.repository.findEnrollments(profile.id, {
      limit: query.limit,
      offset,
      studentId: query.studentId,
      batchId: query.batchId,
      programId: query.programId,
      departmentId: query.departmentId,
      status: query.status,
      isCurrent: query.isCurrent,
      search: query.search,
    });

    return {
      enrollments: rows,
      pagination: {
        total: count,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(count / query.limit),
      },
    };
  }

  public async getEnrollmentById(userId: number, enrollmentId: number) {
    const profile = await this.resolveProfileOrThrow(userId);
    const enrollment = await this.repository.findEnrollmentById(enrollmentId);

    if (!enrollment || enrollment.institutionId !== profile.id) {
      throw new NotFoundError('Academic enrollment not found');
    }

    return enrollment.toJSON();
  }

  public async createEnrollment(userId: number, input: CreateStudentAcademicEnrollmentInput) {
    const profile = await this.resolveProfileOrThrow(userId);

    const batch = await this.repository.findBatchById(input.batchId);
    if (!batch || batch.institutionId !== profile.id) {
      throw new ValidationError('Batch does not belong to your institution');
    }

    // Verify student profile exists
    const student = await this.repository.findStudentProfileById(input.studentId);
    if (!student) {
      throw new NotFoundError('Student profile not found');
    }

    // Verify verified affiliation
    const affiliation = await StudentInstitutionAffiliation.findOne({
      where: {
        studentId: input.studentId,
        institutionId: profile.id,
        status: 'VERIFIED',
      },
    });

    if (!affiliation) {
      throw new ValidationError(
        'Student must have a VERIFIED institutional affiliation before academic enrollment'
      );
    }

    // Check duplicate enrollment in this batch
    const existingInBatch = await this.repository.findEnrollmentByBatchAndStudent(
      input.batchId,
      input.studentId
    );
    if (existingInBatch) {
      throw new ConflictError('Student is already enrolled in this batch');
    }

    // If marked current, deactivate other current enrollments for this student
    if (input.isCurrent) {
      await this.repository.updateEnrollment(
        input.studentId,
        { isCurrent: false }
      );
    }

    const enrollment = await this.repository.createEnrollment({
      ...input,
      institutionId: profile.id,
      departmentId: batch.departmentId,
      programId: batch.programId,
    });

    return enrollment.toJSON();
  }

  public async updateEnrollment(
    userId: number,
    enrollmentId: number,
    input: UpdateStudentAcademicEnrollmentInput
  ) {
    const profile = await this.resolveProfileOrThrow(userId);
    const enrollment = await this.repository.findEnrollmentById(enrollmentId);

    if (!enrollment || enrollment.institutionId !== profile.id) {
      throw new NotFoundError('Academic enrollment not found');
    }

    if (input.batchId && input.batchId !== enrollment.batchId) {
      const batch = await this.repository.findBatchById(input.batchId);
      if (!batch || batch.institutionId !== profile.id) {
        throw new ValidationError('Target batch does not belong to your institution');
      }
    }

    await this.repository.updateEnrollment(enrollmentId, input);
    const updated = await this.repository.findEnrollmentById(enrollmentId);
    return updated!.toJSON();
  }

  public async deleteEnrollment(userId: number, enrollmentId: number) {
    const profile = await this.resolveProfileOrThrow(userId);
    const enrollment = await this.repository.findEnrollmentById(enrollmentId);

    if (!enrollment || enrollment.institutionId !== profile.id) {
      throw new NotFoundError('Academic enrollment not found');
    }

    await this.repository.deleteEnrollment(enrollmentId);
    return { message: 'Academic enrollment deleted successfully' };
  }

  public async getStudentAcademicContext(studentUserId: number) {
    const student = await StudentProfile.findOne({ where: { userId: studentUserId } });
    if (!student) {
      throw new NotFoundError('Student profile not found');
    }

    const activeEnrollment = await this.repository.findStudentActiveEnrollment(student.id);
    const affiliations = await StudentInstitutionAffiliation.findAll({
      where: { studentId: student.id },
      include: ['institution', 'department'],
    });

    return {
      studentId: student.id,
      activeEnrollment: activeEnrollment ? activeEnrollment.toJSON() : null,
      affiliations: affiliations.map((a) => a.toJSON()),
    };
  }

  // ----------------------------------------------------
  // 3. Placement Operations
  // ----------------------------------------------------
  public async getPlacements(userId: number, query: InstitutionQueryInput) {
    const profile = await this.resolveProfileOrThrow(userId);
    const offset = (query.page - 1) * query.limit;

    const { rows, count } = await this.repository.findPlacements(profile.id, query.limit, offset);

    return {
      placements: rows,
      pagination: {
        total: count,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(count / query.limit),
      },
    };
  }

  public async getPlacementById(userId: number, placementId: number) {
    const profile = await this.resolveProfileOrThrow(userId);
    const placement = await this.repository.findPlacementById(placementId);

    if (!placement || placement.institutionId !== profile.id) {
      throw new NotFoundError('Placement data not found');
    }

    return placement.toJSON();
  }

  public async createPlacement(userId: number, input: CreatePlacementInput) {
    const profile = await this.resolveProfileOrThrow(userId);

    const existing = await this.repository.findPlacementByYear(profile.id, input.academicYear);
    if (existing) {
      throw new ConflictError(`Placement report for academic year '${input.academicYear}' already exists`);
    }

    if (input.placedStudents > input.totalStudents) {
      throw new ValidationError('Placed students cannot exceed total students');
    }

    const placement = await this.repository.createPlacement({
      ...input,
      institutionId: profile.id,
      higherStudiesStudents: input.higherStudiesStudents || 0,
      entrepreneurshipStudents: input.entrepreneurshipStudents || 0,
    });

    appEvents.emitSafe(AppEventType.PLACEMENT_CHANGED, {
      placementId: placement.id,
      actorUserId: userId,
      actionType: 'CREATE',
    });

    return placement.toJSON();
  }

  public async updatePlacement(userId: number, placementId: number, input: UpdatePlacementInput) {
    const profile = await this.resolveProfileOrThrow(userId);
    const placement = await this.repository.findPlacementById(placementId);

    if (!placement || placement.institutionId !== profile.id) {
      throw new NotFoundError('Placement data not found');
    }

    if (input.academicYear && input.academicYear !== placement.academicYear) {
      const existing = await this.repository.findPlacementByYear(profile.id, input.academicYear);
      if (existing) {
        throw new ConflictError(`Placement report for academic year '${input.academicYear}' already exists`);
      }
    }

    const total = input.totalStudents !== undefined ? input.totalStudents : placement.totalStudents;
    const placed = input.placedStudents !== undefined ? input.placedStudents : placement.placedStudents;
    if (placed > total) {
      throw new ValidationError('Placed students cannot exceed total students');
    }

    await this.repository.updatePlacement(placementId, input);
    const updated = await this.repository.findPlacementById(placementId);
    return updated!.toJSON();
  }

  public async deletePlacement(userId: number, placementId: number) {
    const profile = await this.resolveProfileOrThrow(userId);
    const placement = await this.repository.findPlacementById(placementId);

    if (!placement || placement.institutionId !== profile.id) {
      throw new NotFoundError('Placement data not found');
    }

    await this.repository.deletePlacement(placementId);
    return { message: 'Placement report deleted successfully' };
  }

  // ----------------------------------------------------
  // 4. Placement Record Operations
  // ----------------------------------------------------
  public async getPlacementRecords(userId: number, placementId: number, query: InstitutionQueryInput) {
    const profile = await this.resolveProfileOrThrow(userId);
    const placement = await this.repository.findPlacementById(placementId);

    if (!placement || placement.institutionId !== profile.id) {
      throw new NotFoundError('Placement data not found');
    }

    const offset = (query.page - 1) * query.limit;
    const { rows, count } = await this.repository.findPlacementRecords(placementId, query.limit, offset);

    return {
      records: rows,
      pagination: {
        total: count,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(count / query.limit),
      },
    };
  }

  public async getPlacementRecordById(userId: number, recordId: number) {
    const profile = await this.resolveProfileOrThrow(userId);
    const record = await this.repository.findPlacementRecordById(recordId);

    if (!record || (record as any).placement?.institutionId !== profile.id) {
      throw new NotFoundError('Placement record not found');
    }

    return record.toJSON();
  }

  public async createPlacementRecord(
    userId: number,
    placementId: number,
    input: CreatePlacementRecordInput
  ) {
    const profile = await this.resolveProfileOrThrow(userId);
    const placement = await this.repository.findPlacementById(placementId);

    if (!placement || placement.institutionId !== profile.id) {
      throw new NotFoundError('Placement data not found');
    }

    if (input.studentId) {
      const student = await this.repository.findStudentProfileById(input.studentId);
      if (!student) {
        throw new NotFoundError('Referenced student profile not found');
      }
    }

    const record = await this.repository.createPlacementRecord({
      ...input,
      placementId,
      offerDate: input.offerDate ? input.offerDate : null,
    });

    const created = await this.repository.findPlacementRecordById(record.id);
    return created!.toJSON();
  }

  public async updatePlacementRecord(
    userId: number,
    recordId: number,
    input: UpdatePlacementRecordInput
  ) {
    const profile = await this.resolveProfileOrThrow(userId);
    const record = await this.repository.findPlacementRecordById(recordId);

    if (!record || (record as any).placement?.institutionId !== profile.id) {
      throw new NotFoundError('Placement record not found');
    }

    if (input.studentId) {
      const student = await this.repository.findStudentProfileById(input.studentId);
      if (!student) {
        throw new NotFoundError('Referenced student profile not found');
      }
    }

    await this.repository.updatePlacementRecord(recordId, {
      ...input,
      offerDate: input.offerDate ? input.offerDate : null,
    });

    const updated = await this.repository.findPlacementRecordById(recordId);
    return updated!.toJSON();
  }

  public async deletePlacementRecord(userId: number, recordId: number) {
    const profile = await this.resolveProfileOrThrow(userId);
    const record = await this.repository.findPlacementRecordById(recordId);

    if (!record || (record as any).placement?.institutionId !== profile.id) {
      throw new NotFoundError('Placement record not found');
    }

    await this.repository.deletePlacementRecord(recordId);
    return { message: 'Placement record deleted successfully' };
  }
}

export const institutionService = new InstitutionService();
