// Renders the user's uploaded picture, or a deterministic colored monogram.
const hueFor = (seed) =>
  [...(seed || "U")].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;

const Avatar = ({ src, name = "U", size = 40, className = "" }) => {
  const initial = (name || "U").trim()[0]?.toUpperCase() || "U";
  const style = { width: size, height: size };

  if (src) {
    return <img src={src} alt={name} className={`avatar-ring ${className}`} style={style} />;
  }

  return (
    <div
      className={`avatar-ring flex items-center justify-center font-display font-semibold text-white ${className}`}
      style={{
        ...style,
        fontSize: size * 0.42,
        background: `linear-gradient(140deg, hsl(${hueFor(name)} 55% 45%), hsl(${(hueFor(name) + 38) % 360} 60% 38%))`,
      }}
    >
      {initial}
    </div>
  );
};

export default Avatar;
