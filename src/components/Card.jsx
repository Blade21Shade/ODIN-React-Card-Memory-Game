export default function Card({id, name, imageURL, handleClick}) {
    return(
        <div className = 'card' id = {id}>
            <button class='cardButton' onClick={()=>{handleClick(id)}}>
                <img class='cardImage' src={imageURL} alt={'Image of' + name}></img>
                <p class='cardText'>{name.charAt(0).toUpperCase() + name.slice(1)}</p>
            </button>
        </div>
    )
}