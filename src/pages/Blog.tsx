import {useState, useEffect} from 'react';
import {collection, getDocs, query, orderBy} from 'firebase/firestore';
import {db} from '../lib/firebase';
import {motion} from 'motion/react';
import {ArrowRight, Calendar, User, Clock} from 'lucide-react';

export default function Blog() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'blogPosts'), orderBy('date', 'desc')));
        setPosts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="section-padding">
      <header className="mb-20">
        <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-accent-teal text-center mb-4">Journal</h3>
        <h1 className="text-5xl font-bold tracking-tight mb-4 text-center">Tech Insights</h1>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto text-center text-sm">Reflections on technology, business integration, and the future of digital craftsmanship.</p>
      </header>

      <div className="flex flex-col gap-24">
        {loading ? 
          [1,2].map(i => (
            <div key={i} className="flex flex-col md:flex-row gap-12 items-center animate-pulse">
              <div className="flex-1 w-full aspect-[16/9] bg-zinc-100 dark:bg-zinc-900 rounded-2xl" />
              <div className="flex-1 space-y-4">
                <div className="h-4 w-24 bg-zinc-100 dark:bg-zinc-900 rounded" />
                <div className="h-8 w-full bg-zinc-100 dark:bg-zinc-900 rounded" />
                <div className="h-4 w-2/3 bg-zinc-100 dark:bg-zinc-900 rounded" />
              </div>
            </div>
          ))
         : posts.length > 0 ? (
          posts.map((post, i) => (
            <motion.article 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`flex flex-col ${i % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} gap-12 items-center`}
            >
              <div className="flex-1 w-full aspect-[16/9] bg-zinc-50 dark:bg-zinc-900 overflow-hidden border border-zinc-100 dark:border-zinc-800 rounded-2xl">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <div className="flex-1 flex flex-col gap-6">
                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-accent-teal">
                  <span>{post.category}</span>
                  <div className="h-[1px] w-8 bg-current opacity-30" />
                  <span className="text-zinc-400">Featured Post</span>
                </div>
                
                <h2 className="text-3xl font-bold leading-tight hover:text-accent-teal transition-colors cursor-pointer tracking-tight">
                  {post.title}
                </h2>
                
                <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed text-sm italic">
                  "{post.excerpt}"
                </p>
                
                <div className="flex items-center gap-6 text-[10px] uppercase tracking-widest font-bold text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Calendar size={12} /> {post.date}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={12} /> {post.readTime}
                  </div>
                </div>
                
                <button className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] mt-2 group text-accent-teal border-b border-accent-teal/50 w-fit pb-1 transition-all hover:border-accent-teal">
                  Read Article <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            </motion.article>
          ))
        ) : (
          <div className="py-20 text-center opacity-40 italic">No blog posts found</div>
        )}
      </div>

      {/* Newsletter / Subscription */}
      <section className="mt-40 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 p-12 md:p-20 text-center rounded-3xl relative overflow-hidden">
        <div className="max-w-xl mx-auto flex flex-col items-center gap-8 relative z-10">
          <h3 className="text-3xl font-bold tracking-tight uppercase">Stay ahead of the curve.</h3>
          <p className="text-sm opacity-70 leading-relaxed">Subscribe to get monthly insights on technology implementation and business growth strategies directly in your inbox.</p>
          <div className="flex w-full gap-4 flex-col sm:flex-row">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="bg-zinc-800 dark:bg-zinc-200 border-none flex-grow px-6 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-teal text-sm" 
            />
            <button className="bg-accent-teal text-white px-8 py-4 font-bold uppercase tracking-widest text-[10px] rounded-xl hover:bg-opacity-90 transition-all">
              Subscribe
            </button>
          </div>
          <p className="text-[10px] opacity-40 uppercase tracking-[0.2em] font-bold">Zero spam. Only signal.</p>
        </div>
      </section>
    </div>
  );
}
