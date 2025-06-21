import { router } from 'expo-router';
import React from 'react';
import {
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
const RoleButton = ({ iconName, title, onPress, color }: RoleButtonProps) => (
  <TouchableOpacity
    style={[styles.button, { backgroundColor: color }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Icon name={iconName} size={40} color="#fff" style={styles.icon} />
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

export default function WelcomeScreen() {
  // Funkce, která se zavolá po stisku tlačítka.
  // V reálné aplikaci by zde byla logika pro navigaci.
  const handlePress = (role: string) => {
    console.log(`Navigace do modulu: ${role}`);
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
    // Příklad s navigací (pokud používáte Expo Router):
    // import { router } from 'expo-router';
    // router.push(`/${role.toLowerCase()}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Vítejte</Text>
        <Text style={styles.subtitle}>Zvolte prosím svou roli pro pokračování</Text>
      </View>

      <View style={styles.buttonContainer}>
        <RoleButton
          title="Uživatel"
          iconName="account-group"
          color="#3498db"
          onPress={() => handlePress('Uživatel')}
        />
        <RoleButton
          title="Dopravní podnik"
          iconName="office-building"
          color="#2ecc71"
          onPress={() => handlePress('Dopravni_podnik')}
        />
        <RoleButton
          title="Řidič"
          iconName="steering"
          color="#e67e22"
          onPress={() => handlePress('Řidič')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c3e50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#ecf0f1',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#bdc3c7',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '85%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderRadius: 15,
    marginBottom: 20,
    elevation: 5, // Stín pro Android
    shadowColor: '#000', // Stín pro iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  icon: {
    marginRight: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '600',
  },
});
