import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { MainTabParamList } from './types';
import { colors } from '@/theme';
import ChatsScreen from '@/screens/chats/ChatsScreen';
import GroupsScreen from '@/screens/groups/GroupsScreen';
import ContactsScreen from '@/screens/contacts/ContactsScreen';
import SettingsScreen from '@/screens/settings/SettingsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TabIcon = ({ label, focused }: { label: string; focused: boolean }) => (
  <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.55 }}>{label}</Text>
);

const MainTabs: React.FC = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarStyle: {
        borderTopColor: colors.border,
        backgroundColor: colors.background,
        height: 60,
        paddingBottom: 8,
        paddingTop: 6,
      },
      tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
    }}
  >
    <Tab.Screen
      name="Chats"
      component={ChatsScreen}
      options={{
        tabBarIcon: ({ focused }) => <TabIcon label="💬" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="Groups"
      component={GroupsScreen}
      options={{
        tabBarIcon: ({ focused }) => <TabIcon label="👥" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="Contacts"
      component={ContactsScreen}
      options={{
        tabBarIcon: ({ focused }) => <TabIcon label="📇" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="Settings"
      component={SettingsScreen}
      options={{
        tabBarIcon: ({ focused }) => <TabIcon label="⚙️" focused={focused} />,
      }}
    />
  </Tab.Navigator>
);

export default MainTabs;
