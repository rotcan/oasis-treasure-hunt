import { useState } from "react";
import { MoveMetadata, getMoveText } from "../../../../../contract/data";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

const MoveMetadataItem=({metadata,index}:{metadata: MoveMetadata,index: number})=>{
    const [open, setOpen] = useState(false);
    const handleClickOpen = () => {
        setOpen(true);
      };
    
      const handleClose = () => {
        setOpen(false);
      };

      
    return (<>
        <div className="flexTableItem" key={index}>
            <Button variant="outlined" onClick={handleClickOpen}>
                {index+1}
            </Button>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Move #"+(index+1)}
                </DialogTitle>
                <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {getMoveText({metadata})}
                </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} autoFocus>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    </>)
}

export default MoveMetadataItem;