import { sequelize } from '../config/database';
import { industryRepository, IndustryRepository } from '../repositories/industry.repository';
import {
  CreateIndustryProfileInput,
  UpdateIndustryProfileInput,
  CreateIndustryContactInput,
  UpdateIndustryContactInput,
  IndustryContactQueryInput,
} from '../validators/industry.validator';
import { NotFoundError, ConflictError, AuthorizationError } from '../errors/app.error';

export class IndustryService {
  constructor(private readonly repository: IndustryRepository = industryRepository) {}

  // ----------------------------------------------------
  // Helpers
  // ----------------------------------------------------
  private async resolveProfileOrThrow(userId: number) {
    const profile = await this.repository.findProfileByUserId(userId);
    if (!profile) {
      throw new NotFoundError('Industry profile not found. Please complete your industry profile first.');
    }
    return profile;
  }

  // ----------------------------------------------------
  // Profile Operations
  // ----------------------------------------------------
  public async getMyProfile(userId: number) {
    const profile = await this.repository.findProfileByUserId(userId, {
      includeUser: true,
      includeContacts: true,
    });

    if (!profile) {
      throw new NotFoundError('Industry profile not found. Please complete your industry profile first.');
    }

    return profile.toJSON();
  }

  public async createMyProfile(userId: number, input: CreateIndustryProfileInput) {
    const existing = await this.repository.findProfileByUserId(userId);
    if (existing) {
      throw new ConflictError('Industry profile already exists for this account');
    }

    const profile = await this.repository.createProfile({
      ...input,
      userId,
      verified: false,
    });

    return profile.toJSON();
  }

  public async updateMyProfile(userId: number, input: UpdateIndustryProfileInput) {
    const profile = await this.resolveProfileOrThrow(userId);

    await this.repository.updateProfile(profile.id, input);
    const updated = await this.repository.findProfileById(profile.id);
    return updated!.toJSON();
  }

  // ----------------------------------------------------
  // Contact Operations
  // ----------------------------------------------------
  public async getContacts(userId: number, query: IndustryContactQueryInput) {
    const profile = await this.resolveProfileOrThrow(userId);
    const offset = (query.page - 1) * query.limit;

    const { rows, count } = await this.repository.findContactsByIndustryId(
      profile.id,
      query,
      query.limit,
      offset
    );

    return {
      contacts: rows,
      pagination: {
        total: count,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(count / query.limit),
      },
    };
  }

  public async getContactById(userId: number, contactId: number) {
    const profile = await this.resolveProfileOrThrow(userId);
    const contact = await this.repository.findContactById(contactId);

    // IDOR Protection: contact must exist and belong to authenticated user's industry profile
    if (!contact || contact.industryId !== profile.id) {
      throw new NotFoundError('Industry contact not found');
    }

    return contact.toJSON();
  }

  public async createContact(userId: number, input: CreateIndustryContactInput) {
    const profile = await this.resolveProfileOrThrow(userId);

    if (input.isPrimary) {
      return await sequelize.transaction(async (t) => {
        await this.repository.clearPrimaryContacts(profile.id, undefined, t);
        const contact = await this.repository.createContact(
          {
            ...input,
            industryId: profile.id,
          },
          t
        );
        return contact.toJSON();
      });
    }

    const contact = await this.repository.createContact({
      ...input,
      industryId: profile.id,
    });

    return contact.toJSON();
  }

  public async updateContact(userId: number, contactId: number, input: UpdateIndustryContactInput) {
    const profile = await this.resolveProfileOrThrow(userId);
    const contact = await this.repository.findContactById(contactId);

    if (!contact || contact.industryId !== profile.id) {
      throw new NotFoundError('Industry contact not found');
    }

    if (input.isPrimary) {
      return await sequelize.transaction(async (t) => {
        await this.repository.clearPrimaryContacts(profile.id, contactId, t);
        await this.repository.updateContact(contactId, input, t);
        const updated = await this.repository.findContactById(contactId);
        return updated!.toJSON();
      });
    }

    await this.repository.updateContact(contactId, input);
    const updated = await this.repository.findContactById(contactId);
    return updated!.toJSON();
  }

  public async deleteContact(userId: number, contactId: number) {
    const profile = await this.resolveProfileOrThrow(userId);
    const contact = await this.repository.findContactById(contactId);

    if (!contact || contact.industryId !== profile.id) {
      throw new NotFoundError('Industry contact not found');
    }

    await this.repository.deleteContact(contactId);
    return { message: 'Industry contact deleted successfully' };
  }
}

export const industryService = new IndustryService();
