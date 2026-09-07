import { Transaction } from 'sequelize';
import '../models';
import { User, UserAttributes, UserCreationAttributes } from '../models/user.model';
import { RefreshToken, RefreshTokenCreationAttributes } from '../models/refresh-token.model';

/**
 * AuthRepository
 * Isolates direct Sequelize model access for all authentication & user identity operations.
 */
export class AuthRepository {
  /**
   * Find a user by email
   */
  public async findUserByEmail(email: string): Promise<User | null> {
    return User.findOne({
      where: { email: email.toLowerCase().trim() },
    });
  }

  /**
   * Find a user by primary key ID
   */
  public async findUserById(id: number): Promise<User | null> {
    return User.findByPk(id);
  }

  /**
   * Find a user by public UUID
   */
  public async findUserByUuid(uuid: string): Promise<User | null> {
    return User.findOne({
      where: { uuid },
    });
  }

  /**
   * Create a new user
   */
  public async createUser(
    userData: UserCreationAttributes,
    transaction?: Transaction
  ): Promise<User> {
    return User.create(userData, { transaction });
  }

  /**
   * Update an existing user by ID
   */
  public async updateUser(
    id: number,
    data: Partial<UserAttributes>,
    transaction?: Transaction
  ): Promise<[number]> {
    return User.update(data, {
      where: { id },
      transaction,
    });
  }

  /**
   * Create a new refresh token record
   */
  public async createRefreshToken(
    tokenData: RefreshTokenCreationAttributes,
    transaction?: Transaction
  ): Promise<RefreshToken> {
    return RefreshToken.create(tokenData, { transaction });
  }

  /**
   * Find a refresh token by string
   */
  public async findRefreshToken(token: string): Promise<RefreshToken | null> {
    return RefreshToken.findOne({
      where: { token },
      include: [
        {
          model: User,
          as: 'user',
        },
      ],
    });
  }

  /**
   * Revoke a specific refresh token
   */
  public async revokeRefreshToken(
    token: string,
    transaction?: Transaction
  ): Promise<[number]> {
    return RefreshToken.update(
      { isRevoked: true },
      {
        where: { token },
        transaction,
      }
    );
  }

  /**
   * Revoke all refresh tokens belonging to a user (e.g. on password reset or full logout)
   */
  public async revokeAllUserRefreshTokens(
    userId: number,
    transaction?: Transaction
  ): Promise<[number]> {
    return RefreshToken.update(
      { isRevoked: true },
      {
        where: { userId, isRevoked: false },
        transaction,
      }
    );
  }
}

export const authRepository = new AuthRepository();
