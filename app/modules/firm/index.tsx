import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';

// Typ pro řidiče
interface Driver {
  id: number;
  name: string;
  busNumber: string;
  station: string;
  avatar: string;
}
export default function Index() {
  const [showDriverPanel, setShowDriverPanel] = useState<boolean>(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  // Animované hodnoty
  const panelTranslateY = useSharedValue(300);
  const panelOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(1);

  // Ukázkové data řidičů
  const drivers: Driver[] = [
    {
      id: 1,
      name: 'Jan Novák',
      busNumber: '127',
      station: 'ID: 1',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face'
    },
    {
      id: 2,
      name: 'Petr Svoboda', 
      busNumber: '284',
      station: 'ID: 2',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face'
    },
    {
      id: 3,
      name: 'Tomáš Dvořák',
      busNumber: '91', 
      station: 'ID: 3',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face'
    }
  ];

  const showPanel = (): void => {
    setShowDriverPanel(true);
    panelOpacity.value = withTiming(1, { duration: 300 });
    panelTranslateY.value = withSpring(0, {
      damping: 20,
      stiffness: 200,
      mass: 1,
    });
    contentOpacity.value = withTiming(1, { duration: 200 });
  };

  const hidePanel = (): void => {
    panelOpacity.value = withTiming(0, { duration: 200 });
    panelTranslateY.value = withTiming(300, { duration: 250 }, () => {
      runOnJS(setShowDriverPanel)(false);
      runOnJS(setSelectedDriver)(null);
    });
  };

  const switchDriverContent = (newDriver: Driver): void => {
    // Animace fade out
    contentOpacity.value = withTiming(0, { duration: 150 }, () => {
      // Změna řidiče po fade out
      runOnJS(setSelectedDriver)(newDriver);
      // Animace fade in s novým obsahem
      contentOpacity.value = withTiming(1, { duration: 200 });
    });
  };

  const handleBusClick = (driverIndex: number): void => {
    const driver = drivers[driverIndex];
    if (driver) {
      if (showDriverPanel && selectedDriver) {
        // Panel je už otevřený, jen přepneme obsah
        switchDriverContent(driver);
      } else {
        // Panel není otevřený, otevřeme ho s novým řidičem
        setSelectedDriver(driver);
        showPanel();
      }
    }
  };

  const handleClosePanel = (): void => {
    hidePanel();
  };

  // Animované styly
  const animatedPanelStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: panelTranslateY.value }],
      opacity: panelOpacity.value,
    };
  });

  const animatedContentStyle = useAnimatedStyle(() => {
    return {
      opacity: contentOpacity.value,
    };
  });
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Headernhinhuhubhu */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face' }}
            style={styles.profileImage}
          />
        </View>
        <View style={styles.headerCenter}>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color="#4CAF50" />
            <Text style={styles.locationText}>Vaše poloha</Text>
          </View>
          <Text style={styles.locationDetail}>Praha, CZ</Text>
        </View>
        <TouchableOpacity style={styles.headerRight}>
          <Ionicons name="grid" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Mockup Mapa */}
      <View style={styles.mapContainer}>
        <View style={styles.mapBackground}>
          {/* Simulace mapy s ulicemi */}
          <View style={[styles.street, styles.streetHorizontal, { top: 100 }]} />
          <View style={[styles.street, styles.streetHorizontal, { top: 200 }]} />
          <View style={[styles.street, styles.streetHorizontal, { top: 300 }]} />
          <View style={[styles.street, styles.streetVertical, { left: 80 }]} />
          <View style={[styles.street, styles.streetVertical, { left: 180 }]} />
          <View style={[styles.street, styles.streetVertical, { left: 280 }]} />

          {/* Bus markery */}
          <TouchableOpacity 
            style={[styles.busMarker, { top: 150, left: 120 }]}
            onPress={() => handleBusClick(0)}
          >
            <Ionicons name="bus" size={16} color="white" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.busMarker, { top: 250, left: 220 }]}
            onPress={() => handleBusClick(1)}
          >
            <Ionicons name="bus" size={16} color="white" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.busMarker, { top: 180, left: 300 }]}
            onPress={() => handleBusClick(2)}
          >
            <Ionicons name="bus" size={16} color="white" />
          </TouchableOpacity>

          {/* Uživatelova pozice */}
          <View style={[styles.userLocation, { top: 200, left: 150 }]}>
            <View style={styles.userDot} />
          </View>
        </View>
      </View>

      {/* Animovaný panel řidiče */}
      {showDriverPanel && selectedDriver && (
        <Animated.View style={[styles.driverPanelContainer, animatedPanelStyle]}>
          <View style={styles.panelHandle} />
          <Animated.View style={[styles.driverPanel, animatedContentStyle]}>
            <View style={styles.driverHeader}>
              <Image 
                source={{ uri: selectedDriver.avatar }}
                style={styles.driverAvatar}
              />
              <View style={styles.driverInfo}>
                <Text style={styles.driverName}>{selectedDriver.name}</Text>
                <Text style={styles.stationName}>{selectedDriver.station}</Text>
                <View style={styles.statusRow}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>Aktivní</Text>
                </View>
              </View>
              <View style={styles.busNumberBadge}>
                <Text style={styles.busNumberText}>#{selectedDriver.busNumber}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.quickInfo}>
              <View style={styles.infoItem}>
                <Ionicons name="time" size={18} color="#4CAF50" />
                <Text style={styles.infoText}>Příjezd za 3 min</Text>
              </View>

              <View style={styles.infoItem}>
                <Ionicons name="people" size={18} color="#4CAF50" />
                <Text style={styles.infoText}>12 cestujících</Text>
              </View>

              <View style={styles.infoItem}>
                <Ionicons name="location" size={18} color="#4CAF50" />
                <Text style={styles.infoText}>Směr: Centrum</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.trackButton}>
              <Ionicons name="location" size={18} color="white" />
              <Text style={styles.trackButtonText}>Sledovat na mapě</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.closeButton}
              onPress={handleClosePanel}
            >
              <Text style={styles.closeButtonText}>Zavřít</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerLeft: {
    marginRight: 15,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerCenter: {
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  locationText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
    fontWeight: '500',
  },
  locationDetail: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  headerRight: {
    padding: 8,
  },

  // Map mockup styles
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapBackground: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    position: 'relative',
  },
  street: {
    backgroundColor: '#E0E0E0',
    position: 'absolute',
  },
  streetHorizontal: {
    width: '100%',
    height: 4,
  },
  streetVertical: {
    height: '100%',
    width: 4,
  },
  busMarker: {
    position: 'absolute',
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    padding: 8,
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userLocation: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#2196F3',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  // Panel handle style
  panelHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 15,
  },
  // Animovaný panel řidiče
  driverPanelContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 10,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 15,
  },
  // Driver panel styles
  driverPanel: {
    paddingBottom: 20,
  },
  driverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  driverAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  stationName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  busNumberBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  busNumberText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 15,
  },

  // Quick info styles
  quickInfo: {
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },

  // Track button styles
  trackButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  trackButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  closeButton: {
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});