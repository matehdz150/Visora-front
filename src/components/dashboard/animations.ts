import type { Transition, Variants } from "framer-motion";

export const dashboardTransition: Transition = {
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1],
};

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 14, scale: 0.992 },
  animate: { opacity: 1, y: 0, scale: 1, transition: dashboardTransition },
  exit: { opacity: 0, y: -8, scale: 0.996, transition: { duration: 0.16, ease: "easeOut" } },
};

export const sidebarVariants: Variants = {
  initial: { opacity: 0, x: -18 },
  animate: { opacity: 1, x: 0, transition: { ...dashboardTransition, delay: 0.04 } },
};

export const drawerBackdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.18 } },
  exit: { opacity: 0, transition: { duration: 0.14 } },
};

export const drawerVariants: Variants = {
  initial: { opacity: 0, x: 36 },
  animate: { opacity: 1, x: 0, transition: dashboardTransition },
  exit: { opacity: 0, x: 28, transition: { duration: 0.16, ease: "easeOut" } },
};

export const loadingVariants: Variants = {
  initial: { opacity: 0, scale: 0.985 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.99, transition: { duration: 0.2, ease: "easeOut" } },
};
