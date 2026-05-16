/** Fixes mobile dialogs broken by default center translate (-50%) on full-screen layouts. */
export const mobileFullscreenDialog =
  "z-[101] gap-0 overflow-y-auto overflow-x-hidden [&>button.absolute]:hidden " +
  "fixed inset-0 left-0 top-0 h-[100dvh] max-h-[100dvh] w-full max-w-none translate-x-0 translate-y-0 rounded-none border-0 " +
  "data-[state=open]:zoom-in-100 data-[state=closed]:zoom-out-100 " +
  "data-[state=open]:slide-in-from-bottom-2 data-[state=closed]:slide-out-to-bottom-2 " +
  "sm:inset-auto sm:left-1/2 sm:top-1/2 sm:h-auto sm:max-h-[90vh] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-lg sm:border " +
  "sm:data-[state=open]:slide-in-from-left-1/2 sm:data-[state=open]:slide-in-from-top-[48%] sm:data-[state=closed]:slide-out-to-left-1/2 sm:data-[state=closed]:slide-out-to-top-[48%] sm:data-[state=open]:zoom-in-95 sm:data-[state=closed]:zoom-out-95";
