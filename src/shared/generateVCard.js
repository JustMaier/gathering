import VCard from 'vcards-js'

const generateVCard = (contact, notes = '', affinities = [], gathering = null, image = null) => {
  const vCard = new VCard()

  const nameParts = contact.name.split(' ')
  vCard.firstName = nameParts.slice(0, 1)
  vCard.lastName = nameParts.slice(1)
  if (contact.organization) vCard.organization = contact.organization
  if (contact.phone) vCard.workPhone = contact.phone
  if (contact.email) vCard.email = contact.email
  if (contact.github) vCard.socialUrls['github'] = `https://github.com/${contact.github}`
  if (contact.twitter) vCard.socialUrls['twitter'] = `https://twitter.com/${contact.twitter}`
  if (image) vCard.photo.embedFromString(image.split('base64,').slice(1), 'JPEG')
  if (gathering) vCard.note = `Via Gathering at ${gathering.name}: ${gathering.place}. Affinities: ${affinities.join(', ')}. ${notes}`

  return vCard.getFormattedString()
}

export default generateVCard
