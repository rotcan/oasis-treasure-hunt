import { Result, ethers } from 'ethers';
import MazeContract from '../abi/Maze.json';
import { PlayerMetadata } from '../components/ui/game/Main';
import { BidType, GameState, MoveResult, Player } from '../utils/common';

export interface MazePoint{
    x: bigint;
    y: bigint;
}


export enum ColorType{
    Neutral, Correct , InCorrect
}

export interface GridColors{
    correct: number[];
    inCorrect: number[];
    reset:boolean,
}

export interface InitializeGameEventMetadata{
    creator: string;
    pos: MazePoint;
    gameIndex: string;
    moveTime: number;
    moveCounter: number;
}

export interface JoinGameEventMetadata{
    creator: string;
    player2: string;
    gameIndex: string;
}

export interface PlayerMoveEventMetadata{
    creator: string;
    player2: string;
    gameIndex: string;
    pos: MazePoint;
    moveResult: MoveResult;
}

export interface PlayerMoveEndEventMetadata{
    creator: string;
    player2: string;
    gameIndex: string;
    winner: string;
}



export interface GameMetadata{
    creator: string;
    current_move_counter: bigint;
    current_pos:MazePoint;
    last_move_timestamp: bigint;
    move_counter: bigint;
    move_time: bigint;
    player2: string;
    status: bigint;
    winner: string;
    bid_type: bigint;
    game_index: bigint;
}

export interface DepositMetadata{
    creator_deposit: bigint;
    player2_deposit: bigint;
}

export interface MoveMetadata{
    is_valid: boolean;
    from: MazePoint;
    to: MazePoint;
    timestamp: bigint;
    move_result: bigint;
}

export interface ContractMetadata{
    gameMetadata: GameMetadata;
    moveMetadatas: MoveMetadata[];
    depositMetadata: DepositMetadata;
    //secretPoint?: MazePoint;
}

export enum ContractEvents{
    GameInitialize="GameInitialize",
    GameJoin="GameJoin",
    PlayerMove="PlayerMove",
    PlayerMoveEnd="PlayerMoveEnd"
}

export const UnassignedAddress="0x0000000000000000000000000000000000000000";

const getContractObject=(endpoint: string): ethers.Contract=>{
    const address=process.env.REACT_APP_CONTRACT_ADDRESS!;
    const jsonRpc=new ethers.JsonRpcProvider(endpoint);
    // console.log("MazeContract",MazeContract);
    const mazeContract=new ethers.Contract(address,MazeContract.abi,jsonRpc);
    return mazeContract;
}


// const getContractIFace=(): ethers.Interface=>{
//     return new ethers.Interface(MazeContract.abi);
// }


export const readGameMetadata=async({endpoint,gameIndex,data,signature}:{endpoint: string, gameIndex:string,data?:string
signature?: string}):Promise<ContractMetadata>=>{
    const mazeContract=getContractObject(endpoint);
    const gData=recursivelyDecodeResult(await mazeContract._gameMetadatas(gameIndex)) as GameMetadata;
    const moveMetadatas=await readMoveData({endpoint,gameIndex,moveCounter: gData.current_move_counter.toString()});
    const depositMetadata= await readDepositData(endpoint,gameIndex);
    // const gameStatus=getStatus({metadata:gData});
    // if((data &&  signature) || (gameStatus===GameState.End)){
    //     const secretPoint=await readSecretPosition({data,endpoint, gameIndex,signature});
    //     return {gameMetadata: gData,moveMetadatas,depositMetadata,secretPoint};    
    // }
    return {gameMetadata: gData,moveMetadatas,depositMetadata};

}

export const readSecretPosition=async({data, endpoint, gameIndex,
signature}:{endpoint: string, gameIndex:string,
data?: string,signature?: string}):Promise<MazePoint>=>{
    const mazeContract=getContractObject(endpoint);
    //const response=await mazeContract.getHash(gameIndex,data);
    try{
        const point=recursivelyDecodeResult(await mazeContract.getSecretPosition(gameIndex,data ?? "",signature ?? ethers.encodeBytes32String(""))) as MazePoint;
        return point;
    }catch(e){
    }
    //console.log("response",recursivelyDecodeResult(response2));
    // const secretPoint=recursivelyDecodeResult(await mazeContract.getSecretPosition(gameIndex,data ?? "",
    // ethers.toUtf8Bytes(hash || ""),ethers.toUtf8Bytes(signature || ""))) as MazePoint;
    // return secretPoint;   
    return {x:ethers.toBigInt(0),y:ethers.toBigInt(0)};
}

