/**
 * GLITCH — application entry point.
 *
 * `react-native-gesture-handler` MUST be imported before anything else so its
 * native side is initialised ahead of the React tree (required on Android).
 * We deliberately do NOT use expo-router; navigation is driven by a custom
 * React Navigation stack mounted inside `App`.
 */
import 'react-native-gesture-handler';

import { registerRootComponent } from 'expo';

import App from './src/App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App)
// and ensures the environment is set up appropriately for Expo Go / dev client.
registerRootComponent(App);
