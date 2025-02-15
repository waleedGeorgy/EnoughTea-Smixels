export default function Button(props){
    return(
    <div className="Chip-root makeStyles-chipBlue-108 Chip-clickable">
        <span onClick={props.clickHandle} className="form-Chip-label">{props.text}</span>
    </div>
    );
}