import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Dimensions, SafeAreaView, StatusBar, Platform, Image, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { TouchableOpacity as TouchableOpacityGestureHandler } from 'react-native-gesture-handler';

const { height, width } = Dimensions.get('window');

export default function ProfilScreen() {
  const { userData, userProjects } = useLocalSearchParams();
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('about');
  const animatedValue = useRef(new Animated.Value(0)).current;
  const levelProgressAnimation = useRef(new Animated.Value(0)).current;
  const [expandedProjects, setExpandedProjects] = useState<{ [key: string]: boolean }>({});
  const [selectedCursus, setSelectedCursus] = useState({ id: 0, name: '' });
  const [isCursusOpen, setIsCursusOpen] = useState(false);

  useEffect(() => {
    if (userData && userProjects) {
      try {
        const parsedUserData = JSON.parse(userData as string);
        const parsedUserProjects = JSON.parse(userProjects as string);
        setUser(parsedUserData);
        setProjects(parsedUserProjects);
        
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
      } catch (error) {
        console.error('Erreur lors de l\'analyse des données:', error);
      }
    }
  }, [userData, userProjects]);

  const handleTabPress = (tab: string) => {
    let toValue = 0;
    if (tab === 'projects') toValue = 1;
    if (tab === 'skills') toValue = 2;

    Animated.timing(animatedValue, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();

    setActiveTab(tab);
  };

  const backgroundPosition = animatedValue.interpolate({
    inputRange: [0, 1, 2],
    outputRange: ['0%', '33.33%', '66.66%'],
  });

  const renderTabContent = () => {
    if (!user) return null;

    switch (activeTab) {
      case 'about':
        return (
          <View>
            <ThemedText style={styles.tabContentText}>Email: {user.email || 'Non disponible'}</ThemedText>
            <ThemedText style={styles.tabContentText}>Téléphone: {user.phone || 'Caché'}</ThemedText>
            <ThemedText style={styles.tabContentText}>Campus: {user.campus?.map((campus: { name: string; }) => campus.name).join(', ') || 'Non spécifié'}</ThemedText>
            <ThemedText style={styles.tabContentText}>Localisation: {user.location || 'Non disponible'}</ThemedText>
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
                    <ThemedText style={styles.projectMark}>{project.final_mark || 'En cours'}</ThemedText>
                    <Ionicons 
                      name={expandedProjects[project.id] ? "chevron-up" : "chevron-down"} 
                      size={24} 
                      color="white" 
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
                              <ThemedText style={styles.teamMark}>
                                {team.final_mark !== undefined && team.final_mark !== null
                                  ? team.final_mark
                                  : "En cours"}
                              </ThemedText>
                            </View>
                          </View>
                        ))}
                      </>
                    ) : (
                      <ThemedText style={styles.projectDetailText}>Aucune équipe pour ce projet</ThemedText>
                    )}
                  </View>
                )}
              </View>
            )) || <ThemedText style={styles.tabContentText}>Aucun projet disponible pour ce cursus</ThemedText>}
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
            )) || <ThemedText style={styles.tabContentText}>Aucune compétence disponible pour ce cursus</ThemedText>}
          </ScrollView>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E90FF" />
      <View style={styles.blueBackground} />
      <View style={styles.blackBackground} />
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <ThemedText style={styles.headerTitle}>Profil 42</ThemedText>
        </View>
        {user ? (
          <>
            <View style={styles.userInfoContainer}>
              <View style={styles.userInfo}>
                <Image 
                  source={{ uri: user.image?.link }} 
                  style={styles.profileImage} 
                />
                <View style={styles.userDetails}>
                  <ThemedText style={styles.fullName}>{user.usual_full_name}</ThemedText>
                  <ThemedText style={styles.text}>@{user.login}  ({user.kind})</ThemedText>
                  <View style={styles.cursusSelector}>
                    <TouchableOpacity onPress={() => setIsCursusOpen(!isCursusOpen)} style={styles.cursusButton}>
                      <ThemedText style={styles.cursusButtonText}>
                        {selectedCursus.name || 'Sélectionner un cursus'}
                      </ThemedText>
                      <Ionicons name={isCursusOpen ? "chevron-up" : "chevron-down"} size={20} color="white" />
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
                <ThemedText style={styles.statNumber}>{projects.length || 0}</ThemedText>
                <ThemedText style={styles.statLabel}>Projets</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={styles.statNumber}>{user.correction_point || 0}</ThemedText>
                <ThemedText style={styles.statLabel}>Evaluation points</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={styles.statNumber}>{user.wallet || 0}</ThemedText>
                <ThemedText style={styles.statLabel}>Wallet</ThemedText>
              </View>
            </View>
          </>
        ) : (
          <ThemedText style={styles.text}>Chargement des données...</ThemedText>
        )}
        
        <View style={styles.tabContainer}>
          <Animated.View style={[styles.animatedBackground, { left: backgroundPosition }]} />
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => handleTabPress('about')}>
            <ThemedText style={[styles.tabButtonText, activeTab === 'about' && styles.activeTabButtonText]}>About</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => handleTabPress('projects')}>
            <ThemedText style={[styles.tabButtonText, activeTab === 'projects' && styles.activeTabButtonText]}>Projects</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => handleTabPress('skills')}>
            <ThemedText style={[styles.tabButtonText, activeTab === 'skills' && styles.activeTabButtonText]}>Skills</ThemedText>
          </TouchableOpacity>
        </View>
        <View style={styles.tabContent}>
          {renderTabContent()}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E90FF',
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
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerContainer: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  userInfoContainer: {
    backgroundColor: '#191919',
    borderRadius: 10,
    padding: 20,
    marginTop: 100,
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
    color: 'white',
    marginBottom: 5,
  },
  text: {
    fontSize: 16,
    color: 'white',
    marginBottom: 5,
  },
  levelContainer: {
    marginTop: 10,
  },
  levelBar: {
    height: 30,
    backgroundColor: '#333',
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
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#191919',
    borderRadius: 10,
    padding: 20,
    marginTop: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 5,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    lineHeight: 40,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    marginBottom: 10,
    position: 'relative',
    height: 40,
  },
  animatedBackground: {
    position: 'absolute',
    width: '33.33%',
    height: '100%',
    backgroundColor: 'rgba(30, 144, 255, 0.2)',
    borderRadius: 20,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  tabButtonText: {
    color: '#888',
    fontWeight: 'bold',
  },
  activeTabButtonText: {
    color: '#1E90FF',
  },
  tabContent: {
    flex: 1,
    backgroundColor: '#191919',
    borderRadius: 10,
    marginTop: 10,
    padding: 20,
  },
  tabContentText: {
    color: 'white',
    marginBottom: 10,
  },
  projectItem: {
    marginBottom: 10,
    backgroundColor: '#222',
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
    color: 'white',
    fontSize: 16,
    flex: 1,
  },
  projectRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectMark: {
    color: 'white',
    marginRight: 10,
  },
  projectDetails: {
    padding: 10,
    backgroundColor: '#333',
  },
  projectDetailText: {
    color: 'white',
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
    color: 'white',
    fontSize: 16,
  },
  skillLevel: {
    color: '#1E90FF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skillBarContainer: {
    height: 10,
    backgroundColor: '#333',
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
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 5,
  },
  cursusButtonText: {
    color: 'white',
    fontSize: 14,
  },
  cursusList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#333',
    borderRadius: 5,
    marginTop: 5,
    maxHeight: 150,
    overflow: 'scroll',
  },
  cursusItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  cursusItemText: {
    color: 'white',
    fontSize: 14,
  },
  projectDetailHeader: {
    color: 'white',
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
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  teamMark: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  teamStatus: {
    color: 'white',
    fontSize: 12,
  },
  teamMembers: {
    color: 'white',
    fontSize: 12,
    fontStyle: 'italic',
  },
  teamNameContainer: {
    flex: 1,
    marginRight: 10,
  },
  teamName: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  teamDate: {
    color: '#888',
    fontSize: 12,
    fontWeight: 'normal',
  },
});
