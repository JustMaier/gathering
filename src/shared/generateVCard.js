import VCard from 'vcards-js'

const generateVCard = (contact) => {
  const vCard = new VCard()

  vCard.firstName = contact.name
  if (contact.phone) vCard.workPhone = contact.phone
  if (contact.organization) vCard.organization = contact.organization
  if (contact.email) vCard.email = contact.email

  return vCard.getFormattedString()
}

export default generateVCard
