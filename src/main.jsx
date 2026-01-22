import React, { useState, useEffect, createContext, useContext } from 'react';
import { Users, Trophy, Pyramid, User, Settings, Plus, Edit2, Trash2, Save, X, LogIn, LogOut, Calendar, TrendingUp } from 'lucide-react';

// Firebase würde hier importiert werden
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';

// Firebase Config - HIER DEINE CONFIG EINTRAGEN
const firebaseConfig = {
  apiKey: "AIzaSyArdTajlSvaUqWh4-LFrhJXOKukn9iecZs",
  authDomain: "cfbgtvereinsmeisterschaft.firebaseapp.com",
  projectId: "cfbgtvereinsmeisterschaft",
  storageBucket: "cfbgtvereinsmeisterschaft.firebasestorage.app",
  messagingSenderId: "527308111102",
  appId: "1:527308111102:web:ef1b52153dd75a6a0c79af",
  measurementId: "G-QKGNPLQN20"
};

// Simulated Firebase (für Demo - wird durch echtes Firebase ersetzt)
const SimulatedFirebase = {
  data: {
    players: [],
    singlesMatches: [],
    doublesMatches: [],
    pyramid: [],
    challenges: [],
    config: { singlesPhase: 'group', groups: { A: [], B: [] } }
  },
  listeners: [],
  
  collection: (name) => ({
    onSnapshot: (callback) => {
      const id = Math.random();
      SimulatedFirebase.listeners.push({ id, name, callback });
      callback(SimulatedFirebase.data[name] || []);
      return () => {
        SimulatedFirebase.listeners = SimulatedFirebase.listeners.filter(l => l.id !== id);
      };
    },
    addDoc: async (data) => {
      const newDoc = { ...data, id: Date.now().toString() };
      SimulatedFirebase.data[name] = [...(SimulatedFirebase.data[name] || []), newDoc];
      SimulatedFirebase.notifyListeners(name);
      return { id: newDoc.id };
    },
    updateDoc: async (id, data) => {
      SimulatedFirebase.data[name] = (SimulatedFirebase.data[name] || []).map(item =>
        item.id === id ? { ...item, ...data } : item
      );
      SimulatedFirebase.notifyListeners(name);
    },
    deleteDoc: async (id) => {
      SimulatedFirebase.data[name] = (SimulatedFirebase.data[name] || []).filter(item => item.id !== id);
      SimulatedFirebase.notifyListeners(name);
    }
  }),
  
  notifyListeners: (name) => {
    SimulatedFirebase.listeners
      .filter(l => l.name === name)
      .forEach(l => l.callback(SimulatedFirebase.data[name] || []));
  }
};

// Auth Context
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  
  const login = async (email, password) => {
    // Simulated login - wird durch Firebase Auth ersetzt
    if (password === 'admin123') {
      setUser({ email, isAdmin: true });
      return true;
    }
    return false;
  };
  
  const logout = () => setUser(null);
  
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

// Main App Component
const TournamentApp = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
        
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {currentPage === 'home' && <HomePage setCurrentPage={setCurrentPage} />}
          {currentPage === 'singles' && <SinglesTournament />}
          {currentPage === 'doubles' && <DoublesTournament />}
          {currentPage === 'admin' && <AdminPanel />}
          {currentPage === 'player' && selectedPlayer && (
            <PlayerProfile playerId={selectedPlayer} onBack={() => setCurrentPage('home')} />
          )}
        </div>
      </div>
    </AuthProvider>
  );
};

