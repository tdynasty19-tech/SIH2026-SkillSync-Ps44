import { Transaction } from 'sequelize';
import '../models';
import {
  Portfolio,
  PortfolioAttributes,
  PortfolioCreationAttributes,
} from '../models/portfolio.model';
import {
  PortfolioProject,
  PortfolioProjectAttributes,
  PortfolioProjectCreationAttributes,
} from '../models/portfolio-project.model';
import {
  PortfolioCertification,
  PortfolioCertificationAttributes,
  PortfolioCertificationCreationAttributes,
} from '../models/portfolio-certification.model';
import {
  PortfolioAchievement,
  PortfolioAchievementAttributes,
  PortfolioAchievementCreationAttributes,
} from '../models/portfolio-achievement.model';
import {
  PortfolioExperience,
  PortfolioExperienceAttributes,
  PortfolioExperienceCreationAttributes,
} from '../models/portfolio-experience.model';
import {
  PortfolioDocument,
  PortfolioDocumentAttributes,
  PortfolioDocumentCreationAttributes,
} from '../models/portfolio-document.model';

export class PortfolioRepository {
  public async findPortfolioByStudentId(studentId: number): Promise<Portfolio | null> {
    return Portfolio.findOne({
      where: { studentId },
      include: [
        { model: PortfolioProject, as: 'projects' },
        { model: PortfolioCertification, as: 'certifications' },
        { model: PortfolioAchievement, as: 'achievements' },
        { model: PortfolioExperience, as: 'experiences' },
        { model: PortfolioDocument, as: 'documents' },
      ],
    });
  }

  public async findPortfolioById(id: number): Promise<Portfolio | null> {
    return Portfolio.findByPk(id, {
      include: [
        { model: PortfolioProject, as: 'projects' },
        { model: PortfolioCertification, as: 'certifications' },
        { model: PortfolioAchievement, as: 'achievements' },
        { model: PortfolioExperience, as: 'experiences' },
        { model: PortfolioDocument, as: 'documents' },
      ],
    });
  }

  public async createPortfolio(
    data: PortfolioCreationAttributes,
    transaction?: Transaction
  ): Promise<Portfolio> {
    return Portfolio.create(data, { transaction });
  }

  public async updatePortfolio(
    id: number,
    data: Partial<PortfolioAttributes>,
    transaction?: Transaction
  ): Promise<[number]> {
    return Portfolio.update(data, {
      where: { id },
      transaction,
    });
  }

  // ----------------------------------------------------
  // 1. Projects
  // ----------------------------------------------------
  public async getProjectsList(portfolioId: number, limit = 20, offset = 0) {
    return PortfolioProject.findAndCountAll({
      where: { portfolioId },
      limit,
      offset,
      order: [['order', 'ASC'], ['createdAt', 'DESC']],
    });
  }

  public async findProjectById(id: number, portfolioId: number) {
    return PortfolioProject.findOne({
      where: { id, portfolioId },
    });
  }

  public async createProject(data: PortfolioProjectCreationAttributes, transaction?: Transaction) {
    return PortfolioProject.create(data, { transaction });
  }

  public async updateProject(
    id: number,
    portfolioId: number,
    data: Partial<PortfolioProjectAttributes>,
    transaction?: Transaction
  ) {
    return PortfolioProject.update(data, {
      where: { id, portfolioId },
      transaction,
    });
  }

  public async deleteProject(id: number, portfolioId: number, transaction?: Transaction) {
    return PortfolioProject.destroy({
      where: { id, portfolioId },
      transaction,
    });
  }

  // ----------------------------------------------------
  // 2. Certifications
  // ----------------------------------------------------
  public async getCertificationsList(portfolioId: number, limit = 20, offset = 0) {
    return PortfolioCertification.findAndCountAll({
      where: { portfolioId },
      limit,
      offset,
      order: [['order', 'ASC'], ['createdAt', 'DESC']],
    });
  }

  public async findCertificationById(id: number, portfolioId: number) {
    return PortfolioCertification.findOne({
      where: { id, portfolioId },
    });
  }

