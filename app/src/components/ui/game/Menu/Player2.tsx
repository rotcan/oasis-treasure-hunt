import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { PlayerMetadata } from "../Main";
import { Player } from "../../../../utils/common";
import { Button } from "@mui/material";
import { useWeb3React } from "@web3-react/core";
import { getStorageData, getStorageKey } from "../../../../contract/data";
import ExistingGamesList from "./ExistingGamesList";

const Player2=({updateState}: {updateState:Dispatch<SetStateAction<PlayerMetadata >>})=>{
    const [gameIndex,setGameIndex]=useState<string|undefined>();
    const [gameList, setGameList] = useState<string[]>([]);
    const { account } = useWeb3React();
  
    useMemo(()=>{
        if(account){
          //test
          const existingGames = getStorageData(getStorageKey(account,true),"0,1,2,3");
          
          console.log("existingGames",existingGames);
          if(existingGames){
              setGameList(existingGames.split(","));
          }
        }
      },[account])
    
    const onGameSelect=(index: string)=>{
        updateState({
            creator: false,
            currentPlayer: Player.Player2,
            gameIndex: index,
            init:true,
        })
    }
    return (<>
        
        <input onChange={(e)=>{setGameIndex(e.target.value)}}/>
        <Button onClick={()=>{gameIndex && onGameSelect(gameIndex);}}>Join Game</Button>
        <ExistingGamesList list={gameList} selectGame={onGameSelect}/>
        </>
    )
}

export default Player2;