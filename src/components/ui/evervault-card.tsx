"use client";
import { useMotionValue } from "motion/react";
import React, { useState, useEffect, useRef } from "react";
import { useMotionTemplate, motion } from "motion/react";
import { cn } from "@/lib/utils";

export const EvervaultCard = ({
  text,
  className,
}: {
  text?: string;
  className?: string;
}) => {
  let mouseX = useMotionValue(0);
  let mouseY = useMotionValue(0);

  const [randomString] = useState(generateRandomString(500000));

  return (
    <div
      className={cn(
        "p-0  bg-transparent aspect-square   flex items-center justify-center w-full max-h-screen relative",
        className
      )}
    >
      <div className="group/card  w-full relative overflow-hidden bg-transparent flex items-center justify-center h-full">
        
        <CardPattern
          mouseX={mouseX}
          mouseY={mouseY}
          randomString={randomString}
        />
        <div className="relative z-10 flex items-center justify-center">
          <div className="relative  flex-col w-full py-20 px-10 bg-white/5 dark:bg-black/20  backdrop-blur-xs   flex items-center justify-center rounded-3xl   border border-muted/30 ">
            {/* <div className="absolute w-full h-full bg-white/80 dark:bg-black/80 blur-sm rounded-5xl" /> */}
            <span className="font-raleway text-white  text-4xl lg:text-6xl font-medium  z-20">
              Join authentiq
            </span>
            <span className="font-raleway dark:text-white text-white text-lg lg:mt-4 lg:text-xl font-medium z-20">
              The future of hiring is authentic & decentralized
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export function CardPattern({ mouseX, mouseY, randomString }: any) {
  let maskImage = useMotionTemplate`radial-gradient(500px at ${mouseX}px ${mouseY}px, white, transparent)`;
  let style = { maskImage, WebkitMaskImage: maskImage };

  const [displayString, setDisplayString] = useState(randomString);
  const frameRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    const animate = (time: number) => {
      if (time - lastUpdateRef.current > 50) {
        setDisplayString((prev: string) => {
          const chars = prev.split("");
          // Randomly change ~1% of characters each frame
          const numChanges = Math.floor(chars.length * 0.01);

          for (let i = 0; i < numChanges; i++) {
            const randomIndex = Math.floor(Math.random() * chars.length);
            chars[randomIndex] = characters.charAt(
              Math.floor(Math.random() * characters.length)
            );
          }

          return chars.join("");
        });
        lastUpdateRef.current = time;
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return (
// rounded-bl-3xl rounded-tl-3xl
  <div className="pointer-events-none">
      <div className="absolute inset-0   mask-[linear-gradient(white,transparent)] group-hover/card:opacity-50"></div>
      <motion.div className="absolute inset-0  bg-linear-to-r from-temerald-500/85 to-shakespeare-700 opacity-100 backdrop-blur-xl" />
      <motion.div className="absolute inset-0  opacity-100 mix-blend-overlay">
        <p className="absolute inset-0 text-xs h-full w-full wrap-break-word whitespace-pre-wrap text-white font-mono font-bold overflow-hidden">
          {displayString}
        </p>
      </motion.div>

      <div className="absolute inset-0  bg-[radial-gradient(ellipse_at_center,transparent_0%,transparent_10%,rgba(0,0,0,0.6)_100%)]"></div>
      <div className="absolute inset-0  bg-[radial-gradient(ellipse_at_center,transparent_0%,transparent_30%,rgba(0,0,0,0.4)_100%)]"></div>
      <div className="absolute inset-0 bg-linear-90 from-background/0  dark:from-background/80 to-transparent"></div>
    </div>
  );
}

const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
export const generateRandomString = (length: number) => {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const Icon = ({ className, ...rest }: any) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className={className}
      {...rest}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
    </svg>
  );
};
