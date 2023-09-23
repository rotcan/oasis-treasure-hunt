import { ethers} from 'ethers'
import MazeContract from '../abi/Maze.json';
import { MazePoint } from './data';
import { BidType } from '../utils/common';


export interface GameInitializeArgs{
    p1pos: {x:number;y:number};
    p2pos: {x:number;y:number};
    moveCount: number;
    moveTimeout: number;
    bidType:BidType;
}

export interface PlayerMoveArgs{
    gameIndex: string;
    p2pos: {x: number;y:number};
}

export const getInitTxnEncodedData=async({args}:{args: GameInitializeArgs })=>{
    const iface=new ethers.Interface(MazeContract.abi);
  
    console.log("args",args);
    const data=iface.encodeFunctionData(iface.getFunction("initGame")?.name!,
    [[ethers.toBigInt(args.p1pos.x),ethers.toBigInt(args.p1pos.y)],
    [ethers.toBigInt(args.p2pos.x),ethers.toBigInt(args.p2pos.y)],
    ethers.toBigInt( args.moveCount),
    ethers.toBigInt(args.moveTimeout),ethers.toBigInt(args.bidType)]);
    return data;
}


export const getJoinGameEncodedData=async({gameIndex}:{gameIndex: string })=>{
    const iface=new ethers.Interface(MazeContract.abi);
    const data=iface.encodeFunctionData(iface.getFunction("joinGame")?.name!,
    [ethers.toBigInt( gameIndex)]);
    return data;
}

export const getPlayerMoveEncodedData=async({args}:{args:PlayerMoveArgs})=>{
    const iface=new ethers.Interface(MazeContract.abi);
    const data=iface.encodeFunctionData(iface.getFunction("playerMove")?.name!,
    [ethers.toBigInt( args.gameIndex),[ethers.toBigInt(args.p2pos.x),ethers.toBigInt(args.p2pos.y)]]);
    return data;
}

export const getForfeitGameEncodedData=async({gameIndex}:{gameIndex: string })=>{
    const iface=new ethers.Interface(MazeContract.abi);
    const data=iface.encodeFunctionData(iface.getFunction("forfeitGame")?.name!,
    [ethers.toBigInt( gameIndex)]);
    return data;
}

export const getEndGameEncodedData=async({gameIndex}:{gameIndex: string })=>{
    const iface=new ethers.Interface(MazeContract.abi);
    const data=iface.encodeFunctionData(iface.getFunction("endGame")?.name!,
    [ethers.toBigInt( gameIndex)]);
    return data;
}