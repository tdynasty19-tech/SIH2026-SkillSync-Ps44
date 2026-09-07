import { Response, NextFunction } from 'express';
import { institutionService, InstitutionService } from '../services/institution.service';
import { AuthenticatedRequest } from '../types/auth.types';
import { sendSuccess } from '../utils/api-response';
import { HttpStatus } from '../constants/http-status';
import {
  createInstitutionProfileSchema,
  updateInstitutionProfileSchema,
  createInstitutionDepartmentSchema,
  updateInstitutionDepartmentSchema,
  createAcademicProgramSchema,
  updateAcademicProgramSchema,
  academicProgramQuerySchema,
  createAcademicBatchSchema,
  updateAcademicBatchSchema,
  academicBatchQuerySchema,
  createStudentAcademicEnrollmentSchema,
  updateStudentAcademicEnrollmentSchema,
  studentAcademicEnrollmentQuerySchema,
  createPlacementSchema,
  updatePlacementSchema,
  createPlacementRecordSchema,
  updatePlacementRecordSchema,
  institutionQuerySchema,
} from '../validators/institution.validator';

export class InstitutionController {
  constructor(private readonly service: InstitutionService = institutionService) {}

  // ----------------------------------------------------
  // Profile Handlers
  // ----------------------------------------------------
  public getMyProfile = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.service.getMyProfile(req.user!.id);
      sendSuccess(res, 'Institution profile fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getInstitutionById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const institutionId = Number(req.params.institutionId);
      const result = await this.service.getInstitutionById(institutionId);
      sendSuccess(res, 'Institution profile fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public createMyProfile = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validated = createInstitutionProfileSchema.parse(req.body);
      const result = await this.service.createMyProfile(req.user!.id, validated);
      sendSuccess(res, 'Institution profile created successfully', result, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  };

  public updateMyProfile = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validated = updateInstitutionProfileSchema.parse(req.body);
      const result = await this.service.updateMyProfile(req.user!.id, validated);
      sendSuccess(res, 'Institution profile updated successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  // ----------------------------------------------------
  // Department Handlers
  // ----------------------------------------------------
  public getDepartments = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query = institutionQuerySchema.parse(req.query);
      const result = await this.service.getDepartments(req.user!.id, query);
      sendSuccess(res, 'Departments fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getDepartmentById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const departmentId = Number(req.params.departmentId);
      const result = await this.service.getDepartmentById(req.user!.id, departmentId);
      sendSuccess(res, 'Department fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public createDepartment = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validated = createInstitutionDepartmentSchema.parse(req.body);
      const result = await this.service.createDepartment(req.user!.id, validated);
      sendSuccess(res, 'Department created successfully', result, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  };

  public updateDepartment = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const departmentId = Number(req.params.departmentId);
      const validated = updateInstitutionDepartmentSchema.parse(req.body);
      const result = await this.service.updateDepartment(req.user!.id, departmentId, validated);
      sendSuccess(res, 'Department updated successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public deleteDepartment = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const departmentId = Number(req.params.departmentId);
      const result = await this.service.deleteDepartment(req.user!.id, departmentId);
      sendSuccess(res, result.message, result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  // ----------------------------------------------------
  // Academic Program Handlers
  // ----------------------------------------------------
  public getPrograms = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query = academicProgramQuerySchema.parse(req.query);
      const result = await this.service.getPrograms(req.user!.id, query);
      sendSuccess(res, 'Academic programs fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getProgramById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const programId = Number(req.params.programId);
      const result = await this.service.getProgramById(req.user!.id, programId);
      sendSuccess(res, 'Academic program fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public createProgram = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validated = createAcademicProgramSchema.parse(req.body);
      const result = await this.service.createProgram(req.user!.id, validated);
      sendSuccess(res, 'Academic program created successfully', result, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  };

  public updateProgram = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const programId = Number(req.params.programId);
      const validated = updateAcademicProgramSchema.parse(req.body);
      const result = await this.service.updateProgram(req.user!.id, programId, validated);
      sendSuccess(res, 'Academic program updated successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public deleteProgram = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const programId = Number(req.params.programId);
      const result = await this.service.deleteProgram(req.user!.id, programId);
      sendSuccess(res, result.message, result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getDepartmentPrograms = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const institutionId = Number(req.params.institutionId);
      const departmentId = Number(req.params.departmentId);
      const result = await this.service.getDepartmentPrograms(institutionId, departmentId);
      sendSuccess(res, 'Department academic programs fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  // ----------------------------------------------------
  // Academic Batch Handlers
  // ----------------------------------------------------
  public getBatches = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query = academicBatchQuerySchema.parse(req.query);
      const result = await this.service.getBatches(req.user!.id, query);
      sendSuccess(res, 'Academic batches fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getBatchById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const batchId = Number(req.params.batchId);
      const result = await this.service.getBatchById(req.user!.id, batchId);
      sendSuccess(res, 'Academic batch fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public createBatch = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validated = createAcademicBatchSchema.parse(req.body);
      const result = await this.service.createBatch(req.user!.id, validated);
      sendSuccess(res, 'Academic batch created successfully', result, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  };

  public updateBatch = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const batchId = Number(req.params.batchId);
      const validated = updateAcademicBatchSchema.parse(req.body);
      const result = await this.service.updateBatch(req.user!.id, batchId, validated);
      sendSuccess(res, 'Academic batch updated successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public deleteBatch = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const batchId = Number(req.params.batchId);
      const result = await this.service.deleteBatch(req.user!.id, batchId);
      sendSuccess(res, result.message, result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getProgramBatches = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const institutionId = Number(req.params.institutionId);
      const programId = Number(req.params.programId);
      const result = await this.service.getProgramBatches(institutionId, programId);
      sendSuccess(res, 'Program academic batches fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  // ----------------------------------------------------
  // Student Academic Enrollment Handlers
  // ----------------------------------------------------
  public getEnrollments = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query = studentAcademicEnrollmentQuerySchema.parse(req.query);
      const result = await this.service.getEnrollments(req.user!.id, query);
      sendSuccess(res, 'Academic enrollments fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getEnrollmentById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const enrollmentId = Number(req.params.enrollmentId);
      const result = await this.service.getEnrollmentById(req.user!.id, enrollmentId);
      sendSuccess(res, 'Academic enrollment fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public createEnrollment = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validated = createStudentAcademicEnrollmentSchema.parse(req.body);
      const result = await this.service.createEnrollment(req.user!.id, validated);
      sendSuccess(res, 'Academic enrollment created successfully', result, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  };

  public updateEnrollment = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const enrollmentId = Number(req.params.enrollmentId);
      const validated = updateStudentAcademicEnrollmentSchema.parse(req.body);
      const result = await this.service.updateEnrollment(req.user!.id, enrollmentId, validated);
      sendSuccess(res, 'Academic enrollment updated successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public deleteEnrollment = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const enrollmentId = Number(req.params.enrollmentId);
      const result = await this.service.deleteEnrollment(req.user!.id, enrollmentId);
      sendSuccess(res, result.message, result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getMyAcademicContext = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.service.getStudentAcademicContext(req.user!.id);
      sendSuccess(res, 'Student academic context fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  // ----------------------------------------------------
  // Placement Handlers
  // ----------------------------------------------------
  public getPlacements = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query = institutionQuerySchema.parse(req.query);
      const result = await this.service.getPlacements(req.user!.id, query);
      sendSuccess(res, 'Placements fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getPlacementById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const placementId = Number(req.params.placementId);
      const result = await this.service.getPlacementById(req.user!.id, placementId);
      sendSuccess(res, 'Placement report fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public createPlacement = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validated = createPlacementSchema.parse(req.body);
      const result = await this.service.createPlacement(req.user!.id, validated);
      sendSuccess(res, 'Placement report created successfully', result, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  };

  public updatePlacement = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const placementId = Number(req.params.placementId);
      const validated = updatePlacementSchema.parse(req.body);
      const result = await this.service.updatePlacement(req.user!.id, placementId, validated);
      sendSuccess(res, 'Placement report updated successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public deletePlacement = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const placementId = Number(req.params.placementId);
      const result = await this.service.deletePlacement(req.user!.id, placementId);
      sendSuccess(res, result.message, result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  // ----------------------------------------------------
  // Placement Record Handlers
  // ----------------------------------------------------
  public getPlacementRecords = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const placementId = Number(req.params.placementId);
      const query = institutionQuerySchema.parse(req.query);
      const result = await this.service.getPlacementRecords(req.user!.id, placementId, query);
      sendSuccess(res, 'Placement records fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getPlacementRecordById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const recordId = Number(req.params.recordId);
      const result = await this.service.getPlacementRecordById(req.user!.id, recordId);
      sendSuccess(res, 'Placement record fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public createPlacementRecord = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const placementId = Number(req.params.placementId);
      const validated = createPlacementRecordSchema.parse(req.body);
      const result = await this.service.createPlacementRecord(req.user!.id, placementId, validated);
      sendSuccess(res, 'Placement record created successfully', result, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  };

  public updatePlacementRecord = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const recordId = Number(req.params.recordId);
      const validated = updatePlacementRecordSchema.parse(req.body);
      const result = await this.service.updatePlacementRecord(req.user!.id, recordId, validated);
      sendSuccess(res, 'Placement record updated successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public deletePlacementRecord = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const recordId = Number(req.params.recordId);
      const result = await this.service.deletePlacementRecord(req.user!.id, recordId);
      sendSuccess(res, result.message, result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };
}

export const institutionController = new InstitutionController();
