import { useEffect, useRef, useState } from "react";
import "./typewriter.css";

/**
 * Drop-in stand-in for the `typewriter-effect` package (React 19 safe).
 * Types each string out, pauses, deletes it, moves to the next, loops.
 */
export default function Typewriter({
  strings = [],
  typeSpeed = 80,
  deleteSpeed = 100,
  pause = 1600,
  loop = true,
}) {
  const [text, setText] = useState("");
  const phase = useRef({ index: 0, deleting: false });

  useEffect(() => {
    if (!strings.length) return;
    const { index, deleting } = phase.current;
    const full = strings[index];

    // Finished typing this string — hold it on screen, then start deleting.
    if (!deleting && text === full) {
      const t = setTimeout(() => {
        phase.current.deleting = true;
        setText(full.slice(0, -1));
      }, pause);
      return () => clearTimeout(t);
    }

    // Finished deleting — advance to the next string.
    if (deleting && text === "") {
      const last = index === strings.length - 1;
      if (last && !loop) return;
      const next = last ? 0 : index + 1;
      const t = setTimeout(() => {
        phase.current = { index: next, deleting: false };
        setText(strings[next].slice(0, 1));
      }, typeSpeed);
      return () => clearTimeout(t);
    }

    const t = setTimeout(
      () =>
        setText(
          deleting ? full.slice(0, text.length - 1) : full.slice(0, text.length + 1)
        ),
      deleting ? deleteSpeed : typeSpeed
    );
    return () => clearTimeout(t);
  }, [text, strings, typeSpeed, deleteSpeed, pause, loop]);

  return (
    <div className="Typewriter">
      <span className="Typewriter__wrapper">{text}</span>
      <span className="Typewriter__cursor" aria-hidden="true">
        |
      </span>
    </div>
  );
}
