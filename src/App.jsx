let pokemonPoolSize = 10;
const POKEMON_MAX_ID = 1026;

function updatePokemonPoolSize(newCount) {
  pokemonPoolSize = newCount;
}

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
                while (idCount < pokemonPoolSize) {
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

    return (
        <>
            <div id="scoreContainer">
                <p>Current Score: {scoreData.currentScore}</p>
                <p>High Score: {scoreData.highScore}</p>
                <button onClick={()=>{updateScoreState(-1)}}>Reset Scores</button>
            </div>
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
