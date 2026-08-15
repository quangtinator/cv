import { useEffect, useRef, useState } from "react";
import "./vertical-timeline.css";

/**
 * Stand-in for `react-vertical-timeline-component` (React 19 safe).
 * Supports the props v1 actually used: lineColor, date, icon, iconStyle,
 * contentStyle, contentArrowStyle and the alternating two-column layout.
 */
export function VerticalTimeline({ children, lineColor = "#FFF", className = "" }) {
  return (
    <div
      className={`vertical-timeline vertical-timeline--two-columns ${className}`.trim()}
      style={{ "--vt-line-color": lineColor }}
    >
      {children}
    </div>
  );
}

export function VerticalTimelineElement({
  children,
  className = "",
  date,
  icon,
  iconStyle,
  contentStyle,
  contentArrowStyle,
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(node);
    // Safety net: never leave the entry stranded at opacity 0 if the
    // observer never reports back.
    const fallback = setTimeout(() => setVisible(true), 2500);
    return () => {
      clearTimeout(fallback);
      io.disconnect();
    };
  }, []);

  // An element with no body is used purely as an end-cap marker (the star).
  const hasContent = Boolean(children || date);

  return (
    <div
      ref={ref}
      className={`vertical-timeline-element ${className} ${
        hasContent ? "" : "vertical-timeline-element--marker"
      } ${visible ? "is-visible" : ""}`.trim()}
    >
      <span className="vertical-timeline-element-icon" style={iconStyle}>
        {icon}
      </span>
      {hasContent && (
        <div className="vertical-timeline-element-content" style={contentStyle}>
          <div
            className="vertical-timeline-element-content-arrow"
            style={contentArrowStyle}
          />
          {children}
          {date && <span className="vertical-timeline-element-date">{date}</span>}
        </div>
      )}
    </div>
  );
}
