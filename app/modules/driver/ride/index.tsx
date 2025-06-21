import service from '@/rady';
import * as Location from 'expo-location';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

// --- Komponenta ProgressBar (beze změny) ---
const ProgressBar = ({ progress }: { progress: number }) => {
    // Funkce Math.max a Math.min zajišťují, že hodnota progress je vždy mezi 0 a 100
    const clampedProgress = Math.max(0, Math.min(progress, 100));
    const red = Math.floor(255 - (clampedProgress * 2.55));
    const green = Math.floor(clampedProgress * 2.55);
    const barColor = `rgb(${red}, ${green}, 0)`;
    // Zobrazí text "V zastávce", pokud je progress 100 % a více
    const atStop = clampedProgress >= 100;

    return (
        <View style={styles.progressContainer}>
            {atStop ? (
                <Text style={styles.atStopText}>V zastávce</Text>
            ) : (
                <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBar, { width: `${clampedProgress}%`, backgroundColor: barColor }]} />
                </View>
            )}
        </View>
    );
};

// --- Pomocná funkce pro výpočet vzdálenosti (beze změny) ---
const getDistance = (coord1: { lat: number, lon: number }, coord2: { lat: number, lon: number }) => {
    if (!coord1 || !coord2) return 0;
    const R = 6371e3; // Poloměr Země v metrech
    const φ1 = coord1.lat * Math.PI / 180;
    const φ2 = coord2.lat * Math.PI / 180;
    const Δφ = (coord2.lat - coord1.lat) * Math.PI / 180;
    const Δλ = (coord2.lon - coord1.lon) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Vzdálenost v metrech
};

// --- Hlavní komponenta obrazovky ---
const DriverScreen = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeDifference, setTimeDifference] = useState(0);
    const [journeyProgress, setJourneyProgress] = useState(0);
    const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
    const [distanceToStop, setDistanceToStop] = useState<number | null>(null);

    const { idSpoje, idLinky } = useLocalSearchParams();


    //const [scheduleData, setScheduleData] = useState<{ stopName: string, arrivalTime: string, lat: number, lon: number, isRequestStop: boolean }[]>([]);

    const scheduleData = service.getServiceDetails(idLinky.toString(), parseInt(idSpoje.toString()));

    console.log(scheduleData);

    /*useEffect(() => {
        setScheduleData(service.getServiceDetails(idLinky.toString(), parseInt(idSpoje.toString())));
        console.log(scheduleData);
    }, [])*/

    //useEffect(() => {
        // ZDE byste normálně načetli data z API nebo databáze
        // Pro účely této ukázky použijeme statická data
      //  setScheduleData(scheduleData);
    //}, []);

