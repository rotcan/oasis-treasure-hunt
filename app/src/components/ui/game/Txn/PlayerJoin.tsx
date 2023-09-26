import { useWeb3React } from "@web3-react/core";
import { getJoinGameEncodedData } from "../../../../contract/txn";
import { Button } from "@mui/material";
import useLoading from "../useLoading";

const PlayerJoin=({gameIndex, amount}:{gameIndex: string,amount: string | undefined})=>{

    const address=process.env.REACT_APP_CONTRACT_ADDRESS!;
    const { account,provider } = useWeb3React();
    const {setLoading}=useLoading();
    
    const submitJoinTxn=async()=>{
        console.log("provider",provider);
        if(provider){
            // const sgms=await provider.getSigner().signMessage("Test");
            // console.log("sgms",sgms);
            
            const encData=await getJoinGameEncodedData({gameIndex});
            console.log("encData",address,encData);
            // const tx=await provider.send("initGame",[]);
            setLoading(true);
            try{
                const tx=await provider.getSigner().sendTransaction ({from: account,
                data:encData,to: address!,value: amount});
                const res=await tx.wait();
                
                console.log("tx",tx,res.logs);
            }catch(error){
                console.log("error",error);
            }
            setLoading(false);
            
        }
    }
    return (<>
        <Button onClick={()=>{submitJoinTxn();}}>Join Game</Button>
    </>)
}

export default PlayerJoin;