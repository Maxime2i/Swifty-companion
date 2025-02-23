import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Dimensions, SafeAreaView, StatusBar, Platform, Image, TouchableOpacity, ScrollView, Animated, FlatList, Easing } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { TouchableOpacity as TouchableOpacityGestureHandler } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import { PieChart } from 'react-native-chart-kit';



const { height, width } = Dimensions.get('window');

type Coequipiers = {
  [key: string]: number;
};

type Correctors = {
  [key: string]: number;
};

export default function ProfilScreen() {
  const router = useRouter();
  const { userData, accessToken } = useLocalSearchParams();
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [corrections, setCorrections] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('about');
  const levelProgressAnimation = useRef(new Animated.Value(0)).current;
  const [expandedProjects, setExpandedProjects] = useState<{ [key: string]: boolean }>({});
  const [selectedCursus, setSelectedCursus] = useState({ id: 0, name: '' });
  const [isCursusOpen, setIsCursusOpen] = useState(false);
  const [coequipier, setCoequipier] = useState<Coequipiers>({});
  const [correctors, setCorrectors] = useState<Correctors>({});
  const [showBasicInfo, setShowBasicInfo] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const { t, i18n } = useTranslation();
  const [currentPage, setCurrentPage] = useState(0);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const backgroundColor = isDark ? '#000000' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const cardBackground = isDark ? '#191919' : '#f0f0f0';
  const secondaryBackground = isDark ? '#333333' : '#e0e0e0';

  const confettiAnimation = useRef(new Animated.Value(0)).current;
  const starAnimation = useRef(new Animated.Value(0)).current;
  const glowAnimation = useRef(new Animated.Value(0)).current;

  const imageAnimation = useRef(new Animated.Value(0)).current;
  const rotateAnimation = useRef(new Animated.Value(0)).current;

  const [showGoatText, setShowGoatText] = useState(false);
  const goatTextAnimation = useRef(new Animated.Value(0)).current;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#1E90FF',
      paddingBottom: Platform.OS === 'ios' ? 34 : 0,
    },
    blueBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: height / 3.6,
      backgroundColor: '#1E90FF',
    },
    blackBackground: {
      position: 'absolute',
      top: height / 3.6,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: backgroundColor,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    headerContainer: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
      marginBottom: 20,
      height: 60, // Ajout d'une hauteur fixe
    },
    backButton: {
      position: 'absolute',
      left: 10,
      top: Platform.OS === 'android' ? StatusBar.currentHeight : 10,
      zIndex: 1, // Assure que le bouton est au-dessus des autres éléments
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: textColor,
      textAlign: 'center',
      flex: 1,
    },
    userInfoContainer: {
      backgroundColor: cardBackground,
      borderRadius: 10,
      padding: 20,
      marginTop: 40,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    profileImage: {
      width: 80,
      height: 80,
      borderRadius: 40,
      marginRight: 20,
    },
    userDetails: {
      flex: 1,
    },
    fullName: {
      fontSize: 20,
      fontWeight: 'bold',
      color: textColor,
      marginBottom: 5,
    },
    text: {
      fontSize: 16,
      color: textColor,
      marginBottom: 5,
    },
    levelContainer: {
      marginTop: 10,
    },
    levelBar: {
      height: 30,
      backgroundColor: secondaryBackground,
      borderRadius: 15,
      overflow: 'hidden',
      position: 'relative',
    },
    levelProgress: {
      height: '100%',
      backgroundColor: '#1E90FF',
      borderRadius: 15,
      position: 'absolute',
      left: 0,
      top: 0,
    },
    levelText: {
      position: 'absolute',
      left: 10,
      top: 0,
      bottom: 0,
      right: 10,
      textAlign: 'center',
      textAlignVertical: 'center',
      color: textColor,
      fontSize: 16,
      fontWeight: 'bold',
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: cardBackground,
      borderRadius: 10,
      padding: 10,
      marginTop: 10,
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
      paddingHorizontal: 5,
    },
    statNumber: {
      fontSize: 32,
      fontWeight: 'bold',
      color: textColor,
      lineHeight: 40,
      includeFontPadding: false,
      textAlignVertical: 'center',
    },
    statLabel: {
      fontSize: 14,
      color: textColor,
      marginTop: 5,
      textAlign: 'center',
    },
    tabContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 10,
      marginBottom: 5,
      position: 'relative',
      height: 40,
    },
    tabButton: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1,
    },
    tabButtonText: {
      color: textColor,
      fontWeight: 'bold',
      width: '90%',
      height: '100%',
      textAlignVertical: 'center',
      textAlign: 'center',
      backgroundColor: cardBackground,
      borderRadius: 20,
      fontSize: 12,
    },
    activeTabButtonText: {
      color: '#1E90FF',
      width: '90%',
      height: '100%',
      textAlignVertical: 'center',
      textAlign: 'center',
      backgroundColor: 'rgba(30, 144, 255, 0.2)',
      borderRadius: 20,
    },
    activeTabButton: {
    },
    tabContent: {
      flex: 1,
      backgroundColor: cardBackground,
      borderRadius: 10,
      marginTop: 5,
      padding: 15,
      maxHeight: '45%',
    },
    tabContentText: {
      color: textColor,
      marginBottom: 10,
      width: '100%', // Utilisez 100% de la largeur du conteneur parent
      textAlign: 'left',
    },
    projectItem: {
      marginBottom: 10,
      backgroundColor: secondaryBackground,
      borderRadius: 8,
      overflow: 'hidden',
    },
    projectHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 10,
    },
    projectName: {
      color: textColor,
      fontSize: 16,
      flex: 1,
    },
    projectRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    projectMark: {
      color: textColor,
      marginRight: 10,
    },
    projectDetails: {
      padding: 10,
      backgroundColor: secondaryBackground,
    },
    projectDetailText: {
      color: textColor,
      marginBottom: 5,
    },
    projectsScrollView: {
      flex: 1,
    },
    skillsScrollView: {
      flex: 1,
    },
    skillItem: {
      marginBottom: 15,
    },
    skillInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 5,
    },
    skillName: {
      color: textColor,
      fontSize: 16,
    },
    skillLevel: {
      color: '#1E90FF',
      fontSize: 16,
      fontWeight: 'bold',
    },
    skillBarContainer: {
      height: 10,
      backgroundColor: secondaryBackground,
      borderRadius: 5,
      overflow: 'hidden',
    },
    skillBar: {
      height: '100%',
      backgroundColor: '#1E90FF',
      borderRadius: 5,
    },
    cursusSelector: {
      marginTop: 10,
      zIndex: 1,
    },
    cursusButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: secondaryBackground,
      padding: 5,
      paddingLeft: 10,
      borderRadius: 5,
    },
    cursusButtonText: {
      color: textColor,
      fontSize: 14,
    },
    cursusList: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      backgroundColor: secondaryBackground,
      borderRadius: 5,
      marginTop: 5,
      maxHeight: 150,
      overflow: 'scroll',
    },
    cursusItem: {
      padding: 5,
      paddingLeft: 10,
      borderBottomWidth: 1,
      borderBottomColor: secondaryBackground,
    },
    cursusItemText: {
      color: textColor,
      fontSize: 14,
    },
    projectDetailHeader: {
      color: textColor,
      fontSize: 16,
      fontWeight: 'bold',
      marginTop: 10,
      marginBottom: 5,
    },
    teamItem: {
      marginLeft: 10,
      marginBottom: 10,
    },
    teamHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    teamName: {
      color: textColor,
      fontSize: 14,
      fontWeight: 'bold',
    },
    teamMark: {
      color: textColor,
      fontSize: 14,
      fontWeight: 'bold',
    },
    teamStatus: {
      color: textColor,
      fontSize: 12,
    },
    teamMembers: {
      color: textColor,
      fontSize: 12,
      fontStyle: 'italic',
    },
    teamNameContainer: {
      flex: 1,
      marginRight: 10,
    },
    teamDate: {
      color: textColor,
      fontSize: 12,
      fontWeight: 'normal',
    },
    statsSlider: {
      marginTop: 10,
    },
    statCard: {
      backgroundColor: secondaryBackground,
      borderRadius: 10,
      padding: 15,
      marginRight: 10,
      width: 150,
      height: 150,
    },
    statTitle: {
      color: textColor,
      fontSize: 14,
      marginBottom: 5,
    },
    statValue: {
      color: textColor,
      fontSize: 18,
      fontWeight: 'bold',
    },
    aboutToggle: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 15,
    },
    toggleButton: {
      flex: 1,
      padding: 10,
      alignItems: 'center',
      backgroundColor: secondaryBackground,
      borderRadius: 15,
      marginHorizontal: 10,
    },
    activeToggleButton: {
      backgroundColor: '#3A96FF',
    },
    toggleButtonText: {
      color: textColor,
      fontWeight: 'bold',
    },
    coequipierText: {
      color: textColor,
      fontSize: 14,
    },
    coequipierItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: -2,
    },
    coequipierRank: {
      color: textColor,
      fontSize: 14,
      marginRight: 5,
    },
    coequipierLogin: {
      color: textColor,
      fontSize: 14,
    },
    coequipierCount: {
      color: textColor,
      fontSize: 14,
    },
    page: {
      width: Dimensions.get('window').width - 70, // Ajusté pour le nouveau padding
      paddingHorizontal: 10, // Ajoute un padding horizontal
    },
    pagination: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 10,
    },
    paginationDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: 'gray',
      marginHorizontal: 4,
      marginTop: '5%',
    },
    paginationDotActive: {
      backgroundColor: '#1E90FF', // Assurez-vous que cette couleur est bien visible
      width: 10, // Légèrement plus grand pour mieux le distinguer
      height: 10,
    },
    statsPageContainer: {
      minHeight: 190, // Hauteur minimale fixe pour éviter le redimensionnement
      justifyContent: 'flex-start',
    },
    statsText: {
      fontSize: 14,
      color: textColor,
      marginBottom: 8,
      minHeight: 20,
    },
    statsTitle: {
      fontSize: 14,
      color: textColor,
      marginBottom: 10,
      fontWeight: 'bold',
    },
    profileImageContainer: {
      width: 80,
      height: 80,
      marginRight: 20,
      position: 'relative',
    },
    goatText: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      textAlign: 'center',
      textAlignVertical: 'center',
      fontSize: 24,
      fontWeight: 'bold',
      color: '#1E90FF',
      zIndex: -1,
    },
  });
  

  



  useEffect(() => {
    if (userData && accessToken) {
      setIsLoading(true);
      try {
        const parsedUserData = JSON.parse(userData as string);
        setUser(parsedUserData);



        // Sélectionner le cursus avec l'ID le plus élevé par défaut
        if (parsedUserData.cursus_users && parsedUserData.cursus_users.length > 0) {
          const defaultCursus = parsedUserData.cursus_users.reduce((prev: any, current: any) => {
            return (prev.cursus.id > current.cursus.id) ? prev : current;
          }).cursus;
          setSelectedCursus({ id: defaultCursus.id, name: defaultCursus.name });
        }
        
        // Animer la barre de niveau
        Animated.timing(levelProgressAnimation, {
          toValue: ((parsedUserData.cursus_users?.[1]?.level || 0) % 1) * 100,
          duration: 1000,
          useNativeDriver: false,
        }).start();

        // Récupérer les projets et les corrections
        fetchProjectsAndCorrections(parsedUserData.login, accessToken as string);
      } catch (error) {
        console.error('Erreur lors de l\'analyse des données:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [userData, accessToken]);

  const fetchProjectsAndCorrections = async (login: string, token: string) => {
    try {
      const allProjects = await fetchAllPages(`https://api.intra.42.fr/v2/users/${login}/projects_users`, token);
      const allCorrections = await fetchAllPages(`https://api.intra.42.fr/v2/users/${login}/scale_teams/as_corrected`, token);

      setProjects(allProjects);
      setCorrections(allCorrections);

      // Calculer les coéquipiers
      const coequipierStats = calculateCoequipiers(allProjects, login);
      setCoequipier(coequipierStats);

      // Traiter les corrections
      const correctorStats = calculateCorrectors(allCorrections);
      setCorrectors(correctorStats);

      // Indiquer que les projets ont été chargés
      setProjectsLoaded(true);
    } catch (error) {
      console.error('Erreur lors de la récupération des projets et corrections:', error);
    }
  };

  const fetchAllPages = async (url: string, token: string) => {
    let allData: any[] = [];
    let page = 1;
    let hasMoreData = true;

    while (hasMoreData) {
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: page, per_page: 100 }
      });
      
      allData = [...allData, ...response.data];

      if (response.data.length < 100) {
        hasMoreData = false;
      } else {
        page++;
      }
    }

    return allData;
  };

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
  };

  const renderTabContent = () => {
    if (!user) return null;

    switch (activeTab) {
      case 'about':
        return (
          <View>
            <View style={styles.aboutToggle}>
             
            </View>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
            >
              <View style={styles.page}>
                <ThemedText style={styles.tabContentText}>{t('Email')}: {user.email || t('Non disponible')}</ThemedText>
                <ThemedText style={styles.tabContentText}>{t('Téléphone')}: {user.phone || t('Caché')}</ThemedText>
                <ThemedText style={styles.tabContentText}>{t('Localisation')}: {user.location || t('Non disponible')}</ThemedText>
              </View>
              <View style={styles.page}>
                <ThemedText style={[styles.tabContentText]}>{t('Moyenne des projets')}: {(projects.filter(p => p.cursus_ids.includes(selectedCursus.id) && p.final_mark !== null)
                      .reduce((sum, p) => sum + p.final_mark, 0) / 
                      projects.filter(p => p.cursus_ids.includes(selectedCursus.id) && p.final_mark !== null).length
                    ).toFixed(2)}</ThemedText>
                <ThemedText style={[styles.tabContentText]}>{t('Jours depuis inscription')}: {Math.floor((new Date().getTime() - new Date(user.created_at).getTime()) / (1000 * 3600 * 24))}</ThemedText>
                <ThemedText style={styles.tabContentText}>{t('Campus')}: {user.campus?.map((campus: { name: string; }) => campus.name).join(', ') || t('Non spécifié')}</ThemedText>
              </View>
              <View style={styles.page}>
                <ThemedText style={styles.tabContentText}>{t('Top 5 des coéquipiers')}: </ThemedText>
                
                {Object.entries(coequipier).length > 0 ? (
                  Object.entries(coequipier)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([login, count], index) => (
                      <View key={login} style={styles.coequipierItem}>
                        <ThemedText style={styles.coequipierRank}>{index + 1}.</ThemedText>
                        <ThemedText style={styles.coequipierLogin}>{login}</ThemedText>
                        <ThemedText style={styles.coequipierCount}> ({count} {t('projets')})</ThemedText>
                      </View>
                    ))
                ) : (
                  <ThemedText style={styles.coequipierText}>{t('Aucun coéquipier trouvé')}</ThemedText>
                )}
              </View>
              <View style={styles.page}>
                <ThemedText style={styles.tabContentText}>{t('Top 5 des correcteurs')}: </ThemedText>
                {Object.entries(correctors).length > 0 ? (
                  Object.entries(correctors)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([login, count], index) => (
                      <View key={login} style={styles.coequipierItem}>
                        <ThemedText style={styles.coequipierRank}>{index + 1}.</ThemedText>
                        <ThemedText style={styles.coequipierLogin}>{login}</ThemedText>
                        <ThemedText style={styles.coequipierCount}> ({count} {t('projets')})</ThemedText>
                      </View>
                    ))
                ) : (
                  <ThemedText style={styles.coequipierText}>{t('Aucun correcteur trouvé')}</ThemedText>
                )}
              </View>
              <View style={[styles.page, styles.statsPageContainer]}>
                <ThemedText style={styles.statsTitle}>
                  {t('Statistiques des projets')}:
                </ThemedText>
                
                <ThemedText style={styles.statsText}>
                  {t('Projet le plus long')}: {
                    projects.filter(p => p.cursus_ids.includes(selectedCursus.id) && p["validated?"]).length > 0 
                    ? `${
                        projects
                          .filter(p => p.cursus_ids.includes(selectedCursus.id) && p["validated?"])
                          .map(p => ({
                            ...p,
                            realDuration: Math.abs((new Date(p.marked_at).getTime() - new Date(p.created_at).getTime()) / (1000 * 3600))
                          }))
                          .reduce((longest, p) => 
                            p.realDuration > longest.realDuration ? p : longest
                          ).project.name
                      } (${
                        Math.round(projects
                          .filter(p => p.cursus_ids.includes(selectedCursus.id) && p["validated?"])
                          .map(p => ({
                            ...p,
                            realDuration: Math.abs((new Date(p.marked_at).getTime() - new Date(p.created_at).getTime()) / (1000 * 3600))
                          }))
                          .reduce((longest, p) => 
                            p.realDuration > longest.realDuration ? p : longest
                          ).realDuration)
                      } ${t('heures')})`
                    : t('Chargement...')
                  }
                </ThemedText>
                
                <ThemedText style={styles.statsText}>
                  {t('Projet le plus court')}: {
                    projects.filter(p => p.cursus_ids.includes(selectedCursus.id) && p["validated?"]).length > 0 
                    ? `${
                        projects
                          .filter(p => p.cursus_ids.includes(selectedCursus.id) && p["validated?"])
                          .map(p => ({
                            ...p,
                            realDuration: Math.abs((new Date(p.marked_at).getTime() - new Date(p.created_at).getTime()) / (1000 * 3600))
                          }))
                          .filter(p => p.realDuration > 0)
                          .reduce((shortest, p) => 
                            p.realDuration < shortest.realDuration ? p : shortest
                          ).project.name
                      } (${
                        Math.round(projects
                          .filter(p => p.cursus_ids.includes(selectedCursus.id) && p["validated?"])
                          .map(p => ({
                            ...p,
                            realDuration: Math.abs((new Date(p.marked_at).getTime() - new Date(p.created_at).getTime()) / (1000 * 3600))
                          }))
                          .filter(p => p.realDuration > 0)
                          .reduce((shortest, p) => 
                            p.realDuration < shortest.realDuration ? p : shortest
                          ).realDuration)
                      } ${t('heures')})`
                    : t('Chargement...')
                  }
                </ThemedText>
              </View>
              <View style={styles.page}>
                <ThemedText style={styles.tabContentText}>{t('Répartition des notes')}: </ThemedText>
                {projects.length > 0 ? (
                  <PieChart
                    data={calculateProjectStats(projects, selectedCursus.id)}
                    width={Dimensions.get('window').width - 90}
                    height={150}
                    chartConfig={{
                      backgroundColor: '#ffffff',
                      backgroundGradientFrom: '#ffffff',
                      backgroundGradientTo: '#ffffff',
                      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      labelColor: (opacity = 1) => textColor,
                      style: {
                        borderRadius: 16
                      },
                      propsForDots: {
                        r: "6",
                        strokeWidth: "2",
                        stroke: "#ffa726"
                      }
                    }}
                    accessor="population"
                    backgroundColor="transparent"
                    hasLegend={true}
                    center={[0, 0]}
                  />
                ) : (
                  <ThemedText style={styles.coequipierText}>{t('Aucun projet trouvé')}</ThemedText>
                )}
              </View>
            </ScrollView>
            <View style={styles.pagination}>
              {[...Array(6)].map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    currentPage === index ? styles.paginationDotActive : null
                  ]}
                />
              ))}
            </View>
          </View>
        );
      case 'projects':
        return (
          <ScrollView style={styles.projectsScrollView}>
            {projects.filter((project) => project.cursus_ids.includes(selectedCursus.id)).map((project, index) => (
              <View key={index} style={styles.projectItem}>
                <TouchableOpacity 
                  style={styles.projectHeader}
                  onPress={() => setExpandedProjects(prev => ({ ...prev, [project.id]: !prev[project.id] }))}
                >
                  <ThemedText style={styles.projectName}>{project.project.name}</ThemedText>
                  <View style={styles.projectRight}>
                    <ThemedText 
                      style={[
                        styles.projectMark,
                        project.final_mark && {
                          color: project["validated?"] ? '#1E90FF' : '#FF5252'
                        }
                      ]}
                    >
                      {project.final_mark || 'En cours'}
                    </ThemedText>
                    <Ionicons 
                      name={expandedProjects[project.id] ? "chevron-up" : "chevron-down"} 
                      size={24} 
                      color={textColor} 
                    />
                  </View>
                </TouchableOpacity>
                {expandedProjects[project.id] && (
                  <View style={styles.projectDetails}>
                    {project.teams && project.teams.length > 0 ? (
                      <>
                        {project.teams.slice().reverse().map((team: any, teamIndex: number) => (
                          <View key={teamIndex} style={styles.teamItem}>
                            <View style={styles.teamHeader}>
                              <View style={styles.teamNameContainer}>
                                <ThemedText style={styles.teamName}>
                                  {team.name}
                                  <ThemedText style={styles.teamDate}>
                                    {' '}({new Date(team.created_at).toLocaleDateString('fr-FR')})
                                  </ThemedText>
                                </ThemedText>
                              </View>
                              <ThemedText 
                                style={[
                                  styles.teamMark,
                                  team.final_mark !== undefined && team.final_mark !== null && {
                                    color: project["validated?"] ? '#1E90FF' : '#FF5252'
                                  }
                                ]}
                              >
                                {team.final_mark !== undefined && team.final_mark !== null
                                  ? team.final_mark
                                  : "En cours"}
                              </ThemedText>
                            </View>
                          </View>
                        ))}
                      </>
                    ) : (
                      <ThemedText style={styles.projectDetailText}>{t('Aucune équipe pour ce projet')}</ThemedText>
                    )}
                  </View>
                )}
              </View>
            )) || <ThemedText style={styles.tabContentText}>{t('Aucun projet disponible pour ce cursus')}</ThemedText>}
          </ScrollView>
        );
      case 'skills':
        const selectedCursusUser = user.cursus_users?.find((cu: { cursus: { id: number; }; }) => cu.cursus.id === selectedCursus.id);
        return (
          <ScrollView style={styles.skillsScrollView}>
            {selectedCursusUser?.skills?.map((skill: any, index: number) => (
              <View key={index} style={styles.skillItem}>
                <View style={styles.skillInfo}>
                  <ThemedText style={styles.skillName}>{skill.name}</ThemedText>
                  <ThemedText style={styles.skillLevel}>{skill.level.toFixed(2)}</ThemedText>
                </View>
                <View style={styles.skillBarContainer}>
                  <View style={[styles.skillBar, { width: `${(skill.level / 20) * 100}%` }]} />
                </View>
              </View>
            )) || <ThemedText style={styles.tabContentText}>{t('Aucune compétence disponible pour ce cursus')}</ThemedText>}
          </ScrollView>
        );
      default:
        return null;
    }
  };

  const handleGoBack = () => {
    router.back();  // Utiliser router.back() au lieu de router.replace('/')
  };

  // Fonction pour calculer les coéquipiers
  const calculateCoequipiers = (projects: any, userLogin: any) => {
    let coequipierStats: { [key: string]: number } = {};
    projects.forEach((project: any) => {
      if (project.teams && project.teams.length > 0) {
        project.teams.forEach((team: { users: any[]; }) => {
          team.users.forEach((user) => {
            if (user.login !== userLogin) {
              coequipierStats[user.login] = (coequipierStats[user.login] || 0) + 1;
            }
          });
        });
      }
    });
    return coequipierStats;
  };

  // Fonction pour calculer les correcteurs
  const calculateCorrectors = (corrections: any) => {
    let correctorStats: { [key: string]: number } = {};
    corrections.forEach((correction: any) => {
      const correctorLogin = correction.corrector.login;
      correctorStats[correctorLogin] = (correctorStats[correctorLogin] || 0) + 1;
    });
    return correctorStats;
  };

  const handleScroll = (event: any) => {
    const { contentOffset, layoutMeasurement } = event.nativeEvent;
    const pageIndex = Math.round(contentOffset.x / layoutMeasurement.width);
    setCurrentPage(pageIndex);
  };

  const specialStyles = StyleSheet.create({
    specialContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
    },
    confetti: {
      position: 'absolute',
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    specialTitle: {
      position: 'absolute',
      width: '100%',
      textAlign: 'center',
      fontSize: 32,
      fontWeight: 'bold',
      color: '#FFD700',
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: { width: 2, height: 2 },
      textShadowRadius: 5,
      top: '20%',
      zIndex: 1001,
    },
  });

  const titleAnimation = useRef(new Animated.Value(0)).current;

  const animateProfileImage = () => {
    // Reset des animations
    imageAnimation.setValue(0);
    rotateAnimation.setValue(0);
    goatTextAnimation.setValue(0);

    setShowGoatText(true);

    Animated.parallel([
      Animated.timing(imageAnimation, {
        toValue: 1,
        duration: 1200,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnimation, {
        toValue: 1,
        duration: 1200,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(goatTextAnimation, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(goatTextAnimation, {
          toValue: 0,
          duration: 600,
          delay: 1000,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => setShowGoatText(false));
  };

  const calculateProjectStats = (projects: any[], selectedCursusId: number) => {
    const filteredProjects = projects.filter(p => 
      p.cursus_ids.includes(selectedCursusId) && 
      p.final_mark !== null
    );

    const above100 = filteredProjects.filter(p => p.final_mark > 100).length;
    const below100 = filteredProjects.filter(p => p.final_mark <= 100).length;

    return [
      {
        name: t('> 100'),
        population: above100,
        color: '#1E90FF',
        legendFontColor: textColor,
        legendFontSize: 15
      },
      {
        name: t('≤ 100'),
        population: below100,
        color: '#FF5252',
        legendFontColor: textColor,
        legendFontSize: 15
      }
    ];
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E90FF" />
      <View style={styles.blueBackground} />
      <View style={styles.blackBackground} />
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <TouchableOpacityGestureHandler onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacityGestureHandler>
          <ThemedText style={styles.headerTitle}>{t('Profil 42')}</ThemedText>
        </View>
        {user ? (
          <>
            <View style={styles.userInfoContainer}>
              <View style={styles.userInfo}>
                <View style={styles.profileImageContainer}>
                  {showGoatText && user.login === 'mlangloi' && (
                    <Animated.Text
                      style={[
                        styles.goatText,
                        {
                          opacity: goatTextAnimation,
                        },
                      ]}
                    >
                      GOAT
                    </Animated.Text>
                  )}
                  <TouchableOpacity onPress={animateProfileImage}>
                    <Animated.Image 
                      source={{ uri: user.image?.link }} 
                      style={[
                        styles.profileImage,
                        {
                          transform: [
                            {
                              translateY: imageAnimation.interpolate({
                                inputRange: [0, 0.5, 1],
                                outputRange: [0, -50, 0],
                              }),
                            },
                            {
                              rotateY: rotateAnimation.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0deg', '720deg'],
                              }),
                            },
                          ],
                        },
                      ]} 
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.userDetails}>
                  <ThemedText style={styles.fullName}>{user.usual_full_name}</ThemedText>
                  <ThemedText style={styles.text}>@{user.login}  ({user.kind})</ThemedText>
                  <View style={styles.cursusSelector}>
                    <TouchableOpacity onPress={() => setIsCursusOpen(!isCursusOpen)} style={styles.cursusButton}>
                      <ThemedText style={styles.cursusButtonText}>
                        {selectedCursus.name || 'Sélectionner un cursus'}
                      </ThemedText>
                      <Ionicons name={isCursusOpen ? "chevron-up" : "chevron-down"} size={20} color={textColor} />
                    </TouchableOpacity>
                    {isCursusOpen && (
                      <View style={styles.cursusList}>
                        {user.cursus_users?.map((cursusUser: any, index: number) => (
                          <TouchableOpacity
                            key={index}
                            style={styles.cursusItem}
                            onPress={() => {
                              setSelectedCursus({ id: cursusUser.cursus.id, name: cursusUser.cursus.name });
                              setIsCursusOpen(false);
                            }}
                          >
                            <ThemedText style={styles.cursusItemText}>{cursusUser.cursus.name}</ThemedText>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              </View>
              <View style={styles.levelContainer}>
                <View style={styles.levelBar}>
                  <Animated.View 
                    style={[
                      styles.levelProgress, 
                      { 
                        width: levelProgressAnimation.interpolate({
                          inputRange: [0, 100],
                          outputRange: ['0%', '100%'],
                        }) 
                      }
                    ]} 
                  />
                  <ThemedText style={styles.levelText}>
                    {user.cursus_users?.[1]?.level
                      ? `Level ${Math.floor(user.cursus_users[1].level)} - ${Math.round((user.cursus_users[1].level % 1) * 100)}%`
                      : 'N/A'}
                  </ThemedText>
                </View>
              </View>
            </View>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                {projectsLoaded ? (
                  <ThemedText style={styles.statNumber}>{projects.length}</ThemedText>
                ) : (
                  <ThemedText style={styles.statNumber}>-</ThemedText>
                )}
                <ThemedText style={styles.statLabel}>{t('Projets')}</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={styles.statNumber}>{user.correction_point || 0}</ThemedText>
                <ThemedText style={styles.statLabel}>{t('Points d\'évaluation')}</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={styles.statNumber}>{user.wallet || 0}</ThemedText>
                <ThemedText style={styles.statLabel}>{t('Portefeuille')}</ThemedText>
              </View>
            </View>
          </>
        ) : (
          <ThemedText style={styles.text}>{t('Chargement des données...')}</ThemedText>
        )}
        
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'about' && styles.activeTabButton]}
            onPress={() => handleTabPress('about')}>
            <ThemedText style={[styles.tabButtonText, activeTab === 'about' && styles.activeTabButtonText]}>{t('À propos')}</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'projects' && styles.activeTabButton]}
            onPress={() => handleTabPress('projects')}>
            <ThemedText style={[styles.tabButtonText, activeTab === 'projects' && styles.activeTabButtonText]}>{t('Projets')}</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'skills' && styles.activeTabButton]}
            onPress={() => handleTabPress('skills')}>
            <ThemedText style={[styles.tabButtonText, activeTab === 'skills' && styles.activeTabButtonText]}>{t('Compétences')}</ThemedText>
          </TouchableOpacity>
        </View>
        <View style={styles.tabContent}>
          {renderTabContent()}
        </View>
      </View>
      
    
    </SafeAreaView>
  );
}

