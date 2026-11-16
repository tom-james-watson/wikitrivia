import {
  AnimatePresence,
  motion,
  Transition,
  useReducedMotion,
} from "motion/react";
import React from "react";
import Button from "./button";
import * as styles from "../styles/quit-game-modal.css";

interface Props {
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
}

// The dialog arrives on a spring and settles; it leaves faster than it
// came, so dismissing it never feels like waiting.
const MODAL_ENTER_TRANSITION: Transition = {
  damping: 30,
  mass: 0.8,
  opacity: { duration: 0.14, ease: "easeOut" },
  stiffness: 420,
  type: "spring",
};

const MODAL_EXIT_TRANSITION: Transition = {
  duration: 0.14,
  ease: "easeIn",
};

export default function QuitGameModal(props: Props) {
  const { onCancel, onConfirm, open } = props;
  const reduceMotion = useReducedMotion();

  React.useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onCancel, open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          animate={{ opacity: 1 }}
          aria-labelledby="quit-game-modal-title"
          aria-modal="true"
          className={styles.overlay}
          exit={{ opacity: 0, transition: { duration: 0.14, ease: "easeIn" } }}
          initial={{ opacity: 0 }}
          onClick={onCancel}
          role="dialog"
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={styles.modal}
            exit={{
              opacity: 0,
              scale: reduceMotion ? 1 : 0.98,
              transition: MODAL_EXIT_TRANSITION,
              y: reduceMotion ? 0 : 6,
            }}
            initial={{
              opacity: 0,
              scale: reduceMotion ? 1 : 0.96,
              y: reduceMotion ? 0 : 12,
            }}
            onClick={(event) => {
              event.stopPropagation();
            }}
            transition={MODAL_ENTER_TRANSITION}
          >
            <h2 className={styles.title} id="quit-game-modal-title">
              Abandon game?
            </h2>
            <p className={styles.body}>
              You&apos;ll lose all progress in the current game.
            </p>
            <div className={styles.actions}>
              <Button fullWidth onClick={onConfirm} text="Yes" />
              <Button fullWidth minimal onClick={onCancel} text="No" />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
