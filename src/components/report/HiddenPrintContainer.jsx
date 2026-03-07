import React from "react";

const HiddenPrintContainer = React.forwardRef(({ children }, ref) => {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        left: "-100000px",
        top: 0,
        width: "210mm",
        zIndex: -1,
        background: "#ffffff",
      }}
    >
      <div ref={ref}>{children}</div>
    </div>
  );
});

HiddenPrintContainer.displayName = "HiddenPrintContainer";

export default HiddenPrintContainer;