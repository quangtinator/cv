import { useEffect, useState } from "react";
import "./typewriter.css";

/**
 * Stand-in for `react-text-loop-next` — cycles through its children,
 * sliding the next one up. Keeps the inline layout of the original.
 */
export default function TextLoop({ items = [], interval = 2600 }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length < 2) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % items.length),
      interval
    );
    return () => clearInterval(id);
  }, [items, interval]);

  if (!items.length) return null;

  return (
    <span className="text-loop">
      <span className="text-loop__sizer">{items[index]}</span>
      <span className="text-loop__item" key={index}>
        {items[index]}
      </span>
    </span>
  );
}
