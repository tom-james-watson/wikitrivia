import { AnimatePresence, motion } from "motion/react";
import React from "react";
import Button from "./button";
import * as styles from "../styles/quit-game-modal.css";

interface Props {
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
}

export default function QuitGameModal(props: Props) {
  const { onCancel, onConfirm, open } = props;

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
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onClick={onCancel}
          role="dialog"
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={styles.modal}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            onClick={(event) => {
              event.stopPropagation();
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
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
