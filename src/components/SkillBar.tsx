import {motion} from 'motion/react';

interface SkillBarProps {
  skill: string;
  level: number; // 1 to 10
  key?: string | number;
}

export default function SkillBar({skill, level}: SkillBarProps) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-semibold">
        <span>{skill}</span>
        <span>{level}/10</span>
      </div>
      <div className="h-1 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${level * 10}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-1 bg-accent-teal rounded-full"
        />
      </div>
    </div>
  );
}
