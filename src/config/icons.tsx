/** Custom Om SVG icon for Mantras — exported for use in menu.config */
export const OmIcon: React.ComponentType<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M8.5 6C8.5 6 6 6.5 6 9.5C6 12.5 8 13 8 13C8 13 5 14 5 17C5 19 6.5 20 8.5 20C10.5 20 12 18.5 12 18.5" />
    <path d="M12 13C12 13 15 12.5 15 9.5C15 7 12.5 6 12 6" />
    <path d="M12 6C12 6 14.5 6 15.5 4" />
    <path d="M15 17C15 17 19 16.5 19 12" />
    <path d="M8 18.5C8 18.5 10 22 15 20.5" />
    <circle cx="18" cy="5" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);
