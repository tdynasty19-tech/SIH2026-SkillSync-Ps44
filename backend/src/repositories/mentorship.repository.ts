import { Op, Transaction } from 'sequelize';
import '../models';
import {
  Mentor,
  MentorAttributes,
  MentorCreationAttributes,
} from '../models/mentor.model';
import {
  MentorshipRequest,
  MentorshipRequestAttributes,
  MentorshipRequestCreationAttributes,
} from '../models/mentorship-request.model';
import {
  MentorshipSession,
  MentorshipSessionAttributes,
  MentorshipSessionCreationAttributes,
} from '../models/mentorship-session.model';
import { User } from '../models/user.model';
import { StudentProfile } from '../models/student-profile.model';
import { MentorshipStatus } from '../constants/enums';

export class MentorshipRepository {
  // ----------------------------------------------------
  // 1. Mentors
  // ----------------------------------------------------
  public async findMentorByUserId(userId: number): Promise<Mentor | null> {
    return Mentor.findOne({
      where: { userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'avatarUrl'],
        },
      ],
    });
  }

  public async findMentorById(id: number): Promise<Mentor | null> {
    return Mentor.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'avatarUrl'],
        },
      ],
    });
  }

  public async findMentors(params: {
    limit: number;
    offset: number;
    expertise?: string;
    availableOnly?: boolean;
  }) {
    const where: any = {};
    if (params.expertise) {
      where.expertiseAreas = { [Op.like]: `%${params.expertise}%` };
    }
    if (params.availableOnly) {
      where.isAvailable = true;
    }

    return Mentor.findAndCountAll({
      where,
      limit: params.limit,
      offset: params.offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'avatarUrl'],
        },
      ],
    });
  }

  public async createMentor(data: MentorCreationAttributes, transaction?: Transaction): Promise<Mentor> {
    return Mentor.create(data, { transaction });
  }

  public async updateMentor(
    id: number,
    data: Partial<MentorAttributes>,
    transaction?: Transaction
  ): Promise<[number]> {
    return Mentor.update(data, {
      where: { id },
      transaction,
    });
  }

  // ----------------------------------------------------
  // 2. Mentorship Requests
  // ----------------------------------------------------
  public async findRequestById(id: number, transaction?: Transaction): Promise<MentorshipRequest | null> {
    return MentorshipRequest.findByPk(id, {
      transaction,
      include: [
        {
          model: Mentor,
          as: 'mentor',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'email', 'avatarUrl'],
            },
          ],
        },
        {
          model: StudentProfile,
          as: 'student',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'email', 'avatarUrl'],
            },
          ],
        },
      ],
    });
  }

  public async findActiveRequest(studentId: number, mentorId: number): Promise<MentorshipRequest | null> {
    return MentorshipRequest.findOne({
      where: {
        studentId,
        mentorId,
        status: {
          [Op.in]: [MentorshipStatus.REQUESTED, MentorshipStatus.ACCEPTED],
        },
      },
    });
  }

  public async findRequestsByStudentId(
    studentId: number,
    limit: number,
    offset: number,
    status?: MentorshipStatus
  ) {
    const where: any = { studentId };
    if (status) {
      where.status = status;
    }

    return MentorshipRequest.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Mentor,
          as: 'mentor',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'email', 'avatarUrl'],
            },
          ],
        },
      ],
    });
  }

  public async findRequestsByMentorId(
    mentorId: number,
    limit: number,
    offset: number,
    status?: MentorshipStatus
  ) {
    const where: any = { mentorId };
    if (status) {
      where.status = status;
    }

    return MentorshipRequest.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: StudentProfile,
          as: 'student',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'email', 'avatarUrl'],
            },
          ],
        },
      ],
    });
  }

  public async createRequest(
    data: MentorshipRequestCreationAttributes,
    transaction?: Transaction
  ): Promise<MentorshipRequest> {
    return MentorshipRequest.create(data, { transaction });
  }

  public async updateRequest(
    id: number,
    data: Partial<MentorshipRequestAttributes>,
    transaction?: Transaction
  ): Promise<[number]> {
    return MentorshipRequest.update(data, {
      where: { id },
      transaction,
    });
  }

  // ----------------------------------------------------
  // 3. Mentorship Sessions
  // ----------------------------------------------------
  public async findSessionById(id: number): Promise<MentorshipSession | null> {
    return MentorshipSession.findByPk(id, {
      include: [
        {
          model: MentorshipRequest,
          as: 'request',
          include: [
            {
              model: Mentor,
              as: 'mentor',
            },
            {
              model: StudentProfile,
              as: 'student',
            },
          ],
        },
      ],
    });
  }

  public async findSessionsByRequestId(
    mentorshipRequestId: number,
    limit: number,
    offset: number,
    completed?: boolean
  ) {
    const where: any = { mentorshipRequestId };
    if (completed !== undefined) {
      where.isCompleted = completed;
    }

    return MentorshipSession.findAndCountAll({
      where,
      limit,
      offset,
      order: [['sessionDate', 'DESC'], ['startTime', 'DESC']],
    });
  }

  public async createSession(
    data: MentorshipSessionCreationAttributes,
    transaction?: Transaction
  ): Promise<MentorshipSession> {
    return MentorshipSession.create(data, { transaction });
  }

  public async updateSession(
    id: number,
    data: Partial<MentorshipSessionAttributes>,
    transaction?: Transaction
  ): Promise<[number]> {
    return MentorshipSession.update(data, {
      where: { id },
      transaction,
    });
  }
}

export const mentorshipRepository = new MentorshipRepository();
