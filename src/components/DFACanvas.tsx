// DFACanvas.tsx
import React, { useRef, useEffect, useState } from "react";
import { useGrammar } from "../contexts/GrammarContext";
import { DFANode, DFAData, DFAEdge } from "../types/types";

export interface DFACanvasProps {
  dfaData?: DFAData;
}

const demoDFA = {
  nodes: [
    {
      id: "0",
      label: "I0",
      productions: ["S'→.E", "E→.E+T", "E→.T", "T→.T*F", "T→.F", "F→.id"],
    },
    {
      id: "1",
      label: "I1",
      productions: ["S'→E.", "E→E.+T"],
    },
    { id: "2", label: "I2", productions: ["E→T.", "T→T.*F"] },
    { id: "3", label: "I3", productions: ["T→F."] },
    { id: "4", label: "I4", productions: ["F→id."] },
    {
      id: "5",
      label: "I5",

      productions: ["E→E+.T", "T→.T*F", "T→.F", "F→.id"],
    },
    { id: "6", label: "I6", productions: ["T→T*.F", "F→.id"] },
    { id: "7", label: "I7", productions: ["E→E+T.", "T→T.*F"] },
    { id: "8", label: "I8", productions: ["T→T*F."] },
  ],
  edges: [
    { from: "0", to: "1", label: "E" },
    { from: "0", to: "2", label: "T" },
    { from: "0", to: "3", label: "F" },
    { from: "0", to: "4", label: "id" },
    { from: "1", to: "5", label: "+" },
    { from: "2", to: "6", label: "*" },
    { from: "5", to: "7", label: "T" },
    { from: "6", to: "8", label: "F" },
    { from: "5", to: "4", label: "id" },
    { from: "6", to: "4", label: "id" },
    { from: "7", to: "6", label: "*" },
    { from: "5", to: "3", label: "F" },
  ],
};