// --- Data jízdního řádu (beze změny) ---
    /*const scheduleData = [
        { stopName: 'U pracovního stolu', arrivalTime: '2025-06-21T13:26:00', lat: 50.1110209, lon: 14.4396771, isRequestStop: true },
        { stopName: 'Mezi kancly', arrivalTime: '2025-06-21T13:27:00', lat: 50.1110258, lon: 14.4395624, isRequestStop: false },
        { stopName: 'U WC', arrivalTime: '2025-06-21T13:28:00', lat: 50.1109463, lon: 14.4395142, isRequestStop: false },
        { stopName: 'Mezi kancly', arrivalTime: '2025-06-21T13:28:00', lat: 50.1110258, lon: 14.4395624, isRequestStop: true },
        { stopName: 'Konečná, U pracovního stolu', arrivalTime: '2025-06-21T13:29:00', lat: 50.1110209, lon: 14.4396771, isRequestStop: false },
    ];*/

    // --- Sledování polohy ---
    useEffect(() => {
        let locationSubscriber: Location.LocationSubscription | null = null;

        const startLocationTracking = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.error('Permission to access location was denied');
                return;
            }

            locationSubscriber = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.BestForNavigation,
                    // ZMĚNA: Interval je nastaven na 200ms pro časté aktualizace polohy
                    timeInterval: 200,
                    distanceInterval: 1, // Aktualizace i při malém pohybu
                },
                (location) => {
                    setCurrentLocation(location);
                }
            );
        };

        startLocationTracking();

        return () => {
            if (locationSubscriber) {
                locationSubscriber.remove();
            }
        };
    }, []);

    // --- Časovač pro odchylku od jízdního řádu (beze změny) ---
    useEffect(() => {
        const timer = setInterval(() => {
            const currentStopData = scheduleData[currentIndex];
            if (currentStopData) {
                const arrival = new Date(currentStopData.arrivalTime).getTime();
                const now = new Date().getTime();
                setTimeDifference(arrival - now);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [currentIndex]);


    // ZMĚNA: Přepracovaná logika pro výpočet vzdálenosti a průběhu cesty
    useEffect(() => {
        // Tento blok se spustí při každé změně polohy (tedy každých 200ms)
        if (!currentLocation || !scheduleData[currentIndex]) return;

        const currentCoords = {
            lat: currentLocation.coords.latitude,
            lon: currentLocation.coords.longitude
        };
        const currentStopData = scheduleData[currentIndex];

        // 1. Vždy vypočítáme zbývající vzdálenost do cílové zastávky
        const distanceToCurrentStop = getDistance(currentCoords, {
            lat: currentStopData.lat,
            lon: currentStopData.lon
        });
        setDistanceToStop(distanceToCurrentStop);

        // 2. PRAVIDLO: Pokud je vzdálenost menší než 6 metrů, jsme v zastávce
        if (distanceToCurrentStop < 6) {
            setJourneyProgress(100);
            return; // Ukončíme, protože jsme v cíli
        }

        // 3. PRAVIDLO: Progress bar se aktualizuje podle reálné ujeté vzdálenosti
        const prevStopData = scheduleData[currentIndex - 1];

        if (currentIndex > 0 && prevStopData) {
            const totalLegDistance = getDistance(
                { lat: prevStopData.lat, lon: prevStopData.lon },
                { lat: currentStopData.lat, lon: currentStopData.lon }
            );

            if (totalLegDistance > 0) {
                const travelledDistance = getDistance(
                    { lat: prevStopData.lat, lon: prevStopData.lon },
                    currentCoords
                );
                // Výpočet progressu jako procento ujeté vzdálenosti z celkové vzdálenosti úseku
                const progress = (travelledDistance / totalLegDistance) * 100;
                setJourneyProgress(progress);
            } else {
                // Pokud jsou zastávky na stejném místě, a nejsme v cíli, progress je 0
                setJourneyProgress(0);
            }
        } else {
            // Pro první zastávku (currentIndex === 0) nemáme předchozí bod,
            // takže progress bar zůstává na 0 %, dokud nedojedeme do cíle (< 6m).
            setJourneyProgress(0);
        }

    }, [currentLocation, currentIndex]);


    const handleNextStop = () => {
        if (currentIndex < scheduleData.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const formatTime = (ms: number) => {
        const isLate = ms < 0;
        const absoluteMs = Math.abs(ms);
        const totalSeconds = Math.floor(absoluteMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const sign = isLate ? '+' : '-';
        return `${sign}${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const formatDistance = (meters: number | null) => {
        if (meters === null) return 'Načítám polohu...';
        if (meters < 1000) {
            return `${Math.round(meters)} m`;
        }
        return `${(meters / 1000).toFixed(2)} km`;
    };

    const currentStop = scheduleData[currentIndex];
    const nextStop = scheduleData[currentIndex + 1];
    const isLate = timeDifference < 0;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.mainContent}>
                {currentStop ? (
                    <>
                        <ProgressBar progress={journeyProgress} />

                        {/* Text "Zbývá" se nyní aktualizuje synchronizovaně s progress barem */}
                        <Text style={styles.distanceText}>
                            Zbývá: {formatDistance(distanceToStop)}
                        </Text>

                        <View style={styles.stopInfo}>
                            <Text style={styles.mainStopName}>{currentStop.stopName}</Text>
                            {currentStop.isRequestStop &&
                                <MaterialCommunityIcon name="bell-ring-outline" size={40} color="white" />
                            }
                        </View>
                        <Text style={[styles.timer, isLate ? styles.timerLate : styles.timerOnTime]}>
                            {formatTime(timeDifference)}
                        </Text>

                        {nextStop && (
                            <View style={styles.nextStopContainer}>
                                <Text style={styles.nextStopLabel}>Následuje:</Text>
                                <Text style={styles.nextStopName}>{nextStop.stopName}</Text>
                            </View>
                        )}
                    </>
                ) : (
                    <Text style={styles.mainStopName}>Konec spoje</Text>
                )}
            </View>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.button} onPress={handleNextStop}>
                    <Text style={styles.buttonText}>Další zastávka</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};


// --- Styly (beze změny, pouze kosmetické úpravy mezer) ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A192F',
        justifyContent: 'space-between',
    },
    mainContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    progressContainer: {
        width: '90%',
        height: 35,
        marginBottom: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressBarBackground: {
        width: '100%',
        height: '100%',
        backgroundColor: '#1E3A5F',
        borderRadius: 18,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 18,
    },
    atStopText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2ECC40',
    },
    distanceText: {
        color: '#A9A9A9',
        fontSize: 18,
        marginBottom: 20,
    },
    stopInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    mainStopName: {
        fontSize: 54,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginRight: 15,
    },
    timer: {
        fontSize: 72,
        fontWeight: 'bold',
        fontVariant: ['tabular-nums'],
    },
    timerOnTime: {
        color: '#FF4136',
    },
    timerLate: {
        color: '#2ECC40',
    },
    nextStopContainer: {
        marginTop: 40,
        alignItems: 'center',
    },
    nextStopLabel: {
        fontSize: 20,
        color: '#A9A9A9',
    },
    nextStopName: {
        fontSize: 32,
        color: 'white',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 20,
        paddingHorizontal: 10,
        borderTopWidth: 1,
        borderTopColor: '#1E3A5F',
    },
    button: {
        backgroundColor: '#1E3A5F',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 10,
        flex: 1,
        marginHorizontal: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
});

export default DriverScreen;
