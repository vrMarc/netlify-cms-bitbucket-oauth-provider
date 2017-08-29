require('dotenv').config({silent: true});
const express = require('express');
const simpleOauthModule = require('simple-oauth2');
const randomstring = require('randomstring');
const port = process.env.PORT || 3000;

const app = express();
const oauth2 = simpleOauthModule.create({
  client: {
    id: process.env.OAUTH_CLIENT_ID,
    secret: process.env.OAUTH_CLIENT_SECRET
  },
  auth: {
    tokenHost: process.env.GIT_HOSTNAME || 'https://bitbucket.org/site/oauth2',
    tokenPath: process.env.OAUTH_TOKEN_PATH || 'https://bitbucket.org/site/oauth2/access_token',
    authorizePath: process.env.OAUTH_AUTHORIZE_PATH || 'https://bitbucket.org/site/oauth2/authorize'
  }
});

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Authorization uri definition
const authorizationUri = oauth2.authorizationCode.authorizeURL({
  // redirect_uri: process.env.REDIRECT_URL, //bitbucket defaults to oauth consumer redirect_url
  // scope: process.env.SCOPES || 'repository:admin', //bitbucket defaults to oauth consumer scopes
  state: randomstring.generate(32)
});

// Initial page redirecting to Github
app.get('/auth', (req, res) => {
  res.redirect(authorizationUri)
});


// Refresh token work
app.get('/refresh', (req, res) => {
    const tokenObject = {
        'access_token': req.query.access_token,
        'refresh_token': req.query.refresh_token,
        'expires_in': '7200'
    };

    let accessToken = oauth2.accessToken.create(tokenObject);

    return accessToken.refresh()
        .then((result) => {
            res.send(JSON.stringify({result}));
        });


});

// Callback service parsing the authorization token and asking for the access token
app.get('/callback', (req, res) => {
  const code = req.query.code;
  const options = {
    code: code
  };

  oauth2.authorizationCode.getToken(options, (error, result) => {
    let mess, content;

    if (error) {
      console.error('Access Token Error', error.message);
      mess = 'error';
      content = JSON.stringify(error)
    } else {
      const token = oauth2.accessToken.create(result);
        console.log("token response: ", token);
      mess = 'success';
      content = {
        token: token.token.access_token,
        expires_in: token.token.expires_in,
        expires_at: token.token.expires_at,
        refresh_token: token.token.refresh_token,
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
    </script>`;
    return res.send(script)
  })
});

app.get('/success', (req, res) => {
  res.send('')
});

app.get('/', (req, res) => {
  res.send('Hello<br><a href="/auth">Log in with Bitbucket</a>')
});

app.listen(port, () => {
  console.log("gandalf is walkin' on port " + port)
});
