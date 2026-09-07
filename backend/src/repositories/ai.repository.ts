import '../models';
import { AIAnalysis, AIAnalysisCreationAttributes } from '../models/ai-analysis.model';

export class AIRepository {
  public async createAnalysis(data: AIAnalysisCreationAttributes): Promise<AIAnalysis> {
    return AIAnalysis.create(data);
  }

  public async findAnalysesByUser(
    userId: number,
    analysisType?: string,
    limit = 20
  ): Promise<AIAnalysis[]> {
    const where: any = { userId };
    if (analysisType) {
      where.analysisType = analysisType;
    }

    return AIAnalysis.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
    });
  }

  public async findAnalysisById(id: number): Promise<AIAnalysis | null> {
    return AIAnalysis.findByPk(id);
  }
}

export const aiRepository = new AIRepository();
