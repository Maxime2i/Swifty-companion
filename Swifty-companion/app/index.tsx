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

  const debouncedGetSuggestions = useMemo(
    () => debounce(async (text: string) => {
      if (accessToken && text.length > 0) {
        try {
          console.log(`Recherche de suggestions pour: "${text}"`);
          const response = await axios.get(`https://api.intra.42.fr/v2/users`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { 
              'range[login]': `${text},${text}z`,
              sort: 'login',
              'page[size]': 10
            }
          });
          
          console.log('Réponse de l\'API:', response.data);
          
          if (response.data && Array.isArray(response.data)) {
            const newSuggestions = response.data.map((user: any) => ({
              login: user.login,
              imageLink: user.image.link
            }));
            console.log('Suggestions trouvées:', newSuggestions);
            setSuggestions(newSuggestions);
          } else {
            console.log('Aucune suggestion trouvée ou format de réponse inattendu');
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
        console.log('Pas de recherche: token manquant ou texte vide');
        setSuggestions([]);
      }
    }, 300),
    [accessToken]
  );

  const handleLoginChange = (text: string) => {
    console.log('Texte saisi:', text);
    setLogin(text);
    debouncedGetSuggestions(text);
  };

  const selectSuggestion = async (suggestion: { login: string, imageLink: string }) => {
    try {
      setLogin(suggestion.login);
      setSuggestions([]);
      console.log(`Sélection de l'utilisateur: ${suggestion.login}`);
      await getUserData(suggestion.login);
    } catch (error) {
      console.error('Erreur lors de la sélection de la suggestion:', error);
    }
  };

  const getUserData = async (selectedLogin: string) => {
    if (accessToken && selectedLogin) {
      try {
        console.log(`Récupération des données pour: ${selectedLogin}`);
        const userResponse = await axios.get(`https://api.intra.42.fr/v2/users/${selectedLogin}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

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

        console.log('Données utilisateur récupérées, redirection vers le profil');
        router.push({
          pathname: '/profil',
          params: { 
            userData: JSON.stringify(userResponse.data),
            userProjects: JSON.stringify(allProjects)
          }
        });
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
