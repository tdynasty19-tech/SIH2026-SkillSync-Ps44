import { mentorshipRepository, MentorshipRepository } from '../repositories/mentorship.repository';
import { studentRepository, StudentRepository } from '../repositories/student.repository';
import {
  CreateMentorProfileInput,
  UpdateMentorProfileInput,
  CreateMentorshipRequestInput,
  RespondMentorshipRequestInput,
  CreateMentorshipSessionInput,
  UpdateMentorshipSessionInput,
} from '../validators/mentorship.validator';
import { MentorshipStatus } from '../constants/enums';
import {
  NotFoundError,
  ConflictError,
  AuthorizationError,
  ValidationError,
} from '../errors/app.error';
import { sequelize } from '../config/database';
import { appEvents, AppEventType } from '../events';

export class MentorshipService {
  constructor(
    private readonly repository: MentorshipRepository = mentorshipRepository,
    private readonly studentRepo: StudentRepository = studentRepository
  ) {}

  // ----------------------------------------------------
  // 1. Mentor Profile Operations
  // ----------------------------------------------------
  public async getMyProfile(userId: number) {
    const mentor = await this.repository.findMentorByUserId(userId);
    if (!mentor) {
      throw new NotFoundError('Mentor profile not found');
    }
    return mentor.toJSON();
  }

  public async createProfile(userId: number, input: CreateMentorProfileInput) {
    const existing = await this.repository.findMentorByUserId(userId);
    if (existing) {
      throw new ConflictError('Mentor profile already exists for this user');
    }

    const mentor = await this.repository.createMentor({
      userId,
      expertiseAreas: input.expertiseAreas,
      maxMentees: input.maxMentees || 5,
      currentMentees: 0,
      isAvailable: input.isAvailable !== undefined ? input.isAvailable : true,
    });

    return mentor.toJSON();
  }

  public async updateMyProfile(userId: number, input: UpdateMentorProfileInput) {
    const mentor = await this.repository.findMentorByUserId(userId);
    if (!mentor) {
      throw new NotFoundError('Mentor profile not found');
    }

    const updates: any = {};
    if (input.expertiseAreas) updates.expertiseAreas = input.expertiseAreas;
    if (input.maxMentees !== undefined) updates.maxMentees = input.maxMentees;
    if (input.isAvailable !== undefined) updates.isAvailable = input.isAvailable;

    await this.repository.updateMentor(mentor.id, updates);
    const updated = await this.repository.findMentorById(mentor.id);
    return updated!.toJSON();
  }

  public async getMentors(params: {
    page: number;
    limit: number;
    expertise?: string;
    availableOnly?: boolean;
  }) {
    const offset = (params.page - 1) * params.limit;
    const { rows, count } = await this.repository.findMentors({
      limit: params.limit,
      offset,
      expertise: params.expertise,
      availableOnly: params.availableOnly,
    });

    return {
      mentors: rows,
      pagination: {
        total: count,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(count / params.limit),
      },
    };
  }

  public async getMentorById(id: number) {
    const mentor = await this.repository.findMentorById(id);
    if (!mentor) {
      throw new NotFoundError('Mentor not found');
    }
    return mentor.toJSON();
  }

  // ----------------------------------------------------
  // 2. Mentorship Request Operations
  // ----------------------------------------------------
  public async createRequest(studentUserId: number, input: CreateMentorshipRequestInput) {
    const student = await this.studentRepo.findProfileByUserId(studentUserId);
    if (!student) {
      throw new NotFoundError('Student profile not found. Please create your student profile first.');
    }

    const mentor = await this.repository.findMentorById(input.mentorId);
    if (!mentor) {
      throw new NotFoundError('Mentor not found');
    }

    // Prevent self-mentorship
    if (mentor.userId === studentUserId) {
      throw new ValidationError('You cannot request mentorship from yourself');
    }

    // Availability & capacity check
    if (!mentor.isAvailable) {
      throw new ConflictError('This mentor is currently not available for new mentees');
    }
    if (mentor.currentMentees >= mentor.maxMentees) {
      throw new ConflictError('This mentor has reached their maximum mentee capacity');
    }

    // Prevent duplicate active requests
    const active = await this.repository.findActiveRequest(student.id, mentor.id);
    if (active) {
      throw new ConflictError('You already have an active or pending mentorship request with this mentor');
    }

    const request = await this.repository.createRequest({
      studentId: student.id,
      mentorId: mentor.id,
      goals: input.goals,
      message: input.message || null,
      status: MentorshipStatus.REQUESTED,
    });

    return request.toJSON();
  }

