import { SVGProps } from "react";

const Logo: React.FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="100"
    height="100"
    viewBox="0 0 100 100"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2.598 38.365c-1.435.828-1.435 2.172 0 3l14.9 8.602-14.9 8.601c-1.435.829-1.435 2.172 0 3L47.4 87.433c1.435.829 3.762.829 5.197 0L97.4 61.568c1.435-.828 1.435-2.171 0-3l-14.9-8.601 14.9-8.602c1.435-.828 1.435-2.172 0-3L52.598 12.5c-1.435-.828-3.762-.828-5.197 0L2.598 38.365zm20.096 14.601L47.4 67.23c1.435.828 3.762.828 5.197 0l24.707-14.264 12.302 7.102-39.608 22.865-39.607-22.865 12.302-7.102z"
    />
  </svg>
);

export default Logo;
