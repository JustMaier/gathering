const socialUrls = {
  github: 'github.com/',
  twitter: 'twitter.com/'
}

export default function cleanSocialUrls (contactInfo) {
  Object.keys(socialUrls).filter(key => contactInfo[key]).forEach(key => {
    const urlParts = contactInfo[key].split(socialUrls[key])
    if (urlParts.length > 1) contactInfo[key] = urlParts[1]
  })
}
