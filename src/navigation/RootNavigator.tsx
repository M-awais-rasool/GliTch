/**
 * Custom React Navigation stack (no expo-router). Headers off (the game draws
 * its own UI); the Game screen disables the swipe-back gesture so it can't fight
 * the in-game controls.
 */

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Palette } from '@/constants';
import { GameScreen } from '@/screens/GameScreen';
import { LevelSelectScreen } from '@/screens/LevelSelectScreen';
import { MainMenuScreen } from '@/screens/MainMenuScreen';

import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="MainMenu"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: Palette.black },
      }}
    >
      <Stack.Screen name="MainMenu" component={MainMenuScreen} />
      <Stack.Screen name="LevelSelect" component={LevelSelectScreen} />
      <Stack.Screen name="Game" component={GameScreen} options={{ gestureEnabled: false }} />
    </Stack.Navigator>
  );
}
