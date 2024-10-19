import { useState, useEffect, useMemo } from 'react';
import { StyleSheet, TextInput, View, TouchableOpacity, FlatList, Image } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const debounce = (func: (...args: any[]) => void, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export default function HomeScreen() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [login, setLogin] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Array<{ login: string, imageLink: string }>>([]);
  const [tokenExpiration, setTokenExpiration] = useState<number | null>(null);
  const router = useRouter();

  const getNewAccessToken = async () => {
    try {
      const response = await axios.post('https://api.intra.42.fr/oauth/token', {
        grant_type: 'client_credentials',
        client_id: process.env.EXPO_PUBLIC_API_UID,
        client_secret: process.env.EXPO_PUBLIC_API_SECRET,
      });
      setAccessToken(response.data.access_token);
      setTokenExpiration(Date.now() + response.data.expires_in * 1000);
    } catch (error) {
      console.error('Erreur lors de l\'obtention du jeton d\'accès:', error);
    }
  };

  useEffect(() => {
    getNewAccessToken();
  }, []);

  const checkAndRefreshToken = async () => {
    if (!tokenExpiration || Date.now() >= tokenExpiration) {
      await getNewAccessToken();
    }
  };

  const debouncedGetSuggestions = useMemo(
    () => debounce(async (text: string) => {
      await checkAndRefreshToken();
      if (accessToken && text.length > 0) {
        try {
          const response = await axios.get(`https://api.intra.42.fr/v2/users`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { 
              'range[login]': `${text},${text}z`,
              sort: 'login',
              'page[size]': 10
            }
          });
          
          
          if (response.data && Array.isArray(response.data)) {
            const newSuggestions = response.data.map((user: any) => ({
              login: user.login,
              imageLink: user.image.link
            }));
            setSuggestions(newSuggestions);
          } else {
            setSuggestions([]);
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des suggestions:', error);
          if (axios.isAxiosError(error) && error.response) {
            console.error('Détails de l\'erreur:', error.response.data);
            if (error.response.status === 429) {
              console.error('Trop de requêtes. Veuillez attendre avant de réessayer.');
              // Ici, vous pourriez ajouter une logique pour informer l'utilisateur
            }
          }
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
      }
    }, 300),
    [accessToken, tokenExpiration]
  );

  const handleLoginChange = (text: string) => {
    setLogin(text);
    debouncedGetSuggestions(text);
  };

  const selectSuggestion = async (suggestion: { login: string, imageLink: string }) => {
    try {
      setLogin(suggestion.login);
      setSuggestions([]);
      await getUserData(suggestion.login);
    } catch (error) {
      console.error('Erreur lors de la sélection de la suggestion:', error);
    }
  };

  const getUserData = async (selectedLogin: string) => {
    await checkAndRefreshToken();
    if (accessToken && selectedLogin) {
      try {
        const userResponse = await axios.get(`https://api.intra.42.fr/v2/users/${selectedLogin}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        // Récupération de tous les projets (code inchangé)
        let allProjects: any[] = [];
        let page = 1;
        let hasMoreProjects = true;

        while (hasMoreProjects) {
          const projectsResponse = await axios.get(`https://api.intra.42.fr/v2/users/${selectedLogin}/projects_users`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { page: page, per_page: 100 }
          });
          
          allProjects = [...allProjects, ...projectsResponse.data];

          if (projectsResponse.data.length < 100) {
            hasMoreProjects = false;
          } else {
            page++;
          }
        }

        // Nouvelle logique pour récupérer toutes les corrections
        let allCorrections: any[] = [];
        page = 1;
        let hasMoreCorrections = true;

        while (hasMoreCorrections) {
          const correctionsResponse = await axios.get(`https://api.intra.42.fr/v2/users/${selectedLogin}/scale_teams/as_corrected`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { page: page, per_page: 100 }
          });
          
          allCorrections = [...allCorrections, ...correctionsResponse.data];

          if (correctionsResponse.data.length < 100) {
            hasMoreCorrections = false;
          } else {
            page++;
          }
        }

        router.push({
          pathname: '/profil',
          params: { 
            userData: JSON.stringify(userResponse.data),
            userProjects: JSON.stringify(allProjects),
            userCorrections: JSON.stringify(allCorrections),
          }
        });

        // Réinitialiser le login après la navigation
        setLogin('');
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        // Afficher un message d'erreur à l'utilisateur ici
      }
    }
  };

  const renderSuggestion = ({ item }: { item: { login: string, imageLink: string } }) => (
    <TouchableOpacity 
      onPress={() => selectSuggestion(item)}
      style={styles.suggestionItem}
      activeOpacity={0.7}
    >
      <View style={styles.suggestionContent}>
        <Image source={{ uri: item.imageLink }} style={styles.suggestionImage} />
        <ThemedText style={styles.suggestionText}>{item.login}</ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            onChangeText={handleLoginChange}
            value={login}
            placeholder="Entrez le login"
            placeholderTextColor="#888"
          />
          <TouchableOpacity onPress={() => getUserData(login)} style={styles.searchButton}>
            <Ionicons name="search" size={24} color="white" />
          </TouchableOpacity>
        </View>
        {suggestions.length > 0 && (
          <FlatList
            data={suggestions}
            renderItem={renderSuggestion}
            keyExtractor={(item) => item.login}
            style={styles.suggestionsList}
          />
        )}
      </View>
      {/* Vous pouvez ajouter ce log temporaire pour vérifier les suggestions */}
      <ThemedText>Suggestions: {JSON.stringify(suggestions)}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  topSection: {
    paddingTop: 160,
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    backgroundColor: '#191919',
    borderRadius: 5,
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
    color: 'white',
  },
  searchButton: {
    padding: 10,
  },
  suggestionsList: {
    maxHeight: 200, // Limitez la hauteur de la liste si nécessaire
    width: '80%',
    paddingTop: 10,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  suggestionText: {
    fontSize: 16,
    color: 'white',
  },
});
