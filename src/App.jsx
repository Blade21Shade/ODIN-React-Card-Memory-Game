import { useState, useEffect } from "react";
import Card from "./components/Card";
import SettingsModal from "./components/SettingsModal";

import "./styles/App.css";

const POKEMON_MAX_ID = 1026;

async function fetchPokemonData(id) {
	let pokemon = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`);
	if (!pokemon.ok) {
		throw new Error(`'Response status: + ${pokemon.status}`);
	}

	let pokemonJson = await pokemon.json();
	let pokemonData = {
		id: id,
		name: pokemonJson.species.name,
		imageURL: pokemonJson.sprites.other['official-artwork'].front_default
	}

	return pokemonData;
}

export default function App() {
    const [gameSettings, setGameSettings] = useState({
        poolSize: 10
    });
    
    const [scoreData, setScoreData] = useState({highScore: 0, currentScore: 0});
    const [scoredIDs, setScoredIDs] = useState([]);
    
    const [getNewPokemon, setGetNewPokemon] = useState(true);
    const [loadingPokemon, setLoadingPokemon] = useState(true);

    const [pokemonData, setPokemonData] = useState([]);
    /** Format of pokemonData objects
     * {
     *  id: id,
     *  name: name,
     *  image: image
     * }
     */

    useEffect(() => {
        // This uses an async wrapper because getting the data from the API takes some time
        async function logicWrapper() {
            // Async so the .allSettled call finishes waiting before trying to save the pokemon to state
            if (getNewPokemon) {
                let idIncludedList = [];
                let idCount = 0;
                while (idCount < gameSettings.poolSize) {
                    let id = Math.floor(Math.random() * POKEMON_MAX_ID) + 1; // IDs start at 1, so +1
                    if (!idIncludedList.includes(id)) {
                        idCount++;
                        idIncludedList.push(id);
                    }
                }

                let fetchFromPokeAPI = [];
                for (let i = 0; i < idIncludedList.length; i++) {
                    fetchFromPokeAPI.push(fetchPokemonData(idIncludedList[i]));
                }
                const allPokemonData = await Promise.allSettled(fetchFromPokeAPI);

                let newPokemonData = [];
                for (let i = 0; i < allPokemonData.length; i++) {
                    let result = allPokemonData[i];
                    if (result.value) {
                        newPokemonData.push(result.value);
                    }
                }

                setPokemonData(newPokemonData);
                setGetNewPokemon(false);
                setLoadingPokemon(false);

                return () => {
                    setLoadingPokemon(true);
                };
            }
        }

        logicWrapper();
    }, [getNewPokemon]);

    /**
     * Logic for when a card is clicked
     * @param {Number} id The ID belonging to the pokemon belonging to the Card
     */
    function handleCardClick(id) {
        shuffleCards();
        updateScoreState(id);
    }

    function shuffleCards() {
        let toShuffle = [...pokemonData];

        for (let i = toShuffle.length - 1; i > 0; i--) { // Fisher-yates shuffle
            // Pick a random index from 0 to i
            const j = Math.floor(Math.random() * (i + 1));
            
            // Swap elements using array destructuring
            [toShuffle[i], toShuffle[j]] = [toShuffle[j], toShuffle[i]];
        }

        setPokemonData(toShuffle);
    }

    /**
     * Updates score state - Current and high score, and already scored IDs
     * @param {Number} id ID of pokemon to check if already scored OR -1 to completely reset score state
     */
    function updateScoreState(id) {
        let scoreInfo = {...scoreData};
        let newScoredIDs = [];

        // -1 resets all score data
        if (id === -1) {
            scoreInfo.currentScore = 0;
            scoreInfo.highScore = 0;
        } else {
            // If the ID was already Scored reset current score
            if (scoredIDs.includes(id)) {
                scoreInfo.currentScore = 0;
            } else {
                scoreInfo.currentScore += 1;
                if (scoreInfo.currentScore > scoreInfo.highScore) {
                    scoreInfo.highScore += 1;
                }
                newScoredIDs = [...scoredIDs];
                newScoredIDs.push(id);
            }
        }

        setScoreData(scoreInfo);
        setScoredIDs(newScoredIDs);
    }

    function resetGameScores() {
        setScoreData({highScore: 0, currentScore: 0});
    }

    function updateGameSettings(newSettings) {
        // This will only be written for poolSize for now since that's the only setting currently made

        let anyChanges = false;
        // Check each setting and update as needed
        let updatedSettings = structuredClone(gameSettings);
        let newSettingsKeys = Object.keys(newSettings);
        for (const key of newSettingsKeys) {
            let keyValue;
            switch(key) {
                case 'poolSize':
                    if (newSettings[key] === updatedSettings[key]) {
                        continue;
                    }

                    keyValue = newSettings[key];
                    if (!keyValue) { // This could be 0, but in this instance that would be a bad value, so the below message is fine
                        console.log(`Key '${key}' doesn't have a value, skipping`);
                        continue;
                    }

                    let keyType = typeof keyValue;
                    if (keyType !== 'number') {
                        console.log(`Key '${key}' must be type 'number' but is type '${keyType}', skipping`);
                        continue;
                    }

                    if (keyValue < 10) {
                        keyValue = 10;
                    } else if (keyValue > 1000) {
                        keyValue = 1000;
                    }
                    
                    anyChanges = true;
                    updatedSettings[key] = keyValue;
                    break;
                default:
                    console.log(`Invalid key given when updating user settings, skipping key: ${key}`);
                    break;
            }
        }

        if (anyChanges) {
            setGameSettings(updatedSettings);
            resetGameScores();
            setGetNewPokemon(true);
        }
    }

    return (
        <>
            <div id="scoreContainer">
                <p>Current Score: {scoreData.currentScore}</p>
                <p>High Score: {scoreData.highScore}</p>
                <button onClick={()=>{updateScoreState(-1)}}>Reset Scores</button>
            </div>
            <SettingsModal
                currentSettings={gameSettings}
                updateGameSettings={updateGameSettings}
            ></SettingsModal>
            <div id="cardContainer">
                {loadingPokemon === true ? (
                    <div>Loading Data</div>
                ) : (
                    pokemonData.map((pData) => (
                        <Card
                            key={pData.id}
                            id={pData.id}
                            name={pData.name}
                            imageURL={pData.imageURL}
                            handleClick={handleCardClick}
                        ></Card>
                    ))
                )}
            </div>
            <button
                onClick={() => {
                    setGetNewPokemon(true);
                    updateScoreState(-1);
                }}
            >
                Get New Pokemon
            </button>
        </>
    );
}
