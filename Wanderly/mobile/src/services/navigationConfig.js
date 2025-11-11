// Default animation settings for screen transitions
export const defaultTransition = {
  transitionSpec: {
    open: {
      animation: "timing",          // Smooth timing animation when opening
      config: { duration: 300 },    // Duration in ms
    },
    close: {
      animation: "timing",          // Same animation when closing
      config: { duration: 300 },
    },
  },
  // Controls screen appearance during transition (fade effect)
  cardStyleInterpolator: ({ current }) => ({
    cardStyle: {
      opacity: current.progress,
    },
  }),
};