  public async createCertification(data: PortfolioCertificationCreationAttributes, transaction?: Transaction) {
    return PortfolioCertification.create(data, { transaction });
  }

  public async updateCertification(
    id: number,
    portfolioId: number,
    data: Partial<PortfolioCertificationAttributes>,
    transaction?: Transaction
  ) {
    return PortfolioCertification.update(data, {
      where: { id, portfolioId },
      transaction,
    });
  }

  public async deleteCertification(id: number, portfolioId: number, transaction?: Transaction) {
    return PortfolioCertification.destroy({
      where: { id, portfolioId },
      transaction,
    });
  }

  // ----------------------------------------------------
  // 3. Achievements
  // ----------------------------------------------------
  public async getAchievementsList(portfolioId: number, limit = 20, offset = 0) {
    return PortfolioAchievement.findAndCountAll({
      where: { portfolioId },
      limit,
      offset,
      order: [['order', 'ASC'], ['createdAt', 'DESC']],
    });
  }

  public async findAchievementById(id: number, portfolioId: number) {
    return PortfolioAchievement.findOne({
      where: { id, portfolioId },
    });
  }

  public async createAchievement(data: PortfolioAchievementCreationAttributes, transaction?: Transaction) {
    return PortfolioAchievement.create(data, { transaction });
  }

  public async updateAchievement(
    id: number,
    portfolioId: number,
    data: Partial<PortfolioAchievementAttributes>,
    transaction?: Transaction
  ) {
    return PortfolioAchievement.update(data, {
      where: { id, portfolioId },
      transaction,
    });
  }

  public async deleteAchievement(id: number, portfolioId: number, transaction?: Transaction) {
    return PortfolioAchievement.destroy({
      where: { id, portfolioId },
      transaction,
    });
  }

  // ----------------------------------------------------
  // 4. Experiences
  // ----------------------------------------------------
  public async getExperiencesList(portfolioId: number, limit = 20, offset = 0) {
    return PortfolioExperience.findAndCountAll({
      where: { portfolioId },
      limit,
      offset,
      order: [['order', 'ASC'], ['createdAt', 'DESC']],
    });
  }

  public async findExperienceById(id: number, portfolioId: number) {
    return PortfolioExperience.findOne({
      where: { id, portfolioId },
    });
  }

  public async createExperience(data: PortfolioExperienceCreationAttributes, transaction?: Transaction) {
    return PortfolioExperience.create(data, { transaction });
  }

  public async updateExperience(
    id: number,
    portfolioId: number,
    data: Partial<PortfolioExperienceAttributes>,
    transaction?: Transaction
  ) {
    return PortfolioExperience.update(data, {
      where: { id, portfolioId },
      transaction,
    });
  }

  public async deleteExperience(id: number, portfolioId: number, transaction?: Transaction) {
    return PortfolioExperience.destroy({
      where: { id, portfolioId },
      transaction,
    });
  }

  // ----------------------------------------------------
  // 5. Documents
  // ----------------------------------------------------
  public async getDocumentsList(portfolioId: number, limit = 20, offset = 0) {
    return PortfolioDocument.findAndCountAll({
      where: { portfolioId },
      limit,
      offset,
      order: [['order', 'ASC'], ['createdAt', 'DESC']],
    });
  }

  public async findDocumentById(id: number, portfolioId: number) {
    return PortfolioDocument.findOne({
      where: { id, portfolioId },
    });
  }

  public async createDocument(data: PortfolioDocumentCreationAttributes, transaction?: Transaction) {
    return PortfolioDocument.create(data, { transaction });
  }

  public async updateDocument(
    id: number,
    portfolioId: number,
    data: Partial<PortfolioDocumentAttributes>,
    transaction?: Transaction
  ) {
    return PortfolioDocument.update(data, {
      where: { id, portfolioId },
      transaction,
    });
  }

  public async deleteDocument(id: number, portfolioId: number, transaction?: Transaction) {
    return PortfolioDocument.destroy({
      where: { id, portfolioId },
      transaction,
    });
  }
}

export const portfolioRepository = new PortfolioRepository();
