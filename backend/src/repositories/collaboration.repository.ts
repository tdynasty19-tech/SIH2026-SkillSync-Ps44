import { Op, Transaction } from 'sequelize';
import '../models';
import {
  Collaboration,
  CollaborationAttributes,
  CollaborationCreationAttributes,
} from '../models/collaboration.model';
import {
  Workshop,
  WorkshopAttributes,
  WorkshopCreationAttributes,
} from '../models/workshop.model';
import {
  GuestLecture,
  GuestLectureAttributes,
  GuestLectureCreationAttributes,
} from '../models/guest-lecture.model';
import {
  IndustrialTraining,
  IndustrialTrainingAttributes,
  IndustrialTrainingCreationAttributes,
} from '../models/industrial-training.model';
import {
  LiveProject,
  LiveProjectAttributes,
  LiveProjectCreationAttributes,
} from '../models/live-project.model';
import { InstitutionProfile } from '../models/institution-profile.model';
import { IndustryProfile } from '../models/industry-profile.model';
import { CollaborationStatus, CollaborationType } from '../constants/enums';

export class CollaborationRepository {
  // ----------------------------------------------------
  // 1. Collaboration Operations
  // ----------------------------------------------------
  public async findCollaborations(
    filter: {
      institutionId?: number;
      industryId?: number;
      status?: CollaborationStatus;
      collaborationType?: CollaborationType;
      search?: string;
    },
    limit = 20,
    offset = 0
  ) {
    const where: any = {};
    if (filter.institutionId) where.institutionId = filter.institutionId;
    if (filter.industryId) where.industryId = filter.industryId;
    if (filter.status) where.status = filter.status;
    if (filter.collaborationType) where.collaborationType = filter.collaborationType;
    if (filter.search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${filter.search}%` } },
        { description: { [Op.like]: `%${filter.search}%` } },
      ];
    }

    return Collaboration.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: InstitutionProfile,
          as: 'institution',
          attributes: ['id', 'institutionName', 'institutionType', 'city', 'state'],
        },
        {
          model: IndustryProfile,
          as: 'industry',
          attributes: ['id', 'companyName', 'industryType', 'city', 'state'],
        },
      ],
    });
  }

  public async findCollaborationById(id: number) {
    return Collaboration.findByPk(id, {
      include: [
        {
          model: InstitutionProfile,
          as: 'institution',
          attributes: ['id', 'institutionName', 'institutionType', 'city', 'state'],
        },
        {
          model: IndustryProfile,
          as: 'industry',
          attributes: ['id', 'companyName', 'industryType', 'city', 'state'],
        },
        { model: Workshop, as: 'workshops' },
        { model: GuestLecture, as: 'guestLectures' },
        { model: IndustrialTraining, as: 'industrialTrainings' },
        { model: LiveProject, as: 'liveProjects' },
      ],
    });
  }

  public async createCollaboration(
    data: CollaborationCreationAttributes,
    transaction?: Transaction
  ) {
    return Collaboration.create(data, { transaction });
  }

  public async updateCollaboration(
    id: number,
    data: Partial<CollaborationAttributes>,
    transaction?: Transaction
  ) {
    return Collaboration.update(data, { where: { id }, transaction });
  }

  public async deleteCollaboration(id: number, transaction?: Transaction) {
    return Collaboration.destroy({ where: { id }, transaction });
  }

  // ----------------------------------------------------
  // 2. Sub-Event Operations: Workshop
  // ----------------------------------------------------
  public async createWorkshop(data: WorkshopCreationAttributes, transaction?: Transaction) {
    return Workshop.create(data, { transaction });
  }

  public async getWorkshopById(id: number) {
    return Workshop.findByPk(id);
  }

  public async updateWorkshop(id: number, data: Partial<WorkshopAttributes>, transaction?: Transaction) {
    return Workshop.update(data, { where: { id }, transaction });
  }

  public async deleteWorkshop(id: number, transaction?: Transaction) {
    return Workshop.destroy({ where: { id }, transaction });
  }

  // ----------------------------------------------------
  // 3. Sub-Event Operations: GuestLecture
  // ----------------------------------------------------
  public async createGuestLecture(data: GuestLectureCreationAttributes, transaction?: Transaction) {
    return GuestLecture.create(data, { transaction });
  }

  public async getGuestLectureById(id: number) {
    return GuestLecture.findByPk(id);
  }

  public async updateGuestLecture(id: number, data: Partial<GuestLectureAttributes>, transaction?: Transaction) {
    return GuestLecture.update(data, { where: { id }, transaction });
  }

  public async deleteGuestLecture(id: number, transaction?: Transaction) {
    return GuestLecture.destroy({ where: { id }, transaction });
  }

  // ----------------------------------------------------
  // 4. Sub-Event Operations: IndustrialTraining
  // ----------------------------------------------------
  public async createIndustrialTraining(data: IndustrialTrainingCreationAttributes, transaction?: Transaction) {
    return IndustrialTraining.create(data, { transaction });
  }

  public async getIndustrialTrainingById(id: number) {
    return IndustrialTraining.findByPk(id);
  }

  public async updateIndustrialTraining(id: number, data: Partial<IndustrialTrainingAttributes>, transaction?: Transaction) {
    return IndustrialTraining.update(data, { where: { id }, transaction });
  }

  public async deleteIndustrialTraining(id: number, transaction?: Transaction) {
    return IndustrialTraining.destroy({ where: { id }, transaction });
  }

  // ----------------------------------------------------
  // 5. Sub-Event Operations: LiveProject
  // ----------------------------------------------------
  public async createLiveProject(data: LiveProjectCreationAttributes, transaction?: Transaction) {
    return LiveProject.create(data, { transaction });
  }

  public async getLiveProjectById(id: number) {
    return LiveProject.findByPk(id);
  }

  public async updateLiveProject(id: number, data: Partial<LiveProjectAttributes>, transaction?: Transaction) {
    return LiveProject.update(data, { where: { id }, transaction });
  }

  public async deleteLiveProject(id: number, transaction?: Transaction) {
    return LiveProject.destroy({ where: { id }, transaction });
  }

  // ----------------------------------------------------
  // 6. Organization Profile Lookups
  // ----------------------------------------------------
  public async findInstitutionProfileById(id: number) {
    return InstitutionProfile.findByPk(id);
  }

  public async findIndustryProfileById(id: number) {
    return IndustryProfile.findByPk(id);
  }

  public async findInstitutionProfileByUserId(userId: number) {
    return InstitutionProfile.findOne({ where: { userId } });
  }

  public async findIndustryProfileByUserId(userId: number) {
    return IndustryProfile.findOne({ where: { userId } });
  }
}

export const collaborationRepository = new CollaborationRepository();
