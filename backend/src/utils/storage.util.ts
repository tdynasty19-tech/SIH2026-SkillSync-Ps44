import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { env } from '../config/env.config';
import { FileUploadError } from '../errors/app.error';
import { logger } from './logger';

export interface UploadedFilePayload {
  buffer?: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

export interface StoredFileResult {
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSizeBytes: number;
}

export interface IStorageProvider {
  upload(file: UploadedFilePayload): Promise<StoredFileResult>;
  delete(fileUrl: string): Promise<void>;
  getAccessibleUrl(fileUrl: string): Promise<string>;
}

/**
 * Local File System Storage Provider
 */
export class LocalStorageProvider implements IStorageProvider {
  private readonly uploadDir: string;

  constructor() {
    this.uploadDir = path.resolve(process.cwd(), 'uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  private static readonly ALLOWED_EXTENSIONS = new Set([
    '.pdf',
    '.doc',
    '.docx',
    '.txt',
    '.png',
    '.jpg',
    '.jpeg',
    '.webp',
  ]);

  private static readonly ALLOWED_MIME_TYPES = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/png',
    'image/jpeg',
    'image/webp',
  ]);

  private static readonly MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

  public async upload(file: UploadedFilePayload): Promise<StoredFileResult> {
    try {
      if (!file || !file.originalname) {
        throw new FileUploadError('Invalid file: filename is required');
      }

      // Check maximum file size
      if (file.size > LocalStorageProvider.MAX_FILE_SIZE_BYTES) {
        throw new FileUploadError('File size exceeds maximum allowed limit of 10MB');
      }

      const rawExt = path.extname(file.originalname).toLowerCase();
      if (!LocalStorageProvider.ALLOWED_EXTENSIONS.has(rawExt)) {
        throw new FileUploadError(`File type / extension ${rawExt} is not allowed`);
      }

      if (file.mimetype && !LocalStorageProvider.ALLOWED_MIME_TYPES.has(file.mimetype.toLowerCase())) {
        throw new FileUploadError(`MIME type ${file.mimetype} is not allowed`);
      }

      // Sanitize base filename and prevent path traversal
      const safeExt = rawExt;
      const safeName = `${crypto.randomUUID()}${safeExt}`;
      const filePath = path.join(this.uploadDir, safeName);

      // Verify resolved path remains inside uploadDir (Path traversal defense)
      if (!filePath.startsWith(this.uploadDir)) {
        throw new FileUploadError('Path traversal detected');
      }

      if (file.buffer) {
        await fs.promises.writeFile(filePath, file.buffer);
      }

      const fileUrl = `/uploads/${safeName}`;

      return {
        fileName: path.basename(file.originalname),
        fileUrl,
        fileType: file.mimetype,
        fileSizeBytes: file.size,
      };
    } catch (err: any) {
      if (err instanceof FileUploadError) {
        throw err;
      }
      logger.error('Failed to upload file to local storage', { error: err.message });
      throw new FileUploadError(`Storage upload failed: ${err.message}`);
    }
  }

  public async delete(fileUrl: string): Promise<void> {
    try {
      if (!fileUrl || fileUrl.includes('..') || fileUrl.includes('\\')) {
        throw new FileUploadError('Invalid file key: Path traversal attempt detected');
      }
      const fileName = path.basename(fileUrl);
      const filePath = path.join(this.uploadDir, fileName);

      if (!filePath.startsWith(this.uploadDir)) {
        throw new FileUploadError('Path traversal detected');
      }

      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    } catch (err: any) {
      logger.error('Failed to delete file from local storage', { error: err.message, fileUrl });
      // Non-fatal, log and continue
    }
  }

  public async getAccessibleUrl(fileUrl: string): Promise<string> {
    if (!fileUrl || fileUrl.includes('..') || fileUrl.includes('\\')) {
      throw new FileUploadError('Invalid file key: Path traversal attempt detected');
    }
    return fileUrl;
  }
}

/**
 * Storage Service Factory
 */
export class StorageService {
  private provider: IStorageProvider;

  constructor() {
    // Configured based on env.STORAGE_PROVIDER (default: 'local')
    this.provider = new LocalStorageProvider();
  }

  public async upload(file: UploadedFilePayload): Promise<StoredFileResult> {
    return this.provider.upload(file);
  }

  public async delete(fileUrl: string): Promise<void> {
    return this.provider.delete(fileUrl);
  }

  public async getAccessibleUrl(fileUrl: string): Promise<string> {
    return this.provider.getAccessibleUrl(fileUrl);
  }
}

export const storageService = new StorageService();
