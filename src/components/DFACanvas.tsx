// DFACanvas.tsx
import React, { useRef, useEffect } from 'react';

interface DFANode {
    id: string;
    label: string;
    x: number;
    y: number;
    productions: string[];
}

interface DFAEdge {
    from: string;
    to: string;
    label: string;
}

interface DFAData {
    nodes: DFANode[];
    edges: DFAEdge[];
}

interface DFACanvasProps {
    dfaData?: DFAData;
}

const DFACanvas: React.FC<DFACanvasProps> = ({ dfaData }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!dfaData || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const drawDFA = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const drawNode = (node: DFANode) => {
                const radius = 50; // Uniform radius for all nodes
                ctx.beginPath();
                ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
                ctx.fillStyle = '#bfdbfe'; // Uniform blue color for all circles
                ctx.fill();
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#3b82f6';
                ctx.stroke();
            
                ctx.fillStyle = '#1e293b';
                ctx.textAlign = 'center';
            
                // Calculate the maximum width of the text that can fit inside the circle
                const maxTextWidth = radius * 2 * 0.8; // 80% of the diameter
            
                // Adjust the font size based on the text length
                let fontSize = 14;
                ctx.font = `bold ${fontSize}px sans-serif`;
                while (ctx.measureText(node.label).width > maxTextWidth && fontSize > 6) {
                    fontSize -= 1;
                    ctx.font = `bold ${fontSize}px sans-serif`;
                }
            
                // Draw the node label
                ctx.fillText(node.label, node.x, node.y - radius - 10); // Node label slightly higher
            
                // Start the productions from the top of the circle
                const textY = node.y - radius + 20; // Adjust the starting position
                node.productions.forEach((production, index) => {
                    ctx.font = 'bold 12px sans-serif'; // Larger text for productions
                    ctx.fillStyle = '#1e293b';
                    ctx.fillText(production, node.x, textY + index * 14);
                });
            };

            const drawEdge = (fromNode: DFANode, toNode: DFANode, label: string) => {
                const dx = toNode.x - fromNode.x;
                const dy = toNode.y - fromNode.y;
                const fromRadius = 50;
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
                ctx.strokeStyle = '#3b82f6';
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
                ctx.fillStyle = '#3b82f6';
                ctx.fill();

                ctx.fillStyle = '#1e293b';
                ctx.font = 'bold 12px sans-serif'; // Bold and darker edge labels
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText(label, midX, midY - 5);
            };

            dfaData.nodes.forEach(drawNode);
            dfaData.edges.forEach(edge => {
                const fromNode = dfaData.nodes.find(node => node.id === edge.from);
                const toNode = dfaData.nodes.find(node => node.id === edge.to);
                if (fromNode && toNode) {
                    drawEdge(fromNode, toNode, edge.label);
                }
            });
        };

        drawDFA();
    }, [dfaData]);

    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-center text-xl font-bold text-gray-800 mb-2">
                Canonical Diagram for LR(0) Items
            </h2>
            <canvas ref={canvasRef} width={800} height={500} style={{ display: 'block', margin: '0 auto' }} />
        </div>
    );
};

export default DFACanvas;
