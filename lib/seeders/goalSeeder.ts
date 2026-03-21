import { Goal } from '../../types/index';
import { addMonths, addYears } from 'date-fns';

export interface GoalSeederOptions {
  userId: string;
}

interface GoalTemplate {
  name: string;
  targetAmount: number;
  monthsAhead: number;
  progressRange: [number, number]; // percentage completed
}

const GOAL_TEMPLATES: GoalTemplate[] = [
  // Short-term goals (3-6 months)
  {
    name: 'Emergency Fund',
    targetAmount: 500000,
    monthsAhead: 6,
    progressRange: [60, 90],
  },
  {
    name: 'Vacation to Europe',
    targetAmount: 300000,
    monthsAhead: 6,
    progressRange: [20, 40],
  },
  {
    name: 'New Laptop Purchase',
    targetAmount: 150000,
    monthsAhead: 3,
    progressRange: [50, 80],
  },

  // Medium-term goals (12-24 months)
  {
    name: 'House Down Payment',
    targetAmount: 2500000,
    monthsAhead: 18,
    progressRange: [25, 50],
  },
  {
    name: 'Car Purchase',
    targetAmount: 1000000,
    monthsAhead: 12,
    progressRange: [30, 60],
  },
  {
    name: 'Wedding Fund',
    targetAmount: 1500000,
    monthsAhead: 24,
    progressRange: [10, 35],
  },
  {
    name: 'Professional Certification',
    targetAmount: 200000,
    monthsAhead: 9,
    progressRange: [40, 70],
  },

  // Long-term goals (3-5 years)
  {
    name: 'Retirement Fund',
    targetAmount: 5000000,
    monthsAhead: 60,
    progressRange: [20, 40],
  },
  {
    name: "Children's Education",
    targetAmount: 2000000,
    monthsAhead: 60,
    progressRange: [15, 35],
  },
  {
    name: 'Dream Vacation',
    targetAmount: 500000,
    monthsAhead: 36,
    progressRange: [25, 50],
  },
];

export function generateGoals(options: GoalSeederOptions): Goal[] {
  const { userId } = options;
  const goals: Goal[] = [];
  let goalId = 1;

  // Select 5-8 random goals from templates
  const goalsToCreate = Math.floor(Math.random() * 4) + 5; // 5-8 goals
  const shuffledTemplates = [...GOAL_TEMPLATES].sort(() => Math.random() - 0.5);
  const selectedTemplates = shuffledTemplates.slice(0, goalsToCreate);

  selectedTemplates.forEach((template) => {
    const targetDate = addMonths(new Date(), template.monthsAhead);
    const progressPercentage =
      Math.floor(
        Math.random() * (template.progressRange[1] - template.progressRange[0])
      ) + template.progressRange[0];
    const currentAmount = Math.floor(
      template.targetAmount * (progressPercentage / 100)
    );

    goals.push({
      id: `goal_${userId}_${goalId++}`,
      userId,
      name: template.name,
      targetAmount: template.targetAmount,
      targetDate,
      currentAmount,
      createdAt: new Date(
        Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000
      ),
      updatedAt: new Date(),
    });
  });

  return goals;
}
