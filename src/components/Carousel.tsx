import {motion, AnimatePresence} from 'motion/react';
import {useState} from 'react';
import {ChevronLeft, ChevronRight, X} from 'lucide-react';

interface CarouselProps {
  images: string[];
}

export default function Carousel({images = []}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center p-8 aspect-[16/10]">
        <p className="text-zinc-500 text-xs italic">No images available</p>
      </div>
    );
  }

  const prev = () => setCurrentIndex((idx) => (idx === 0 ? images.length - 1 : idx - 1));
  const next = () => setCurrentIndex((idx) => (idx === images.length - 1 ? 0 : idx + 1));

  return (
    <>
      <div className="relative group overflow-hidden bg-black/5 dark:bg-white/5 aspect-[16/10]">
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full h-full object-contain cursor-zoom-in bg-white dark:bg-zinc-950"
          onClick={() => setIsFullscreen(true)}
          referrerPolicy="no-referrer"
        />
        
        <button 
          onClick={prev}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/50 text-white rounded-none opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronLeft size={20} />
        </button>
        <button 
          onClick={next}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/50 text-white rounded-none opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronRight size={20} />
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, i) => (
            <div 
              key={i} 
              className={`h-1 transition-all ${i === currentIndex ? 'w-8 bg-accent-teal' : 'w-2 bg-white/30'}`} 
            />
          ))}
        </div>
      </div>

      {/* Fullscreen Gallery */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center px-4"
          >
            <button 
              onClick={() => setIsFullscreen(false)}
              className="absolute top-8 right-8 text-white p-2 hover:bg-white/10"
            >
              <X size={32} />
            </button>
            
            <div className="relative w-full max-w-5xl aspect-video">
              <img 
                src={images[currentIndex]} 
                className="w-full h-full object-contain" 
                referrerPolicy="no-referrer"
              />
              <button 
                onClick={prev}
                className="absolute -left-12 top-1/2 -translate-y-1/2 text-white hidden md:block"
              >
                <ChevronLeft size={48} />
              </button>
              <button 
                onClick={next}
                className="absolute -right-12 top-1/2 -translate-y-1/2 text-white hidden md:block"
              >
                <ChevronRight size={48} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
