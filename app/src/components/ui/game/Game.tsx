import { Button, IconButton } from "@mui/material";
import { useWeb3React } from "@web3-react/core";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { ContractEvents, GameMetadata, InitializeGameEventMetadata, JoinGameEventMetadata, MoveMetadata, PlayerMoveEndEventMetadata, PlayerMoveEventMetadata, UnassignedAddress, addInitGameEventListener, addJoinGameEventListener, addPlayerMoveEventEventListener, addPlayerMoveEventListener, addToStorage, calculateGridSquares, getMoveResult, getNumberValue, getPlayer2Pos, getPlayerType, getStatus, getStorageKey, isForfeitVisible, isGameSetup, isPlayer2Join } from "../../../contract/data";
import useMazeData from "../../../contract/useMazeData";
import { BidType, GameState, Player, getDateInNumber } from "../../../utils/common";
import '../../phaser/index';
import { EventBus, GameEvents, JoinGameArgs, SetPositionArgs } from "../../phaser/scenes/main";
import GameMetadataItem from "./Game/GameMetadataItem";
import { PlayerMetadata, defaultPlayerMetadata } from "./Main";
import PlayerJoin from "./Txn/PlayerJoin";
import PlayerMove from "./Txn/PlayerMove";
import StartGame from "./Txn/StartGame";
import BidDetails, { BidArgs } from "./Game/BidDetails";
import useSecretPosition from "../../../contract/useSecretPosition";
import EndGameTxn from "./Txn/EndGameTxn";
import ForfeitGameTxn from "./Txn/ForfeitGameTxn";
import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';


