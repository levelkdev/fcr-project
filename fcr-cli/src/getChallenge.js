module.exports = async (fcr, listingHash) => {
  const listing = await fcr.registry.getListing(listingHash)
  if (parseInt(listing.challengeID) > 0) {
    const challenge = await fcr.registry.getChallenge(listing.challengeID)
    return challenge
  }
}