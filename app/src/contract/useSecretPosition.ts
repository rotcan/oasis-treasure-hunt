import { useMemo, useState } from "react";
import { GameMetadata, MazePoint, getStatus, readSecretPosition } from "./data";
import { GameState, getDateInNumber } from "../utils/common";
import { ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";
import useLoading from "../components/ui/game/useLoading";

const useSecretPosition=({endpoint,gameIndex,metadata}:{endpoint:string,
    gameIndex:string | undefined,metadata: GameMetadata | undefined})=>{
    //const [secretPosMap,setSecretPosMap]=useState<Map<string,MazePoint>>(new Map<string,MazePoint>());
    const [secretPosition,setSecretPosition]=useState<MazePoint|undefined>();
    const {account,provider}=useWeb3React();
    const {setLoading}=useLoading();
    
    const getSignature=async(gameIndex: string):Promise<{msg:string | undefined,signature: string | undefined} >=>{
        try{
            //Sign message
            const msg=""+getDateInNumber();
            const hashMsg=ethers.solidityPackedKeccak256(['string','uint256'],[msg,ethers.toBigInt(gameIndex)]);
            const signature=await provider?.getSigner().signMessage(hashMsg);
            if(!signature)
                throw Error("cannot obtain signature");
            return {msg,signature};
        }catch(e){
            console.log("getSignature error",e);
        }
        return {msg: undefined,signature:undefined};
    }

    const getData=async()=>{
        if(gameIndex && metadata){
            // if(secretPosMap.has(gameIndex))
            //     return;
            setLoading(true);
            const {msg,signature}=getStatus({metadata})===GameState.End ? {msg:undefined,signature:undefined} : await getSignature(gameIndex);
            const point=await readSecretPosition({endpoint ,gameIndex, data: msg,signature});
            console.log("secretposition point",point,"");
            if(point && point.x>0){
                // setSecretPosMap(current=>(
                //     current.set(gameIndex,point)
                // ))
                setSecretPosition(point);
            }
            setLoading(false);
            
        }
    }

    useMemo(()=>{
        if((gameIndex && metadata?.creator===account) || (metadata && getStatus({metadata}))===GameState.End){
            getData();
        }
    },[gameIndex,metadata?.status])


    return {secretPosition};
}

export default useSecretPosition;