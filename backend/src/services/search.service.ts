import { searchRepository, SearchRepository } from '../repositories/search.repository';
import {
  GlobalSearchQuery,
  SearchCategory,
  SearchResponseData,
  SearchResultItem,
} from '../validators/search.validator';

export class SearchService {
  constructor(private readonly repository: SearchRepository = searchRepository) {}

  public async search(query: GlobalSearchQuery): Promise<SearchResponseData> {
    const q = query.q.trim();
    const type = query.type;
    const page = query.page;
    const limit = query.limit;
    const offset = (page - 1) * limit;

    // 1. Single Category Search
    if (type) {
      const { rows, count } = await this.searchSingleCategory(type, q, limit, offset);
      return {
        query: q,
        type,
        results: rows,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit) || 1,
        },
      };
    }

    // 2. All Categories Search (Unified Multi-Category)
    // Fetch a bounded sample from each category deterministically and merge
    const perCategoryLimit = Math.max(5, Math.ceil(limit / 3));
    const [
      jobs,
      internships,
      projects,
      learningPrograms,
      mentors,
      skills,
      careerRoles,
      companies,
      institutions,
    ] = await Promise.all([
      this.repository.searchJobs(q, perCategoryLimit, 0),
      this.repository.searchInternships(q, perCategoryLimit, 0),
      this.repository.searchProjects(q, perCategoryLimit, 0),
      this.repository.searchLearningPrograms(q, perCategoryLimit, 0),
      this.repository.searchMentors(q, perCategoryLimit, 0),
      this.repository.searchSkills(q, perCategoryLimit, 0),
      this.repository.searchCareerRoles(q, perCategoryLimit, 0),
      this.repository.searchCompanies(q, perCategoryLimit, 0),
      this.repository.searchInstitutions(q, perCategoryLimit, 0),
    ]);

    const totalCount =
      jobs.count +
      internships.count +
      projects.count +
      learningPrograms.count +
      mentors.count +
      skills.count +
      careerRoles.count +
      companies.count +
      institutions.count;

    // Combine all category results
    const combined: SearchResultItem[] = [
      ...jobs.rows,
      ...internships.rows,
      ...projects.rows,
      ...learningPrograms.rows,
      ...mentors.rows,
      ...skills.rows,
      ...careerRoles.rows,
      ...companies.rows,
      ...institutions.rows,
    ];

    // Apply deterministic ranking:
    // 1. Exact title match (case-insensitive)
    // 2. Title starts with query
    // 3. Title contains query
    // 4. Stable tie-breaker by type then id
    const lowerQuery = q.toLowerCase();
    combined.sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();

      const aExact = aTitle === lowerQuery;
      const bExact = bTitle === lowerQuery;
      if (aExact !== bExact) return aExact ? -1 : 1;

      const aStarts = aTitle.startsWith(lowerQuery);
      const bStarts = bTitle.startsWith(lowerQuery);
      if (aStarts !== bStarts) return aStarts ? -1 : 1;

      // Stable secondary tie-breaker
      if (a.type !== b.type) return a.type.localeCompare(b.type);
      return a.id - b.id;
    });

    // Apply paginated slice over the combined ranked results
    const paginatedResults = combined.slice(offset, offset + limit);

    return {
      query: q,
      type: 'all',
      results: paginatedResults,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
    };
  }

  private async searchSingleCategory(
    type: SearchCategory,
    query: string,
    limit: number,
    offset: number
  ): Promise<{ rows: SearchResultItem[]; count: number }> {
    switch (type) {
      case SearchCategory.JOBS:
        return this.repository.searchJobs(query, limit, offset);
      case SearchCategory.INTERNSHIPS:
        return this.repository.searchInternships(query, limit, offset);
      case SearchCategory.PROJECTS:
        return this.repository.searchProjects(query, limit, offset);
      case SearchCategory.LEARNING_PROGRAMS:
        return this.repository.searchLearningPrograms(query, limit, offset);
      case SearchCategory.MENTORS:
        return this.repository.searchMentors(query, limit, offset);
      case SearchCategory.SKILLS:
        return this.repository.searchSkills(query, limit, offset);
      case SearchCategory.CAREER_ROLES:
        return this.repository.searchCareerRoles(query, limit, offset);
      case SearchCategory.COMPANIES:
        return this.repository.searchCompanies(query, limit, offset);
      case SearchCategory.INSTITUTIONS:
        return this.repository.searchInstitutions(query, limit, offset);
      default:
        return { rows: [], count: 0 };
    }
  }
}

export const searchService = new SearchService();
