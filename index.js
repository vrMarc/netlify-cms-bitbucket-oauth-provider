require('dotenv').config({silent: true})
const express = require('express')
const simpleOauthModule = require('simple-oauth2')
const randomstring = require('randomstring')
const port = process.env.PORT || 3000

const app = express()
const oauth2 = simpleOauthModule.create({
  client: {
    id: process.env.OAUTH_CLIENT_ID,
    secret: process.env.OAUTH_CLIENT_SECRET
  },
  auth: {
    // Supply GIT_HOSTNAME for enterprise github installs.
    tokenHost: process.env.GIT_HOSTNAME || 'https://bitbucket.org/site/oauth2',
    tokenPath: process.env.OAUTH_TOKEN_PATH || 'https://bitbucket.org/site/oauth2/access_token',
    authorizePath: process.env.OAUTH_AUTHORIZE_PATH || 'https://bitbucket.org/site/oauth2/authorize'
  }
})

// Authorization uri definition
const authorizationUri = oauth2.authorizationCode.authorizeURL({
  // redirect_uri: process.env.REDIRECT_URL, //bitbucket defaults to oauth consumer redirect_url
  // scope: process.env.SCOPES || 'repository:admin', //bitbucket defaults to oauth consumer scopes
  state: randomstring.generate(32)
})

// Initial page redirecting to Github
app.get('/auth', (req, res) => {
  res.redirect(authorizationUri)
})

// Callback service parsing the authorization token and asking for the access token
app.get('/callback', (req, res) => {
  const code = req.query.code
  const options = {
    code: code
  }

  oauth2.authorizationCode.getToken(options, (error, result) => {
    let mess, content

    if (error) {
      console.error('Access Token Error', error.message)
      mess = 'error'
      content = JSON.stringify(error)
    } else {
      const token = oauth2.accessToken.create(result)
      mess = 'success'
      content = {
        token: token.token.access_token,
        expires_at: token.token.expires_at,
        provider: 'bitbucket'
      }
    }

    const script = `
    <script>
    (function() {
      function recieveMessage(e) {
        console.log("recieveMessage %o", e)
        // send message to main window with da app
        window.opener.postMessage(
          'authorization:bitbucket:${mess}:${JSON.stringify(content)}',
          e.origin
        )
      }
      window.addEventListener("message", recieveMessage, false)
      // Start handshare with parent
      console.log("Sending message: %o", "bitbucket")
      window.opener.postMessage("authorizing:bitbucket", "*")
      })()
    </script>`
    return res.send(script)
  })
})

app.get('/success', (req, res) => {
  res.send('world <br> hello the')
})

app.get('/', (req, res) => {
  res.send('Hello<br><a href="/auth">Log in with Bitbucket</a>')
})

app.listen(port, () => {
  console.log("gandalf is walkin' on port " + port)
})
