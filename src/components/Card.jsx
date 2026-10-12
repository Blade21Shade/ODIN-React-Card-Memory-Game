export default function Card({id, name, imageURL, handleClick}) {
    return(
        <div className = 'card' id = {id}>
            <button onClick={handleClick(id)}>
                <img src={imageURL} alt={'Image of' + name}></img>
                <p>{name.charAt(0).toUpperCase() + name.slice(1)}</p>
            </button>
        </div>
    )
}