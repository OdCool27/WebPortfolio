import {motion} from 'motion/react';
import Carousel from '../components/Carousel';
import {useState, useEffect} from 'react';
import {collection, getDocs} from 'firebase/firestore';
import {db} from '../lib/firebase';
import {normalizeProject, sortProjectsByRecency, type ProjectRecord} from '../lib/projects';

export default function Projects() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const snap = await getDocs(collection(db, 'projects'));
        const normalizedProjects = snap.docs.map(doc => normalizeProject({ id: doc.id, ...doc.data() }));
        setProjects(sortProjectsByRecency(normalizedProjects));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const websites = projects.filter(p => p.type === 'Website');
  const applications = projects.filter(p => p.type === 'Application');
  const templates = projects.filter(p => p.type === 'Template');
  const mobileApps = projects.filter(p => p.type === 'Mobile');

  return (
    <div className="section-padding">
      <header className="mb-20">
        <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-accent-teal mb-4">Portfolio</h3>
        <h1 className="text-5xl font-bold tracking-tight mb-4">Work & Exploration</h1>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl text-sm leading-relaxed">A detailed exploration of my engineering journey, ranging from sleek marketing websites to robust enterprise-level applications.</p>
      </header>

      {/* Websites Section */}
      <section className="mb-32">
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-xs uppercase tracking-widest font-bold text-accent-teal">Featured Websites</h2>
          <div className="h-[1px] flex-grow mx-8 bg-zinc-100 dark:bg-zinc-800" />
        </div>
        <div className="flex flex-col gap-24">
          {websites.map((site, i) => (
            <motion.article 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid gap-8"
            >
              <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900 p-6 border border-zinc-100 dark:border-zinc-800 rounded-xl">
                <div className="flex items-center gap-4">
                  <span className="text-xl font-bold tracking-tight">{site.businessName || site.business}</span>
                  <div className="h-4 w-[1px] bg-accent-teal/30" />
                  <span className="text-[10px] uppercase tracking-widest text-zinc-400">{site.title}</span>
                </div>
                <div className="flex items-center gap-4">
                  <img src={site.logoUrl || site.logo} alt="Logo" className="w-10 h-10 grayscale opacity-50 object-contain" referrerPolicy="no-referrer" />
                </div>
              </div>
              
              <div className="rounded-2xl overflow-hidden">
                <Carousel images={site.images} />
              </div>
              
              <div className="max-w-4xl px-2">
                <div className="flex gap-2 mb-6">
                  {site.tags.map((tag, j) => (
                    <span key={j} className="text-[9px] font-bold bg-zinc-100 dark:bg-zinc-800 px-3 py-1 uppercase tracking-wider rounded-full">{tag}</span>
                  ))}
                  <span className="text-[10px] font-mono text-zinc-400 ml-auto">{site.date}</span>
                </div>
                <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{site.description}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Applications Section */}
      <section className="mb-32">
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-xs uppercase tracking-widest font-bold text-accent-teal">Application Projects</h2>
          <div className="h-[1px] flex-grow mx-8 bg-zinc-100 dark:bg-zinc-800" />
        </div>
        <div className="flex flex-col gap-24">
          {applications.map((app, i) => (
            <motion.article 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid gap-8"
            >
              <div className="rounded-2xl overflow-hidden">
                <Carousel images={app.images} />
              </div>
              
              <div className="max-w-4xl px-2">
                <h3 className="text-2xl font-bold mb-4 tracking-tight">{app.title}</h3>
                <div className="flex gap-2 mb-6">
                  {app.tags && app.tags.map((tag: string, j: number) => (
                    <span key={j} className="text-[9px] font-bold bg-zinc-100 dark:bg-zinc-800 px-3 py-1 uppercase tracking-wider rounded-full">{tag}</span>
                  ))}
                  <span className="text-[10px] font-mono text-zinc-400 ml-auto">{app.date}</span>
                </div>
                <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{app.description}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Templates Section */}
      <section className="mb-32">
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-xs uppercase tracking-widest font-bold text-accent-teal">UI Kit & Templates</h2>
          <div className="h-[1px] flex-grow mx-8 bg-zinc-100 dark:bg-zinc-800" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {loading ? 
            [1,2,3].map(i => <div key={i} className="aspect-[4/3] bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-xl" />)
           : templates.length > 0 ? (
            templates.map((temp, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="aspect-[4/3] bg-zinc-50 dark:bg-zinc-900 overflow-hidden mb-4 border border-zinc-100 dark:border-zinc-800 rounded-xl">
                  <img src={temp.images?.[0] || temp.image} alt={temp.title} className="w-full h-full object-contain bg-white dark:bg-zinc-950 transition-transform duration-500 group-hover:scale-110 grayscale group-hover:grayscale-0" referrerPolicy="no-referrer" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-widest mb-1">{temp.title}</h4>
                <p className="text-[9px] text-zinc-400 uppercase tracking-widest">Wireframe / UI Design</p>
              </div>
            ))
          ) : (
            <div className="col-span-full py-10 text-center opacity-40 italic text-sm">No templates found</div>
          )}
        </div>
      </section>

      {/* Mobile Apps Section */}
      <section className="mb-32">
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-xs uppercase tracking-widest font-bold text-accent-teal">Mobile Ecosystem</h2>
          <div className="h-[1px] flex-grow mx-8 bg-zinc-100 dark:bg-zinc-800" />
        </div>
        {mobileApps.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-8">
            {mobileApps.map((app, i) => (
              <motion.article key={i} className="grid gap-8">
                 <Carousel images={app.images} />
                 <div>
                    <h3 className="text-2xl font-bold mb-4">{app.title}</h3>
                    <p className="text-sm opacity-60">{app.description}</p>
                 </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/30">
            <p className="text-xl font-bold italic text-zinc-300 dark:text-zinc-700">Coming Soon</p>
            <div className="flex items-center gap-2 mt-4">
              <div className="h-2 w-2 rounded-full bg-accent-teal animate-pulse" />
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold">Research Phase</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
