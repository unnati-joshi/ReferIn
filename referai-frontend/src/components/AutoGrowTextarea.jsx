import { useEffect, useRef } from "react";

// Textarea that grows with its content between a min and max height, then
// scrolls. Makes pasting and editing long text (e.g. job descriptions) comfortable.
const AutoGrowTextarea = ({
  value,
  onChange,
  className = "",
  minHeight = 160,
  maxHeight = 560,
  ...props
}) => {
  const ref = useRef(null);

  const resize = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(Math.max(el.scrollHeight, minHeight), maxHeight)}px`;
  };

  useEffect(resize, [value, minHeight, maxHeight]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      onInput={resize}
      style={{ minHeight, maxHeight, overflowY: "auto", resize: "none" }}
      className={className}
      {...props}
    />
  );
};

export default AutoGrowTextarea;
