import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { useState } from "react";
import MenuBookIcon from '@mui/icons-material/MenuBook';

const Rules=()=>{
    const [open, setOpen] = useState(false);
    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };
    return (<>
     
        <Button  onClick={handleClickOpen}>
            <MenuBookIcon titleAccess="Rules"/>
        </Button>
        <Dialog  open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                >
            <DialogTitle id="alert-dialog-title">
                    Rules
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    <h3>Instructions</h3>
                    <ul>
                        <li>To setup a new game, player1 needs to set the following details
                            <ul>
                                <li>Secret location of the treasure (not visible to anyone)</li>
                                <li>Starting position for player2 who needs to find the treasure</li>
                                <li>Time limit for each move</li>
                                <li>No of moves player2 can take</li>
                                <li>Optional Bid value(0.5x or 1x), player2 needs to add same value in escrow and winner gets total value in pot</li>
                            </ul>
                        </li>
                        <li>To find the treasure, player2 will place on an empty space on the grid</li>
                        <li>Contract will calculate if new position is nearer/farther/or at same distance from treasure</li>
                        <li>This goes on till moves are finished or player2 finds the treasure</li>
                        <li>If player2 thinks they are in the correct position, they need to run a verify position instruction to finish the game. If position is not correct then only gas fees are deducted</li>
                    </ul>
                </DialogContentText>
            </DialogContent>
               
        </Dialog>
    
    </>);
}

export default Rules;