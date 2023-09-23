import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { BidType } from "../../../../utils/common";
import { Button } from "@mui/material";

export interface BidArgs{
    bidAmount: string;
    bidType: BidType
}

const BidDetails=({args,isEditable,updateState}:{args: BidArgs, isEditable: boolean, 
    updateState:Dispatch<SetStateAction<BidArgs>>})=>{

        const [bType,setBType]=useState<BidType>(args.bidType);

  
    return (<>
    <div className="flexTable">
          <div className="flexTableItem">Bid value (Gwei)</div>
          <input className="flexTableItem" placeholder="Bid" onChange={(e)=>{isEditable && updateState(current=>({
            ...current,bidAmount: e.target.value, bidType: bType
          }))}} value={args.bidAmount}/>
          <div className={'flexTableItem ' + (bType===BidType.Free ? "selectedBid":"")} >
             <Button onClick={()=>{ isEditable &&  setBType(BidType.Free)}}>0x</Button>
          </div>
          <div className={'flexTableItem ' + (bType===BidType.Half ? "selectedBid":"")} >
          <Button onClick={()=>{ isEditable &&  setBType(BidType.Half)}}>0.5x</Button>
          </div>
          <div className={'flexTableItem ' + (bType===BidType.Full ? "selectedBid":"")} >
          <Button onClick={()=>{isEditable && setBType(BidType.Full)}}>1x</Button>
          </div>
        </div>
    </>)
}

export default BidDetails;