  public async getMyRequests(userId: number, isMentor: boolean, query: { page: number; limit: number; status?: MentorshipStatus }) {
    const offset = (query.page - 1) * query.limit;

    if (isMentor) {
      const mentor = await this.repository.findMentorByUserId(userId);
      if (!mentor) {
        throw new NotFoundError('Mentor profile not found');
      }
      const { rows, count } = await this.repository.findRequestsByMentorId(mentor.id, query.limit, offset, query.status);
      return {
        requests: rows,
        pagination: {
          total: count,
          page: query.page,
          limit: query.limit,
          totalPages: Math.ceil(count / query.limit),
        },
      };
    } else {
      const student = await this.studentRepo.findProfileByUserId(userId);
      if (!student) {
        throw new NotFoundError('Student profile not found');
      }
      const { rows, count } = await this.repository.findRequestsByStudentId(student.id, query.limit, offset, query.status);
      return {
        requests: rows,
        pagination: {
          total: count,
          page: query.page,
          limit: query.limit,
          totalPages: Math.ceil(count / query.limit),
        },
      };
    }
  }

  public async getRequestById(userId: number, requestId: number) {
    const request = await this.repository.findRequestById(requestId);
    if (!request) {
      throw new NotFoundError('Mentorship request not found');
    }

    const isStudentOwner = (request as any).student?.userId === userId;
    const isMentorOwner = (request as any).mentor?.userId === userId;

    if (!isStudentOwner && !isMentorOwner) {
      throw new AuthorizationError('You do not have permission to view this mentorship request');
    }

    return request.toJSON();
  }

  public async respondToRequest(mentorUserId: number, requestId: number, input: RespondMentorshipRequestInput) {
    const request = await this.repository.findRequestById(requestId);
    if (!request) {
      throw new NotFoundError('Mentorship request not found');
    }

    if ((request as any).mentor?.userId !== mentorUserId) {
      throw new AuthorizationError('Only the assigned mentor can respond to this mentorship request');
    }

    // Status transition rules
    if (request.status === MentorshipStatus.REJECTED || request.status === MentorshipStatus.COMPLETED) {
      throw new ConflictError(`Cannot modify a request with status '${request.status}'`);
    }

    const result = await sequelize.transaction(async (transaction) => {
      const mentor = await this.repository.findMentorById(request.mentorId);

      if (input.status === MentorshipStatus.ACCEPTED && request.status !== MentorshipStatus.ACCEPTED) {
        if (mentor && mentor.currentMentees >= mentor.maxMentees) {
          throw new ConflictError('You have reached your maximum mentee capacity');
        }
        if (mentor) {
          await this.repository.updateMentor(mentor.id, { currentMentees: mentor.currentMentees + 1 }, transaction);
        }
      } else if (input.status === MentorshipStatus.COMPLETED && request.status === MentorshipStatus.ACCEPTED) {
        if (mentor && mentor.currentMentees > 0) {
          await this.repository.updateMentor(mentor.id, { currentMentees: mentor.currentMentees - 1 }, transaction);
        }
      }

      await this.repository.updateRequest(
        requestId,
        {
          status: input.status,
          respondedAt: new Date(),
        },
        transaction
      );

      const updated = await this.repository.findRequestById(requestId, transaction);
      return updated!.toJSON();
    });

    if (input.status === MentorshipStatus.ACCEPTED) {
      const studentUserId = (result as any).student?.userId;
      const mentorUser = (result as any).mentor?.user;
      const mentorName = mentorUser ? `${mentorUser.firstName} ${mentorUser.lastName}` : 'your mentor';
      if (studentUserId) {
        appEvents.emitSafe(AppEventType.MENTORSHIP_ACCEPTED, {
          studentUserId,
          mentorName,
          mentorshipRequestId: requestId,
        });
      }
    }

    return result;
  }

