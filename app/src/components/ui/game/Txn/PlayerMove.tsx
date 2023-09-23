import { useWeb3React } from "@web3-react/core";
import { getPlayerMoveEncodedData } from "../../../../contract/txn";
import { Button } from "@mui/material";
import useLoading from "../useLoading";

const PlayerMove=({gameIndex}:{gameIndex: string})=>{
    const address=process.env.REACT_APP_CONTRACT_ADDRESS!;
    const { account,provider } = useWeb3React();
    const {setLoading}=useLoading();
    
    const submitPlayerMoveTxn=async()=>{
        console.log("provider",provider);
        if(provider){
            // const sgms=await provider.getSigner().signMessage("Test");
            // console.log("sgms",sgms);
            
            const encData=await getPlayerMoveEncodedData({args:{gameIndex,p2pos: {x: window.p2GridPos.x,
            y:window.p2GridPos.y}}});
            console.log("encData",address,encData);
            // const tx=await provider.send("initGame",[]);
            setLoading(true);
            try{
                const tx=await provider.getSigner().sendTransaction ({from: account,
                data:encData,to: address!});
                const res=await tx.wait();
                
                console.log("tx",tx,res.logs);
            }catch(error){
                console.log("error",error);
            }
            setLoading(false);
            
        }
    }

    return (
        <>
            <Button onClick={()=>{submitPlayerMoveTxn()}}>Submit Move</Button>
        </>
    )
}

export default PlayerMove;