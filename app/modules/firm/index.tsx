/* -----------------------------------------------------------
 *  POZOR: Aby fungovala interaktivní mapa, musí být v nativním
 *  projektu přidaný balíček `react-native-maps`
 *  ⇒ Expo :  npx expo install react-native-maps
 *  ⇒ Bare :  npm i react-native-maps  && pod install
 *
 *  Když knihovna chybí (typická hláška
 *  “RNMapsAirModule could not be found”), kód níže
 *  zobrazí jednoduché textové “filler” plátno
 *  místo mapy a aplikace nespadne.
 * ----------------------------------------------------------*/

import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

/* ----------  ⬇️ načtení MapView jen pokud existuje ⬇️ ---------- */
let MapView: any = null;
let Marker: any = null;
try {
   
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
} catch (err) {
  console.warn(
    'react-native-maps není nainstalováno – interaktivní mapa se nezobrazí. ' +
      'Přidejte balíček a vytvořte nový native build.',
  );
}
/* ---------------------------------------------------------------- */

interface Driver {
  id: number;
  name: string;
  busNumber: string;
  station: string;
  avatar: string;
  latitude: number;
  longitude: number;
}

export default function Index() {
  const [showDriverPanel, setShowDriverPanel] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  /* animace panelu ------------------------------------------------ */
  const panelTranslateY = useSharedValue(300);
  const panelOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(1);

  /* ukázková data řidičů + souřadnice ---------------------------- */
  const drivers: Driver[] = [
    {
      id: 1,
      name: 'Jan Novák',
      busNumber: '127',
      station: 'ID: 1',
      // anonymní avatar
      
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face',
      latitude: 50.0875,
      longitude: 14.42,
    },
    {
      id: 2,
      name: 'Petr Svoboda',
      busNumber: '284',
      station: 'ID: 2',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
      latitude: 50.075,
      longitude: 14.45,
    },
    {
      id: 3,
      name: 'Tomáš Dvořák',
      busNumber: '91',
      station: 'ID: 3',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face',
      latitude: 50.065,
      longitude: 14.47,
    },
  ];

  const userLocation = { latitude: 50.111386, longitude: 14.439933 };

  /* ---------- obsluha panelu řidiče ---------- */
  const showPanel = () => {
    setShowDriverPanel(true);
    panelOpacity.value = withTiming(1, { duration: 300 });
    panelTranslateY.value = withSpring(0, { damping: 20, stiffness: 200 });
    contentOpacity.value = withTiming(1, { duration: 200 });
  };

  const hidePanel = () => {
    panelOpacity.value = withTiming(0, { duration: 200 });
    panelTranslateY.value = withTiming(300, { duration: 250 }, () => {
      runOnJS(setShowDriverPanel)(false);
      runOnJS(setSelectedDriver)(null);
    });
  };

  const switchDriverContent = (d: Driver) => {
    contentOpacity.value = withTiming(0, { duration: 150 }, () => {
      runOnJS(setSelectedDriver)(d);
      contentOpacity.value = withTiming(1, { duration: 200 });
    });
  };

  const handleBusClick = (idx: number) => {
    const driver = drivers[idx];
    if (!driver) return;
    if (showDriverPanel && selectedDriver) switchDriverContent(driver);
    else {
      setSelectedDriver(driver);
      showPanel();
    }
  };

  /* ---------- animované styly ---------- */
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

      {/* ░░░  HLAVIČKA  ░░░ */}
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
          <Text style={styles.locationDetail}>Partyzánská 18/23, 170 00 Praha 7-Holešovice</Text>
        </View>
        <TouchableOpacity style={styles.headerRight}>
          <Ionicons name="grid" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* ░░░  MAPA / PLACEHOLDER  ░░░ */}
      <View style={styles.mapContainer}>
        {MapView ? (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: 50.111386,
              longitude: 14.439933,
              latitudeDelta: 0.002,
              longitudeDelta: 0.002,
            }}
          >
            {drivers.map((d, i) => (
              <Marker
                key={d.id}
                coordinate={{ latitude: d.latitude, longitude: d.longitude }}
                onPress={() => handleBusClick(i)}
              >
                <View style={styles.busMarker}>
                  <Ionicons name="bus" size={16} color="white" />
                </View>
              </Marker>
            ))}
            {/* <Marker coordinate={userLocation}>
              <View style={styles.userDot} />
            </Marker> */}
          </MapView>
        ) : (
          <View style={styles.mapFallback}>
            <Text style={styles.mapFallbackText}>
              Interaktivní mapa není dostupná. <Text style={{ fontWeight: '600' }}>Přidejte
              react-native-maps</Text> a vytvořte nový build.
            </Text>
          </View>
        )}
      </View>

      {/* ░░░  PANEL ŘIDIČE  ░░░ */}
      {showDriverPanel && selectedDriver && (
        <Animated.View style={[styles.driverPanelContainer, animatedPanelStyle]}>
          <View style={styles.panelHandle} />
          <Animated.View style={[styles.driverPanel, animatedContentStyle]}>
            <View style={styles.driverHeader}>
              <Image source={{ uri: selectedDriver.avatar }} style={styles.driverAvatar} />
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

            <TouchableOpacity style={styles.closeButton} onPress={hidePanel}>
              <Text style={styles.closeButtonText}>Zavřít</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

/* ----------  STYLY  ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  /* header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerLeft: { marginRight: 15 },
  profileImage: { width: 40, height: 40, borderRadius: 20 },
  headerCenter: { flex: 1 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  locationText: { fontSize: 12, color: '#4CAF50', marginLeft: 4, fontWeight: '500' },
  locationDetail: { fontSize: 16, fontWeight: '600', color: '#333' },
  headerRight: { padding: 8 },

  /* map */
  mapContainer: { flex: 1 },
  map: { flex: 1 },
  mapFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#F5F5F5',
  },
  mapFallbackText: { textAlign: 'center', color: '#666' },

  busMarker: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    padding: 8,
    borderWidth: 3,
    borderColor: 'white',
  },
  userDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#2196F3',
    borderWidth: 3,
    borderColor: 'white',
  },

  /* panel */
  panelHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 15,
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
  driverPanel: { paddingBottom: 20 },
  driverHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  driverAvatar: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  driverInfo: { flex: 1 },
  driverName: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  stationName: { fontSize: 14, color: '#666', marginBottom: 6 },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4CAF50', marginRight: 6 },
  statusText: { fontSize: 12, color: '#666' },
  busNumberBadge: { backgroundColor: '#4CAF50', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
  busNumberText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 15 },

  /* quick info + btns */
  quickInfo: { marginBottom: 20 },
  infoItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  infoText: { fontSize: 14, color: '#666', marginLeft: 10 },
  trackButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  trackButtonText: { color: 'white', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  closeButton: { backgroundColor: '#F0F0F0', borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  closeButtonText: { fontSize: 16, color: '#666', fontWeight: '500' },
});
