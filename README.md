# Netlify-cms-bitbucket-oauth-provider

***External authentication providers were enabled in netlify-cms version 0.4.3. Check your web console to see your netlify-cms version.***

[netlify-cms](https://www.netlifycms.org/) has its own Bitbucket OAuth client. This implementation was created by reverse engineering the results of that client, so it's not necessary to reimplement client part of [netlify-cms](https://www.netlifycms.org/).

This is a fork of the Github oauth provider from [@vencax] (https://github.com/vencax/netlify-cms-github-oauth-provider) and modified slightly for bitbucket usage.

Bitbucket and Bitbucket Enterprise are currently supported, but as this is a general Oauth client, feel free to submit a PR to add other git hosting providers.

## 1) Install Locally

**Install Repo Locally**

```
git clone https://bitbucket.com/zanedev/netlify-cms-bitbucket-oauth-provider
cd netlify-cms-bitbucket-oauth-provider
npm install
```

**Create Oauth App**
Information is available on the [Bitbucket Developer Documentation](https://confluence.atlassian.com/bitbucket/oauth-on-bitbucket-cloud-238027431.html). Fill out the fields however you like. This is where Bitbucket will send your callback after a user has authenticated, and should be `https://your.server.com/callback` for use with this repo.

## 2) Config

### Auth Provider Config

Configuration is done with environment variables, which can be supplied as command line arguments, added in your app  hosting interface, or loaded from a .env ([dotenv](https://bitbucket.com/motdotla/dotenv)) file.

**Example .env file:**

```
NODE_ENV=production
OAUTH_CLIENT_ID=f432a9casdff1e4b79c57
OAUTH_CLIENT_SECRET=pampadympapampadympapampadympa
REDIRECT_URL=https://your.server.com/callback
GIT_HOSTNAME=https://Bitbucket.website.com
```

**Client ID & Client Secret (required):**
After registering your Oauth app, you will be able to get your client id and client secret on the next page.

**Redirect URL (optional):**
Leave this blank for bitbucket as it will fallback to the consumer redirect url defined in your oauth consumer

**Git Hostname (Optional):**
Not needed for bitbucket

### CMS Config
You also need to add `base_url` to the backend section of your netlify-cms's config file. `base_url` is the live URL of this repo with no trailing slashes.

```
backend:
  name: Bitbucket
  repo: user/repo   # Path to your Bitbucket repository
  branch: master    # Branch to update
  base_url: https://your.server.com # Path to ext auth provider
```

## 3) Push

Basic instructions for pushing to heroku are available in the [original blog post](http://www.vxk.cz/tips/2017/05/18/netlify-cms/).

You can also use a service like Zeit Now to deploy this js oauth server for example using now command line:
now -e OAUTH_CLIENT_ID={bitbucket oauth id} -e OAUTH_CLIENT_SECRET={bitbucket oauth secret}
