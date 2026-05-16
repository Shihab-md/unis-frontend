import React, { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa";

const GoToTopButton = () => {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleGoToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!showButton) return null;

  return (
    <button
      type="button"
      onClick={handleGoToTop}
      className="
        fixed bottom-5 right-4 z-50
        flex items-center justify-center
        size-12 md:size-16
        rounded-full
        border-2 border-white
        bg-pink-700 text-white
        shadow-[0_10px_30px_rgba(15,23,42,0.55)]
        ring-4 ring-white/60
        hover:bg-pink-700
        hover:-translate-y-0.5
        active:scale-95
        transition-all duration-200
      "
      title="Go to top"
      aria-label="Go to top"
    >
      <FaArrowUp className="text-xl md:text-3xl" />
    </button>
  );
};

export default GoToTopButton;