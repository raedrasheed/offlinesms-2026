import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppStackParamList } from './types';
import MainTabs from './MainTabs';
import ChatDetailsScreen from '@/screens/chats/ChatDetailsScreen';
import GroupChatScreen from '@/screens/groups/GroupChatScreen';
import NewChatScreen from '@/screens/chats/NewChatScreen';
import CreateGroupScreen from '@/screens/groups/CreateGroupScreen';

const Stack = createNativeStackNavigator<AppStackParamList>();

const AppStack: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Tabs" component={MainTabs} />
    <Stack.Screen name="ChatDetails" component={ChatDetailsScreen} />
    <Stack.Screen name="GroupChat" component={GroupChatScreen} />
    <Stack.Screen
      name="NewChat"
      component={NewChatScreen}
      options={{ presentation: 'modal' }}
    />
    <Stack.Screen
      name="CreateGroup"
      component={CreateGroupScreen}
      options={{ presentation: 'modal' }}
    />
  </Stack.Navigator>
);

export default AppStack;
