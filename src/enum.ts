enum MessageAction {
  GrabDataFromJira,
  PlayAudio,
  SignIn,
  GetAuthenticationStatus
}

enum LoginType {
  Google,
  GitHub,
  Spotify
}

export { MessageAction, LoginType };