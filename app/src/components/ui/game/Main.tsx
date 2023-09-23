import { useEffect, useState } from "react";
import { Player } from "../../../utils/common";
import Menu from "./Menu";
import Game from "./Game";
import { useWeb3React } from "@web3-react/core";
import { EventBus, GameEvents } from "../../phaser/scenes/main";
import { useSearchParams } from "react-router-dom";
import Loading from "./Loading";

export interface PlayerMetadata {
  currentPlayer: Player ;
  gameIndex: string | undefined;
  creator: boolean;
  init:boolean;
}

export const defaultPlayerMetadata={creator: false,
currentPlayer: Player.Player1,gameIndex:undefined,init:false} as PlayerMetadata;

const Main = () => {
  const [playerMetadata, setPlayerMetadata] = useState<
    PlayerMetadata>(defaultPlayerMetadata);
  const {account}=useWeb3React();
  const [queryParams,setQueryParams]=useSearchParams()
  
  useEffect(()=>{
    if(queryParams && queryParams.get("gameId")){
      //console.log("qp", queryParams.get("gameId"));
      setPlayerMetadata(current=>({
        ...current,gameIndex: queryParams.get("gameId")!, init: true
      }))
    }
  },[queryParams])
  return (
    <>
    <Loading />
    {!account && <label>Waiting for user to connect to wallet</label>}
      {account && !playerMetadata.init && <Menu updateState={setPlayerMetadata}/>}
      {account && playerMetadata.init && <Game playerMetadata={playerMetadata} updateState={setPlayerMetadata}/>}
    </>
  );
};

export default Main;