const DFACanvas: React.FC<DFACanvasProps> = ({ dfaData }) => {
  const { states, transitions } = useGrammar();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // const [DFAData, setDFAData] = useState<DFAData>({nodes:[], edges: []})
  console.log(states, transitions);
  // useEffect(() => {
  //   if (!states || !transitions || !canvasRef.current) return;
  //   const canvas = canvasRef.current;
  //   const ctx = canvas.getContext("2d");
  //   if (!ctx) return;

  //   const DFAData: DFAData = {
  //     nodes: [],
  //     edges: [],
  //   };

  //   // inserting nodes for DFA
  //   states.forEach((state, i) => {
  //     DFAData.nodes.push({
  //       id: `${i}`,
  //       label: `I${i}`,
  //       x: 0,
  //       y: 0,
  //       productions: [...state[i]].map(
  //         ([symbol, production]) => `${symbol}→${production}`
  //       ),
  //     });
  //   });

  //   // inserting edges for DFA
  //   transitions.forEach((transitition) => {
  //     DFAData.edges.push({
  //       from: `${transitition.from}`,
  //       to: `${transitition.to}`,
  //       label: transitition.scanned,
  //     });
  //   });

  //   console.log("DFAData", DFAData);

  //   const drawDFA = () => {
  //     ctx.clearRect(0, 0, canvas.width, canvas.height);

  //     const drawNode = (node: DFANode) => {
  //       const radius = 50; // Uniform radius for all nodes
  //       ctx.beginPath();
  //       ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
  //       ctx.fillStyle = "#bfdbfe"; // Uniform blue color for all circles
  //       ctx.fill();
  //       ctx.lineWidth = 2;
  //       ctx.strokeStyle = "#3b82f6";
  //       ctx.stroke();

  //       ctx.fillStyle = "#1e293b";
  //       ctx.textAlign = "center";

  //       // Calculate the maximum width of the text that can fit inside the circle
  //       const maxTextWidth = radius * 2 * 0.8; // 80% of the diameter

  //       // Adjust the font size based on the text length
  //       let fontSize = 14;
  //       ctx.font = `bold ${fontSize}px sans-serif`;
  //       while (
  //         ctx.measureText(node.label).width > maxTextWidth &&
  //         fontSize > 6
  //       ) {
  //         fontSize -= 1;
  //         ctx.font = `bold ${fontSize}px sans-serif`;
  //       }

  //       // Draw the node label
  //       ctx.fillText(node.label, node.x, node.y - radius - 10); // Node label slightly higher

  //       // Start the productions from the top of the circle
  //       const textY = node.y - radius + 20; // Adjust the starting position
  //       node.productions.forEach((production, index) => {
  //         ctx.font = "bold 12px sans-serif"; // Larger text for productions
  //         ctx.fillStyle = "#1e293b";
  //         ctx.fillText(production, node.x, textY + index * 14);
  //       });
  //     };

  //     const drawEdge = (fromNode: DFANode, toNode: DFANode, label: string) => {
  //       const dx = toNode.x - fromNode.x;
  //       const dy = toNode.y - fromNode.y;
  //       const fromRadius = 50;
  //       const angle = Math.atan2(dy, dx);
  //       const startX = fromNode.x + fromRadius * Math.cos(angle);
  //       const startY = fromNode.y + fromRadius * Math.sin(angle);
  //       const toRadius = 50;
  //       const endX = toNode.x - toRadius * Math.cos(angle);
  //       const endY = toNode.y - toRadius * Math.sin(angle);

  //       const midX = (startX + endX) / 2;
  //       const midY = (startY + endY) / 2;

  //       ctx.beginPath();
  //       ctx.moveTo(startX, startY);
  //       ctx.lineTo(endX, endY);
  //       ctx.strokeStyle = "#3b82f6";
  //       ctx.lineWidth = 2;
  //       ctx.stroke();

  //       const arrowHeadSize = 10;
  //       ctx.beginPath();
  //       ctx.moveTo(endX, endY);
  //       ctx.lineTo(
  //         endX - arrowHeadSize * Math.cos(angle - Math.PI / 6),
  //         endY - arrowHeadSize * Math.sin(angle - Math.PI / 6)
  //       );
  //       ctx.lineTo(
  //         endX - arrowHeadSize * Math.cos(angle + Math.PI / 6),
  //         endY - arrowHeadSize * Math.sin(angle + Math.PI / 6)
  //       );
  //       ctx.closePath();
  //       ctx.fillStyle = "#3b82f6";
  //       ctx.fill();

  //       ctx.fillStyle = "#1e293b";
  //       ctx.font = "bold 12px sans-serif"; // Bold and darker edge labels
  //       ctx.textAlign = "center";
  //       ctx.textBaseline = "bottom";
  //       ctx.fillText(label, midX, midY - 5);
  //     };

  //     DFAData?.nodes.forEach((node) => drawNode(node));
  //     DFAData?.edges.forEach((edge) => {
  //       const fromNode = DFAData.nodes.find((node) => node.id === edge.from);
  //       const toNode = DFAData.nodes.find((node) => node.id === edge.to);
  //       if (fromNode && toNode) {
  //         drawEdge(fromNode, toNode, edge.label);
  //       }
  //     });
  //   };

  //   drawDFA();
  // }, [states, transitions]);

  useEffect(() => {
    if (!states.length || !transitions.length || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const levelSpacing = 150; // Vertical spacing between levels
    const nodeSpacing = 120; // Horizontal spacing between nodes
    const canvasWidth = canvas.width;

    const levels: { [key: string]: DFANode[] } = {};
    const visited: Set<string> = new Set();

    const DFAData: DFAData = { nodes: [], edges: [] };
    // inserting nodes for DFA
    states.forEach((state, i) => {
      DFAData.nodes.push({
        id: `${i}`,
        label: `I${i}`,
        x: 0,
        y: 0,
        productions: [...state[i]].map(
          ([symbol, production]) => `${symbol}→${production}`
        ),
      });
    });
    // Insert edges into DFAData
    transitions.forEach((transition) => {
      DFAData.edges.push({
        from: `${transition.from}`,
        to: `${transition.to}`,
        label: transition.scanned,
      });
    });

    console.log("DFAData", DFAData);

    // Assign levels to nodes based on transitions
    const assignLevels = (current: string, level: number) => {
      if (visited.has(current)) return;
      visited.add(current);

      if (!levels[level]) levels[level] = [];
      levels[level].push(DFAData.nodes[Number(current)]);

      transitions
        .filter((t) => t.from === Number(current))
        .forEach((t) => assignLevels(String(t.to), level + 1));
    };

    assignLevels("0", 0); // Start from the initial state (assumed to be "0")
    console.log("levels", levels);

    // Calculate positions
    Object.entries(levels).forEach(([level, nodes], levelIndex) => {
      const y = levelIndex * levelSpacing + 50; // Adjust y position based on level
      const totalNodes = nodes.length;
      const startX = (canvasWidth - totalNodes * nodeSpacing) / 2; // Center nodes

      nodes.forEach((node, i) => {
        node.x = startX + i * nodeSpacing;
        node.y = y;
        DFAData.nodes.push();
      });
    });

    const drawDFA = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const drawNode = (node: DFANode) => {
        const radius = 50;
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = "#bfdbfe";
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#3b82f6";
        ctx.stroke();

        ctx.fillStyle = "#1e293b";
        ctx.textAlign = "center";

        // Draw the node label
        ctx.font = "bold 14px sans-serif";
        ctx.fillText(node.label, node.x, node.y - radius - 10);
        const rule = node.productions.join("\n"); // Multi-line text
        const lines = rule.split("\n"); // Split the text into lines
        ctx.font = "bold 10px sans-serif";
        ctx.textAlign = "center"; // Optional: Align text to the center of the node

        lines.forEach((line, index) => {
          const lineHeight = 10; // Adjust the spacing between lines
          ctx.fillText(line, node.x, node.y + index * lineHeight);
        });

        // Draw productions
        // node.productions.forEach((production, index) => {
        //   ctx.font = "bold 12px sans-serif";
        //   ctx.fillStyle = "#1e293b";
        //   ctx.fillText(production, node.x, node.y);
        // });
      };

      const drawEdge = (fromNode: DFANode, toNode: DFANode, label: string) => {
        const fromRadius = 50;

        if (fromNode === toNode) {
          // Self-loop logic
          const loopRadius = 30;
          const startAngle = Math.PI / 2; // Adjust these angles as needed
          const endAngle = (7 * Math.PI) / 4;

          const centerX = fromNode.x + fromRadius * Math.cos(startAngle);
          const centerY = fromNode.y + fromRadius * Math.sin(startAngle);

          ctx.beginPath();
          ctx.arc(centerX, centerY, loopRadius, startAngle, endAngle);
          ctx.strokeStyle = "#3b82f6";
          ctx.lineWidth = 2;
          ctx.stroke();

          // Arrowhead for the self-loop
          const arrowAngle = (3 * Math.PI) / 4; // Adjust for arrowhead position
          const arrowX = centerX + loopRadius * Math.cos(arrowAngle);
          const arrowY = centerY + loopRadius * Math.sin(arrowAngle);
          const arrowHeadSize = 10;

          ctx.beginPath();
          ctx.moveTo(arrowX, arrowY);
          ctx.lineTo(
            arrowX - arrowHeadSize * Math.cos(arrowAngle - Math.PI / 6),
            arrowY - arrowHeadSize * Math.sin(arrowAngle - Math.PI / 6)
          );
          ctx.lineTo(
            arrowX - arrowHeadSize * Math.cos(arrowAngle + Math.PI / 6),
            arrowY - arrowHeadSize * Math.sin(arrowAngle + Math.PI / 6)
          );
          ctx.closePath();
          ctx.fillStyle = "#3b82f6";
          ctx.fill();

          // Label for the self-loop
          ctx.fillStyle = "#1e293b";
          ctx.font = "bold 12px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(label, centerX, centerY - loopRadius - 10);
        } else {
          // Straight edge logic
          const dx = toNode.x - fromNode.x;
          const dy = toNode.y - fromNode.y;
          const angle = Math.atan2(dy, dx);
          const startX = fromNode.x + fromRadius * Math.cos(angle);
          const startY = fromNode.y + fromRadius * Math.sin(angle);
          const toRadius = 50;
          const endX = toNode.x - toRadius * Math.cos(angle);
          const endY = toNode.y - toRadius * Math.sin(angle);

          const midX = (startX + endX) / 2;
          const midY = (startY + endY) / 2;

          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = "#3b82f6";
          ctx.lineWidth = 2;
          ctx.stroke();

          const arrowHeadSize = 10;
          ctx.beginPath();
          ctx.moveTo(endX, endY);
          ctx.lineTo(
            endX - arrowHeadSize * Math.cos(angle - Math.PI / 6),
            endY - arrowHeadSize * Math.sin(angle - Math.PI / 6)
          );
          ctx.lineTo(
            endX - arrowHeadSize * Math.cos(angle + Math.PI / 6),
            endY - arrowHeadSize * Math.sin(angle + Math.PI / 6)
          );
          ctx.closePath();
          ctx.fillStyle = "#3b82f6";
          ctx.fill();

          ctx.fillStyle = "#1e293b";
          ctx.font = "bold 12px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "bottom";
          ctx.fillText(label, midX, midY - 5);
        }
      };

      DFAData?.nodes.forEach((node) => {
        // console.log(node);
        drawNode(node);
      });
      DFAData?.edges.forEach((edge) => {
        const fromNode = DFAData.nodes.find((node) => node.id === edge.from);
        const toNode = DFAData.nodes.find((node) => node.id === edge.to);
        if (fromNode && toNode) {
          drawEdge(fromNode, toNode, edge.label);
        }
      });
    };

    drawDFA();
  }, [states, transitions]);

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-center text-xl font-bold text-gray-800 mb-2">
        Canonical Diagram for LR(0) Items
      </h2>
      <canvas
        ref={canvasRef}
        width={800}
        height={700}
        style={{ display: "block", margin: "0 auto" }}
      />
    </div>
  );
};

export default DFACanvas;

