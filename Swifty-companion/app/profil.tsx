import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Dimensions, SafeAreaView, StatusBar, Platform, Image, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

const { height, width } = Dimensions.get('window');

export default function ProfilScreen() {
  const { userData } = useLocalSearchParams();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('about');
  const animatedValue = useRef(new Animated.Value(0)).current;
  const levelProgressAnimation = useRef(new Animated.Value(0)).current;
  const [expandedProjects, setExpandedProjects] = useState<{ [key: string]: boolean }>({});
  const [selectedCursus, setSelectedCursus] = useState(0);

  useEffect(() => {
    if (userData) {
      try {
        const parsedUserData = JSON.parse(userData as string);
        setUser(parsedUserData);
        
        // Animer la barre de niveau
        Animated.timing(levelProgressAnimation, {
          toValue: ((parsedUserData.cursus_users?.[1]?.level || 0) % 1) * 100,
          duration: 1000,
          useNativeDriver: false,
        }).start();
      } catch (error) {
        console.error('Erreur lors de l\'analyse des données utilisateur:', error);
      }
    }
  }, [userData]);

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
            <ThemedText style={styles.tabContentText}>Email: {user.email || 'Unavailable'}</ThemedText>
            <ThemedText style={styles.tabContentText}>Phone: {user.phone || 'Hidden'}</ThemedText>
            <ThemedText style={styles.tabContentText}>Birthday: {user.birthday || 'Unavailable'}</ThemedText>
            <ThemedText style={styles.tabContentText}>Location: {user.location || 'Unavailable'}</ThemedText>
            <ThemedText style={styles.tabContentText}>Coalition: {user.coalition?.name || 'Unavailable'}</ThemedText>
          </View>
        );
      case 'projects':
        return (
          <ScrollView style={styles.projectsScrollView}>
            {user.projects_users?.map((project: any, index: number) => (
              <View key={index} style={styles.projectItem}>
                <TouchableOpacity 
                  style={styles.projectHeader}
                  onPress={() => setExpandedProjects(prev => ({ ...prev, [project.project.id]: !prev[project.project.id] }))}
                >
                  <ThemedText style={styles.projectName}>{project.project.name}</ThemedText>
                  <View style={styles.projectRight}>
                    <ThemedText style={styles.projectMark}>{project.final_mark || 'En cours'}</ThemedText>
                    <Ionicons 
                      name={expandedProjects[project.project.id] ? "chevron-up" : "chevron-down"} 
                      size={24} 
                      color="white" 
                    />
                  </View>
                </TouchableOpacity>
                {expandedProjects[project.project.id] && (
                  <View style={styles.projectDetails}>
                    <ThemedText style={styles.projectDetailText}>Status: {project.status}</ThemedText>
                    <ThemedText style={styles.projectDetailText}>Validated: {project.validated ? 'Yes' : 'No'}</ThemedText>
                    {/* Ajoutez d'autres détails du projet ici si nécessaire */}
                  </View>
                )}
              </View>
            )) || <ThemedText style={styles.tabContentText}>Aucun projet disponible</ThemedText>}
          </ScrollView>
        );
      case 'skills':
        return (
          <ScrollView style={styles.skillsScrollView}>
            {user.cursus_users?.[1]?.skills?.map((skill: any, index: number) => (
              <View key={index} style={styles.skillItem}>
                <View style={styles.skillInfo}>
                  <ThemedText style={styles.skillName}>{skill.name}</ThemedText>
                  <ThemedText style={styles.skillLevel}>{skill.level.toFixed(2)}</ThemedText>
                </View>
                <View style={styles.skillBarContainer}>
                  <View style={[styles.skillBar, { width: `${(skill.level / 20) * 100}%` }]} />
                </View>
              </View>
            )) || <ThemedText style={styles.tabContentText}>Aucune compétence disponible</ThemedText>}
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
                  <ThemedText style={styles.text}>Campus: {user.campus?.[0]?.name || 'Campus non spécifié'}</ThemedText>
                  <View style={styles.cursusSelector}>
                    <Picker
                      selectedValue={selectedCursus}
                      style={styles.cursusPicker}
                      onValueChange={(itemValue) => setSelectedCursus(itemValue)}
                    >
                      {user.cursus_users?.map((cursus, index) => (
                        <Picker.Item key={index} label={cursus.cursus.name} value={index} />
                      ))}
                    </Picker>
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
                <ThemedText style={styles.statNumber}>{user.projects_users?.length || 0}</ThemedText>
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
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  cursusLabel: {
    color: 'white',
    fontSize: 16,
    marginRight: 10,
  },
  cursusPicker: {
    flex: 1,
    color: 'white',
    backgroundColor: '#333',
  },
});
