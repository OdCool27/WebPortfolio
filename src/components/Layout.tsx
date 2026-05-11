import {ReactNode} from 'react';
import {Link, useLocation} from 'react-router-dom';
import {Instagram, Github, Linkedin, Menu, X} from 'lucide-react';
import {motion, AnimatePresence} from 'motion/react';
import {useState} from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({children}: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Projects', path: '/projects' },
    { name: 'Blog', path: '/blog' }
  ];

  const socialLinks = [
    { icon: <Instagram size={20} />, url: 'https://instagram.com' },
    { icon: <Github size={20} />, url: 'https://github.com' },
    { icon: <Linkedin size={20} />, url: 'https://linkedin.com' }
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-10 h-20 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold tracking-tighter">
            ODANE COLLINS<span className="text-accent-teal">.</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-10">
            {navItems.map((item) => (
              <Link 
                key={item.path} 
                to={item.path}
                className={`nav-link text-sm font-medium ${location.pathname === item.path ? 'text-accent-teal' : 'hover:text-accent-teal'}`}
              >
                {item.name}
              </Link>
            ))}
            <div className="flex items-center gap-5 ml-4">
              {socialLinks.map((link, i) => (
                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-accent-teal transition-colors">
                  {link.icon}
                </a>
              ))}
            </div>
          </nav>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white dark:bg-black pt-24 px-6 md:hidden"
          >
            <nav className="flex flex-col gap-6 items-center">
              {navItems.map((item) => (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-2xl font-display font-bold"
                >
                  {item.name}
                </Link>
              ))}
              <div className="w-12 h-[1px] bg-accent-teal my-4" />
              <div className="flex gap-8">
                {socialLinks.map((link, i) => (
                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="hover:text-accent-teal">
                    {link.icon}
                  </a>
                ))}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-grow pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="px-10 py-6 border-t border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-center text-[10px] text-zinc-400 uppercase tracking-widest font-semibold gap-4">
        <div>© {new Date().getFullYear()} Odane Collins Portfolio</div>
        <div className="flex gap-6">
          <a href="https://instagram.com" className="hover:text-accent-teal transition-colors">Instagram</a>
          <a href="https://github.com" className="hover:text-accent-teal transition-colors">GitHub</a>
          <a href="https://linkedin.com" className="hover:text-accent-teal transition-colors">LinkedIn</a>
        </div>
      </footer>
    </div>
  );
}
