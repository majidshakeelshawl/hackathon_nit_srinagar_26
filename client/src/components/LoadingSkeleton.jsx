export default function LoadingSkeleton({ lines = 3, height = 16 }) {
  const widths = ['100%', '75%', '50%', '85%', '60%'];
  
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{
            height: `${height}px`,
            width: widths[i % widths.length],
          }}
        />
      ))}
    </div>
  );
}
