
import { useEffect, useState } from 'react'
import { hooks, metaMask } from '../../../connectors/metamask'
import { Card } from './Card'
const {  useChainId, useAccounts, useENSName, useIsActivating,useAccount, useIsActive, useProvider, useENSNames } = hooks

export default function MetaMaskCard() {
  const chainId = useChainId()
  const isActivating = useIsActivating()
  const account=useAccount();
  const isActive = useIsActive()

  const provider = useProvider()
  const ENSName = useENSName(provider)

  const [error, setError] = useState<Error | undefined>(undefined)

  // attempt to connect eagerly on mount
  useEffect(() => {
    void metaMask.connectEagerly().catch(() => {
      console.debug('Failed to connect eagerly to metamask')
    })
  }, [])

  return (
    <Card
      connector={metaMask}
      activeChainId={chainId}
      isActivating={isActivating}
      isActive={isActive}
      error={error}
      account={account}
      provider={provider}
      ENSName={ENSName}
      setError={setError}
    />
  )
}