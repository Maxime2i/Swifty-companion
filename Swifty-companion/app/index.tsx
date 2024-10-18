import { useState, useEffect } from 'react';
import { StyleSheet, Button, TextInput } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import axios from 'axios';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [login, setLogin] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const getAccessToken = async () => {
      try {
        const response = await axios.post('https://api.intra.42.fr/oauth/token', {
          grant_type: 'client_credentials',
          client_id: process.env.EXPO_PUBLIC_API_UID,
          client_secret: process.env.EXPO_PUBLIC_API_SECRET,
        });
        setAccessToken(response.data.access_token);
        console.log(response.data.access_token);
      } catch (error) {
        console.error('Erreur lors de l\'obtention du jeton d\'accès:', error);
      }
    };

    getAccessToken();
  }, []);

  const getUserData = async () => {
    if (accessToken && login) {
      try {
        const response = await axios.get(`https://api.intra.42.fr/v2/users/${login}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        console.log('Données utilisateur:', response.data);
        // Redirection vers la page de profil avec les données utilisateur
        router.push({
          pathname: '/profil',
          params: { userData: JSON.stringify(response.data) }
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des données utilisateur:', error);
        // Afficher un message d'erreur à l'utilisateur ici
      }
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.text}>Hello</ThemedText>
      <TextInput
        style={styles.input}
        onChangeText={setLogin}
        value={login}
        placeholder="Entrez le login"
        placeholderTextColor="#888"
      />
      <Button 
        title="Rechercher" 
        onPress={getUserData}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userInfo: {
    color: 'white',
    fontSize: 18,
    marginTop: 20,
  },
  link: {
    marginTop: 20,
  },
  input: {
    height: 40,
    width: '80%',
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    color: 'white',
  },
});
