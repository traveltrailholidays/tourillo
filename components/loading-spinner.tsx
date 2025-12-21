const LoadingSpinner = ({ className = 'h-5 w-5 text-gray-600' }) => (
  <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
    <path
      d="M22 12a10 10 0 0 1-10 10"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      className="opacity-75"
    />
  </svg>
);

export default LoadingSpinner;
