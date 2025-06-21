import { Service } from '@/global';
import service from '@/rady';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

// Statická data pro spoje, která si později můžete nahradit daty z API

const LINKY = service.getLines().map((line) => ({
  id: line.lineNumber,
  nazev: `Linka ${line.lineNumber}: ${line.description}`,
}));

/*const SPOJE = [
  { id: '1', nazev: 'Linka 101: Brno -> Kuřim' },
  { id: '2', nazev: 'Linka 44: Mendlovo nám. -> Zvonařka' },
  { id: '3', nazev: 'Linka 84: Stará osada -> Zvonařka' },
  { id: '4', nazev: 'Noční linka N97: Jírovcova -> Hlavní nádraží' },
];*/

// Správný PIN pro přihlášení (pro demonstrační účely)
const SPRAVNY_PIN = '1234';

const ObrazovkaProRidice = () => {
  // Stavy pro ukládání zadaného PINu, stavu přihlášení a vybraného spoje
  const [pin, setPin] = useState('');
  const [jePrihlasen, setJePrihlasen] = useState(false);
  // Předvybereme první spoj ze seznamu
  const [vybranaLinka, setVybranaLinka] = useState<string>(LINKY[0]?.id);
  const [vybranySpoj, setVybranySpoj] = useState<number>();

  const [spoje, setSpoje] = useState<Service[]>([]);

  useEffect(() => {
    const spoje = service.getServicesForLine(vybranaLinka);
    setSpoje(spoje ?? []);
  }, [vybranaLinka]);

  // Funkce pro zpracování přihlášení
  const handleLogin = () => {
    if (pin === SPRAVNY_PIN) {
      setJePrihlasen(true);
    } else {
      Alert.alert('Chyba přihlášení', 'Zadali jste nesprávný PIN.');
      setPin(''); // Vyčistí pole pro PIN po neúspěšném pokusu
    }
  };

  // Funkce pro potvrzení výběru spoje
  const handlePotvrditSpoj = () => {
    const linka = LINKY.find(l => l.id === vybranaLinka);
    const spoj = spoje.find(s => s.id === vybranySpoj);
    if(!spoj) return;
    Alert.alert(
      'Potvrzení spoje',
      `Chcete opravdu jet linku ${linka?.nazev} a spoj: ${spoj.id}?`,
      [
      {
        text: 'Ne',
        style: 'cancel',
        onPress: () => {
        // Pokud uživatel zvolí "Ne", nic se nestane
        return;
        },
      },
      {
        text: 'Ano',
        onPress: () => {
        //router.push('/modules/driver/ride');
          router.push({
            pathname: '/modules/driver/ride',
            params: { 
              idSpoje: spoj.id, 
              idLinky: vybranaLinka
            },
          });
        },
      },
      ],
      { cancelable: false }
    );
    return;
    // Zde by následovala další logika, např. přechod na další obrazovku
  };

  // Pokud uživatel není přihlášen, zobrazí se obrazovka pro zadání PINu
  if (!jePrihlasen) {
    return (
      <SafeAreaView style={styles.wrapper}>
        <View style={styles.container}>
          <Text style={styles.title}>Přihlášení řidiče</Text>
          <TextInput
            style={styles.input}
            placeholder="Zadejte svůj 4místný PIN"
            value={pin}
            onChangeText={setPin}
            keyboardType="numeric"
            secureTextEntry // Skryje zadané znaky
            maxLength={4}
          />
          <Button title="Přihlásit se" onPress={handleLogin} />
        </View>
      </SafeAreaView>
    );
  }

  // Po úspěšném přihlášení se zobrazí obrazovka pro výběr spoje
  return (
    <SafeAreaView style={styles.wrapper}>
      <View style={styles.container}>
        <Text style={styles.title}>Vyberte linku a spoj, který pojedete</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={vybranySpoj}
            onValueChange={(itemValue) => setVybranaLinka(itemValue)}
            style={styles.picker}
          >
            {LINKY.map((spoj) => (
              <Picker.Item key={spoj.id} label={spoj.nazev} value={spoj.id} />
            ))}
          </Picker>
          <Picker
            selectedValue={vybranaLinka}
            onValueChange={(itemValue) => setVybranySpoj(itemValue)}
            style={styles.picker
          }>
            {spoje.map((spoj) => (
              <Picker.Item key={spoj.id} label={`Spoj ${spoj.id}`} value={spoj.id} />
            ))}
          </Picker>
  
        </View>
        <Button title="Potvrdit a pokračovat" onPress={handlePotvrditSpoj} />
      </View>
    </SafeAreaView>
  );
};

// Styly pro komponenty
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: 'white',
  },
  picker: {
    width: '100%',
  },
});

export default ObrazovkaProRidice;