export const readDepositData=async(endpoint: string, gameIndex:string):Promise<DepositMetadata>=>{
    const mazeContract=getContractObject(endpoint);
    const deposits=recursivelyDecodeResult(await mazeContract._deposits(gameIndex)) as DepositMetadata;
    return deposits;   
}

const readMoveData=async({endpoint,gameIndex,moveCounter}:{endpoint: string, gameIndex: string,moveCounter: string}):
Promise<MoveMetadata[]>=>{
    const mazeContract=getContractObject(endpoint);
    const mc=Math.max(0,ethers.toNumber(moveCounter)-1);
    const moveMetadata: MoveMetadata[]=[];
    for(var i=0;i<=mc;i++){
        moveMetadata.push(recursivelyDecodeResult(await mazeContract.getMoveData(ethers.toBigInt(gameIndex),i)) as MoveMetadata)
    }
    return moveMetadata;
}

export const addInitGameEventListener=async(endpoint: string,
    address: string,
    event: ContractEvents,
     callback: (args: InitializeGameEventMetadata)=>void)=>
{
    const mazeContract=getContractObject(endpoint);
    const existingListeners=await mazeContract.listeners(event.toString())
    //console.log("existingListeners start",existingListeners.length);
    if(existingListeners.length===0){
        mazeContract.on(event.toString(),(creator,pos,gameIndex,moveTime,moveCounter)=>{
            console.log("mazeContract",creator,pos,gameIndex,moveTime,moveCounter);
            console.log("mazeContract2",recursivelyDecodeResult(pos));
            callback({creator,gameIndex, moveCounter, moveTime ,pos:recursivelyDecodeResult(pos)});
        })
    }
    // console.log("existingListeners end",(await mazeContract.listeners(event.toString())).length);
}

export const addJoinGameEventListener=async(endpoint: string,
     callback: (args: JoinGameEventMetadata)=>void)=>
{
    const mazeContract=getContractObject(endpoint);
    const existingListeners=await mazeContract.listeners(ContractEvents.GameJoin.toString())
    // console.log("addJoinGameEventListener existingListeners start",existingListeners.length);
    if(existingListeners.length===0){
        mazeContract.on(ContractEvents.GameJoin.toString(),(creator,player2,gameIndex)=>{
            callback({creator, player2, gameIndex});
        })
    }
    // console.log("addJoinGameEventListener existingListeners end",(await mazeContract.listeners(ContractEvents.GameJoin.toString())).length);
}

export const addPlayerMoveEventListener=async(endpoint: string,
    callback: (args: PlayerMoveEventMetadata)=>void)=>
{
   const mazeContract=getContractObject(endpoint);
   const existingListeners=await mazeContract.listeners(ContractEvents.PlayerMove.toString())
    // console.log("addPlayerMoveEventListener existingListeners start",existingListeners.length);
   if(existingListeners.length===0){
       mazeContract.on(ContractEvents.PlayerMove.toString(),(creator,player2,gameIndex,pos,moveResult)=>{
           callback({creator, player2, gameIndex,pos: recursivelyDecodeResult(pos),
        moveResult: getNumberValue(recursivelyDecodeResult(moveResult)) as MoveResult});
       })
   }
    // console.log("addPlayerMoveEventListener existingListeners end",(await mazeContract.listeners(ContractEvents.PlayerMove.toString())).length);
}


export const addPlayerMoveEventEventListener=async(endpoint: string,
    callback: (args: PlayerMoveEndEventMetadata)=>void)=>
{
   const mazeContract=getContractObject(endpoint);
   const existingListeners=await mazeContract.listeners(ContractEvents.PlayerMoveEnd.toString())
//    console.log("existingListeners start",existingListeners.length);
   if(existingListeners.length===0){
       mazeContract.on(ContractEvents.PlayerMoveEnd.toString(),(creator,player2,gameIndex,winner)=>{
           callback({creator, player2, gameIndex,winner});
       })
   }
//    console.log("existingListeners end",(await mazeContract.listeners(ContractEvents.PlayerMoveEnd.toString())).length);
}

export const getTxnLogs=async({endpoint,txId}:{endpoint: string,txId: string})=>{
    const jsonRpc=new ethers.JsonRpcProvider(endpoint);
    const receipt=await jsonRpc.getTransactionReceipt(txId);
    console.log("receipt",receipt?.logs);
}

