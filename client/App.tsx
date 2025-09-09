/**
 * Learnoverse Internship Assignment - Client App
 * Built by Swastik Shetty
 * This React Native app fetches and plays YouTube videos using a Node.js server and MongoDB database.
 * UI has been upgraded for a more interactive and polished user experience.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  Modal,
  ActivityIndicator,
  Linking,
  Platform,
  Alert,
  RefreshControl,
  Pressable,
  Animated,
  LogBox, // <-- Import LogBox
} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import LottieView from 'lottie-react-native';

// --- Types ---
type Video = {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
};

// Hide yellow warning boxes in the app
LogBox.ignoreAllLogs(); // <-- Add this line to hide all warnings

// --- Animated List Item Component ---
const VideoListItem = ({ item, onPress }: { item: Video, onPress: () => void }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const onPressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.97,
            useNativeDriver: true,
        }).start();
    };

    const onPressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
            <Animated.View style={[styles.itemContainer, { transform: [{ scale: scaleAnim }] }]}>
                <View style={styles.thumbnailContainer}>
                    <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
                    <View style={styles.playIconContainer}>
                         <Text style={styles.playIcon}>▶</Text>
                    </View>
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.channel}>{item.channelTitle}</Text>
                </View>
            </Animated.View>
        </Pressable>
    );
};

// --- Skeleton Loader Component ---
const SkeletonLoader = () => (
    <View style={styles.itemContainer}>
        <View style={[styles.thumbnail, styles.skeletonItem]} />
        <View style={styles.textContainer}>
            <View style={[styles.skeletonItem, { height: 20, width: '90%', marginBottom: 8 }]} />
            <View style={[styles.skeletonItem, { height: 16, width: '60%' }]} />
        </View>
    </View>
);


// --- Main App Component ---
const App = () => {
  // State Management
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Data Fetching
  const fetchVideos = useCallback(async () => {
    try {
      const apiUrl = Platform.OS === 'android' ? 'http://10.0.2.2:3000/videos' : 'http://localhost:3000/videos';
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setVideos(data);
      setError(null);
    } catch (e: any) {
      setError('Failed to fetch videos. Pull down to retry.');
      console.error(e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
    setTimeout(() => setIsSplashVisible(false), 3000);
  }, [fetchVideos]);

  // Handlers
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchVideos();
  }, [fetchVideos]);

  const closePlayer = () => setSelectedVideo(null);

  const onPlayerStateChange = useCallback((state: string) => {
    if (state === 'ended') closePlayer();
  }, []);

  const onPlayerError = useCallback((error: any) => {
      console.error("YouTube Player Error:", error);
      Alert.alert("Playback Error", "This video cannot be played. It may be restricted by the owner.");
      closePlayer();
  }, []);

  // --- Conditional Renders ---
  
  if (isSplashVisible) {
    return (
        <View style={styles.splashContainer}>
            <LottieView
                source={{ uri: 'https://lottie.host/d498bcad-70b2-4c9f-913a-9ac710dc7d3a/77hVkFL2vo.lottie' }}
                autoPlay
                loop={false}
                style={styles.lottie}
            />
        </View>
    );
  }
  
  // --- Main Render ---
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Learnoverse Player</Text>
        <Pressable onPress={() => setInfoModalVisible(true)} style={styles.infoButton}>
            <Text style={styles.infoButtonText}>i</Text>
        </Pressable>
      </View>

      {/* Content Area */}
      {isLoading ? (
        <FlatList
          data={Array(5).fill(0)}
          renderItem={() => <SkeletonLoader />}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={styles.list}
        />
      ) : error && videos.length === 0 ? (
        <View style={styles.centerContent}>
            <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
            data={videos}
            renderItem={({ item }) => <VideoListItem item={item} onPress={() => setSelectedVideo(item)} />}
            keyExtractor={(item) => item.videoId} 
            contentContainerStyle={styles.list}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FFFFFF']} tintColor={'#FFFFFF'}/>
            }
        />
      )}

      {/* Video Player Modal */}
      {selectedVideo && (
          <Modal animationType="fade" transparent={true} visible={!!selectedVideo} onRequestClose={closePlayer}>
            <View style={styles.modalContainer}>
              <View style={styles.playerContainer}>
                <Text style={styles.playerTitle} numberOfLines={2}>{selectedVideo.title}</Text>
                <YoutubePlayer height={220} play={true} videoId={selectedVideo.videoId} onChangeState={onPlayerStateChange} onError={onPlayerError} />
                <Pressable style={({ pressed }) => [styles.closeButton, { opacity: pressed ? 0.8 : 1 }]} onPress={closePlayer}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
      )}

      {/* Info Modal */}
      <Modal animationType="fade" transparent={true} visible={infoModalVisible} onRequestClose={() => setInfoModalVisible(false)}>
        <View style={styles.modalContainer}>
            <View style={styles.infoModalContent}>
                <Text style={styles.infoModalTitle}>About This App</Text>
                <Text style={styles.infoModalText}>Built by Swastik Shetty for the Learnoverse internship assignment.</Text>
                <Text style={styles.infoModalText}>A React Native app with a Node.js server and MongoDB.</Text>
                <Pressable onPress={() => Linking.openURL('https://github.com/SwastikShetty06')}>
                    <Text style={styles.linkText}>Visit my GitHub</Text>
                </Pressable>
                 <Pressable style={({ pressed }) => [styles.closeButton, { opacity: pressed ? 0.8 : 1 }]} onPress={() => setInfoModalVisible(false)}>
                    <Text style={styles.closeButtonText}>Close</Text>
                </Pressable>
            </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  // Containers & Layout
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F', // Darker background
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  textContainer: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  // Header
  header: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1A1A1A',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  // Info Button
  infoButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  // Video Item
  thumbnailContainer: {
    width: 120,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center'
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  playIconContainer: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  channel: {
    fontSize: 13,
    color: '#AAAAAA',
    marginTop: 5,
  },
  // States: Loading & Error
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  lottie: {
    width: 250,
    height: 250,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
    textAlign: 'center',
  },
  skeletonItem: {
      backgroundColor: '#2C2C2C',
      borderRadius: 8,
  },
  // Modals
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  playerContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    width: '95%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  playerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#444',
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 16,
  },
  closeButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  infoModalContent: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 25,
    width: '90%',
    alignItems: 'center',
  },
  infoModalTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: 16,
  },
  infoModalText: {
      fontSize: 16,
      color: '#DDDDDD',
      textAlign: 'center',
      marginBottom: 12,
  },
  linkText: {
      fontSize: 16,
      color: '#5899FF',
      marginTop: 10,
      textDecorationLine: 'underline',
  }
});

export default App;

