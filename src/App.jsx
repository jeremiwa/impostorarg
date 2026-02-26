import { useState, useEffect } from 'react';
import { User, UserPlus, Play, KeyRound, Skull, X, Check, Eye } from 'lucide-react';
import categoriesData from './data/categories.json';

const SCREENS = {
  SETUP: 'SETUP',
  CATEGORY: 'CATEGORY',
  REVEAL: 'REVEAL',
  DISCUSSION: 'DISCUSSION',
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState(SCREENS.SETUP);
  const [players, setPlayers] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');

  // Game State
  const [activeCategories, setActiveCategories] = useState([]);
  const [assignedRoles, setAssignedRoles] = useState([]);
  const [revealingPlayer, setRevealingPlayer] = useState(null);
  const [seenPlayers, setSeenPlayers] = useState([]);
  const [currentCategoryName, setCurrentCategoryName] = useState('');
  const [startingPlayer, setStartingPlayer] = useState('');
  const [numImpostors, setNumImpostors] = useState(1);
  const [votingResults, setVotingResults] = useState(null); // Will hold the final reveal info

  // Initialize all categories as active
  useEffect(() => {
    setActiveCategories(categoriesData.map(c => c.id));
  }, []);

  const toggleCategory = (id) => {
    setActiveCategories(prev =>
      prev.includes(id)
        ? prev.filter(catId => catId !== id)
        : [...prev, id]
    );
  };

  const addPlayer = (e) => {
    e.preventDefault();
    const name = newPlayerName.trim();
    if (name && !players.includes(name)) {
      setPlayers([...players, name]);
      setNewPlayerName('');
    }
  };

  const removePlayer = (name) => {
    setPlayers(players.filter(p => p !== name));
  };

  const goToCategories = () => {
    if (players.length >= 3) {
      setCurrentScreen(SCREENS.CATEGORY);
    } else {
      alert("¡Necesitan ser al menos 3 jugadores para armar bardo!");
    }
  };

  const startGame = () => {
    if (activeCategories.length === 0) {
      alert("¡Tenés que dejar al menos una categoría seleccionada!");
      return;
    }

    const safeNumImpostors = Math.max(1, Math.min(numImpostors, players.length - 1));

    // Pick a random category from the active ones
    const randomCatIndex = Math.floor(Math.random() * activeCategories.length);
    const selectedCatId = activeCategories[randomCatIndex];
    const category = categoriesData.find(c => c.id === selectedCatId);

    // Pick a random word and its clues array
    const randomItemIndex = Math.floor(Math.random() * category.items.length);
    const selectedItem = category.items[randomItemIndex];

    // Pick Impostors
    const shuffledPlayers = [...players].sort(() => 0.5 - Math.random());
    const impostorPlayers = shuffledPlayers.slice(0, safeNumImpostors);

    // Shuffle clues
    const shuffledClues = [...selectedItem.clues].sort(() => 0.5 - Math.random());

    let clueIndex = 0;
    const roles = players.map((player) => {
      const isImpostor = impostorPlayers.includes(player);
      let roleData = { playerName: player, isImpostor };
      if (isImpostor) {
        // give them a unique clue if available, else cycle avoiding out of bounds
        roleData.word = shuffledClues[clueIndex % shuffledClues.length];
        clueIndex++;
      } else {
        roleData.word = selectedItem.word;
      }
      return roleData;
    });

    setAssignedRoles(roles);
    setCurrentCategoryName(category.name);
    setStartingPlayer(players[Math.floor(Math.random() * players.length)]);
    setRevealingPlayer(null);
    setSeenPlayers([]);
    setCurrentScreen(SCREENS.REVEAL);
  };

  const resetGame = () => {
    setAssignedRoles([]);
    setCurrentCategoryName('');
    setStartingPlayer('');
    setRevealingPlayer(null);
    setSeenPlayers([]);
    setVotingResults(null);
    setCurrentScreen(SCREENS.SETUP);
  };

  return (
    <div className="app-container">
      {currentScreen === SCREENS.SETUP && (
        <div className="glass-panel fade-enter">
          <h1>El Impostor</h1>
          <p style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--text-secondary)' }}>
            Edición Argentina 🇦🇷
          </p>

          <form onSubmit={addPlayer} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Nombre del jugador..."
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              maxLength={15}
            />
            <button type="submit" className="btn-secondary" style={{ width: 'auto', padding: '0 20px' }}>
              <UserPlus size={20} />
            </button>
          </form>

          <div style={{ maxHeight: '30vh', overflowY: 'auto', paddingRight: '10px', marginBottom: '20px' }}>
            {players.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px 0' }}>
                Agregá a los pibes para arrancar
              </p>
            ) : (
              players.map(player => (
                <div key={player} className="player-item">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <User size={16} style={{ color: 'var(--accent-neon)' }} /> {player}
                  </span>
                  <button className="delete-btn" onClick={() => removePlayer(player)}>
                    <X size={20} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '20px', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '15px' }}>
            <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Impostores:</span>
            <button className="btn-secondary" style={{ width: '40px', padding: '5px' }} onClick={() => setNumImpostors(Math.max(1, numImpostors - 1))}>-</button>
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{numImpostors}</span>
            <button className="btn-secondary" style={{ width: '40px', padding: '5px' }} onClick={() => setNumImpostors(Math.min(Math.max(1, players.length - 1), numImpostors + 1))}>+</button>
          </div>

          <button
            className="btn-primary"
            onClick={goToCategories}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', opacity: players.length >= 3 ? 1 : 0.5 }}
          >
            Siguiente <Check size={20} />
          </button>
          {players.length > 0 && players.length < 3 && (
            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--accent-alt)', marginTop: '10px' }}>
              Faltan {3 - players.length} jugador(es)
            </p>
          )}
        </div>
      )}

      {currentScreen === SCREENS.CATEGORY && (
        <div className="glass-panel fade-enter">
          <h2 style={{ textAlign: 'center', color: 'var(--accent-neon)', marginBottom: '10px' }}>Categorías</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '15px' }}>
            Activá o desactivá las que quieras que salgan al azar.
          </p>

          <div className="category-grid" style={{ maxHeight: '50vh', overflowY: 'auto', paddingRight: '10px', paddingBottom: '10px' }}>
            {categoriesData.map(cat => {
              const isActive = activeCategories.includes(cat.id);
              return (
                <div
                  key={cat.id}
                  className={`category-card ${isActive ? 'active' : 'inactive'}`}
                  onClick={() => toggleCategory(cat.id)}
                  style={{
                    borderColor: isActive ? 'var(--accent-neon)' : 'var(--glass-border)',
                    opacity: isActive ? 1 : 0.5,
                    transform: isActive ? 'scale(1)' : 'scale(0.95)'
                  }}
                >
                  <span className="category-icon">{cat.icon}</span>
                  <span className="category-name">{cat.name}</span>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button className="btn-secondary" onClick={() => setCurrentScreen(SCREENS.SETUP)}>
              Atrás
            </button>
            <button className="btn-primary" onClick={startGame}>
              <Play size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '5px' }} /> ¡JUGAR!
            </button>
          </div>
        </div>
      )}

      {currentScreen === SCREENS.REVEAL && (
        <div className="glass-panel fade-enter" style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: '10px' }}>Tu Turno</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '15px', fontSize: '1.2rem' }}>
            Categoría: <strong style={{ color: 'var(--accent-alt)' }}>{currentCategoryName}</strong>
          </p>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.9rem' }}>
            Mantené apretado tu nombre para ver tu rol en secreto. Que nadie espíe 👀
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
            {assignedRoles.map((role) => {
              const isPressing = revealingPlayer === role.playerName;
              const hasSeen = seenPlayers.includes(role.playerName);

              return (
                <button
                  key={role.playerName}
                  className={`btn-${hasSeen && !isPressing ? 'secondary' : 'primary'}`}
                  style={{
                    padding: '10px',
                    fontSize: isPressing ? '1rem' : '1.3rem',
                    height: '110px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    opacity: hasSeen && !isPressing ? 0.7 : 1,
                    transition: 'all 0.2s ease',
                    wordBreak: 'break-word',
                  }}
                  onPointerDown={() => setRevealingPlayer(role.playerName)}
                  onPointerUp={() => {
                    setRevealingPlayer(null);
                    if (!seenPlayers.includes(role.playerName)) {
                      setSeenPlayers([...seenPlayers, role.playerName]);
                    }
                  }}
                  onPointerLeave={() => {
                    if (revealingPlayer === role.playerName) {
                      setRevealingPlayer(null);
                      if (!seenPlayers.includes(role.playerName)) {
                        setSeenPlayers([...seenPlayers, role.playerName]);
                      }
                    }
                  }}
                >
                  {isPressing ? (
                    <div className="fade-enter" style={{ pointerEvents: 'none' }}>
                      <span style={{ fontSize: '0.8rem', color: role.isImpostor ? 'var(--accent-alt)' : '#fff', marginBottom: '5px', display: 'block' }}>
                        {role.isImpostor ? 'Tu pista:' : 'Palabra:'}
                      </span>
                      <strong style={{ color: role.isImpostor ? 'var(--accent-alt)' : 'var(--accent-neon)', fontSize: '1.3rem', lineHeight: '1.1' }}>
                        {role.word}
                      </strong>
                    </div>
                  ) : (
                    <div style={{ pointerEvents: 'none' }}>
                      {hasSeen && <Check size={16} style={{ display: 'block', margin: '0 auto 5px', opacity: 0.5 }} />}
                      {role.playerName}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <button
            className="btn-primary"
            onClick={() => setCurrentScreen(SCREENS.DISCUSSION)}
            style={{ width: '100%', opacity: seenPlayers.length === players.length ? 1 : 0.5 }}
          >
            Todos listos <Play size={20} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '5px' }} />
          </button>
        </div>
      )}

      {currentScreen === SCREENS.DISCUSSION && (
        <div className="glass-panel fade-enter" style={{ textAlign: 'center' }}>
          <h1 style={{ color: 'var(--accent-alt)', marginBottom: '10px' }}>¡A CHAMUYAR!</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
            La categoría que tocó fue: <strong style={{ color: 'var(--accent-neon)' }}>{currentCategoryName}</strong>
          </p>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
            Cada jugador tira una palabra relacionada a su secreto sin decirlo directamente. ¡Atrapen al impostor!
          </p>

          <div style={{ background: 'linear-gradient(45deg, var(--accent-neon), var(--accent-alt))', padding: '15px', borderRadius: '15px', marginBottom: '20px', color: '#fff', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5)' }}>
            Empieza hablando: {startingPlayer}
          </div>

          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '15px', marginBottom: '30px' }}>
            <h3 style={{ marginBottom: '15px', color: 'var(--accent-neon)' }}>Jugadores Vivos</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
              {players.map(p => (
                <span key={p} style={{ background: 'var(--bg-secondary)', padding: '8px 15px', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
                  {p}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
            {!votingResults ? (
              <button className="btn-primary" onClick={() => {
                const impostors = assignedRoles.filter(r => r.isImpostor).map(r => r.playerName);
                const wordObj = assignedRoles.find(r => !r.isImpostor);
                setVotingResults({
                  impostors,
                  word: wordObj ? wordObj.word : '?'
                });
              }}>
                Revelar Impostores
              </button>
            ) : (
              <div className="fade-enter" style={{ background: 'rgba(0,0,0,0.5)', padding: '20px', borderRadius: '15px', border: '1px solid var(--accent-neon)', marginBottom: '20px' }}>
                <h2 style={{ color: 'var(--text-primary)', marginBottom: '10px' }}>¡Resultados!</h2>
                <p style={{ fontSize: '1.2rem', marginBottom: '5px', color: 'var(--text-secondary)' }}>La palabra secreta era:</p>
                <h3 style={{ fontSize: '2rem', color: 'var(--accent-neon)', marginBottom: '20px' }}>"{votingResults.word}"</h3>

                <p style={{ fontSize: '1.2rem', marginBottom: '5px', color: 'var(--text-secondary)' }}>
                  {votingResults.impostors.length > 1 ? 'Los impostores eran:' : 'El impostor era:'}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                  {votingResults.impostors.map(imp => (
                    <span key={imp} style={{ background: 'var(--accent-alt)', padding: '5px 15px', borderRadius: '15px', fontWeight: 'bold', color: '#fff' }}>
                      <Skull size={14} style={{ display: 'inline', marginRight: '5px' }} /> {imp}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button className="btn-secondary" onClick={() => { setVotingResults(null); resetGame(); }}>
              Terminar y armar otra
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
