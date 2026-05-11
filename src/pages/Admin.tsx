import React, {useState, useEffect} from 'react';
import {User, signInWithPopup, signInWithRedirect, signOut} from 'firebase/auth';
import {collection, getDocs, addDoc, updateDoc, deleteDoc, doc, writeBatch, serverTimestamp} from 'firebase/firestore';
import {auth, db, googleProvider, handleFirestoreError, OperationType} from '../lib/firebase';
import {normalizeProject, sortProjectsByRecency} from '../lib/projects';
import {motion} from 'motion/react';
import {Plus, Trash2, Edit2, LogOut, Save, X, Database} from 'lucide-react';

interface AdminProps {
  user: User | null;
}

const ADMIN_EMAIL = 'odanecollins@gmail.com';

export default function Admin({user}: AdminProps) {
  const [activeTab, setActiveTab] = useState<'skills' | 'projects' | 'blog'>('projects');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState<any>({});

  const isOdane = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    if (isOdane) {
      fetchItems();
    }
  }, [isOdane, activeTab]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const colName = activeTab === 'blog' ? 'blogPosts' : activeTab;
      const snapshot = await getDocs(collection(db, colName));
      const docs: any[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

      if (activeTab === 'skills') {
        setItems(docs.sort((a, b) => Number(b.level ?? 0) - Number(a.level ?? 0)));
        return;
      }

      if (activeTab === 'projects') {
        setItems(sortProjectsByRecency(docs.map(normalizeProject)));
        return;
      }

      setItems(docs.sort((a, b) => String(b.date ?? '').localeCompare(String(a.date ?? ''))));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error(error);
      const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';

      if (code === 'auth/popup-blocked' || code === 'auth/cancelled-popup-request') {
        await signInWithRedirect(auth, googleProvider);
        return;
      }

      if (code === 'auth/popup-closed-by-user') {
        setAuthError('The Google sign-in popup was closed before login completed. Please try again and finish the sign-in flow.');
        return;
      }

      if (code === 'auth/unauthorized-domain') {
        setAuthError('This site domain is not authorized in Firebase Authentication yet. Add your Netlify domain under Firebase Authentication > Settings > Authorized domains.');
        return;
      }

      if (code === 'auth/operation-not-allowed') {
        setAuthError('Google sign-in is not enabled for this Firebase project. Turn it on under Firebase Authentication > Sign-in method.');
        return;
      }

      setAuthError('Google sign-in failed. Check Firebase Authentication settings and the browser console for the exact error.');
    }
  };

  const handleLogout = () => signOut(auth);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const colName = activeTab === 'blog' ? 'blogPosts' : activeTab;
    try {
      const payload = activeTab === 'projects'
        ? {
            ...formData,
            images: Array.isArray(formData.images) ? formData.images.filter(Boolean) : [],
            tags: Array.isArray(formData.tags) ? formData.tags.filter(Boolean) : [],
            featuredOnHome: Boolean(formData.featuredOnHome),
            updatedAt: serverTimestamp(),
          }
        : {
            ...formData,
            updatedAt: serverTimestamp(),
          };

      if (activeTab === 'projects' && payload.featuredOnHome) {
        const batch = writeBatch(db);
        const projectsSnap = await getDocs(collection(db, 'projects'));

        projectsSnap.docs.forEach((projectDoc) => {
          if (projectDoc.id !== editingId && projectDoc.data().featuredOnHome) {
            batch.update(projectDoc.ref, {featuredOnHome: false, updatedAt: serverTimestamp()});
          }
        });

        if (editingId) {
          batch.update(doc(db, colName, editingId), payload);
        } else {
          const newRef = doc(collection(db, colName));
          batch.set(newRef, {...payload, createdAt: serverTimestamp()});
        }

        await batch.commit();
      } else if (editingId) {
        await updateDoc(doc(db, colName, editingId), payload);
      } else {
        await addDoc(collection(db, colName), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }

      setEditingId(null);
      setShowAddForm(false);
      setFormData({});
      await fetchItems();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, colName);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    setLoading(true);
    const colName = activeTab === 'blog' ? 'blogPosts' : activeTab;
    try {
      await deleteDoc(doc(db, colName, id));
      fetchItems();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, colName);
    } finally {
      setLoading(false);
    }
  };

  const seedData = async () => {
    if (!confirm('This will populate Firestore with initial data. Continue?')) return;
    setLoading(true);
    try {
      // Seed Skills
      const skills = [
        { name: 'HTML', level: 9 }, { name: 'CSS', level: 9 }, { name: 'JavaScript', level: 9 },
        { name: 'React', level: 8 }, { name: 'MySQL', level: 7 }, { name: 'Java', level: 8 },
        { name: 'Python', level: 7 }, { name: 'Spring', level: 7 }
      ];
      for (const s of skills) {
        await addDoc(collection(db, 'skills'), s);
      }

      // Seed Projects
      const projects = [
        { title: 'TechFlow', type: 'Website', businessName: 'TechFlow Solutions', description: 'TechFlow is a state-of-the-art e-commerce platform.', date: '2023-12-01', images: ['https://picsum.photos/seed/site1a/1200/800'], tags: ['React', 'Tailwind'] },
        { title: 'HealthTrack Pro', type: 'Application', description: 'A comprehensive health monitoring system.', date: '2024-03-01', images: ['https://picsum.photos/seed/health/800/600'], tags: ['React', 'Node.js'] }
      ];
      for (const p of projects) {
        await addDoc(collection(db, 'projects'), p);
      }

      alert('Data seeded successfully!');
      fetchItems();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="section-padding flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-3xl font-bold mb-8">Admin Portal</h2>
        <button 
          onClick={handleLogin}
          className="bg-accent-teal text-white px-10 py-4 rounded-xl font-bold hover:bg-opacity-90 transition-all flex items-center gap-3"
        >
          Login with Google
        </button>
        {authError && (
          <p className="mt-6 max-w-xl text-center text-sm text-red-500">
            {authError}
          </p>
        )}
      </div>
    );
  }

  if (!isOdane) {
    return (
      <div className="section-padding flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-3xl font-bold mb-4 text-red-500">Access Denied</h2>
        <p className="opacity-60 mb-8 text-center">You are logged in as <span className="font-bold">{user.email}</span>.<br />Only the primary owner can access this portal.</p>
        <button onClick={handleLogout} className="text-accent-teal font-bold uppercase tracking-widest text-xs flex items-center gap-2">
          Logout <LogOut size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="section-padding">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Control Center</h1>
          <p className="text-zinc-500 text-sm">Managing portfolio assets for {user.email}</p>
        </div>
        <div className="flex gap-4">
          <button onClick={seedData} className="flex items-center gap-2 text-[10px] font-bold uppercase border border-zinc-200 dark:border-zinc-800 px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
            <Database size={14} /> Seed Data
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 text-[10px] font-bold uppercase bg-red-500 text-white px-4 py-2 hover:bg-red-600 transition-colors">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-zinc-100 dark:border-zinc-800 mb-8">
        {(['projects', 'blog', 'skills'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setEditingId(null); setShowAddForm(false); }}
            className={`px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'border-b-2 border-accent-teal text-accent-teal' : 'text-zinc-400 hover:text-zinc-600'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold capitalize">{activeTab} List</h2>
        <button 
          onClick={() => { setShowAddForm(true); setEditingId(null); setFormData({}); }}
          className="bg-accent-teal text-white w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-accent-teal/20"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* List Items */}
      <div className="space-y-4">
        {loading && !items.length && <div className="text-center py-20 opacity-40 italic">Loading storage...</div>}
        
        {items.map((item) => (
          <div key={item.id} className="card-zinc p-6 flex justify-between items-center group">
            <div>
              <h3 className="font-bold text-lg">{item.title || item.name}</h3>
              <p className="text-xs text-zinc-500 mt-1 line-clamp-1">
                {item.description || item.excerpt || `Level: ${item.level}`}
                {item.featuredOnHome ? ' • Featured on home' : ''}
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => { setEditingId(item.id); setFormData(item); setShowAddForm(true); }}
                className="p-2 hover:text-accent-teal transition-colors"
              >
                <Edit2 size={18} />
              </button>
              <button 
                onClick={() => handleDelete(item.id)}
                className="p-2 hover:text-red-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal (Simple) */}
      {(showAddForm || editingId) && (
        <div className="fixed inset-0 z-[100] bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-6">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-zinc-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-10 relative shadow-2xl"
          >
            <button onClick={() => { setShowAddForm(false); setEditingId(null); }} className="absolute top-8 right-8 text-zinc-400 hover:text-white">
              <X size={24} />
            </button>
            
            <h2 className="text-2xl font-bold mb-8 uppercase tracking-tighter">
              {editingId ? 'Edit' : 'Add New'} {activeTab.slice(0, -1)}
            </h2>

            <form onSubmit={handleSave} className="space-y-6">
              {activeTab === 'skills' ? (
                <>
                  <Input label="Skill Name" field="name" value={formData.name} onChange={v => setFormData({...formData, name: v})} />
                  <Input label="Proficiency (1-10)" field="level" type="number" value={formData.level} onChange={v => setFormData({...formData, level: Number(v)})} />
                </>
              ) : activeTab === 'projects' ? (
                <>
                  <Input label="Project Title" field="title" value={formData.title} onChange={v => setFormData({...formData, title: v})} />
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase font-bold text-zinc-400">Type</label>
                    <select 
                      className="bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm outline-none w-full"
                      value={formData.type}
                      onChange={e => setFormData({...formData, type: e.target.value})}
                    >
                      <option value="Website">Website</option>
                      <option value="Application">Application</option>
                      <option value="Template">Template</option>
                      <option value="Mobile">Mobile</option>
                    </select>
                  </div>
                  <Input label="Business Name (Optional)" field="businessName" value={formData.businessName} onChange={v => setFormData({...formData, businessName: v})} />
                  <Input label="Project URL (Optional)" field="url" value={formData.url} onChange={v => setFormData({...formData, url: v})} />
                  <Input label="Logo URL" field="logoUrl" value={formData.logoUrl} onChange={v => setFormData({...formData, logoUrl: v})} />
                  <Input 
                    label="Image URLs (Comma separated)" 
                    field="images" 
                    value={formData.images?.join(', ')} 
                    onChange={v => setFormData({...formData, images: v.split(',').map(s => s.trim())})} 
                  />
                  <Input 
                    label="Tags (Comma separated)" 
                    field="tags" 
                    value={Array.isArray(formData.tags) ? formData.tags.join(', ') : ''} 
                    onChange={v => setFormData({...formData, tags: v.split(',').map(s => s.trim()).filter(Boolean)})} 
                  />
                  <Input label="Date" field="date" type="date" value={formData.date} onChange={v => setFormData({...formData, date: v})} />
                  <label className="flex items-center gap-3 rounded-xl bg-zinc-50 px-4 py-3 text-sm dark:bg-zinc-800">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.featuredOnHome)}
                      onChange={e => setFormData({...formData, featuredOnHome: e.target.checked})}
                      className="h-4 w-4"
                    />
                    <span>Feature this project on the home page</span>
                  </label>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase font-bold text-zinc-400">Description</label>
                    <textarea 
                      className="bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm outline-none w-full resize-none h-32"
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                </>
              ) : (
                <>
                  <Input label="Blog Title" field="title" value={formData.title} onChange={v => setFormData({...formData, title: v})} />
                  <Input label="Excerpt" field="excerpt" value={formData.excerpt} onChange={v => setFormData({...formData, excerpt: v})} />
                  <Input label="Category" field="category" value={formData.category} onChange={v => setFormData({...formData, category: v})} />
                  <Input label="Image URL" field="image" value={formData.image} onChange={v => setFormData({...formData, image: v})} />
                  <Input label="Date" field="date" type="date" value={formData.date} onChange={v => setFormData({...formData, date: v})} />
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase font-bold text-zinc-400">Content</label>
                    <textarea 
                      className="bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm outline-none w-full resize-none h-64"
                      value={formData.content}
                      onChange={e => setFormData({...formData, content: e.target.value})}
                    />
                  </div>
                </>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-accent-teal text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all"
              >
                {loading ? 'Processing...' : editingId ? 'Update Item' : 'Create Item'}
                {!loading && <Save size={16} />}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function Input({label, field, type='text', value, onChange}: {label: string, field: string, type?: string, value?: any, onChange: (v: string) => void}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] uppercase font-bold text-zinc-400" htmlFor={field}>{label}</label>
      <input 
        id={field}
        type={type}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        className="bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm outline-none w-full focus:ring-1 focus:ring-accent-teal transition-all"
      />
    </div>
  );
}
