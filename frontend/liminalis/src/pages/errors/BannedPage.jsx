import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import billionMustLove from "../../assets/billionsMustLove.avif";
import billionMustSmile from "../../assets/billionsMustSmile.jpg";
import "./styles/BillionsMustLove.css";

export default function BannedPage() {
  const { t } = useTranslation();

  const [frameTick, setFrameTick] = useState(0);
  const [visualMode, setVisualMode] = useState("love");
  const [isPanicFlash, setIsPanicFlash] = useState(false);
  const [glitchIntensity, setGlitchIntensity] = useState(0);

  const ROW_COUNT = 5;
  const ITEMS_PER_ROW = 4;
  const SCROLL_WIDTH = 10000;
  const DUPLICATE_COUNT = 2;

  useEffect(() => {
    const animationId = setInterval(() => setFrameTick((t) => t + 1), 16);
    return () => clearInterval(animationId);
  }, []);

  useEffect(() => {
    const modeSwitchId = setInterval(() => {
      const randomValue = Math.random();

      setVisualMode(randomValue > 0.7 ? "smile" : "love");

      if (randomValue > 0.85) {
        setGlitchIntensity(1);
        setTimeout(() => setGlitchIntensity(0), 300);
      }
    }, 1500);

    return () => clearInterval(modeSwitchId);
  }, []);

  useEffect(() => {
    const panicFlashId = setInterval(() => {
      setIsPanicFlash(true);
      setTimeout(() => setIsPanicFlash(false), 80);
    }, 2500);

    return () => clearInterval(panicFlashId);
  }, []);

  const currentImage =
    visualMode === "love" ? billionMustLove : billionMustSmile;

  return (
    <div className={`container ${visualMode === "smile" ? "smile" : ""}`}>
      <div className="overlayNoise" />

      <div className="text">
        <h1>{visualMode === "love" ? "BANNED" : "Still Banned"}</h1>
        <p>
          {visualMode === "love"
            ? t("banned.description")
            : t("banned.description") + " UwU"}
        </p>
      </div>

      <div className="field">
        {Array.from({ length: ROW_COUNT }).map((_, rowIndex) => {
          const rowBaseY = rowIndex * 60;
          const rowPhaseOffset = rowIndex * 0.7;

          return Array.from({ length: ITEMS_PER_ROW }).map((_, itemIndex) => {
            const itemBaseX = itemIndex * 450 + rowIndex * 700;

            const scrollSpeed = visualMode === "smile" ? 0.2 : 5.8;
            const xPosition = itemBaseX - frameTick * scrollSpeed;

            const verticalWobble =
              Math.sin(frameTick * 0.03 + rowPhaseOffset + itemIndex * 0.4) *
              (visualMode === "smile" ? 6 : 10);

            const glitchOffset =
              glitchIntensity * Math.sin(frameTick * 0.2 + itemIndex) * 18;

            const yPosition = rowBaseY + verticalWobble + glitchOffset;

            const scaleFactor = 1.1 + (rowIndex % 4) * 0.15;

            const opacityLevel =
              visualMode === "smile" ? 0.12 : 0.08 + rowIndex * 0.01;

            const imageFilter =
              glitchIntensity > 0
                ? "contrast(2) saturate(3)"
                : visualMode === "smile"
                ? "contrast(1.3) saturate(1.4)"
                : "contrast(2.5) saturate(3)";

            return Array.from({ length: DUPLICATE_COUNT }).map((_, copyIndex) => (
              <img
                key={`${rowIndex}-${itemIndex}-${copyIndex}`}
                src={currentImage}
                className="unit"
                alt=""
                style={{
                  transform: `translate(${xPosition + copyIndex * SCROLL_WIDTH}px, ${yPosition}px) scale(${scaleFactor})`,
                  opacity: opacityLevel,
                  filter: imageFilter,
                }}
              />
            ));
          });
        })}

        <img src={currentImage} className="core" alt="" />
      </div>

      {isPanicFlash && (
        <div className="panic">
          {visualMode === "smile"
            ? "SMILE DRIFT"
            : "SIGNAL STABILITY WARNING"}
        </div>
      )}
    </div>
  );
}