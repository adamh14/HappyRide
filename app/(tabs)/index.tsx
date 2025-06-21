import { router } from 'expo-router';
import React from 'react';
import {
  Animated,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Typ pro definování vlastností tlačítka pro lepší znovupoužitelnost
type RoleButtonProps = {
  iconName: string;
  title: string;
  onPress: () => void;
  color: string;
};

// Komponenta pro jedno tlačítko, aby byl kód přehlednější
const RoleButton = ({ iconName, title, onPress, color }: RoleButtonProps) => {
  const scaleValue = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 300,
      friction: 50,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 50,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: color }]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <Icon name={iconName} size={40} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function WelcomeScreen() {
  // Funkce, která se zavolá po stisku tlačítka.
  // V reálné aplikaci by zde byla logika pro navigaci.
  const handlePress = (role: string) => {
    console.log(`Navigace do modulu: ${role}`);

    setTimeout(() => {
      if (role === 'Řidič') {
        // Pomocí router.push() přejdeme na obrazovku definovanou souborem `app/ridic.js`
        router.push('/modules/driver');
      } else if (role === 'Uživatel') {
        // Pomocí router.push() přejdeme na obrazovku definovanou souborem `app/dopravni-podnik.js`
        router.push('/modules/user');
      } else if (role === 'Dopravni_podnik') {
        // Pomocí router.push() přejdeme na obrazovku definovanou souborem `app/dopravni-podnik.js`
        router.push('/modules/firm');
      } else {
        // Zde můžete později přidat navigaci pro ostatní role
        alert(`Navigace pro roli "${role}" zatím není implementována.`);
      }
    }, 150);
    // Příklad s navigací (pokud používáte Expo Router):
    // import { router } from 'expo-router';
    // router.push(`/${role.toLowerCase()}`);
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Background gradient elements */}
      <View style={styles.backgroundElements}>
        <View style={styles.gradientCircle1} />
        <View style={styles.gradientCircle2} />
        <View style={styles.gradientCircle3} />
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>Vítejte</Text>
        <Text style={styles.subtitle}>Zvolte prosím svou roli pro pokračování</Text>
      </View>

      <View style={styles.buttonContainer}>
        <RoleButton
          title="Uživatel"
          iconName="account-group"
          color="#4ade80"
          onPress={() => handlePress('Uživatel')}
        />
        <RoleButton
          title="Dopravní podnik"
          iconName="office-building"
          color="#059669"
          onPress={() => handlePress('Dopravni_podnik')}
        />
        <RoleButton
          title="Řidič"
          iconName="steering"
          color="#4ade80"
          onPress={() => handlePress('Řidič')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e0f2f1', // Light blue-green background
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backgroundElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradientCircle1: {
    position: 'absolute',
    top: -100,
    right: -50,
    width: 200,
    height: 200,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 100,
  },
  gradientCircle2: {
    position: 'absolute',
    bottom: -80,
    left: -60,
    width: 180,
    height: 180,
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    borderRadius: 90,
  },
  gradientCircle3: {
    position: 'absolute',
    top: '40%',
    right: -30,
    width: 120,
    height: 120,
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    borderRadius: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
    paddingHorizontal: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#059669', // Green color for title
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#374151', // Dark gray for subtitle
    textAlign: 'center',
  },
  buttonContainer: {
    width: '85%',
    zIndex: 1,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 25,
    borderRadius: 24,
    marginBottom: 16,
    elevation: 6, // Stín pro Android
    shadowColor: '#000', // Stín pro iOS
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  icon: {
    marginRight: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
});