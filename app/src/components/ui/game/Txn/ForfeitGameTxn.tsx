import { useWeb3React } from "@web3-react/core";
import { getForfeitGameEncodedData } from "../../../../contract/txn";
import { Button } from "@mui/material";
import useLoading from "../useLoading";
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
const ForfeitGameTxn=({gameIndex}:{gameIndex: string})=>{
    const address=process.env.REACT_APP_CONTRACT_ADDRESS!;
    const { account,provider } = useWeb3React();
    const {setLoading}=useLoading();
    
    const submitEndGameTxn=async()=>{
        console.log("provider",provider);
        if(provider){
            // const sgms=await provider.getSigner().signMessage("Test");
            // console.log("sgms",sgms);
            
            const encData=await getForfeitGameEncodedData({gameIndex});
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
    return (<>
    <Button onClick={()=>{submitEndGameTxn();}}><ReportProblemIcon titleAccess="Forfeit Match"/></Button>
    </>)
}

export default ForfeitGameTxn;