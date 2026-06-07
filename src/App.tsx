/**
 * Application root.
 *
 * Provider order matters:
 *  - GestureHandlerRootView must wrap everything for react-native-gesture-handler.
 *  - SafeAreaProvider supplies insets to the HUD/menus.
 *  - NavigationContainer hosts the custom stack with a dark theme so there is no
 *    white flash between screens.
 */

import { NavigationContainer, DefaultTheme, type Theme } from '@react-navigation/native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { GlitchColors, Palette } from '@/constants';
import { RootNavigator } from '@/navigation/RootNavigator';

const navTheme: Theme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: Palette.black,
    card: Palette.black,
    text: Palette.textPrimary,
    border: 'transparent',
    primary: GlitchColors.blue,
    notification: Palette.danger,
  },
};

export default function App() {
  // Enforce landscape at runtime regardless of build type (app.json alone needs
  // a native rebuild for dev builds; this locks it on every launch).
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE).catch(() => {
      /* orientation lock is best-effort; ignore unsupported platforms */
    });
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar style="light" hidden />
        <NavigationContainer theme={navTheme}>
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.black,
  },
});
