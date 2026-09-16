"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import { LabButton } from "./LabUi";
import { useManagedTimers } from "./useManagedTimers";

export function ActBridge({
  lines,
  onDone,
}: {
  lines: readonly string[];
  onDone: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const { schedule } = useManagedTimers();
  const onDoneRef = useRef(onDone);
  const done = useRef(false);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    onDoneRef.current();
  };

  useEffect(() => {
    if (reduceMotion) return;
    schedule(() => {
      if (done.current) return;
      done.current = true;
      onDoneRef.current();
    }, 1700);
  }, [reduceMotion, schedule]);

  return (
    <div className="flex min-h-[42vh] flex-col justify-center">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex max-w-lg flex-col gap-3"
      >
        {lines.map((line) => (
          <p key={line} className="text-[17px] leading-snug text-zinc-100">
            {line}
          </p>
        ))}
        <div className="mt-6">
          <LabButton onClick={finish}>Continuar</LabButton>
        </div>
      </motion.div>
    </div>
  );
}
