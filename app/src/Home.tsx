import Main from './components/ui/game/Main';
import MetaMaskCard from './components/ui/wallet/MetamaskCard';
import MazeData from './contract/useMazeData';

const Home=()=>{
    return (<>
        <header style={{backgroundColor:"grey",paddingBottom:"0.5em"}}>
            <MetaMaskCard />
         </header>
         <div>
            <Main/>
         </div>
         
         <div id="game">

        </div>
    </>)
}

export default Home;