# Chrome Extension Sample Project

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app) and using [Webpack](https://webpack.js.org).

## Technologies used

1. [Google Chrome Extension](https://developer.chrome.com/docs/extensions/get-started)
2. [React.js](https://legacy.reactjs.org/)
3. [TypeScript](https://www.typescriptlang.org)
4. [Webpack](https://webpack.js.org)

## Extension cores used

1. [Message Passing](https://developer.chrome.com/docs/extensions/develop/concepts/messaging)
2. [Service Workers](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers)
3. [Content Script](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts)

## Extension apis used

1. [Scripting](https://developer.chrome.com/docs/extensions/reference/api/scripting)
2. [Offscreen](https://developer.chrome.com/docs/extensions/reference/api/offscreen)
3. [identity](https://developer.chrome.com/docs/extensions/reference/api/identity)
4. [Storage](https://developer.chrome.com/docs/extensions/reference/api/storage)

## Contents

1. Change background color for current web page
2. Play audio and it will continue to play even if we close extension popup window or jump to different tab.
3. Grab data from Jira website and inject the popup component into current web page.
4. Sign in withg `Email/Password` using Firebase Authentication
5. Sign in withg `Google` using Firebase Authentication
6. Sign in withg `GitHub` using Firebase Authentication
7. Sign in withg `Spotify`

## Setup

1. In the **Google Cloud console**, on the project selector page, select or [create a Google Cloud project](https://cloud.google.com/resource-manager/docs/creating-managing-projects).
2. Enable [Identity Platform](https://console.cloud.google.com/marketplace/details/google-cloud-platform/customer-identity).
3. For [Email/Password](https://cloud.google.com/identity-platform/docs/sign-in-user-email):
   1. Go to the [Identity Providers](https://console.cloud.google.com/customer-identity/providers) page.
   2. Add `Email/Password` provider.
4. For [Google](https://cloud.google.com/identity-platform/docs/web/google):
   1. Go to the [API's & Services](https://console.cloud.google.com/apis/credentials) page.
   2. Creaete a `OAuth consent screen`, User Type = **External**.
   3. Create a `Chrome Extension` Credentials, **Item ID** = `my-extension-id`.
   4. Create a `Web Application` Credentials, **Authorized redirect URIs** = `https://myproject.firebaseapp.com/__/auth/handler`.
   5. Go to the [Identity Providers](https://console.cloud.google.com/customer-identity/providers) page.
   6. Add new domain, Settings -> SECURITY -> ADD DOMAIN, **Domain** = `chrome-extension:// my-extension-id`.
   7. Add `Google` provider, set **Web Client ID** and **Web Secret**. And ID and secret come from credentials we created in step 4.
5. For [GitHub](https://cloud.google.com/identity-platform/docs/web/github): 
   1. Go to the [OAuth Apps](https://github.com/settings/developers) page.
   2. Create a [OAuth Apps](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app), **Authorization callback URL** = `https://my-extension-id.chromiumapp.org/`.
   3. Go to the [Identity Providers](https://console.cloud.google.com/customer-identity/providers) page.
   4. Add **GitHub** provider, set **Web Client ID** and **Web Secret**. And ID and secret come from credentials we created in step 2.
6. For [Spotify](https://cloud.google.com/identity-platform/docs/web/custom), but without Firebase:
   1. Go to the [Dashboard](https://developer.spotify.com/dashboard) page.
   2. Create a App, **Redirect URI** = `https://extension-id.chromiumapp.org/`.

## Getting Started

1. In **Manifest.json**, set **client_id** =  `google-client-id`  in **oauth2** section.

2. Create a `env` file for keys

   ```
   API_KEY = "api-key"
   AUTH_DOMAIN = "auth-domain"
   PROJECT_ID = "project-id"
   STORAGE_BUCKET = "storage-bucket"
   MESSAGING_SENDER_ID = "messaging-sender-id"
   APP_ID = "app-id"
   GOOGLE_CLIENT_ID = "google-client-id"
   GITHUB_CLIENT_ID = "github-client-id"
   GITHUB_CLIENT_SECRET = "github-client-secret"
   SPOTIFY_CLIENT_ID = "spotify-client-id"
   SPOTIFY_CLIENT_SECRET = "spotify-client-secret"
   ```

3. Install dependencies:

   ```
   yarn install
   ```

4. Builds the app for production to the `dist` folder.

   ```
   yarn build
   ```

5. Load an unpacked extension on Google Chrome browser

   1. Go to the Extensions page by entering `chrome://extensions` in a new tab.
   2. Enable Developer Mode by clicking the toggle switch next to **Developer mode**.
   3. Click the **Load unpacked** button and select the extension directory (the path like **project/dist**).
