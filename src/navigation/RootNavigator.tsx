import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import AuthStack from './AuthStack';
import AppStack from './AppStack';
import SplashScreen from '@/screens/SplashScreen';
import ProfileSetupScreen from '@/screens/auth/ProfileSetupScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const ProfileGate = createNativeStackNavigator();
const ProfileGateNav: React.FC = () => (
  <ProfileGate.Navigator screenOptions={{ headerShown: false }}>
    <ProfileGate.Screen name="ProfileSetup" component={ProfileSetupScreen} />
  </ProfileGate.Navigator>
);

const RootNavigator: React.FC = () => {
  const { user, initializing, hasProfile } = useAuth();

  if (initializing) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      {!user ? <AuthStack /> : !hasProfile ? <ProfileGateNav /> : <AppStack />}
    </NavigationContainer>
  );
};

export default RootNavigator;
