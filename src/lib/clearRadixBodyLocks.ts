export function clearRadixBodyLocks() {
  const releaseLocks = () => {
    const hasOpenModal =
      document.querySelector('[role="dialog"][data-state="open"]') ||
      document.querySelector('[role="menu"][data-state="open"]');

    if (hasOpenModal) {
      return;
    }

    [document.documentElement, document.body].forEach((element) => {
      if (element.style.overflow === 'hidden') {
        element.style.overflow = '';
      }

      if (element.style.pointerEvents === 'none') {
        element.style.pointerEvents = '';
      }
    });

    document.body.style.removeProperty('padding-right');
    document.body.removeAttribute('data-scroll-locked');
  };

  [0, 100, 350, 700].forEach((delay) => window.setTimeout(releaseLocks, delay));
}
