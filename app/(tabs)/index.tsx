import { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { API_UID, API_SECRET } from '@env';
import axios from 'axios';


export default function HomeScreen() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const getAccessToken = async () => {
      try {
        const response = await axios.post('https://api.intra.42.fr/oauth/token', {
          grant_type: 'client_credentials',
          client_id: API_UID,
          client_secret: API_SECRET,
        });
        setAccessToken(response.data.access_token);
        console.log(response.data.access_token);
      } catch (error) {
        console.error('Erreur lors de l\'obtention du jeton d\'accès:', error);
      }
    };

    getAccessToken();
  }, []);

  useEffect(() => {
    const getUserData = async () => {
      if (accessToken) {
        try {
          const response = await axios.get('https://api.intra.42.fr/v2/users/mlangloi', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          setUserData(response.data);
          console.log('Données utilisateur:', response.data);
        } catch (error) {
          console.error('Erreur lors de la récupération des données utilisateur:', error);
        }
      }
    };

    getUserData();
  }, [accessToken]);

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.text}>Hello</ThemedText>
      {userData && (
        <ThemedText style={styles.userInfo}>
          Utilisateur: {userData.login}
        </ThemedText>
      )}
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
});
