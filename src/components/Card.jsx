export default function Card({id, name, image, handleClick}) {
    return(
        <div className = 'card' id = {id}>
            <button onClick={handleClick(id)}>
                <img src={image} alt={'Image of' + name}></img>
                <p>{name}</p>
            </button>
        </div>
    )
}