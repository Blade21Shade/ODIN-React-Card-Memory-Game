import { useState } from 'react'
import Card from './components/Card';

import './styles/App.css'

export default function App() {
  const [pokemonData, setPokemonData] = useState([]);
  /** Format of pokemonData objects
   * {
   *  id: id,
   *  name: name,
   *  image: image
   * }
   */

  /**
   * Logic for when a card is clicked
   * @param {Number} id The ID belonging to the pokemon belonging to the Card
   */
  function handleCardClick(id) {

  }

  return (
    <>
      <div id='cardContainer'>
        {pokemonData.map((pData)=>{
          <Card
            key={pData.id}
            id={pData.id}
            name={pData.name}
            image={pData.image}
            handleClick={handleCardClick}
            >
          </Card>
        })}
      </div>
    </>
  )
}
