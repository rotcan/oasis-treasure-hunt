import { Web3ReactHooks } from "@web3-react/core"
import type { BigNumber } from '@ethersproject/bignumber'
import { useEffect, useState } from "react"
import { formatEther } from '@ethersproject/units'
import { getTruncatedAddress } from "../../../utils/common"

function useBalance(
    provider?: ReturnType<Web3ReactHooks['useProvider']>,
    account?: string
  ): BigNumber | undefined {
    const [balance, setBalance] = useState<BigNumber | undefined>()
  
    useEffect(() => {
      if (provider && account) {
        let stale = false
        provider.getBalance(account).then((b)=>{
            if (stale) return
            setBalance(b)  
        })
  
      
        return () => {
          stale = true
          setBalance(undefined)
        }
      }
    }, [provider, account])
  
    return balance
  }

  
const SingleAccount=({
    account,
    provider,
    ENSName,
  }: {
    account: ReturnType<Web3ReactHooks['useAccount']>
    provider: ReturnType<Web3ReactHooks['useProvider']>
    ENSName: ReturnType<Web3ReactHooks['useENSName']>
  })=>{
    const balance = useBalance(provider, account)
  
    if (account === undefined) return null
  
    return (
        <div style={{textAlign:'left',display:"flex"}}>
        <div style={{display:"flex"}}>
        Account:{' '}
        </div>
        <div style={{display:"flex"}}>
          {
            !account
            ? 'None'
            : ( <div key={account} style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <span style={{width:"14em",}}>{getTruncatedAddress(ENSName ?? account)}</span>
                <span>{balance ? ` (Ξ${formatEther(balance)})` : null}</span>
                </div>
                )
          }
        </div>
      </div>
    )
  }

export default SingleAccount;