  // ----------------------------------------------------
  // 3. Mentorship Session Operations
  // ----------------------------------------------------
  public async createSession(userId: number, input: CreateMentorshipSessionInput) {
    const request = await this.repository.findRequestById(input.mentorshipRequestId);
    if (!request) {
      throw new NotFoundError('Mentorship request not found');
    }

    if (request.status !== MentorshipStatus.ACCEPTED) {
      throw new ValidationError('Sessions can only be created for accepted mentorship requests');
    }

    const isStudentOwner = (request as any).student?.userId === userId;
    const isMentorOwner = (request as any).mentor?.userId === userId;

    if (!isStudentOwner && !isMentorOwner) {
      throw new AuthorizationError('You do not have permission to schedule sessions for this mentorship');
    }

    const session = await this.repository.createSession({
      mentorshipRequestId: input.mentorshipRequestId,
      sessionDate: input.sessionDate,
      startTime: input.startTime,
      durationMinutes: input.durationMinutes || 45,
      meetingLink: input.meetingLink || null,
      notes: input.notes || null,
      isCompleted: false,
    });

    return session.toJSON();
  }

  public async getSessionById(userId: number, sessionId: number) {
    const session = await this.repository.findSessionById(sessionId);
    if (!session) {
      throw new NotFoundError('Mentorship session not found');
    }

    const reqData = (session as any).request;
    const isStudentOwner = reqData?.student?.userId === userId;
    const isMentorOwner = reqData?.mentor?.userId === userId;

    if (!isStudentOwner && !isMentorOwner) {
      throw new AuthorizationError('You do not have permission to access this mentorship session');
    }

    return session.toJSON();
  }

  public async getSessions(userId: number, requestId: number, query: { page: number; limit: number; completed?: boolean }) {
    const request = await this.repository.findRequestById(requestId);
    if (!request) {
      throw new NotFoundError('Mentorship request not found');
    }

    const isStudentOwner = (request as any).student?.userId === userId;
    const isMentorOwner = (request as any).mentor?.userId === userId;

    if (!isStudentOwner && !isMentorOwner) {
      throw new AuthorizationError('You do not have permission to access sessions for this mentorship');
    }

    const offset = (query.page - 1) * query.limit;
    const { rows, count } = await this.repository.findSessionsByRequestId(requestId, query.limit, offset, query.completed);

    return {
      sessions: rows,
      pagination: {
        total: count,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(count / query.limit),
      },
    };
  }

  public async updateSession(userId: number, sessionId: number, input: UpdateMentorshipSessionInput) {
    const session = await this.repository.findSessionById(sessionId);
    if (!session) {
      throw new NotFoundError('Mentorship session not found');
    }

    const reqData = (session as any).request;
    const isStudentOwner = reqData?.student?.userId === userId;
    const isMentorOwner = reqData?.mentor?.userId === userId;

    if (!isStudentOwner && !isMentorOwner) {
      throw new AuthorizationError('You do not have permission to modify this mentorship session');
    }

    const updates: any = {};
    if (input.sessionDate) updates.sessionDate = input.sessionDate;
    if (input.startTime) updates.startTime = input.startTime;
    if (input.durationMinutes !== undefined) updates.durationMinutes = input.durationMinutes;
    if (input.meetingLink !== undefined) updates.meetingLink = input.meetingLink;
    if (input.notes !== undefined) updates.notes = input.notes;
    if (input.isCompleted !== undefined) updates.isCompleted = input.isCompleted;

    await this.repository.updateSession(sessionId, updates);
    const updated = await this.repository.findSessionById(sessionId);
    return updated!.toJSON();
  }
}

export const mentorshipService = new MentorshipService();
