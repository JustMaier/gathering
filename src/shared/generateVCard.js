import VCard from 'vcards-js'

const generateVCard = (contact, gathering = null, image = null) => {
  const vCard = new VCard()

  vCard.firstName = contact.name
  if (contact.phone) vCard.workPhone = contact.phone
  if (contact.organization) vCard.organization = contact.organization
  if (contact.email) vCard.email = contact.email
  if (image) vCard.photo.attachFromUrl(image, 'JPEG')
  if (gathering) vCard.note = `Via Gathering at ${gathering.name}: ${gathering.place}`

  return vCard.getFormattedString()
}

export default generateVCard
