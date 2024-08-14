export default function AnimatedArrowSpacer({
  isAnimating,
}: { isAnimating: boolean }) {
  return (
    <div className="arrow-spacer my-4">
      <style>
        {`
          @keyframes lightUpOrange {
            0% {
              opacity: 0.2;
              box-shadow: none;
              border-color: #f5f5f5;
            }
            50% {
              opacity: 1;
              box-shadow: 0 0 10px #df5822, 0 0 20px #f09226;
              border-color: #f09226;
            }
            100% {
              opacity: 0.2;
              box-shadow: none;
              border-color: #f5f5f5;
            }
          }

          .card-spacer {
            border-top: 1px solid #f5f5f5;
            transition: border-color 0.3s ease;
          }

          .animate-spacer {
            animation: lightUpOrange 1s ease-in-out infinite;
          }
        `}
      </style>
      {[100, 80, 60, 40, 20, 10, 5, 1].map((width, index) => (
        <div
          key={width}
          className={`card-spacer mt-1 ${isAnimating ? "animate-spacer" : ""}`}
          style={{
            width: `${width}%`,
            margin: "0 auto",
            animationDelay: `${index * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}
