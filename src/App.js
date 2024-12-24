import React, { useEffect, useState } from 'react';

// WebSocket connection to the server
const ws = new WebSocket('ws://localhost:5050');

const App = () => {
  const [gameState, setGameState] = useState(null); // Game state including cards
  const [playerHand, setPlayerHand] = useState([]); // Player's hand of 13 cards
  const [selectedCards, setSelectedCards] = useState([]); // Selected cards for play

  useEffect(() => {
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'state') {
        setGameState(data.gameState);
        setPlayerHand(data.gameState.playerHand);  // Set the player's 13 cards
      }
    };

    // When the connection opens, send a 'join' message to the server
    ws.onopen = () => {
      const playerId = Math.random().toString(36).substr(2, 9); // Random player ID
      ws.send(
        JSON.stringify({ type: 'join', playerId }) // Send join request to the server
      );
    };
  }, []);

  // Function to map card data to the SVG path
  const getCardImage = (card) => {
    const { rank, suit } = card;

    // Map suit name to letter
    const suitMapping = {
      'H': 'H',
      'C': 'C',
      'D': 'D',
      'S': 'S'
    };

    // Construct the card file name: e.g., AH.svg, KC.svg, etc.
    const suitLetter = suitMapping[suit];
    return require(`./assets/cards/${rank}${suitLetter}.svg`); // Dynamically import the SVG
  };

  // Handle card selection
  const handleCardClick = (card) => {
    // If the card is already selected, remove it from the selection
    if (selectedCards.includes(card)) {
      setSelectedCards(selectedCards.filter(c => c !== card));
    } else {
      // Allow selection of up to 4 cards at a time
      if (selectedCards.length < 4) {
        setSelectedCards([...selectedCards, card]);
      }
    }
  };

  // Render each card in the player's hand
  const renderCard = (card, index) => {
    const isSelected = selectedCards.includes(card); // Check if the card is selected
    return (
      <div
        key={index}
        style={{
          width: '100px',
          height: '150px',
          border: isSelected ? '3px solid red' : '1px solid black', // Highlight selected card
          display: 'inline-block',
          margin: '5px',
          backgroundColor: '#fff',
          textAlign: 'center',
          lineHeight: '150px',
          cursor: 'pointer', // Change cursor to pointer on hover
        }}
        onClick={() => handleCardClick(card)} // Handle card click to select/unselect
      >
        <img src={getCardImage(card)} alt={`${card.rank} of ${card.suit}`} style={{ width: '100%', height: '100%' }} />
      </div>
    );
  };

  // Handle the play of selected cards
  const handlePlay = () => {
    if (selectedCards.length > 0) {
      // Send selected cards to the server (you can customize this to match the game logic)
      ws.send(JSON.stringify({ type: 'play', cards: selectedCards }));
      setSelectedCards([]); // Reset selected cards after play
    }
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
            {/* Display selected cards count */}
            <p>Selected Cards: {selectedCards.length} / 4</p>
            <button onClick={handlePlay} disabled={selectedCards.length === 0}>
              Play Selected Cards
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
