import { useMemo, useState } from "react";
import { ContractMetadata, readGameMetadata } from "./data";
import useLoading from "../components/ui/game/useLoading";

const useMazeData=({endpoint,gameIndex,lastUpdateTimestamp,init,creator}:{endpoint: string,
    gameIndex: string | undefined | bigint,lastUpdateTimestamp: number | undefined,init:boolean,creator: boolean})=>{
    const [metadata,setMetadata]=useState<ContractMetadata|undefined>();
    const {setLoading}=useLoading();
    const data=async()=>{
        const gameIndexStr=gameIndex!==undefined && typeof gameIndex=== 'bigint' ? gameIndex.toString() : gameIndex!==undefined ? String(gameIndex):undefined;
        console.log("gameIndexStr",gameIndexStr);
        if(gameIndexStr){
            setLoading(true);
            const data=await readGameMetadata({endpoint: endpoint,gameIndex: gameIndexStr});
            setMetadata(data);
            setLoading(false);
        }
    }

    useMemo(()=>{
        if(lastUpdateTimestamp)
            data();
    },[lastUpdateTimestamp]);
   
    return {metadata};
}

export default useMazeData;