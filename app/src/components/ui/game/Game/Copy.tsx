import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import { Button } from "@mui/material";

const Copy=({str}:{str: string})=>{
    
    async function copyToClip() {
        await navigator.clipboard.writeText(str);
    }

    return (
        <>
            <Button  onClick={()=>{copyToClip()}}><ContentPasteIcon titleAccess="Copy Url"/></Button>
        </>
    )
}
export default Copy;