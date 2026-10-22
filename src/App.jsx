import { useState, useEffect, useRef } from "react";
import Card from "./components/Card";
import SettingsModal from "./components/SettingsModal";

import "./styles/App.css";

const POKEMON_MAX_ID = 1025;

async function fetchPokemonData(id) {
    let pokemon = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`);
    if (!pokemon.ok) {
        throw new Error(`'Response status: + ${pokemon.status}`);
    }

    let pokemonJson = await pokemon.json();
    let pokemonData = {
        id: id,
        name: pokemonJson.species.name,
        primaryType: pokemonJson.types[0].type.name,
        secondaryType: pokemonJson.types[1]?.type?.name ?? "none",
        imageURL: pokemonJson.sprites.other['official-artwork'].front_default
    };

    return pokemonData;
}

export default function App() {
    const [gameSettings, setGameSettings] = useState({
        poolSize: 10,
        primaryType: 'any',
        secondaryType: 'any'
    });
    
    // This is used by a div to avoid confusion for users when the number of Pokemon retrieved doesn't match the size they set
    const lessPokemonMatchSettingsThanPoolSize = useRef(null);

    const [scoreData, setScoreData] = useState({highScore: 0, currentScore: 0});
    const [scoredIDs, setScoredIDs] = useState([]);

    const [getNewPokemon, setGetNewPokemon] = useState(true);
    const [loadingPokemon, setLoadingPokemon] = useState(true);

    // Data format is defined in fetchPokemonData()
    const [pokemonData, setPokemonData] = useState([]);

    useEffect(() => {
        // This uses an async wrapper because getting the data from the API takes some time
        async function logicWrapper() {
            // Async so the .allSettled call finishes waiting before trying to save the pokemon to state
            if (getNewPokemon) {
                let processedIDs = [];
                let numberOfIDsToGenerate = 10;
                let numberOfPokemonSearched = 0;
                let validPokemonData = [];

                // Used to exit the search loop
                let poolFilled = false;
                let finalLoop = false; // True when less Pokemon exist with the primary and secondary type than the pool size

                while (poolFilled === false && finalLoop === false) {
                    // If the difference between max ID and pokemon searched is less than the number to generate, generateNewIDs would run forever
                    // This prevents that, and tells the loop not to attempt any more loops after this call
                    // This is usually only relevant when both primary and secondary type are defined, potentially searching the entire database of Pokemon
                    if (numberOfPokemonSearched > POKEMON_MAX_ID - numberOfIDsToGenerate) {
                        numberOfIDsToGenerate = POKEMON_MAX_ID - numberOfPokemonSearched;
                        finalLoop = true;
                    }

                    let newIDs = generateNewIDs(numberOfIDsToGenerate, processedIDs);
                    processedIDs.push(...newIDs);
                    numberOfPokemonSearched += numberOfIDsToGenerate;

                    let fetchFromPokeAPI = [];
                    for (const id of newIDs) {
                        fetchFromPokeAPI.push(fetchPokemonData(id));
                    }
                    const allPokemonData = await Promise.allSettled(fetchFromPokeAPI);

                    for (let i = 0; i < allPokemonData.length; i++) {
                        let pokeData = allPokemonData[i].value;

                        if (!pokeData) {
                            continue;
                        }

                        let validPrimaryType = true;
                        if (gameSettings.primaryType !== "any") {
                            validPrimaryType = typeCheck(pokeData.primaryType, "primaryType");
                        }

                        let validSecondaryType = true;
                        if (gameSettings.secondaryType === "none") {
                            validSecondaryType = pokeData.secondaryType === "none" ? true : false;
                        } else if (gameSettings.secondaryType !== "any") {
                            validSecondaryType = typeCheck(pokeData.secondaryType, "secondaryType");
                        }

                        if (validPrimaryType && validSecondaryType) {
                            validPokemonData.push(pokeData);

                            if (validPokemonData.length === gameSettings.poolSize) {
                                poolFilled = true;
                                break;
                            }
                        }
                    }
                }

                setPokemonData(validPokemonData);
                setGetNewPokemon(false);
                setLoadingPokemon(false);

                if (!poolFilled) {
                    updateLessMatchSettingsReference(false, validPokemonData.length);
                } else {
                    updateLessMatchSettingsReference(true, -1);
                }

                return () => {
                    setLoadingPokemon(true);
                };
            }
        }

        logicWrapper();
    }, [getNewPokemon]);

    function generateNewIDs(numToGenerate, alreadyProcessedIDs) {
        let newIDs = [];
        let idCount = 0;
        while (idCount < numToGenerate) {
            let id = Math.floor(Math.random() * POKEMON_MAX_ID) + 1; // IDs start at 1, so +1
            if (!alreadyProcessedIDs.includes(id) && !newIDs.includes(id)) {
                idCount++;
                newIDs.push(id);
            }
        }

        return newIDs;
    }

    function typeCheck(pokeType, primaryTypeOrSecondaryType) {
        return pokeType === gameSettings[primaryTypeOrSecondaryType];
    }

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
        let anyChanges = false;
        // Check each setting and update as needed
        let updatedSettings = structuredClone(gameSettings);
        let newSettingsKeys = Object.keys(newSettings);
        for (const key of newSettingsKeys) {
            let keyValue;
            let validKeyValue = true;

            switch (key) {
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
                    break;
                case 'primaryType':
                case 'secondaryType':
                    if (newSettings[key] === updatedSettings[key]) {
                        continue;
                    }
                    keyValue = newSettings[key];
                    break;
                default:
                    console.log(`Invalid key given when updating user settings, skipping key: ${key}`);
                    validKeyValue = false;
                    break;
            }

            if (validKeyValue) {
                anyChanges = true;
                updatedSettings[key] = keyValue;
            }
        }

        if (anyChanges) {
            setGameSettings(updatedSettings);
            getNewPokemonAndResetNecessarySettings();
        }
    }

    function updateLessMatchSettingsReference(shouldBeHidden, numberOfPokemonFound) {
        if (shouldBeHidden) {
            lessPokemonMatchSettingsThanPoolSize.current.hidden = true;
        } else {
            lessPokemonMatchSettingsThanPoolSize.current.hidden = false;
            lessPokemonMatchSettingsThanPoolSize.current.innerText = `Any pokemon with primary type '${gameSettings.primaryType}' and secondary type '${gameSettings.secondaryType}' found, but there aren't enough to fill the current pool size.
            Number found / Pool size: ${numberOfPokemonFound} / ${gameSettings.poolSize}`;
        }
    }

    function getNewPokemonAndResetNecessarySettings() {
        setGetNewPokemon(true);
        setLoadingPokemon(true);
        resetGameScores();
        updateLessMatchSettingsReference(true, -1);
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
            <div ref={lessPokemonMatchSettingsThanPoolSize}></div>
            <button onClick={() => {getNewPokemonAndResetNecessarySettings()}}>Get New Pokemon</button>

            <div id="cardContainer">
                {loadingPokemon === true ? <div>Fetching Pokemon</div> : 
                    pokemonData.map((pData) => (
                        <Card
                            key={pData.id}
                            id={pData.id}
                            name={pData.name}
                            imageURL={pData.imageURL}
                            handleClick={handleCardClick}
                        ></Card>
                    ))
                }
            </div>
        </>
    );
}
