import { Button } from "@mui/material";
import { useWeb3React } from "@web3-react/core";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { getStorageData, getStorageKey } from "../../../../contract/data";
import { Player } from "../../../../utils/common";
import { PlayerMetadata } from "../Main";
import ExistingGamesList from "./ExistingGamesList";

const Player1 = ({updateState}: {updateState:Dispatch<SetStateAction<PlayerMetadata >>}) => {
  const [gameList, setGameList] = useState<string[]>([]);
  const { account } = useWeb3React();
  const [bidAmount, setBidAmount]=useState<string>();

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
    <>
      <div>
        <Button onClick={()=>{startGameTxn()}}>Start New Game</Button>
      </div>
      <ExistingGamesList list={gameList} selectGame={selectGame}/>
    </>
  );
};

export default Player1;
