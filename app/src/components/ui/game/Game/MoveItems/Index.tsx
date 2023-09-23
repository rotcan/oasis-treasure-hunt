import { Button } from "@mui/material";
import { MoveMetadata } from "../../../../../contract/data";
import MoveMetadataItem from "./MoveMetadataItem";

const MoveItems=({metadatas}:{metadatas: MoveMetadata[]})=>{
    return (
        <>
        {metadatas.filter(m=>m.is_valid).map((item,index)=>{
            return (
                <MoveMetadataItem key={index} index={index} metadata={item}/>
            )
        })}
        </>
    )
}

export default MoveItems;