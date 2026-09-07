import { Transaction, Op } from 'sequelize';
import '../models';
import { IndustryProfile, IndustryProfileAttributes, IndustryProfileCreationAttributes } from '../models/industry-profile.model';
import { IndustryContact, IndustryContactAttributes, IndustryContactCreationAttributes } from '../models/industry-contact.model';
import { User } from '../models/user.model';
import { IndustryContactQueryInput } from '../validators/industry.validator';

export class IndustryRepository {
  // ----------------------------------------------------
  // Profile Data Access
  // ----------------------------------------------------
  public async findProfileByUserId(
    userId: number,
    options: { includeUser?: boolean; includeContacts?: boolean } = {}
  ) {
    const include: any[] = [];
    if (options.includeUser) {
      include.push({
        model: User,
        as: 'user',
        attributes: ['id', 'uuid', 'firstName', 'lastName', 'email', 'role', 'isVerified'],
      });
    }
    if (options.includeContacts) {
      include.push({
        model: IndustryContact,
        as: 'contacts',
        attributes: ['id', 'name', 'designation', 'email', 'phone', 'isPrimary', 'createdAt'],
      });
    }

    return IndustryProfile.findOne({
      where: { userId },
      include: include.length > 0 ? include : undefined,
    });
  }

  public async findProfileById(id: number) {
    return IndustryProfile.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'uuid', 'firstName', 'lastName', 'email', 'role', 'isVerified'],
        },
        {
          model: IndustryContact,
          as: 'contacts',
          attributes: ['id', 'name', 'designation', 'email', 'phone', 'isPrimary', 'createdAt'],
        },
      ],
    });
  }

  public async createProfile(data: IndustryProfileCreationAttributes, transaction?: Transaction) {
    return IndustryProfile.create(data, { transaction });
  }

  public async updateProfile(
    id: number,
    data: Partial<IndustryProfileAttributes>,
    transaction?: Transaction
  ) {
    return IndustryProfile.update(data, { where: { id }, transaction });
  }

  // ----------------------------------------------------
  // Contact Data Access
  // ----------------------------------------------------
  public async findContactsByIndustryId(
    industryId: number,
    query: IndustryContactQueryInput,
    limit = 20,
    offset = 0
  ) {
    const where: any = { industryId };
    if (query.search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${query.search}%` } },
        { designation: { [Op.like]: `%${query.search}%` } },
        { email: { [Op.like]: `%${query.search}%` } },
      ];
    }

    return IndustryContact.findAndCountAll({
      where,
      limit,
      offset,
      order: [
        ['isPrimary', 'DESC'],
        ['createdAt', 'ASC'],
      ],
    });
  }

  public async findContactById(id: number) {
    return IndustryContact.findByPk(id);
  }

  public async createContact(data: IndustryContactCreationAttributes, transaction?: Transaction) {
    return IndustryContact.create(data, { transaction });
  }

  public async updateContact(
    id: number,
    data: Partial<IndustryContactAttributes>,
    transaction?: Transaction
  ) {
    return IndustryContact.update(data, { where: { id }, transaction });
  }

  public async deleteContact(id: number, transaction?: Transaction) {
    return IndustryContact.destroy({ where: { id }, transaction });
  }

  public async clearPrimaryContacts(
    industryId: number,
    excludeContactId?: number,
    transaction?: Transaction
  ) {
    const where: any = { industryId, isPrimary: true };
    if (excludeContactId) {
      where.id = { [Op.ne]: excludeContactId };
    }
    return IndustryContact.update({ isPrimary: false }, { where, transaction });
  }
}

export const industryRepository = new IndustryRepository();
