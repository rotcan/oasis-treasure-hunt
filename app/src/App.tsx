import { Web3ReactHooks, Web3ReactProvider } from "@web3-react/core";
import type { MetaMask } from "@web3-react/metamask";
import { metaMask, hooks as metaMaskHooks } from "./connectors/metamask";
import "./App.css";
import Home from "./Home";
import { BrowserRouter } from "react-router-dom";
import { LoadingProdiver } from "./components/ui/game/useLoading";

const connectors: [MetaMask, Web3ReactHooks][] = [[metaMask, metaMaskHooks]];
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Web3ReactProvider connectors={connectors}>
          <LoadingProdiver>
            <Home />
          </LoadingProdiver>
        </Web3ReactProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
