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

enum ContentMessageAction {
  GetUserInfo,
  GetDataFromJira
}

export { MessageAction, LoginType, ContentMessageAction };