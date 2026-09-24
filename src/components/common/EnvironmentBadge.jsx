import React from "react";
import { isStagingEnvironment } from "../../utils/frontendEnvironment";

const EnvironmentBadge = ({ className = "" }) => {
  if (!isStagingEnvironment()) return null;

  return (
    <span
      className={`inline-flex items-center rounded-full border border-amber-700/40 bg-amber-300 px-2 py-0.5 text-[9px] font-extrabold tracking-[0.12em] text-amber-950 shadow-sm md:text-[10px] ${className}`}
      title="Staging environment - test data only"
      aria-label="Staging environment - test data only"
    >
      STAGING
    </span>
  );
};

export default EnvironmentBadge;