export const getNumberValue=(val: bigint):number=>{
    return ethers.toNumber(val);
}

export const getStatus=({metadata}:{metadata: GameMetadata}): GameState=>{
    const gameStatus:GameState=getNumberValue(metadata.status) as GameState;
    return gameStatus;
}

export const isGameSetup=({metadata}:{metadata: GameMetadata | undefined}):boolean=>{
    return metadata?.creator!==UnassignedAddress
}

export const getBidType=({metadata}:{metadata: GameMetadata}):BidType=>{
    const bidType:BidType=getNumberValue(metadata.bid_type) as BidType;
    return bidType;
}

export const getBidText=({metadata}:{metadata: GameMetadata})=>{
    switch(getBidType({metadata})){
        case BidType.Free: return "0x";
        case BidType.Half: return "0.5x";
        case BidType.Full: return "1x";
    }
}

export const getMoveResult=({metadata}:{metadata: MoveMetadata}): MoveResult=>{
    const moveResult:MoveResult=getNumberValue(metadata.move_result) as MoveResult;
    return moveResult;
}

export const getMoveCounterText=({metadata}:{metadata: GameMetadata})=>{
    const moveCounter=getNumberValue(metadata.move_counter);
    const currentMoveCounter=getNumberValue(metadata.current_move_counter);
    return currentMoveCounter+"/"+moveCounter;
}

export const getNextMoveTime=({metadata}:{metadata: GameMetadata}):Date=>{
    const val=getNumberValue(metadata.last_move_timestamp);
    if(ethers.toNumber(metadata.status)===GameState.Init){
        const moveTime=getNumberValue(metadata.move_time);
        return new Date((val+moveTime)*1000)
    }
    return new Date(val*1000);
}

export const getGameStatus=({metadata}:{metadata: GameMetadata}): string=>{
    const gameStatus=getStatus({metadata});
    switch(gameStatus){
        case GameState.Setup:
            return "Share: ";
        case GameState.Init:
            return "Game Started";
        case GameState.End:
            return "Game Ended";
    }
    return "";
}

export const getKeccakHash=({val}:{val:string})=>{
    return ethers.keccak256(ethers.toUtf8Bytes(val));
}

export const getTimeLabel=({metadata}:{metadata: GameMetadata}):string=>{
    const gameStatus:GameState=getNumberValue(metadata.status) as GameState;
    switch(gameStatus){
        case GameState.Setup:
            return "Setup Time";
        case GameState.Init:
            return "Next Move Timelimit";
        case GameState.End:
            return "End Time";
    }

}

const getPointText=(p: MazePoint)=>{
    return "{"+p.x+","+p.y+"}";
}

export const getPlayerType=({playerMetadata}:{playerMetadata: PlayerMetadata}):Player=>{
    if(playerMetadata.creator)
        return Player.Player1;
    return Player.Player2
}

export const getPlayer2Pos=({metadata}:{metadata: ContractMetadata}):{x:number,y:number}=>{
    const p= metadata.gameMetadata.current_pos;
    return {x:getNumberValue(p.x),y:getNumberValue(p.y)};
}

export const getMoveText=({metadata}:{metadata: MoveMetadata}):string=>{
    
    if(metadata.is_valid){
        const moveResult=getMoveResult({metadata});
        switch(moveResult){
            case MoveResult.Near:
                return `${getPointText(metadata.to)} is nearer to Target Location than ${getPointText(metadata.from)}`;
            case MoveResult.Exact:
                return `Congratulations ${getPointText(metadata.to)} is the Target Location`;
            case MoveResult.Far:
                return `${getPointText(metadata.to)} is farther from Target Location than ${getPointText(metadata.from)}`;
            case MoveResult.Same:
                return `${getPointText(metadata.from)} is at a same distance to Target Location as ${getPointText(metadata.to)}`;
                
                
        }    
        
    }
    return "Pending Move"
}

export const isPlayer2Join=({metadata}:{metadata: GameMetadata}):boolean=>{
    if(metadata.creator!==UnassignedAddress && getStatus({metadata})===GameState.Setup)
        return true;
    return false;
}

export const isForfeitVisible=({metadata,currentAccount}:{metadata?: GameMetadata,currentAccount: string | undefined}):boolean=>{
    if(metadata && currentAccount){
        if(getStatus({metadata})===GameState.Setup && metadata.creator===currentAccount)
            return true;
        if(getStatus({metadata})===GameState.Init)
            return true;
    }
    return false;
}

