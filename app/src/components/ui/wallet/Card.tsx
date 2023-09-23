import type { Web3ReactHooks } from '@web3-react/core'
import type { MetaMask } from '@web3-react/metamask'

import { ConnectWithSelect } from './ConnectWithSelect'
import SingleAccount from './SingleAccount'
import { Status } from './Status'

interface Props {
  connector: MetaMask
  activeChainId: ReturnType<Web3ReactHooks['useChainId']>
  chainIds?: ReturnType<Web3ReactHooks['useChainId']>[]
  isActivating: ReturnType<Web3ReactHooks['useIsActivating']>
  isActive: ReturnType<Web3ReactHooks['useIsActive']>
  error: Error | undefined
  setError: (error: Error | undefined) => void
  ENSName: ReturnType<Web3ReactHooks['useENSName']>
  provider?: ReturnType<Web3ReactHooks['useProvider']>
  account?: string
}

export function Card({
  connector,
  activeChainId,
  chainIds,
  isActivating,
  isActive,
  error,
  setError,
  ENSName,
  account,
  provider,
}: Props) {
  return (
    <div
      style={{
        display: 'flex',
        alignSelf:"flex-end",
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '20rem',
        padding: '1rem',
        marginRight:'1em',
        marginLeft: "auto",
        overflow: 'auto',
      }}
    >
      {/* <b>{getName(connector)}</b> */}
      <div style={{ marginBottom: '0.1rem',display:"flex" }}>
        <div style={{display:"flex"}}>
        <Status isActivating={isActivating} isActive={isActive} error={error} />
        </div>
        <div  style={{display:"flex"}}>
          <ConnectWithSelect
          connector={connector}
          activeChainId={activeChainId}
          chainIds={chainIds}
          isActivating={isActivating}
          isActive={isActive}
          error={error}
          setError={setError}
        />
        </div>
      </div>
      {/* <Chain chainId={activeChainId} /> */}
      <div style={{ marginBottom: '0.1rem' }}>
        {/* <Accounts accounts={accounts} provider={provider} ENSNames={ENSNames} /> */}
        <SingleAccount ENSName={ENSName} account={account} provider={provider}/>
      </div>
      
    </div>
  )
}