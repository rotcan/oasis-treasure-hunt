import { Dispatch, SetStateAction, useState } from "react";
import { PlayerMetadata } from "../Main";
import { Button } from "@mui/material";
import { Player } from "../../../../utils/common";
import Rules from "../Game/Rules";

const CommonMenu=({updateState}: {updateState:Dispatch<SetStateAction<PlayerMetadata >>})=>{
    const [gameId,setGameId]=useState<string|undefined>();
    const startGameTxn=()=>{
        updateState({
                creator: true,
                currentPlayer: Player.Player1,
                gameIndex: undefined,
                init:true,
            })
      }
    
     
    
      const selectGame=(game: string)=>{
        if(!game || game==="-1")
        {
            alert("Please select a game to join!");
            return;
        }
        updateState({
            creator: true,
            currentPlayer: Player.Player1,
            gameIndex: game,
            init:true,
        })
      }
      
    return (
        <><div className="flexTable">
          <div className="flexTableItem">
            <Button onClick={()=>{startGameTxn()}}>Setup New Game</Button>
          </div>
          <div className="flexTableItem">
          <i>OR</i>
          </div>
          <div className="flexTableItem">
                <input value={gameId} onChange={(e)=>setGameId(e.target.value)} placeholder="Game Id"/>
                <Button onClick={(e)=>{gameId && selectGame(gameId)}} >Join Game</Button>
            </div>
            <div className="flexTableItem">
            <Rules />
            </div>
          </div>
        </>
      );
}

export default CommonMenu;