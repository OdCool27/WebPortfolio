/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import {useEffect, useState} from 'react';
import {onAuthStateChanged, User} from 'firebase/auth';
import {auth} from './lib/firebase';
import Layout from './components/Layout';
import Home from './pages/Home';
import Projects from './pages/Projects';
import Blog from './pages/Blog';
import Admin from './pages/Admin';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-white dark:bg-zinc-950">
      <div className="h-8 w-8 border-2 border-accent-teal border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/admin" element={<Admin user={user} />} />
        </Routes>
      </Layout>
    </Router>
  );
}
