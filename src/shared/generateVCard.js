const generateVCard = (contact) => {
  return `BEGIN:VCARD
    VERSION:3.0
    FN:${contact.name}
    TEL;TYPE=work,voice:${contact.phone}
    EMAIL;type=internet,pref:${contact.email}
    ORG:${contact.organization}
    UID:${contact.id}
    END:VCARD`
}

export default generateVCard
