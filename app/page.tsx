'use client';

import { useEffect, useRef, useState } from 'react';

type Target = {
  x: number;
  y: number;
  radius: number;
  id: number;
};

export default function TargetShootingGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameRunning, setGameRunning] = useState(false);
  const [targets, setTargets] = useState<Target[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 600;

    const drawGame = () => {
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      targets.forEach((target) => {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fef2f2';
        ctx.beginPath();
        ctx.arc(target.x, target.y, target.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(target.x, target.y, target.radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    drawGame();
  }, [targets]);

  const startGame = () => {
    setGameRunning(true);
    setScore(0);
    setTimeLeft(30);
    setTargets([]);
  };

  const generateTarget = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const newTarget: Target = {
      x: Math.random() * (canvas.width - 120) + 60,
      y: Math.random() * (canvas.height - 120) + 60,
      radius: 30 + Math.random() * 20,
      id: Date.now(),
    };

    setTargets(prev => [...prev, newTarget]);

    setTimeout(() => {
      setTargets(prev => prev.filter(t => t.id !== newTarget.id));
    }, 2000);
  };

  useEffect(() => {
    if (!gameRunning) return;

    const gameTimer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const targetGenerator = setInterval(generateTarget, 1500);

    return () => {
      clearInterval(gameTimer);
      clearInterval(targetGenerator);
    };
  }, [gameRunning]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!gameRunning) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const hitTarget = targets.find(target => {
      const distance = Math.sqrt((x - target.x) ** 2 + (y - target.y) ** 2);
      return distance <= target.radius;
    });

    if (hitTarget) {
      setScore(prev => prev + 10);
      setTargets(prev => prev.filter(t => t.id !== hitTarget.id));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex flex-col items-center justify-center p-8">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-4xl w-full">
        <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">
          🎯 Target Shooting Game
        </h1>

        <div className="flex justify-between items-center mb-6">
          <div className="text-xl font-semibold text-gray-700">
            Score: <span className="text-blue-600">{score}</span>
          </div>
          <div className="text-xl font-semibold text-gray-700">
            Time: <span className="text-red-600">{timeLeft}s</span>
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="border-4 border-gray-300 rounded-lg cursor-crosshair shadow-lg"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>

        <div className="text-center">
          {!gameRunning && timeLeft === 30 ? (
            <button
              onClick={startGame}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors"
            >
              🎮 Start Game
            </button>
          ) : !gameRunning && timeLeft === 0 ? (
            <div>
              <p className="text-2xl font-bold mb-4 text-gray-800">
                Game Over! Final Score: {score}
              </p>
              <button
                onClick={startGame}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors"
              >
                🔄 Play Again
              </button>
            </div>
          ) : (
            <p className="text-lg text-gray-600">
              Click on the red targets to score points! 🎯
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
