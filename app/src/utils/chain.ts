import type { AddEthereumChainParameter } from '@web3-react/types'

type ChainConfig = { [chainId: number]: BasicChainInformation | ExtendedChainInformation }

interface BasicChainInformation {
    urls: string[]
    name: string
}
  
interface ExtendedChainInformation extends BasicChainInformation {
    nativeCurrency: AddEthereumChainParameter['nativeCurrency']
    blockExplorerUrls: AddEthereumChainParameter['blockExplorerUrls']
}
  
export const TESTNET_CHAINS: ChainConfig = {
  0x5aff: {
      urls: [process.env.REACT_APP_RPC_ENDPOINT!].filter(Boolean),
      name: 'Sapphire',
      nativeCurrency:{name:"Rose",symbol:"ROSE",decimals:18}
    },
}


function isExtendedChainInformation(
    chainInformation: BasicChainInformation | ExtendedChainInformation
  ): chainInformation is ExtendedChainInformation {
    return !!(chainInformation as ExtendedChainInformation).nativeCurrency
  }
  

export function getAddChainParameters(chainId: number): AddEthereumChainParameter | number {
    const chainInformation = TESTNET_CHAINS[chainId]
    if (isExtendedChainInformation(chainInformation)) {
      return {
        chainId,
        chainName: chainInformation.name,
        nativeCurrency: chainInformation.nativeCurrency,
        rpcUrls: chainInformation.urls,
        blockExplorerUrls: chainInformation.blockExplorerUrls,
      }
    } else {
      return chainId
    }
  }
