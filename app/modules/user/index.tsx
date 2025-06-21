import service from '@/rady';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

const { width, height } = Dimensions.get('window');

export default function Index() {
  const [isExpanded, setIsExpanded] = useState(false);
  const slideAnim = useRef(new Animated.Value(height)).current;
  const headerAnim = useRef(new Animated.Value(0)).current; // Pro pohyb jména nahoru

  const [stop, setStop] = useState('Mezi kancly'); // Výchozí zastávka pro vyhledávání


  console.log(service.findDeparturesFromStop('Mezi kancly')[0].departureTime);

  const [tripSchedules, setTripSchedules] = useState(
    service.findDeparturesFromStop('Mezi kancly').map((dep) => ({
      Linka: dep.line,
      arrival: dep.departureTime
    }))

  );

  /*const tripSchedules = [
    { Linka: "30", arrival: "11:00" },
    { Linka: "16", arrival: "12:00" },
    { Linka: "29", arrival: "13:00" },
    { Linka: "44", arrival: "14:00" },
    { Linka: "84", arrival: "15:00" },
    { Linka: "N97", arrival: "16:00" }
  ];*/

  const handleButtonPress = () => {
    console.log("Button pressed, starting animations");

    setTripSchedules(
      service.findDeparturesFromStop(query).map((dep) => ({
        Linka: dep.line,
        arrival: dep.departureTime
      }))
    );

    setIsExpanded(true);

    // Animace jména nahoru - plynulý posun z centra nahoru
    Animated.timing(headerAnim, {
      toValue: -130, // Posun z centra nahoru
      duration: 500,
      easing: Easing.out(Easing.quad), // Plynulejší easing
      useNativeDriver: true,
    }).start();

    // Animace content card ze spoda
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start((finished) => {
      console.log("Animation finished:", finished);
    });
  };

  const handleCloseCard = () => {
    console.log("Closing card");

    // Vrátit jméno zpět na střed
    Animated.timing(headerAnim, {
      toValue: 0,
      duration: 400,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();

    // Animace content card zpět dolů
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 400,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start((finished) => {
      if (finished) {
        setIsExpanded(false);
      }
    });
  };

  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    console.log("Search query:", query);
    setTripSchedules(
      service.findDeparturesFromStop(query).map((dep) => ({
        Linka: dep.line,
        arrival: dep.departureTime
          ? new Date(dep.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : 'N/A'
      }))
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar barStyle="light-content" backgroundColor="#1a202c" />

      {/* Fixed Header with Animation - Always Visible */}
      <Animated.View style={{
        backgroundColor: '#FFFFFF',
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 0,
        zIndex: 3,
        transform: [{ translateY: headerAnim }],
        position: 'absolute',
        top: 120,
        left: 0,
        right: 0
      }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center'
          }}>
            <View style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: '#FFFFFF',
              marginRight: 15,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 2,
              borderColor: '#4a5568'
            }}>
              <Ionicons name="person" size={28} color="#000000" />
            </View>
            <View>
              <Text style={{
                color: '#000000',
                fontSize: 20,
                fontWeight: '600',
                marginBottom: 2
              }}>
                Hi, Aaron
              </Text>
              <Text style={{
                color: '#000000',
                fontSize: 13,
                fontWeight: '400'
              }}>
                Where are you going today?
              </Text>
            </View>
          </View>
          <MaterialIcons name="apps" size={28} color="#000000" />
        </View>
      </Animated.View>

      {/* Center Area - Show button when not expanded */}
      {!isExpanded && (
        <View style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FFFFFF',
          paddingBottom: 70,
          gap: 20,
        }}>
          {/* search bar */}
          <View
            style={{
              width: '90%',
              backgroundColor: '#f7fafc',
              borderRadius: 25,
              paddingHorizontal: 20,
              paddingVertical: 12,
              flexDirection: 'row',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 3,
            }}
          >
            {/* Ikona je zároveň tlačítko pro odeslání */}
            <Pressable onPress={handleSearch}>
              <Ionicons name="search" size={24} color="#a0aec0" />
            </Pressable>

              {/* Vlastní vstup */}
              <TextInput
                style={{
                  flex: 1,
                  marginLeft: 10,
                  color: '#2d3748',        // text
                  fontSize: 16,
                  paddingVertical: 0,      // zarovná s ikonou
                }}
                placeholder="Search for places or routes"
                placeholderTextColor="#a0aec0"
                value={query}
                onChangeText={setQuery}
                returnKeyType="search"
                onSubmitEditing={handleSearch}
              />
          </View>

          <TouchableOpacity 
            onPress={handleButtonPress}
            style={{
              backgroundColor: '#4CAF50',
              paddingHorizontal: 40,
              paddingVertical: 16,
              borderRadius: 25,
              shadowColor: '#e53e3e',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6
            }}
          >
            <Text style={{
              color: 'white',
              fontWeight: '600',
              fontSize: 16,
              letterSpacing: 0.5
            }}>
              Plan Your Trip
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Animated Content Card - slides from bottom */}
      <Animated.View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'transparent',
        transform: [{ translateY: slideAnim }],
        zIndex: 1
      }}>
        {/* Spacer for header */}
        <View style={{ height: 130 }} />

        <View style={{
          flex: 1,
          backgroundColor: '#f8f9fa',
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          position: 'relative'
        }}>
          {/* Location Pin Icon */}
          <View style={{
            position: 'absolute',
            top: -15,
            left: '50%',
            marginLeft: -15,
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: '#e53e3e',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
            zIndex: 10
          }}>
            <MaterialIcons name="location-on" size={18} color="white" />
          </View>

          {/* Close Button */}
          <TouchableOpacity 
            onPress={handleCloseCard}
            style={{
              position: 'absolute',
              top: 15,
              right: 20,
              zIndex: 10,
              padding: 8,
              backgroundColor: 'rgba(255,255,255,0.9)',
              borderRadius: 20
            }}
          >
            <MaterialIcons name="close" size={24} color="#718096" />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, marginTop: 24 }}>
            {/* Map Section */}
          

            {/* Trip Schedule Cards */}
            <View style={{ paddingHorizontal: 20 }}>
              {tripSchedules.map((trip, index) => (
                <View key={index} style={{
                  backgroundColor: 'white',
                  borderRadius: 18,
                  padding: 18,
                  marginBottom: 16,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.08,
                  shadowRadius: 6,
                  elevation: 3
                }}>
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 11,
                        color: '#718096',
                        marginBottom: 6,
                        fontWeight: '500',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5
                      }}>
                        Linka
                      </Text>
                      <Text style={{
                        fontSize: 32,
                        fontWeight: '700',
                        color: '#1a202c'
                      }}>
                        {trip.Linka}
                      </Text>
                    </View>

                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      flex: 0.5,
                      justifyContent: 'center',
                      paddingHorizontal: 0,
                      paddingRight: 40,
                      paddingTop: 24
                      
                    }}>
                      <View style={{
                        height: 2,
                        backgroundColor: '#e2e8f0',
                        flex: 1
                      }} />
                      <View style={{
                        width: 14,
                        height: 14,
                        borderRadius: 7,
                        backgroundColor: '#e53e3e',
                        marginHorizontal: 8
                      }} />
                      <View style={{
                        height: 2,
                        backgroundColor: '#e2e8f0',
                        flex: 1
                      }} />
                    </View>

                    {/* <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      <Text style={{
                        fontSize: 11,
                        color: '#718096',
                        marginBottom: 6,
                        fontWeight: '500',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5
                      }}>
                        Příjezd
                      </Text>
                      <Text style={{
                        fontSize: 22,
                        fontWeight: '700',
                        color: '#1a202c'
                      }}>
                        {trip.arrival}
                      </Text>
                    </View> */}
                    <View style={{ flex: 1, width: 200, alignItems: 'center', paddingLeft: 6 }}>
                      <Text style={{
                        fontSize: 11,
                        color: '#718096',
                        marginBottom: 6,
                        fontWeight: '500',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        
                      }}>
                        Linka
                      </Text>
                      <Text style={{
                        fontSize: 32,
                        fontWeight: '700',
                        color: '#1a202c'
                      }}>
                        {trip.arrival}
                      </Text>
                    </View>

                    <TouchableOpacity style={{
                      padding: 0
                    }}>
                      <MaterialIcons name="more-vert" size={22} color="#a0aec0" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            {/* Pricing and Tickets Section */}
            {/* <View style={{
              flexDirection: 'row',
              paddingHorizontal: 20,
              paddingTop: 10,
              paddingBottom: 30,
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <View style={{
                backgroundColor: '#f7fafc',
                paddingHorizontal: 24,
                paddingVertical: 18,
                borderRadius: 16,
                flex: 0.28,
                alignItems: 'center'
              }}>
                <Text style={{
                  fontSize: 20,
                  fontWeight: '700',
                  color: '#2d3748'
                }}>
                  224฿
                </Text>
              </View>

              <View style={{
                backgroundColor: '#f7fafc',
                paddingHorizontal: 24,
                paddingVertical: 18,
                borderRadius: 16,
                flex: 0.28,
                alignItems: 'center'
              }}>
                <Text style={{
                  fontSize: 20,
                  fontWeight: '700',
                  color: '#2d3748'
                }}>
                  354฿
                </Text>
              </View>

              <TouchableOpacity style={{
                backgroundColor: '#e53e3e',
                paddingHorizontal: 28,
                paddingVertical: 18,
                borderRadius: 16,
                flex: 0.38,
                alignItems: 'center',
                shadowColor: '#e53e3e',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 4
              }}>
                <Text style={{
                  color: 'white',
                  fontWeight: '700',
                  fontSize: 16,
                  letterSpacing: 0.5
                }}>
                  TICKETS
                </Text>
              </TouchableOpacity>
            </View> */}

            {/* Page Indicator */}
            {/* <View style={{
              flexDirection: 'row',
              justifyContent: 'center',
              paddingBottom: 30
            }}>
              <View style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: '#e53e3e',
                marginHorizontal: 5
              }} />
              <View style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: '#cbd5e0',
                marginHorizontal: 5
              }} />
              <View style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: '#cbd5e0',
                marginHorizontal: 5
              }} />
            </View> */}
          </ScrollView>
        </View>
      </Animated.View>
    </View>
  );
}