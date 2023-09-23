
///Show rules
///Show player 1 and player 2 option
///For player show game id
///For player show existing games

import { Dispatch, SetStateAction, useState } from "react";
import Player1 from "./Player1";
import Player2 from "./Player2";
import { PlayerMetadata } from "../Main";
import CommonMenu from "./CommonMenu";


const Menu=({updateState}: {updateState:Dispatch<SetStateAction<PlayerMetadata >>})=>{
    
    return (
        <>
        {/* <Player1 updateState={updateState}/>
        <Player2 updateState={updateState}/> */}
        <CommonMenu updateState={updateState}/>
        </>
    )
}

export default Menu;