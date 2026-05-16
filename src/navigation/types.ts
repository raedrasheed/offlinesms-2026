import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Welcome: undefined;
  PhoneLogin: undefined;
  OtpVerify: { phoneNumber: string };
  ProfileSetup: undefined;
};

export type MainTabParamList = {
  Chats: undefined;
  Groups: undefined;
  Contacts: undefined;
  Settings: undefined;
};

export type AppStackParamList = {
  Tabs: NavigatorScreenParams<MainTabParamList>;
  ChatDetails: { chatId: string; title: string; photoURL?: string | null };
  GroupChat: { groupId: string; title: string; photoURL?: string | null };
  NewChat: undefined;
  CreateGroup: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  App: NavigatorScreenParams<AppStackParamList>;
};