// Navigation Component
const Navigation = ({ currentPage, setCurrentPage }) => {
  const { user, logout } = useAuth();
  
  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-indigo-600">🏸 Vereinsmeisterschaft</h1>
            
            <div className="flex space-x-4">
              <NavButton 
                icon={<Trophy size={18} />} 
                label="Einzel" 
                active={currentPage === 'singles'}
                onClick={() => setCurrentPage('singles')}
              />
              <NavButton 
                icon={<Pyramid size={18} />} 
                label="Doppel" 
                active={currentPage === 'doubles'}
                onClick={() => setCurrentPage('doubles')}
              />
              <NavButton 
                icon={<Users size={18} />} 
                label="Spieler" 
                active={currentPage === 'players'}
                onClick={() => setCurrentPage('players')}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {user?.isAdmin && (
              <NavButton 
                icon={<Settings size={18} />} 
                label="Admin" 
                active={currentPage === 'admin'}
                onClick={() => setCurrentPage('admin')}
              />
            )}
            {user ? (
              <button onClick={logout} className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg">
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            ) : (
              <button onClick={() => setCurrentPage('admin')} className="flex items-center space-x-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg">
                <LogIn size={18} />
                <span>Admin Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavButton = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
      active ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-100'
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);

// Home Page
const HomePage = ({ setCurrentPage }) => {
  const [players, setPlayers] = useState([]);
  
  useEffect(() => {
    const unsubscribe = SimulatedFirebase.collection('players').onSnapshot(setPlayers);
    return unsubscribe;
  }, []);
  
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">Willkommen zur Vereinsmeisterschaft</h2>
        <p className="text-xl text-gray-600">Aktuell {players.length} registrierte Spieler</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <TournamentCard
          title="Einzel-Turnier"
          description="Gruppenphasen mit anschließendem K.O.-System"
          icon={<Trophy className="text-yellow-500" size={48} />}
          onClick={() => setCurrentPage('singles')}
        />
        <TournamentCard
          title="Doppel-Pyramide"
          description="Herausforderungs-System mit dynamischer Rangfolge"
          icon={<Pyramid className="text-blue-500" size={48} />}
          onClick={() => setCurrentPage('doubles')}
        />
      </div>
      
      <RecentMatches />
    </div>
  );
};

const TournamentCard = ({ title, description, icon, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-white rounded-xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-shadow"
  >
    <div className="flex items-center space-x-4 mb-4">
      {icon}
      <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
    </div>
    <p className="text-gray-600">{description}</p>
  </div>
);

const RecentMatches = () => {
  const [matches, setMatches] = useState([]);
  
  useEffect(() => {
    const unsubscribe = SimulatedFirebase.collection('singlesMatches').onSnapshot(data => {
      setMatches(data.slice(-5).reverse());
    });
    return unsubscribe;
  }, []);
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Letzte Ergebnisse</h3>
      {matches.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Noch keine Spiele eingetragen</p>
      ) : (
        <div className="space-y-3">
          {matches.map(match => (
            <div key={match.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">{match.player1} vs {match.player2}</span>
              <span className="text-indigo-600 font-bold">{match.score}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Singles Tournament Component
const SinglesTournament = () => {
  const [phase, setPhase] = useState('group');
  const [groups, setGroups] = useState({ A: [], B: [] });
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Einzel-Turnier</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setPhase('group')}
              className={`px-4 py-2 rounded-lg ${phase === 'group' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
            >
              Gruppenphase
            </button>
            <button
              onClick={() => setPhase('ko')}
              className={`px-4 py-2 rounded-lg ${phase === 'ko' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
            >
              K.O.-Runde
            </button>
          </div>
        </div>
        
        {phase === 'group' ? (
          <GroupStage groups={groups} />
        ) : (
          <KnockoutStage />
        )}
      </div>
    </div>
  );
};

const GroupStage = ({ groups }) => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <GroupTable groupName="A" players={groups.A} />
      <GroupTable groupName="B" players={groups.B} />
    </div>
  );
};

const GroupTable = ({ groupName, players }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Gruppe {groupName}</h3>
      <table className="w-full">
        <thead>
          <tr className="text-left text-sm text-gray-600 border-b">
            <th className="pb-2">Platz</th>
            <th className="pb-2">Spieler</th>
            <th className="pb-2">Pkt</th>
            <th className="pb-2">Sätze</th>
          </tr>
        </thead>
        <tbody>
          {players.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center py-4 text-gray-500">Gruppe noch nicht eingeteilt</td>
            </tr>
          ) : (
            players.map((player, idx) => (
              <tr key={idx} className="border-b border-gray-200">
                <td className="py-2 font-bold">{idx + 1}</td>
                <td className="py-2">{player.name}</td>
                <td className="py-2">{player.points || 0}</td>
                <td className="py-2">{player.sets || '0:0'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

const KnockoutStage = () => {
  return (
    <div className="text-center py-12">
      <Trophy size={64} className="mx-auto text-yellow-500 mb-4" />
      <h3 className="text-2xl font-bold text-gray-800 mb-2">K.O.-Runde</h3>
      <p className="text-gray-600">Wird verfügbar nach Abschluss der Gruppenphase</p>
    </div>
  );
};

// Doubles Tournament Component
const DoublesTournament = () => {
  const [pyramid, setPyramid] = useState([]);
  const [challenges, setChallenges] = useState([]);
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Doppel-Pyramide</h2>
        
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3">Aktuelle Rangfolge</h3>
          <PyramidView pyramid={pyramid} />
        </div>
        
        <div>
          <h3 className="text-xl font-semibold mb-3">Anstehende Herausforderungen</h3>
          <ChallengeList challenges={challenges} />
        </div>
      </div>
    </div>
  );
};

const PyramidView = ({ pyramid }) => {
  if (pyramid.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <Pyramid size={64} className="mx-auto text-blue-500 mb-4" />
        <p className="text-gray-600">Pyramide noch nicht initialisiert</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      {pyramid.map((player, idx) => (
        <div 
          key={idx}
          className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-l-4 border-yellow-500"
          style={{ marginLeft: `${idx * 20}px` }}
        >
          <div className="flex items-center space-x-3">
            <span className="font-bold text-lg text-gray-700">#{idx + 1}</span>
            <span className="font-medium">{player.name}</span>
          </div>
          <span className="text-sm text-gray-500">{player.wins || 0} Siege</span>
        </div>
      ))}
    </div>
  );
};

const ChallengeList = ({ challenges }) => {
  if (challenges.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <Calendar size={48} className="mx-auto text-gray-400 mb-2" />
        <p className="text-gray-500">Keine anstehenden Herausforderungen</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {challenges.map((challenge, idx) => (
        <div key={idx} className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <span className="font-medium">{challenge.challenger} fordert {challenge.challenged} heraus</span>
            <span className="text-sm text-gray-500">Offen</span>
          </div>
        </div>
      ))}
    </div>
  );
};

// Admin Panel Component
const AdminPanel = () => {
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const handleLogin = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (!success) {
      setError('Ungültige Anmeldedaten');
    }
  };
  
  if (!user) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="admin@verein.de"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Passwort</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Passwort (Demo: admin123)"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Anmelden
            </button>
          </form>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Admin-Panel</h2>
        <PlayerManagement />
      </div>
    </div>
  );
};

const PlayerManagement = () => {
  const [players, setPlayers] = useState([]);
  const [newPlayer, setNewPlayer] = useState({ name: '', email: '' });
  const [editingId, setEditingId] = useState(null);
  
  useEffect(() => {
    const unsubscribe = SimulatedFirebase.collection('players').onSnapshot(setPlayers);
    return unsubscribe;
  }, []);
  
  const addPlayer = async () => {
    if (newPlayer.name.trim()) {
      await SimulatedFirebase.collection('players').addDoc({
        ...newPlayer,
        createdAt: new Date().toISOString()
      });
      setNewPlayer({ name: '', email: '' });
    }
  };
  
  const deletePlayer = async (id) => {
    if (confirm('Spieler wirklich löschen?')) {
      await SimulatedFirebase.collection('players').deleteDoc(id);
    }
  };
  
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Spielerverwaltung</h3>
      
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex space-x-3">
          <input
            type="text"
            placeholder="Name"
            value={newPlayer.name}
            onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="email"
            placeholder="Email (optional)"
            value={newPlayer.email}
            onChange={(e) => setNewPlayer({ ...newPlayer, email: e.target.value })}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
          />
          <button
            onClick={addPlayer}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Hinzufügen</span>
          </button>
        </div>
      </div>
      
      <div className="space-y-2">
        {players.map(player => (
          <div key={player.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
            <div>
              <span className="font-medium">{player.name}</span>
              {player.email && <span className="text-sm text-gray-500 ml-3">{player.email}</span>}
            </div>
            <div className="flex space-x-2">
              <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                <Edit2 size={18} />
              </button>
              <button 
                onClick={() => deletePlayer(player.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Player Profile Component
const PlayerProfile = ({ playerId, onBack }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <button onClick={onBack} className="mb-4 text-indigo-600 hover:underline">← Zurück</button>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Spieler-Profil</h2>
      <p className="text-gray-600">Spieler-Details werden hier angezeigt...</p>
    </div>
  );
};

export default TournamentApp;