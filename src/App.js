import React, { useEffect, useState } from 'react';

const ws = new WebSocket('ws://localhost:5050');

const App = () => {
  const [gameState, setGameState] = useState(null);
  const [playerHand, setPlayerHand] = useState([]); 
  const [selectedCards, setSelectedCards] = useState([]); 

  useEffect(() => {
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'state') {
        setGameState(data.gameState);
        setPlayerHand(data.gameState.playerHand); 
      } else if (data.type === 'update') {
        setGameState(data.gameState); 
      }
    };

    ws.onopen = () => {
      const playerId = Math.random().toString(36).substr(2, 9); 
      ws.send(JSON.stringify({ type: 'join', playerId })); 
    };
  }, []);

  const getCardImage = (card) => {
    const { rank, suit } = card;

    const suitMapping = {
      H: 'H',
      C: 'C',
      D: 'D',
      S: 'S',
    };

    const suitLetter = suitMapping[suit];
    return require(`./assets/cards/${rank}${suitLetter}.svg`);
  };

  const handleCardClick = (card) => {
    if (selectedCards.includes(card)) {
      setSelectedCards(selectedCards.filter((c) => c !== card));
    } else if (selectedCards.length < 4) {
      setSelectedCards([...selectedCards, card]);
    }
  };

  const renderCard = (card, index) => {
    const isSelected = selectedCards.includes(card);
    return (
      <div
        key={index}
        style={{
          width: '100px',
          height: '150px',
          border: isSelected ? '3px solid red' : '1px solid black',
          display: 'inline-block',
          margin: '5px',
          backgroundColor: '#fff',
          textAlign: 'center',
          lineHeight: '150px',
          cursor: 'pointer',
        }}
        onClick={() => handleCardClick(card)}
      >
        <img
          src={getCardImage(card)}
          alt={`${card.rank} of ${card.suit}`}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    );
  };

  const handlePlay = () => {
    if (selectedCards.length > 0) {
      ws.send(JSON.stringify({ type: 'play', cards: selectedCards }));
      setPlayerHand(playerHand.filter((card) => !selectedCards.includes(card))); 
      setSelectedCards([]); 
    }
  };

  const renderTable = () => {
    return (
      <div className="table">
        <h2>Table</h2>
        <div>
          {gameState.table.map((card, index) => (
            <div
              key={index}
              style={{
                width: '80px',
                height: '120px',
                border: '1px solid black',
                display: 'inline-block',
                margin: '5px',
                backgroundColor: '#ddd',
                textAlign: 'center',
                lineHeight: '120px',
              }}
            >
              <img
                src={getCardImage(card)}
                alt={`${card.rank} of ${card.suit}`}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="game-container">
      <h1>Liar's Deck</h1>
      {gameState && (
        <>
          <h2>Your Hand</h2>
          <div className="hand">
            {playerHand.map((card, index) => renderCard(card, index))}
          </div>
          <div>
            <p>Selected Cards: {selectedCards.length} / 4</p>
            <button onClick={handlePlay} disabled={selectedCards.length === 0}>
              Play Selected Cards
            </button>
          </div>
          {renderTable()}
        </>
      )}
    </div>
  );
};

export default App;