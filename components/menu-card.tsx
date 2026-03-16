import { AnimatePresence, motion } from "motion/react";
import React from "react";
import * as styles from "../styles/menu-card.css";

interface Props {
  children: React.ReactNode;
  className?: string;
  contentKey: string;
  frameRef?: React.Ref<HTMLDivElement>;
}

const CARD_TRANSITION = {
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1] as const,
};
const CONTENT_TRANSITION = {
  duration: 0.22,
  ease: [0.22, 1, 0.36, 1] as const,
};

export default function MenuCard(props: Props) {
  const { children, className, contentKey, frameRef } = props;

  return (
    <motion.div
      className={className ? `${styles.frame} ${className}` : styles.frame}
      ref={frameRef}
      layout
      layoutDependency={contentKey}
      transition={CARD_TRANSITION}
    >
      <motion.div className={styles.inner} layout transition={CARD_TRANSITION}>
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={contentKey}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={styles.body}
            exit={{ opacity: 0, scale: 0.985, y: -10 }}
            initial={{ opacity: 0, scale: 0.985, y: 14 }}
            layout
            transition={CONTENT_TRANSITION}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
