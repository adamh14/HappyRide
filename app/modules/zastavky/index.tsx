import service from '@/rady';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';


// Typ pro zastávku
type StopProps = {
  name: string;
  time: string;
  lines?: string[];
  hasIcon?: boolean;
};

// Komponenta pro jednu zastávku
const StopItem = ({ name, time, lines, hasIcon }: StopProps) => (
  <View style={styles.stopContainer}>
    <View style={styles.stopLine}>
      <View style={styles.stopDot} />
      <View style={styles.connectionLine} />
    </View>
    <View style={styles.stopContent}>
      <View style={styles.stopInfo}>
        <Text style={styles.stopName}>{name}</Text>
        {lines && lines.length > 0 && (
          <Text style={styles.stopLines}>{lines.join(', ')}</Text>
        )}
      </View>
      <View style={styles.timeContainer}>
        {hasIcon && (
          <Icon name="map-marker-outline" size={16} color="#059669" style={styles.stopIcon} />
        )}
        <Text style={styles.stopTime}>{time}</Text>
      </View>
    </View>
  </View>
);





export default function UserScreen() {
const { idSpoje, idLinky } = useLocalSearchParams(); 
    const stops = service.getServiceDetails(idLinky.toString(), parseInt(idSpoje.toString()));
    const stopss = [
    { 
      name: 'Slovany', 
      time: '15:17', 
      lines: ['1', '1/2A', '4', '10', '13', '22', '23', '29', '30', '31', '51', 'N2', 'N5'] 
    },
    { 
      name: 'Pošta Francouzská', 
      time: '15:18', 
      lines: ['29', '30'] 
    },
    { 
      name: 'Poliklinika Slovany', 
      time: '15:19', 
      lines: ['29', '30'] 
    },
    { 
      name: 'Nádraží Slovany', 
      time: '15:21', 
      lines: ['12', '29', '30'] 
    },
    { 
      name: 'Letná', 
      time: '15:27', 
      lines: ['11', '15', '29', '30', 'N3', 'N6'] 
    },
    { 
      name: 'Opavská', 
      time: '15:29', 
      lines: ['13', '16', '17', '29', '30', '38', 'N3', 'N6'] 
    },
    { 
      name: 'Poliklinika Doubravka', 
      time: '15:30', 
      lines: ['13', '16', '17', '28', '29', '30', '38', 'N3', 'N6'] 
    },
    { 
      name: 'Husův park', 
      time: '15:31', 
      lines: ['28', '30'] 
    },
    { 
      name: 'Kovošrot', 
      time: '15:32', 
      lines: ['30'],
      hasIcon: true 
    },
    { 
      name: 'Čistící stanice', 
      time: '15:33', 
      lines: ['30'],
      hasIcon: true 
    },
  ];

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Icon name="chevron-left" size={28} color="#fff" />
          <Text style={styles.backText}>Zpět</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Odjezdy</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerIcon}>
            <Icon name="bookmark-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Route Info */}
      <View style={styles.routeInfo}>
        <View style={styles.routeNumber}>
          <Text style={styles.routeNumberText}>30</Text>
        </View>
        <View style={styles.routeDetails}>
          <Text style={styles.routeText}>Bory → Sídliště Košutka</Text>
        </View>
      </View>

      {/* Stops List */}
      <ScrollView style={styles.stopsContainer} showsVerticalScrollIndicator={false}>
        {stops.map((stop, index) => (
          <StopItem
            key={index}
            name={stop.stopName}
            time={stop.departureTime}
            lines={["13, 26"]}
            hasIcon={true}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#059669',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#047857',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  headerIcon: {
    padding: 4,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#10b981',
  },
  routeNumber: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  routeNumberText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  routeDetails: {
    flex: 1,
  },
  routeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  stopsContainer: {
    flex: 1,
    backgroundColor: '#d1fae5',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  stopContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  stopLine: {
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  stopDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ef4444',
    zIndex: 1,
  },
  connectionLine: {
    position: 'absolute',
    top: 12,
    width: 2,
    height: 40,
    backgroundColor: '#6ee7b7',
  },
  stopContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  stopInfo: {
    flex: 1,
    paddingRight: 16,
  },
  stopName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#065f46',
    marginBottom: 4,
  },
  stopLines: {
    fontSize: 14,
    color: '#10b981',
    lineHeight: 18,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stopIcon: {
    marginRight: 4,
  },
  stopTime: {
    fontSize: 18,
    fontWeight: '600',
    color: '#065f46',
    minWidth: 50,
    textAlign: 'right',
  },
});