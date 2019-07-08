# The Gathering

In-person, ephemeral libp2p-linked gatherings of communities with secure contact sharing and ERC721 trophies incentivizing matchmaking

[Try it out](https://quisest.com)

## Overview

The Gathering improves the experience of in-person ephemeral gatherings, such as conferences, college orientations or other assemblies of communities of affinity.  Gathering attendees use a mobile app to enable automatic person-to-person contact information exchange via libp2p upon the entry of one person's codename, which is printed on his or her lanyard.  Connections (without identifying information) are tallied and tracked by the organizer of the gathering and others running scorekeeper nodes.  Gather incentivizes positive networking behavior through awarding points for recommending matches among one's connections, with several custom ERC721 trophies awarded to the points leaders in various categories at the gathering's conclusion, including trophies for most connections, most matches made and the Kevin Bacon award for the fewest average degrees of separation from all attendees. 

## Contributors

@justmaier and @vrortvedt

## FAQs
### What is The Gathering?
In short, it’s a conference enhancer.  In a bit more detail, it’s a decentralized, incentivized contact sharing tool for in-person ephemeral gatherings of communities of affinity.

### How can I create a Gathering?
Go to gthr.io and click the Create Gathering button and then fill out the event’s details.  For network stability, you should probably join from a desktop or laptop that you can keep running during The Gathering.  Otherwise the network might collapse when all participants’ phones are locked. If you wish to have ERC721 trophies, you’ll need to copy and deploy the smart contract deployed here: https://etherscan.io/dapp/0x366cf49c6bc3986b20ecf4fd7c05f0c617332e8c.  

### How can I join a Gathering?
The best way to join a Gathering is to scan the connect QR code on a device that is already in the Gathering, which will also trigger a connection request to that person.  Then enter the contact information you are willing to exchange with other members of the Gathering and tag or create your affinities.

### How can I connect with someone?
You can either click the + button at the top right of the screen and enter the code name for the person you are trying to connect with, or you can have your would-be contact scan your QR code with their camera (best for iOS users).

### Why does The Gathering use code names?
Upon joining, each member of the Gathering is given a randomly chosen two word code name, which may be changed in the user profile (pencil icon next to your name).  Code names are used to connect with other members of the gathering and because they are unique to each Gathering, help limit the universe of potential connections to those immediately present.   

### How can I send a recommendation to connect?
If you think your connection Alice should meet Bob because of a common interest, you can recommend that match by going to Alice’s profile, clicking “Send Recommendation” and then selecting Bob from the list of your connections.  Alice will then receive a notification of your recommendation, along with Bob’s name, organization and profile photo, but none of his actual contact info.

### How does scoring work?
Accepted connections are worth one point for each person, though rejected connection requests are worth negative one, as an anti-spam measure.  Recommending a match earns one point, and if that match is made, the recommender earns two additional points.

### What are the trophies?
The MVP trophy is awarded for the most total points.  The Schmoozer trophy is awarded for the most direct connections.  The Cupid trophy is awarded for the most matches made.  Trophies may be minted as ERC721 Non-Fungible Tokens on the Ethereum blockchain by deploying a  smart contract similar to the one located at https://etherscan.io/dapp/0x366cf49c6bc3986b20ecf4fd7c05f0c617332e8c.

### What devices does The Gathering run on?
The Gathering runs on iOS or Android mobile devices, as well as desktops and laptops.  It works on Chrome, Firefox, Safari, Brave and most other browsers.  As far as we can tell, the only browser that doesn’t seem to work is Opera, though browsers embedded in some Android QR Reader apps have had some missing functionality as well.

### Can I join a Gathering remotely?
Not unless someone in the Gathering shares their connection info with you, which they really shouldn’t.

### Who can see my data in The Gathering?
Only members of the same Gathering that you have joined can see any data about you, unless someone in the Gathering publishes that information elsewhere, which they really shouldn’t.  The only data that is visible to all members is name, organization and profile photo.  Contact information is stored as SHA2 256 hashes and may only be viewed by one’s connections.  Of course a connection may decide to publish your contact info outside the Gathering (although they really shouldn’t), but because users control what contact info they wish to share (if any), members should only include such info as they would be comfortable putting on a business card or adding to a social media profile.

### How does The Gathering work under the hood?
The Gathering runs on React, js-ipfs and OrbitDB.  The smart contracts generating the trophies are based on the Ethereum ERC721 non-fungible token standard.  More questions? Take a look at the Github repo at https://github.com/JustMaier/gathering

### How can I give feedback, ask a question or report a bug?
Github: @justmaier @vrortvedt
Email: Just.Maier@gmail.com victorrortvedt@gmail.com