export const getStorageKey=(address: string,isCreator: boolean)=>{
    if(isCreator)
        return "creator~"+address;
    return "player2~"+address;
}

export const getStorageData=(key: string,defValue: string):string=>{
    const data=localStorage.getItem(key) ?? defValue;
    const set: Set<string> = new Set<string>();
    data.split(",").map(m=>set.add(m));
    return Array.from(set.values()).join(",");
}

export const addToStorage=(key:string, value: string)=>{
    const existingValues = localStorage.getItem(key);
    const set: Set<string> = new Set<string>();
    set.add(value);
    if (existingValues) {
        existingValues.split(",").map((m) => set.add(m));
    }
    localStorage.setItem(key, Array.from(set.values()).join(","));
}



export const testCalculateGridSquares=({gridHeight,gridWidth,newPoint,oldPoint,oldGrid,correctPoint}:
    {gridWidth:number,gridHeight: number,oldPoint: MazePoint,newPoint: MazePoint,
correctPoint: MazePoint,oldGrid?: GridColors})=>{
    const d1=getPointDistance({p1:correctPoint,p2: newPoint});
    const d2=getPointDistance({p1:correctPoint,p2: oldPoint});
    const result=d1===ethers.toBigInt(0) ? MoveResult.Exact :
     d1===d2? MoveResult.Same : d1>d2 ? MoveResult.Far : MoveResult.Near
     console.log("newPoint ",newPoint,d1,"oldPoint",oldPoint,d2,"result",result);
     return calculateGridSquares({gridHeight,gridWidth,newPoint,oldPoint,result,oldGrid,reset:true});
}
export const calculateGridSquares=({gridHeight,gridWidth,newPoint,oldPoint,result,oldGrid,reset}:
    {gridWidth:number,gridHeight: number,oldPoint: MazePoint,newPoint: MazePoint,
result: MoveResult,oldGrid?: GridColors,reset:boolean})=>{
    const gridColors: GridColors={correct: [],inCorrect:[],reset:reset} as GridColors;
    for(var i=0;i<gridHeight;i++){
        for(var j=0;j<gridWidth;j++){
            const index=i*gridWidth+j;
            const gridPoint={x:ethers.toBigInt(i+1),y:ethers.toBigInt(j+1)} as MazePoint;
            const newDistance=getPointDistance({p1:gridPoint,p2:newPoint});
            const oldDistance=getPointDistance({p1:gridPoint,p2:oldPoint});
            const isCorrect=(!oldGrid || oldGrid.correct.indexOf(index)) && isCorrectGrid({newDistance,oldDistance,result});
            isCorrect ? gridColors.correct.push(index) : gridColors.inCorrect.push(index)

        }
    }
    return gridColors;
}

const getPointDistance=({p1,p2}:{p1: MazePoint,p2:MazePoint})=>{
    return (p1.x-p2.x)*(p1.x-p2.x)+(p1.y-p2.y)*(p1.y-p2.y);
}

const checkIfEqualToNumber=(val: bigint | number, val2: number)=>{
    if(typeof val=== 'bigint')
        return ethers.toNumber(val)===val2;
    return val===val2;
}

const isCorrectGrid=({newDistance,oldDistance,result}:{newDistance: number | bigint,oldDistance: number | bigint, result: MoveResult}):
boolean=>{
    switch(result){
        case MoveResult.Exact:
            if(checkIfEqualToNumber(newDistance,0)) return true;
            break;
        case MoveResult.Same:
            if(newDistance===oldDistance) return true;
            break;
        case MoveResult.Far:
            if(newDistance>oldDistance) return true;
            break;
        case MoveResult.Near:
            if(newDistance<oldDistance) return true;
            break;
    }
    return false;
}

const recursivelyDecodeResult = (result: Result): any => {
    if (typeof result !== 'object') {
      // Raw primitive value
      return result;
    }
    try {
      const obj = result.toObject();
      if (obj._) {
        throw new Error('Decode as array, not object');
      }
      Object.keys(obj).forEach((key) => {
        obj[key] = recursivelyDecodeResult(obj[key]);
      });
      return obj;
    } catch (err) {
      // Result is array.
      return result
        .toArray()
        .map((item) => recursivelyDecodeResult(item as Result));
    }
};
