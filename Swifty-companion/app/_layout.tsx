import './i18n';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from "expo-router";
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

export default function RootLayout() {
  return (
    <I18nextProvider i18n={i18n}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack>
          <Stack.Screen name="index" options={{ title: "Accueil", headerShown: false }} />
          <Stack.Screen name="profil" options={{ title: "Profil", headerShown: false }} />
        </Stack>
      </GestureHandlerRootView>
    </I18nextProvider>
  );
}