const Game=({playerMetadata,updateState}:
    {playerMetadata :PlayerMetadata,updateState:Dispatch<SetStateAction<PlayerMetadata >>})=>{
    const address=process.env.REACT_APP_CONTRACT_ADDRESS!;
    const endpoint=process.env.REACT_APP_RPC_ENDPOINT!;
    const [lastUpdateTimestamp,setLastUpdateTimestamp]=useState<number | undefined>();
    const {metadata}=useMazeData({endpoint,gameIndex: playerMetadata.gameIndex,lastUpdateTimestamp,
    creator: playerMetadata.creator, init: playerMetadata.init});
    const {secretPosition} = useSecretPosition({endpoint,gameIndex: playerMetadata.gameIndex,
        metadata: metadata?.gameMetadata});
    const { account } = useWeb3React();
    
    const startGameCallback = (data: InitializeGameEventMetadata) => {
        console.log("startGameCallback",data,account === data.creator);
        if (account === data.creator) {
            const key=getStorageKey(data.creator,true);
            addToStorage(key,data.gameIndex);
            setTimeout(()=>{
                updateState({
                    creator: true,
                    currentPlayer: Player.Player1,
                    gameIndex:  data.gameIndex.toString(),
                    init:true,
                })
                //@ts-ignore
                const sec=new Date()/1;
                console.log("joinGameCallback data update",data,sec);
                setLastUpdateTimestamp(sec)
            },15000);
        //   setGameList(localStorage.getItem(data.creator)?.split(",") ?? []);
            //@ts-ignore
            //const sec=new Date()/1;
            //console.log("startGameCallback data update",data,sec);
            //setLastUpdateTimestamp(sec)
        }
    };

    const joinGameCallback=(data: JoinGameEventMetadata)=>{
        console.log("joinGameCallback data",data,account,account===data.creator,account===data.player2);
        if(account===data.player2  || account===data.creator){
            const key=getStorageKey(data.creator,account===data.creator);
            addToStorage(key,data.gameIndex);
            setTimeout(()=>{
            const sec=getDateInNumber();
            console.log("joinGameCallback data update",data,sec);
            setLastUpdateTimestamp(sec)
            },5000);
        }
    }

    const playerMoveCallback=(data: PlayerMoveEventMetadata)=>{
        console.log("playerMoveCallback data",data,account,account===data.creator,account===data.player2);
        if(account===data.player2 || account===data.creator){
            setTimeout(()=>{
            const sec=getDateInNumber();
            console.log("playerMoveCallback data update",data,sec);
            setLastUpdateTimestamp(sec)
        },5000);
        }
    }

    const playerMoveEndCallback=(data: PlayerMoveEndEventMetadata)=>{
        console.log("playerMoveEndCallback data",data,account,account===data.creator,account===data.player2);
        if(account===data.player2  || account===data.creator){
            setTimeout(()=>{
            const sec=getDateInNumber();
            console.log("playerMoveEndCallback data update",data,sec);
            setLastUpdateTimestamp(sec)
        },5000);
        }
    }
      
    const backClick=()=>{
        EventBus.emit(GameEvents.ResetGrid,{});
        EventBus.emit(GameEvents.HideP1);
        updateState(current=>({
            ...current,
            ...defaultPlayerMetadata
        }))
    }

    const player2ActionJsx=()=>{
        
        if(!metadata || !playerMetadata.gameIndex || getStatus({metadata:metadata.gameMetadata})===GameState.End)
            return <></>
        if(!isGameSetup({metadata: metadata.gameMetadata}))
            return <></>
        if(isPlayer2Join({metadata: metadata.gameMetadata}) )
            return (<PlayerJoin gameIndex={playerMetadata.gameIndex}/>   )
        return (<PlayerMove gameIndex={playerMetadata.gameIndex}/>   )
    }


    const updateGrid=({movesMetadata}:{movesMetadata: MoveMetadata[]})=>{
        const moves=movesMetadata.filter(m=>m.is_valid);
        if( moves.length>0){
            let counter=0;
            EventBus.emit(GameEvents.ResetGrid,{});
            for(const move of moves){
                const newPos=move.to;
                const oldPos=move.from;
                const result=getMoveResult({metadata: move});
                const gc=calculateGridSquares({gridHeight: 8,gridWidth:8,newPoint: newPos,
                    oldPoint:oldPos,result:result,reset:counter===0 ? true: false});
                console.log("gc",gc);
                EventBus.emit(GameEvents.UpdateGrid,gc);
                counter++;
            }
           
        }
    }

    const resetGame=()=>{
        window.p1GridPos={x:1,y:1};
        window.p2GridPos={x:1,y:2};

        EventBus.emit(GameEvents.ResetGrid);
        EventBus.emit(GameEvents.Player1,window.p1GridPos.x,
            window.p1GridPos.y, 
            window.p2GridPos.x, 
            window.p2GridPos.y,
            GameState.Setup);
        console.log("Reset Game");
        
    }

    useMemo(()=>{
        
        console.log("adding listener");
        addInitGameEventListener(endpoint,address, ContractEvents.GameInitialize,startGameCallback);
        addJoinGameEventListener(endpoint, joinGameCallback);
        addPlayerMoveEventListener(endpoint, playerMoveCallback);
        addPlayerMoveEventEventListener(endpoint, playerMoveEndCallback);
        console.log("added listener");
        
    },[])

    useMemo(()=>{
        console.log("useMemo playerMetadata",playerMetadata,metadata);
        if(playerMetadata){
            //existing game
            if(playerMetadata.gameIndex)
                setLastUpdateTimestamp(getDateInNumber());
            //new game
            else if(playerMetadata.init){
                //Reset pos
                //No readonly
                resetGame();
            }
        }
    },[playerMetadata])

    useMemo(()=>{
        if(metadata){
            const currentPlayerMetadata=playerMetadata.init ? playerMetadata :
            {creator: metadata.gameMetadata.creator===account,
            currentPlayer: metadata.gameMetadata.creator===account? Player.Player1 : Player.Player2,
            gameIndex: playerMetadata.gameIndex,
            init: true
            } as PlayerMetadata;
            
            //Todo: Set p1 pos 
            window.p2GridPos={...getPlayer2Pos({metadata})};
            console.log("Update grid ",metadata.gameMetadata.last_move_timestamp,window.p2GridPos);
            
            EventBus.emit(GameEvents.Join, {creator:currentPlayerMetadata.creator} as JoinGameArgs);
            EventBus.emit(GameEvents.SetPosition,{player: Player.Player2 ,
                position:{x: window.p2GridPos.x,y:window.p2GridPos.y}} as SetPositionArgs);
            EventBus.emit(GameEvents.ShowPlayer,Player.Player2);
            
            if(playerMetadata.creator || !(getStatus({metadata:metadata.gameMetadata})===GameState.Init)){
                console.log("Make it readonly");
                EventBus.emit(GameEvents.ReadOnly);
            }
            //Hide p1 item for p2 
            //EventBus.emit(GameEvents.HideP1);
            console.log("currentPlayerMetadata",currentPlayerMetadata);
            updateGrid({movesMetadata: metadata.moveMetadatas});

            if(!playerMetadata.init)
            updateState(current=>({
                ...current,currentPlayerMetadata
            }))
            
        }
    },[metadata])

    useMemo(()=>{
        console.log("Memo call secretPositionMap",secretPosition);
        if(secretPosition && secretPosition.x>0){
            const position=secretPosition;
            console.log("Game secretPosition",position);
            const x=getNumberValue(position.x);
            const y=getNumberValue(position.y);
            EventBus.emit(GameEvents.SetPosition,{player: Player.Player1 ,
                position:{x,y}} as SetPositionArgs);
            EventBus.emit(GameEvents.ShowPlayer,Player.Player1);

        }
    },[secretPosition])

    
    useEffect(()=>{
        resetGame();
            
    },[]);

    return(
    <>
    <div className="flexTable">
        <div className="flexTableItem">
        {
            playerMetadata.creator && playerMetadata.init && playerMetadata.gameIndex===undefined
             && (<>
             <StartGame /></>)
        }
        {
            playerMetadata.init && metadata && (
                <GameMetadataItem data={metadata} player={getPlayerType({playerMetadata})}/>
            )
        }
        {
            //Show all moves
            playerMetadata.gameIndex && metadata && metadata.gameMetadata.creator!==account && (
                //Show join or move depending one state
                
                //Options to make move and submit them
                player2ActionJsx()
            )
        }
        {
            playerMetadata.gameIndex && metadata && getStatus({metadata: metadata.gameMetadata})===GameState.End
            && (<label>{metadata.gameMetadata.winner} is the winner!</label>)
        }
       
        </div>
        <div className="flexTableItem">
        {
            metadata && playerMetadata.gameIndex && isGameSetup({metadata: metadata?.gameMetadata}) 
            && getStatus({metadata: metadata.gameMetadata})===GameState.Init 
            && (<EndGameTxn gameIndex={playerMetadata.gameIndex}/>)
        }
        {
            playerMetadata.gameIndex && isForfeitVisible({metadata: metadata?.gameMetadata,
                currentAccount: account}) && (<ForfeitGameTxn gameIndex={playerMetadata.gameIndex}/>)
        }
        {
            playerMetadata.init && (<IconButton onClick={()=>{backClick();}}><ArrowCircleLeftIcon /></IconButton>)
        }
        </div>
        </div>
        <div id="game">
        
        </div>
        
    </>
    )
}

export default Game;