import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const { width, height } = Dimensions.get('window');

function HomeScreen({ navigation }) {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Staggered entrance animations
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Continuous floating animation for decoration
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Subtle rotation for the icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Show welcome text after initial animation
    setTimeout(() => setShowWelcome(true), 1500);
  }, []);

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.92,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handleGetStarted = () => {
    // Navigate to Board screen with animation
    Animated.sequence([
      Animated.spring(buttonScale, {
        toValue: 0.9,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.navigate('Board'); // Navigates to BoardScreen
    });
  };

  const floatY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '8deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E1A" />
      
      {/* Background Gradient */}
      <View style={styles.gradientBackground}>
        <View style={styles.gradientOverlay} />
        
        {/* Animated Background Circles */}
        <Animated.View 
          style={[
            styles.circle1,
            {
              transform: [
                { translateY: floatY },
                { scale: scaleAnim }
              ]
            }
          ]} 
        />
        <Animated.View 
          style={[
            styles.circle2,
            {
              transform: [
                { translateY: floatY },
                { scale: scaleAnim }
              ]
            }
          ]} 
        />
        <Animated.View 
          style={[
            styles.circle3,
            {
              transform: [
                { translateY: floatY },
                { scale: scaleAnim }
              ]
            }
          ]} 
        />
      </View>

      {/* Content */}
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }
        ]}
      >
        {/* Animated Icon */}
        <Animated.View 
          style={[
            styles.iconContainer,
            {
              transform: [
                { rotate: rotate },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          <View style={styles.iconWrapper}>
            <Icon name="check-circle" size={70} color="#6C63FF" />
          </View>
        </Animated.View>

        {/* Welcome Text with Typewriter Effect */}
        <View style={styles.textContainer}>
          <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
            Welcome to
          </Animated.Text>
          <Animated.Text style={[styles.brandName, { opacity: fadeAnim }]}>
            TaskFlow
          </Animated.Text>
          <Animated.Text style={[styles.Natnael, { opacity: fadeAnim }]}>
            Natnael
          </Animated.Text>
          
          {showWelcome && (
            <Animated.Text 
              style={[
                styles.subtitle,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              Organize your tasks, boost your productivity
            </Animated.Text>
          )}
        </View>

        {/* Feature Highlights */}
        <Animated.View 
          style={[
            styles.featuresContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Icon name="check" size={16} color="#6C63FF" />
            </View>
            <Text style={styles.featureText}>Smart task management</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Icon name="clock" size={16} color="#6C63FF" />
            </View>
            <Text style={styles.featureText}>Track your progress</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Icon name="trending-up" size={16} color="#6C63FF" />
            </View>
            <Text style={styles.featureText}>Boost productivity</Text>
          </View>
        </Animated.View>

        {/* Get Started Button - Navigates to Board */}
        <Animated.View
          style={[
            styles.buttonWrapper,
            {
              transform: [{ scale: buttonScale }],
              opacity: fadeAnim,
            }
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handleGetStarted}
            style={styles.button}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonText}>Get Started</Text>
              <Animated.View 
                style={[
                  styles.buttonIcon,
                  {
                    transform: [
                      {
                        translateX: rotateAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 5],
                        })
                      }
                    ]
                  }
                ]}
              >
                <Icon name="arrow-right" size={22} color="#FFF" />
              </Animated.View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0A0E1A',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(106, 99, 255, 0.03)',
  },
  circle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(106, 99, 255, 0.08)',
    top: -50,
    right: -80,
  },
  circle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(106, 99, 255, 0.06)',
    bottom: 100,
    left: -60,
  },
  circle3: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(106, 99, 255, 0.04)',
    bottom: -30,
    right: 30,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    marginTop: 55,
  },
  iconContainer: {
    marginTop: 5,
  },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(106, 99, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(106, 99, 255, 0.2)',
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  title: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '400',
    letterSpacing: 1,
    marginBottom: 4,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: -1,
    textShadowColor: 'rgba(106, 99, 255, 0.3)',
    textShadowOffset: { width: 0, height: 10 },
    textShadowRadius: 20,
  },
  Natnael: {
    fontSize: 38,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: 2,
    textShadowColor: 'rgba(106, 99, 255, 0.3)',
    textShadowOffset: { width: 0, height: 10 },
    textShadowRadius: 20,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  featuresContainer: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  featureIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(106, 99, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  buttonWrapper: {
    width: '100%',
    marginBottom: 30,
  },
  button: {
    width: '100%',
    height: 60,
    backgroundColor: '#6C63FF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginRight: 12,
  },
  buttonIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 0.5,
  },
});

export default HomeScreen;