# Google Chrome Extension Sample Project

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
3. [Storage](https://developer.chrome.com/docs/extensions/reference/api/storage)

## Contents

### Feature 1 - change background color of current webpage

Using `chrome.scripting.executeScript` to inject a script into a target context. In this case we change background color in target webpage.

---

### Feature 2 - play audio

Using `Offscreen` to handle audio, it will keep playing even if we close extension popup or jump to different tab.

---

### Feature 3 - grab data from Jira website then inject the popup component into current webpage.

1. Using `chrome.scripting.executeScript` to get data from target webpage.
2. Using `Content Script` to inject new component into target webpage with data.

---

### Feature 4 - Sign in with Firebase

1. In the **Google Cloud console**, on the project selector page, select or [create a Google Cloud project](https://cloud.google.com/resource-manager/docs/creating-managing-projects).
2. Enable [Identity Platform](https://console.cloud.google.com/marketplace/details/google-cloud-platform/customer-identity).
3. With [Email/Password](https://cloud.google.com/identity-platform/docs/sign-in-user-email):
   1. Go to the [Identity Providers](https://console.cloud.google.com/customer-identity/providers) page.
   2. Add **Email/Password** provider.
   3. Start coding, using `signInWithEmailAndPassword` to sign in.
4. With [Google](https://cloud.google.com/identity-platform/docs/web/google):
   1. Go the the [API's & Services](https://console.cloud.google.com/apis/credentials) page.
   2. Creaete a **OAuth consent screen** with **External** User Type.
   3. Create a **Credentials** with `OAuth client ID`, **Application type** is `Web application`, and set **Authorized redirect URIs** to `https://myproject.firebaseapp.com/__/auth/handler`.
   4. Go to the [Identity Providers](https://console.cloud.google.com/customer-identity/providers) page to add new domain, Settings -> SECURITY -> ADD DOMAIN -> `chrome-extension:// my-extension-id`.
   5. Add **Google** provider.
   6. Enter your Google **Web Client ID** and **Web Secret**. And ID and secret come from credentials we created in step 3.
   7. Start coding, using `getAuthToken` to get an OAuth2 access token using the client ID and scopes specified in the oauth2 section of manifest.json. (PS: This method only enable auth flows with `Google` identity providers.)
   8. Get credential from `GoogleAuthProvider`.
   9. Using `signInWithCredential` to sign in with credentail.
5. With [GitHub](https://cloud.google.com/identity-platform/docs/web/github): 
   1. Create a [OAuth Apps](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app) and set **Authorization callback URL** to `https://my-extension-id.chromiumapp.org/`.
   2. Go to the [Identity Providers](https://console.cloud.google.com/customer-identity/providers) page and add **GitHub** provider.
   3. Enter your Google **Web Client ID** and **Web Secret**. And ID and secret come from credentials we created in step 1.
   4. Start coding, using `launchWebAuthFlow` to start an auth flow at the specified URL then the final redirect URL will be passed to the callback function. (PS:  This method enables auth flows with `non-Google` identity providers)
   5. In this case, we will get **code** from callback function, so we need to exchange code for token.
   6. Get credential from `GithubAuthProvider`.
   7. Using `signInWithCredential` to sign in with credentail.
6. With [Spotify](https://cloud.google.com/identity-platform/docs/web/custom):

## Getting Started

1. Install dependencies:

```bash
yarn install
```

2. Builds the app for production to the `dist` folder.

```bash
yarn build
```

3. Load an unpacked extension on Google Chrome browser
   1. Go to the Extensions page by entering `chrome://extensions` in a new tab.
   2. Enable Developer Mode by clicking the toggle switch next to **Developer mode**.
   3. Click the **Load unpacked** button and select the extension directory (the path like **project/dist**).
