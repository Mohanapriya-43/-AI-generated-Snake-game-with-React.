import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, RefreshCw, Terminal, Cpu, Activity } from 'lucide-react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const GAME_SPEED = 100;

const TRACKS = [
  { id: 1, title: "DATA_STREAM_01", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: 2, title: "VOID_SIGNAL_02", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id: 3, title: "NEURAL_LINK_03", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
];

export default function App() {
  // Music State
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Game State
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [foodState, setFoodState] = useState({ x: 5, y: 5 });
  const foodRef = useRef({ x: 5, y: 5 });
  const directionRef = useRef(INITIAL_DIRECTION);
  const lastProcessedDirectionRef = useRef(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isGameRunning, setIsGameRunning] = useState(false);

  const setFood = (newFood: { x: number; y: number }) => {
    foodRef.current = newFood;
    setFoodState(newFood);
  };

  const generateFood = (currentSnake: { x: number; y: number }[]) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      if (!currentSnake.some((segment) => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    return newFood;
  };

  const moveSnake = useCallback(() => {
    if (gameOver || !isGameRunning) return;

    setSnake((prevSnake) => {
      const head = prevSnake[0];
      const currentDir = directionRef.current;
      lastProcessedDirectionRef.current = currentDir;
      const newHead = { x: head.x + currentDir.x, y: head.y + currentDir.y };

      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE ||
        prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)
      ) {
        setGameOver(true);
        setIsGameRunning(false);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
        setScore((s) => {
          const newScore = s + 1;
          setHighScore((h) => Math.max(h, newScore));
          return newScore;
        });
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [gameOver, isGameRunning]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      const { x, y } = lastProcessedDirectionRef.current;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          if (y !== 1) directionRef.current = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
        case 's':
          if (y !== -1) directionRef.current = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
        case 'a':
          if (x !== 1) directionRef.current = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
        case 'd':
          if (x !== -1) directionRef.current = { x: 1, y: 0 };
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isGameRunning) {
      const interval = setInterval(moveSnake, GAME_SPEED);
      return () => clearInterval(interval);
    }
  }, [moveSnake, isGameRunning]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play().catch(() => {});
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying, currentTrack]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };
  const prevTrack = () => {
    setCurrentTrack((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const startGame = () => {
    setSnake(INITIAL_SNAKE);
    directionRef.current = INITIAL_DIRECTION;
    lastProcessedDirectionRef.current = INITIAL_DIRECTION;
    setScore(0);
    setGameOver(false);
    setIsGameRunning(true);
    setFood(generateFood(INITIAL_SNAKE));
    if (!isPlaying) setIsPlaying(true);
  };

  return (
    <div className="min-h-screen bg-black text-[#00ffff] flex flex-col items-center justify-center p-4 screen-tear relative">
      <div className="noise absolute inset-0 z-0"></div>
      
      <audio ref={audioRef} src={TRACKS[currentTrack].url} onEnded={nextTrack} />

      <header className="z-10 mb-12 text-center">
        <h1 
          className="text-4xl md:text-6xl font-pixel glitch-text tracking-tighter mb-2" 
          data-text="SYSTEM_OVERRIDE::SNAKE"
        >
          SYSTEM_OVERRIDE::SNAKE
        </h1>
        <div className="flex items-center justify-center gap-4 text-xs opacity-70">
          <span className="flex items-center gap-1"><Terminal size={12} /> PROTOCOL_V.2.0.26</span>
          <span className="flex items-center gap-1"><Cpu size={12} /> CORE_TEMP_STABLE</span>
          <span className="flex items-center gap-1 animate-pulse"><Activity size={12} /> UPLINK_ACTIVE</span>
        </div>
      </header>

      <main className="z-10 flex flex-col lg:flex-row gap-12 items-center lg:items-stretch">
        {/* AUDIO_MODULE */}
        <section className="w-full lg:w-72 border-2 border-[#ff00ff] p-6 bg-black/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#ff00ff] animate-pulse"></div>
          <h2 className="font-pixel text-xs mb-6 text-[#ff00ff] tracking-widest underline decoration-double">AUDIO_MODULE</h2>
          
          <div className="aspect-square border border-[#00ffff]/30 mb-6 flex items-center justify-center relative group">
            <div className={`w-3/4 h-3/4 border-2 border-[#00ffff] flex items-center justify-center ${isPlaying ? 'animate-ping opacity-20' : 'opacity-10'}`}></div>
            <div className={`absolute inset-0 flex items-center justify-center ${isPlaying ? 'animate-pulse' : ''}`}>
              <div className="w-1/2 h-1/2 border border-[#ff00ff] rotate-45"></div>
            </div>
            <span className="font-pixel text-[10px] text-white/50 absolute bottom-2">SIGNAL_STRENGTH: 98%</span>
          </div>

          <div className="mb-8">
            <p className="text-[10px] opacity-50 mb-1">CURRENT_STREAM:</p>
            <p className="font-pixel text-sm truncate text-white glitch-text" data-text={TRACKS[currentTrack].title}>
              {TRACKS[currentTrack].title}
            </p>
          </div>

          <div className="flex justify-between items-center mb-8">
            <button onClick={prevTrack} className="hover:text-[#ff00ff] transition-colors"><SkipBack size={24} /></button>
            <button 
              onClick={togglePlay} 
              className="w-16 h-16 border-2 border-[#00ffff] flex items-center justify-center hover:bg-[#00ffff] hover:text-black transition-all"
            >
              {isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
            </button>
            <button onClick={nextTrack} className="hover:text-[#ff00ff] transition-colors"><SkipForward size={24} /></button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-[10px] uppercase">
              <span>Gain</span>
              <span>{Math.round(volume * 100)}%</span>
            </div>
            <input 
              type="range" min="0" max="1" step="0.01" value={volume} 
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full appearance-none bg-[#ff00ff]/20 h-1 accent-[#ff00ff] cursor-crosshair"
            />
          </div>
        </section>

        {/* LOGIC_CORE */}
        <section className="flex flex-col items-center">
          <div className="w-full flex justify-between font-pixel text-[10px] mb-2 px-1">
            <div className="flex flex-col">
              <span className="text-[#ff00ff]">DATA_HARVESTED:</span>
              <span className="text-2xl text-white">{score.toString().padStart(4, '0')}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="opacity-50">MAX_RECOVERY:</span>
              <span className="text-lg">{highScore.toString().padStart(4, '0')}</span>
            </div>
          </div>

          <div 
            className="border-4 border-[#00ffff] relative bg-black shadow-[0_0_20px_rgba(0,255,255,0.2)]"
            style={{ width: GRID_SIZE * 20, height: GRID_SIZE * 20 }}
          >
            {/* GRID_LINES */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
              style={{ 
                backgroundImage: 'linear-gradient(#00ffff 1px, transparent 1px), linear-gradient(90deg, #00ffff 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }} 
            />

            {/* FOOD_BIT */}
            <div 
              className="absolute bg-[#ff00ff] shadow-[0_0_10px_#ff00ff]"
              style={{ width: 18, height: 18, left: foodState.x * 20 + 1, top: foodState.y * 20 + 1 }}
            />

            {/* ENTITY_SNAKE */}
            {snake.map((segment, i) => (
              <div 
                key={i}
                className={`absolute ${i === 0 ? 'bg-white z-10' : 'bg-[#00ffff]'} border border-black`}
                style={{ 
                  width: 20, height: 20, 
                  left: segment.x * 20, top: segment.y * 20,
                  opacity: 1 - (i / snake.length) * 0.5
                }}
              />
            ))}

            {/* OVERLAYS */}
            {!isGameRunning && !gameOver && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-20">
                <button 
                  onClick={startGame}
                  className="font-pixel text-lg border-2 border-[#00ffff] px-8 py-4 hover:bg-[#00ffff] hover:text-black transition-all glitch-text"
                  data-text="INITIALIZE_CORE"
                >
                  INITIALIZE_CORE
                </button>
              </div>
            )}

            {gameOver && (
              <div className="absolute inset-0 bg-[#ff00ff]/20 backdrop-blur-md flex flex-col items-center justify-center z-20">
                <h3 className="font-pixel text-3xl text-white mb-4 glitch-text" data-text="CRITICAL_FAILURE">CRITICAL_FAILURE</h3>
                <p className="font-pixel text-xs mb-8">RECOVERY_ID: {Math.random().toString(36).substring(7).toUpperCase()}</p>
                <button 
                  onClick={startGame}
                  className="font-pixel text-sm border-2 border-white px-6 py-3 hover:bg-white hover:text-black transition-all flex items-center gap-2"
                >
                  <RefreshCw size={16} /> REBOOT_SYSTEM
                </button>
              </div>
            )}
          </div>

          <footer className="mt-8 w-full border-t border-[#00ffff]/20 pt-4 flex justify-between items-center text-[10px] opacity-50 uppercase tracking-widest">
            <span>Input: [W][A][S][D] || [ARROWS]</span>
            <span>Status: {isGameRunning ? 'RUNNING' : 'IDLE'}</span>
          </footer>
        </section>
      </main>

      <footer className="z-10 mt-12 text-[8px] opacity-30 font-pixel text-center space-y-1">
        <p>WARNING: UNAUTHORIZED ACCESS TO NEURAL_LINK_03 MAY CAUSE MEMORY LEAK</p>
        <p>© 2026 CYBER_VOID_INDUSTRIES // ALL_RIGHTS_RESERVED</p>
      </footer>
    </div>
  );
}
