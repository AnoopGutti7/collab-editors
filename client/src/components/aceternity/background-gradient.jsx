import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'

const MotionDiv = motion.div

export function BackgroundGradient({ children, className, containerClassName }) {
  return (
    <div className={cn('relative rounded-[22px] p-px', containerClassName)}>
      <MotionDiv
        aria-hidden="true"
        className="absolute inset-0 rounded-[22px] bg-[radial-gradient(circle_farthest-side_at_0_100%,#00ccb1,transparent),radial-gradient(circle_farthest-side_at_100%_0,#7b61ff,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#ffc414,transparent),radial-gradient(circle_farthest-side_at_0_0,#ff5f6d,#141316)] opacity-70 blur-sm"
        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />
      <div className={cn('relative rounded-[21px] bg-background', className)}>{children}</div>
    </div>
  )
}
