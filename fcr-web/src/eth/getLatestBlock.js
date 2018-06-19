export default async (web3) => {
  const blockNum = await web3.eth.getBlockNumber()
  const latestBlock = await web3.eth.getBlock(blockNum)
  return latestBlock
}