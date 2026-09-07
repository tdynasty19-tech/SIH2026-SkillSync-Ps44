import { Skill } from '../types/skill.types';

export const calculateMatchScore = (
  userSkills: Skill[],
  requiredSkills: { name: string; level: number }[]
): number => {
  if (!requiredSkills.length) return 100;

  let totalScore = 0;
  let maxPossibleScore = requiredSkills.reduce((sum, req) => sum + req.level, 0);

  requiredSkills.forEach(req => {
    const userSkill = userSkills.find(s => s.name.toLowerCase() === req.name.toLowerCase());
    if (userSkill) {
      const points = Math.min(userSkill.proficiency, req.level);
      totalScore += points;
    }
  });

  return Math.round((totalScore / maxPossibleScore) * 100);
};
