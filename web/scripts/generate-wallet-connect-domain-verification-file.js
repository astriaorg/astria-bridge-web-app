const fs = require('fs')
const path = require('path')

/**
 * This script generates a static file that is used by
 * WalletConnect to verify the domain ownership.
 * https://docs.reown.com/
 */

const content = process.env.REACT_APP_WALLET_CONNECT_DOMAIN_VERIFICATION_CODE

if (content) {
  fs.writeFileSync(
    path.join(__dirname, '../public/.well-known/walletconnect.txt'),
    content,
  )

  console.log('Generated verification.txt with content:', content)
}
