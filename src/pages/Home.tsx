import {motion} from 'motion/react';
import SkillBar from '../components/SkillBar';
import {ArrowRight, ExternalLink, Mail, Send} from 'lucide-react';
import {useForm} from 'react-hook-form';
import {Link} from 'react-router-dom';
import {useState, useEffect} from 'react';
import {collection, getDocs, query, orderBy} from 'firebase/firestore';
import {db} from '../lib/firebase';
import {getFeaturedProject, normalizeProject, sortProjectsByRecency, type ProjectRecord} from '../lib/projects';
import myImage from '../assets/odane.JPEG';

export default function Home() {
  const {register, handleSubmit, formState: {errors}} = useForm();
  const [skills, setSkills] = useState<any[]>([]);
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const skillsSnap = await getDocs(query(collection(db, 'skills'), orderBy('level', 'desc')));
        setSkills(skillsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const projectsSnap = await getDocs(collection(db, 'projects'));
        const normalizedProjects = projectsSnap.docs.map(doc => normalizeProject({ id: doc.id, ...doc.data() }));
        setProjects(sortProjectsByRecency(normalizedProjects));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const websites = projects.filter(p => p.type === 'Website');
  const applications = projects.filter(p => p.type === 'Application');
  const featuredProject = getFeaturedProject(projects);

  const onSubmit = (data: any) => {
    console.log(data);
    alert('Thank you for reaching out, ' + data.fullName + '! I will get back to you soon.');
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="section-padding flex flex-col md:flex-row items-center gap-10 min-h-[70vh]">
        <div className="w-full md:w-1/3 flex flex-col items-center md:items-start text-center md:text-left">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-32 h-32 rounded-full bg-teal-100 dark:bg-teal-900 border-2 border-accent-teal overflow-hidden mb-8"
          >
            <img 
              src={myImage}
              alt="Odane Collins" 
              className="w-full h-full object-cover grayscale"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <h1 className="text-4xl font-bold leading-tight mb-2">Odane Collins</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm italic mb-6">Full Stack Developer</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
            Motivated software engineer dedicated to building scalable web applications and intuitive user experiences. My goal is to bridge the gap between complex backend logic and elegant frontend design.
          </p>
        </div>
        
        <div className="w-full md:w-2/3 flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <h3 className="text-xs uppercase tracking-widest font-bold text-accent-teal">Featured Project</h3>
            {featuredProject ? (
              <div className="relative group aspect-video card-zinc cursor-pointer">
                <img src={featuredProject.images[0] || featuredProject.image} className="w-full h-full object-contain bg-white dark:bg-zinc-950 opacity-80 group-hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent text-white">
                  <p className="text-[10px] uppercase tracking-widest opacity-70 mb-2">{featuredProject.type || 'Project'}</p>
                  <h4 className="text-2xl font-bold">{featuredProject.title}</h4>
                  <p className="text-xs opacity-70">{featuredProject.featuredOnHome ? 'Selected from admin' : 'Most recently added project'}</p>
                </div>
              </div>
            ) : (
              <div className="aspect-video card-zinc flex items-center justify-center border-dashed">
                <p className="text-zinc-500 italic text-sm">No featured project available</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="bg-zinc-50 dark:bg-zinc-900 border-y border-zinc-100 dark:border-zinc-800 py-32">
        <div className="section-padding">
          <div className="grid md:grid-cols-2 gap-20">
            <div>
              <h3 className="text-xs uppercase tracking-widest font-bold text-accent-teal mb-4">Technical Skills</h3>
              <h2 className="text-4xl font-bold mb-6 tracking-tight">Mastering the Tools of the Trade</h2>
              <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed mb-8">
                My technical foundation is built on both frontend elegance and backend robustness. I believe in continuous learning and staying updated with the ever-evolving ecosystem.
              </p>
            </div>
            <div className="space-y-4">
              {loading ? 
                [1,2,3,4].map(i => <div key={i} className="h-12 w-full bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-lg" />)
               : (
                skills.map((skill) => (
                  <SkillBar 
                    key={skill.id || skill.name} 
                    skill={skill.name} 
                    level={skill.level} 
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Projects Synopsis */}
      <section className="py-32">
        <div className="section-padding">
          <div className="text-center mb-20">
            <span className="text-accent-teal font-mono text-sm uppercase tracking-[0.3em] mb-4 block">Portfolio</span>
            <h2 className="text-5xl font-display font-bold">Project Highlights</h2>
          </div>

          {/* Websites Grid */}
          <div className="mb-32">
            <div className="flex justify-between items-end mb-8">
              <h3 className="text-xs uppercase tracking-widest font-bold text-accent-teal">Featured Websites</h3>
              <span className="text-[10px] text-zinc-400">Hover to explore</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {loading ? 
                [1,2,3,4].map(i => <div key={i} className="aspect-square bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-xl" />)
               : websites.length > 0 ? (
                websites.slice(0, 6).map((site) => (
                  <motion.div 
                    key={site.id}
                    className="relative group aspect-square bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl flex items-center justify-center cursor-pointer overflow-hidden transition-all duration-300 p-6"
                  >
                    {site.logoUrl || site.logo ? (
                      <img
                        src={site.logoUrl || site.logo}
                        alt={site.title}
                        className="max-w-full max-h-full object-contain opacity-70 transition-opacity duration-300 group-hover:opacity-100"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-4xl opacity-20 font-bold">{site.icon || site.title?.charAt(0)}</span>
                    )}
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-teal-600 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-4">
                      <span className="text-[10px] font-bold uppercase mb-4">{site.title || site.name}</span>
                      <div className="flex gap-2">
                        <a href={site.url || '#'} className="px-3 py-1.5 bg-white text-zinc-900 text-[9px] font-bold rounded uppercase tracking-wider">VISIT</a>
                        <Link to="/projects" className="px-3 py-1.5 border border-white text-white text-[9px] font-bold rounded uppercase tracking-wider">MORE</Link>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-10 text-center opacity-40 italic text-sm">No websites found</div>
              )}
            </div>
          </div>

          {/* Applications Grid */}
          <div>
            <h3 className="text-xs uppercase tracking-widest font-bold text-accent-teal mb-8">Application Projects</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {loading ? 
                [1,2].map(i => <div key={i} className="h-32 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-xl" />)
               : applications.length > 0 ? (
                applications.slice(0, 4).map((app, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl flex gap-6 hover:border-accent-teal/50 transition-colors cursor-pointer group"
                  >
                    <div className="w-20 h-20 bg-teal-100 dark:bg-teal-900 rounded-lg flex-shrink-0 flex items-center justify-center text-3xl font-bold text-accent-teal overflow-hidden">
                      <img src={app.images?.[0] || app.image} className="w-full h-full object-contain bg-white dark:bg-zinc-950 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex flex-col justify-center">
                      <h4 className="text-sm font-bold mb-1">{app.title}</h4>
                      <p className="text-[10px] text-zinc-500 mb-3 line-clamp-2">{app.description}</p>
                      <div className="flex gap-1.5 flex-wrap">
                        {app.tags && app.tags.map((tag: string, j: number) => (
                          <span key={j} className="text-[8px] px-2 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded-full font-bold uppercase tracking-tighter">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-10 text-center opacity-40 italic text-sm">No applications found</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section-padding py-24">
        <div className="p-10 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-3xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <h3 className="text-2xl font-bold mb-2 tracking-tight">Start a conversation</h3>
              <p className="text-xs opacity-50 uppercase tracking-widest">Available for new opportunities</p>
            </div>
            <span className="text-sm font-mono opacity-70 underline decoration-accent-teal">odanecollins@gmail.com</span>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-zinc-400">Full Name</label>
                <input 
                  {...register('fullName', { required: true })}
                  className="bg-zinc-800 dark:bg-zinc-200 border-none rounded-xl px-6 py-4 text-sm focus:ring-1 focus:ring-accent-teal outline-none"
                  placeholder="Your Name"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-zinc-400">Email address</label>
                <input 
                  {...register('email', { required: true })}
                  type="email" 
                  placeholder="Your email" 
                  className="bg-zinc-800 dark:bg-zinc-200 border-none rounded-xl px-6 py-4 text-sm focus:ring-1 focus:ring-accent-teal outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-zinc-400">Contact Number (Optional)</label>
                <input 
                  {...register('phone')}
                  type="tel"
                  className="bg-zinc-800 dark:bg-zinc-200 border-none rounded-xl px-6 py-4 text-sm focus:ring-1 focus:ring-accent-teal outline-none"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-zinc-400">Reason for reaching out</label>
                <select 
                  {...register('reason')}
                  className="bg-zinc-800 dark:bg-zinc-200 border-none rounded-xl px-6 py-4 text-sm focus:ring-1 focus:ring-accent-teal outline-none appearance-none"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Project Proposal">Project Proposal</option>
                  <option value="Collaboration">Collaboration</option>
                  <option value="Feedback">Feedback</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase font-bold text-zinc-400">Message</label>
              <textarea 
                {...register('message', { required: true })}
                rows={4}
                className="bg-zinc-800 dark:bg-zinc-200 border-none rounded-xl px-6 py-4 text-sm focus:ring-1 focus:ring-accent-teal outline-none resize-none"
                placeholder="How can I help you?"
              />
            </div>
            
            <button 
              type="submit"
              className="bg-accent-teal text-white w-full md:w-fit px-12 py-5 rounded-2xl text-sm font-bold hover:bg-opacity-90 transition-all flex items-center justify-center gap-3 uppercase tracking-widest mt-4 shadow-xl shadow-accent-teal/20"
            >
              Send Message <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
