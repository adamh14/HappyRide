import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const { width, height } = Dimensions.get('window');

export default function Index() {
  const [isExpanded, setIsExpanded] = useState(false);
  const slideAnim = useRef(new Animated.Value(height)).current;
  const headerAnim = useRef(new Animated.Value(0)).current; // Pro pohyb jména nahoru
  const tripSchedules = [
    { departure: "07:00", arrival: "11:00" },
    { departure: "08:00", arrival: "12:00" },
    { departure: "09:00", arrival: "13:00" }
  ];

  const handleButtonPress = () => {
    console.log("Button pressed, starting animations");
    setIsExpanded(true);

    // Animace jména nahoru - plynulý posun z centra nahoru
    Animated.timing(headerAnim, {
      toValue: -200, // Posun z centra nahoru
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
  return (
    <View style={{ flex: 1, backgroundColor: '#1a202c' }}>
      <StatusBar barStyle="light-content" backgroundColor="#1a202c" />

      {/* Fixed Header with Animation - Always Visible */}
      <Animated.View style={{
        backgroundColor: '#1a202c',
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 30,
        zIndex: 3,
        transform: [{ translateY: headerAnim }],
        position: 'absolute',
        top: 0,
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
              backgroundColor: '#2d3748',
              marginRight: 15,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 2,
              borderColor: '#4a5568'
            }}>
              <Ionicons name="person" size={28} color="#ffffff" />
            </View>
            <View>
              <Text style={{
                color: '#ffffff',
                fontSize: 20,
                fontWeight: '600',
                marginBottom: 2
              }}>
                Hi, Aaron
              </Text>
              <Text style={{
                color: '#a0aec0',
                fontSize: 13,
                fontWeight: '400'
              }}>
                Where are you going today?
              </Text>
            </View>
          </View>
          <MaterialIcons name="apps" size={28} color="#ffffff" />
        </View>
      </Animated.View>

      {/* Center Area - Show button when not expanded */}
      {!isExpanded && (
        <View style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1a202c',
          paddingTop: 100 // Prostor pro jméno
        }}>
          <TouchableOpacity 
            onPress={handleButtonPress}
            style={{
              backgroundColor: '#e53e3e',
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

          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            {/* Map Section */}
            <View style={{
              margin: 20,
              marginTop: 35,
              borderRadius: 20,
              overflow: 'hidden',
              backgroundColor: '#e8f4f8',
              height: 200,
              position: 'relative',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4
            }}>
              {/* Mock Map Background */}
              <View style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#e8f4f8',
                position: 'relative'
              }}>
                {/* Road lines */}
                <View style={{
                  position: 'absolute',
                  top: 60,
                  left: 40,
                  width: 120,
                  height: 3,
                  backgroundColor: '#cbd5e0',
                  borderRadius: 2
                }} />
                <View style={{
                  position: 'absolute',
                  top: 100,
                  left: 80,
                  width: 80,
                  height: 3,
                  backgroundColor: '#cbd5e0',
                  borderRadius: 2,
                  transform: [{ rotate: '45deg' }]
                }} />
                <View style={{
                  position: 'absolute',
                  top: 140,
                  left: 20,
                  width: 100,
                  height: 3,
                  backgroundColor: '#cbd5e0',
                  borderRadius: 2
                }} />
              </View>

              {/* My Location Label */}
              <View style={{
                position: 'absolute',
                top: 20,
                left: 20,
                backgroundColor: 'white',
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 25,
                flexDirection: 'row',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 3
              }}>
                <View style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: '#48bb78',
                  marginRight: 10
                }} />
                <Text style={{ 
                  fontSize: 13, 
                  fontWeight: '500',
                  color: '#2d3748'
                }}>My location</Text>
                <TouchableOpacity style={{ marginLeft: 10 }}>
                  <MaterialIcons name="close" size={18} color="#718096" />
                </TouchableOpacity>
              </View>

              {/* Airport Label */}
              <View style={{
                position: 'absolute',
                bottom: 20,
                right: 20,
                backgroundColor: 'white',
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 25,
                flexDirection: 'row',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 3
              }}>
                <View style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: '#e53e3e',
                  marginRight: 10
                }} />
                <Text style={{ 
                  fontSize: 13, 
                  fontWeight: '500',
                  color: '#2d3748'
                }}>Airport</Text>
                <TouchableOpacity style={{ marginLeft: 10 }}>
                  <MaterialIcons name="close" size={18} color="#718096" />
                </TouchableOpacity>
              </View>

              {/* Connection Line */}
              <View style={{
                position: 'absolute',
                top: '50%',
                left: '20%',
                right: '20%',
                height: 2,
                backgroundColor: '#4299e1',
                marginTop: -1
              }} />
              <View style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: '#2d3748',
                marginLeft: -6,
                marginTop: -6
              }} />
            </View>

            {/* Trip Schedule Cards */}
            <View style={{ paddingHorizontal: 20 }}>
              {tripSchedules.map((trip, index) => (
                <View key={index} style={{
                  backgroundColor: 'white',
                  borderRadius: 18,
                  padding: 24,
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
                        DEPARTURE
                      </Text>
                      <Text style={{
                        fontSize: 26,
                        fontWeight: '700',
                        color: '#1a202c'
                      }}>
                        {trip.departure}
                      </Text>
                    </View>

                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      flex: 1.5,
                      justifyContent: 'center',
                      paddingHorizontal: 20
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
                        marginHorizontal: 12
                      }} />
                      <View style={{
                        height: 2,
                        backgroundColor: '#e2e8f0',
                        flex: 1
                      }} />
                    </View>

                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      <Text style={{
                        fontSize: 11,
                        color: '#718096',
                        marginBottom: 6,
                        fontWeight: '500',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5
                      }}>
                        ARRIVAL
                      </Text>
                      <Text style={{
                        fontSize: 26,
                        fontWeight: '700',
                        color: '#1a202c'
                      }}>
                        {trip.arrival}
                      </Text>
                    </View>

                    <TouchableOpacity style={{
                      marginLeft: 20,
                      padding: 8
                    }}>
                      <MaterialIcons name="more-vert" size={22} color="#a0aec0" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            {/* Pricing and Tickets Section */}
            <View style={{
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
            </View>

            {/* Page Indicator */}
            <View style={{
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
            </View>
          </ScrollView>
        </View>
      </Animated.View>
    </View>
  );
}