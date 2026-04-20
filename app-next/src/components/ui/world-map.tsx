"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import DottedMap from "dotted-map";

interface MapProps {
  dots?: Array<{
    start: { lat: number; lng: number; label?: string };
    end: { lat: number; lng: number; label?: string };
  }>;
  lineColor?: string;
}

export default function WorldMap({
  dots = [],
  lineColor = "#3b82f6",
}: MapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const map = new DottedMap({ height: 100, grid: "diagonal" });

  const svgMap = map.getSVG({
    radius: 0.22,
    color: "#1e293b",
    shape: "circle",
    backgroundColor: "rgb(9, 9, 11)",
  });

  const projectPoint = (lat: number, lng: number) => {
    const x = (lng + 180) * (800 / 360);
    const y = (90 - lat) * (400 / 180);
    return { x, y };
  };

  // Arco proporcional à distância: trajetos curtos (ex: Manaus→SP ~40u)
  // ganham curvatura suave (6-12u), trajetos longos (SP→Tóquio ~300u)
  // ganham arcos amplos (50-60u). Evita loops gigantes em distâncias pequenas.
  const createCurvedPath = (
    start: { x: number; y: number },
    end: { x: number; y: number }
  ) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const arcHeight = Math.max(6, Math.min(50, distance * 0.22));
    const midX = (start.x + end.x) / 2;
    const midY = Math.min(start.y, end.y) - arcHeight;
    return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
  };

  // Deduplica pontos: quando várias rotas convergem pro mesmo endpoint
  // (ex: hub central), evitamos sobrepor múltiplos dots animados.
  // Pontos com 2+ rotas apontando pra eles são marcados como "hub" e
  // ganham destaque visual (raio maior, pulse maior).
  const pointKey = (p: { lat: number; lng: number }) =>
    `${p.lat.toFixed(4)},${p.lng.toFixed(4)}`;
  const pointUsage = new Map<
    string,
    { lat: number; lng: number; count: number }
  >();
  dots.forEach((d) => {
    [d.start, d.end].forEach((p) => {
      const key = pointKey(p);
      const existing = pointUsage.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        pointUsage.set(key, { lat: p.lat, lng: p.lng, count: 1 });
      }
    });
  });
  const uniquePoints = Array.from(pointUsage.values());

  return (
    <div className="w-full aspect-[2/1] bg-[rgb(9,9,11)] rounded-lg relative font-sans">
      <img
        src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
        className="h-full w-full [mask-image:linear-gradient(to_bottom,transparent,white_10%,white_90%,transparent)] pointer-events-none select-none"
        alt="world map"
        height="495"
        width="1056"
        draggable={false}
      />
      <svg
        ref={svgRef}
        viewBox="0 0 800 400"
        className="w-full h-full absolute inset-0 pointer-events-none select-none"
      >
        {dots.map((dot, i) => {
          const startPoint = projectPoint(dot.start.lat, dot.start.lng);
          const endPoint = projectPoint(dot.end.lat, dot.end.lng);
          return (
            <g key={`path-group-${i}`}>
              <motion.path
                d={createCurvedPath(startPoint, endPoint)}
                fill="none"
                stroke="url(#path-gradient)"
                strokeWidth="1"
                initial={{
                  pathLength: 0,
                }}
                animate={{
                  pathLength: 1,
                }}
                transition={{
                  duration: 1,
                  delay: 0.5 * i,
                  ease: "easeOut",
                }}
                key={`start-upper-${i}`}
              ></motion.path>
            </g>
          );
        })}

        <defs>
          <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="5%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="95%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        {uniquePoints.map((point, i) => {
          const { x, y } = projectPoint(point.lat, point.lng);
          const isHub = point.count >= 2;
          const baseRadius = isHub ? 3 : 1.8;
          const pulseTo = isHub ? 12 : 7;
          return (
            <g key={`point-${i}`}>
              <circle cx={x} cy={y} r={baseRadius} fill={lineColor} />
              <circle
                cx={x}
                cy={y}
                r={baseRadius}
                fill={lineColor}
                opacity={isHub ? 0.6 : 0.4}
              >
                <animate
                  attributeName="r"
                  from={baseRadius}
                  to={pulseTo}
                  dur="1.8s"
                  begin="0s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  from={isHub ? 0.6 : 0.4}
                  to="0"
                  dur="1.8s"
                  begin="0s"
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          );
        })}
      </svg>
    </div>
  );
}