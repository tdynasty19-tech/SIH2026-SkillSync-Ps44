import { Request, Response, NextFunction } from 'express';
import { searchService, SearchService } from '../services/search.service';
import { globalSearchQuerySchema } from '../validators/search.validator';
import { sendSuccess } from '../utils/api-response';
import { HttpStatus } from '../constants/http-status';

export class SearchController {
  constructor(private readonly service: SearchService = searchService) {}

  public search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedQuery = globalSearchQuerySchema.parse(req.query);
      const data = await this.service.search(validatedQuery);
      sendSuccess(res, 'Search completed successfully', data, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };
}

export const searchController = new SearchController();
