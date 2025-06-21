import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Alert, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

interface Driver {
  id: number;
  name: string;
  busNumber: string;
  station: string;
  avatar: string;
}

export default function Index() {
  const [showDriverPanel, setShowDriverPanel] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // získej lokaci po spuštění
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Přístup k poloze byl odepřen');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    })();
  }, []);

  const panelTranslateY = useSharedValue(300);
  const panelOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(1);

  const drivers: Driver[] = [
    {
      id: 1,
      name: 'Jan Novák',
      busNumber: '127',
      station: 'ID: 1',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    },
    {
      id: 2,
      name: 'Petr Svoboda',
      busNumber: '284',
      station: 'ID: 2',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
    },
    {
      id: 3,
      name: 'Tomáš Dvořák',
      busNumber: '91',
      station: 'ID: 3',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face',
    },
  ];

  const showPanel = () => {
    setShowDriverPanel(true);
    panelOpacity.value = withTiming(1, { duration: 300 });
    panelTranslateY.value = withSpring(0, { damping: 20, stiffness: 200, mass: 1 });
    contentOpacity.value = withTiming(1, { duration: 200 });
  };

  const hidePanel = () => {
    panelOpacity.value = withTiming(0, { duration: 200 });
    panelTranslateY.value = withTiming(300, { duration: 250 }, () => {
      runOnJS(setShowDriverPanel)(false);
      runOnJS(setSelectedDriver)(null);
    });
  };

  const switchDriverContent = (newDriver: Driver) => {
    contentOpacity.value = withTiming(0, { duration: 150 }, () => {
      runOnJS(setSelectedDriver)(newDriver);
      contentOpacity.value = withTiming(1, { duration: 200 });
    });
  };

  const handleBusClick = (index: number) => {
    const driver = drivers[index];
    if (driver) {
      if (showDriverPanel && selectedDriver) {
        switchDriverContent(driver);
      } else {
        setSelectedDriver(driver);
        showPanel();
      }
    }
  };

  const handleClosePanel = () => {
    hidePanel();
  };

  const animatedPanelStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: panelTranslateY.value }],
    opacity: panelOpacity.value,
  }));

  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
            }}
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

      {/* Mapa */}
      <View style={styles.mapContainer}>
        <View style={styles.mapBackground}>
          {/* Ulice */}
          <View style={[styles.street, styles.streetHorizontal, { top: 100 }]} />
          <View style={[styles.street, styles.streetHorizontal, { top: 200 }]} />
          <View style={[styles.street, styles.streetHorizontal, { top: 300 }]} />
          <View style={[styles.street, styles.streetVertical, { left: 80 }]} />
          <View style={[styles.street, styles.streetVertical, { left: 180 }]} />
          <View style={[styles.street, styles.streetVertical, { left: 280 }]} />

          {/* Busy */}
          <TouchableOpacity style={[styles.busMarker, { top: 150, left: 120 }]} onPress={() => handleBusClick(0)}>
            <Ionicons name="bus" size={16} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.busMarker, { top: 250, left: 220 }]} onPress={() => handleBusClick(1)}>
            <Ionicons name="bus" size={16} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.busMarker, { top: 180, left: 300 }]} onPress={() => handleBusClick(2)}>
            <Ionicons name="bus" size={16} color="white" />
          </TouchableOpacity>

          {/* Uživatelská poloha */}
          {location && (
            <View style={[styles.userLocation, { top: 50, left: 50 }]}>
              <View style={styles.userDot} />
            </View>
          )}
        </View>
      </View>

      {/* Panel řidiče */}
      {showDriverPanel && selectedDriver && (
        <Animated.View style={[styles.driverPanelContainer, animatedPanelStyle]}>
          <View style={styles.panelHandle} />
          <Animated.View style={[styles.driverPanel, animatedContentStyle]}>
            {/* ...panel řidiče zůstává stejný... */}
            <TouchableOpacity style={styles.closeButton} onPress={handleClosePanel}>
              <Text style={styles.closeButtonText}>Zavřít</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  headerLeft: { marginRight: 15 },
  profileImage: { width: 40, height: 40, borderRadius: 20 },
  headerCenter: { flex: 1 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  locationText: { fontSize: 12, color: '#4CAF50', marginLeft: 4, fontWeight: '500' },
  locationDetail: { fontSize: 16, fontWeight: '600', color: '#333' },
  headerRight: { padding: 8 },

  mapContainer: { flex: 1, position: 'relative' },
  mapBackground: { flex: 1, backgroundColor: '#F5F5F5', position: 'relative' },
  street: { backgroundColor: '#E0E0E0', position: 'absolute' },
  streetHorizontal: { width: '100%', height: 4 },
  streetVertical: { height: '100%', width: 4 },
  busMarker: {
    position: 'absolute',
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    padding: 8,
    borderWidth: 3,
    borderColor: 'white',
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
  },

  driverPanelContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  panelHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 15,
  },
  driverPanel: {},
  closeButton: {
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});
