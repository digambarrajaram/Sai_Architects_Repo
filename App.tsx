import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { navigationService } from './src/navigation/NavigationService';
import { enableScreens } from 'react-native-screens';
import { AuthProvider } from './src/context/AuthContext';

enableScreens();

function App() {
  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <AuthProvider>
        <StatusBar style="auto" />
        <AppNavigator
          ref={(navigatorRef) => {
            if (navigatorRef) {
              navigationService.setNavigationRef(navigatorRef);
            }
          }}
        />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

registerRootComponent(App);

export default App;
