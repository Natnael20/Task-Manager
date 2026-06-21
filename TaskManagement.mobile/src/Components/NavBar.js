import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar,
  TouchableWithoutFeedback,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const { width, height } = Dimensions.get('window');

const NavBar = ({ navigation, activeScreen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(width)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  // Toggle menu
  const toggleMenu = () => {
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  const openMenu = () => {
    setIsOpen(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0.5,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsOpen(false);
    });
  };

  // Navigate to screen
  const navigateTo = (screen) => {
    closeMenu();
    setTimeout(() => {
      navigation.navigate(screen);
    }, 350);
  };

  // Menu items - Both Home and Board as separate items
  const menuItems = [
    { 
      id: 'home', 
      label: 'Home', 
      icon: 'home', 
      screen: 'Home',
      color: '#6C63FF',
    },
    { 
      id: 'board', 
      label: 'Board', 
      icon: 'grid', 
      screen: 'Board',
      color: '#6C63FF',
    },
    { 
      id: 'All Tasks', 
      label: 'All Tasks', 
      icon: 'list', 
      screen: 'Tasks',
      color: '#0984E3',
    },
    { 
      id: 'notes', 
      label: 'Notes', 
      icon: 'file-text', 
      screen: 'Notes',
      color: '#00B894',
    },
    { 
      id: 'calendar', 
      label: 'Calendar', 
      icon: 'calendar', 
      screen: 'Calendar',
      color: '#E17055',
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: 'bar-chart-2', 
      screen: 'Analytics',
      color: '#FDCB6E',
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: 'settings', 
      screen: 'Settings',
      color: '#636E72',
    },
  ];

  return (
    <>
      {/* Menu Button (Always visible) */}
      <TouchableOpacity
        style={styles.menuButton}
        onPress={toggleMenu}
        activeOpacity={0.8}
      >
        <View style={styles.menuButtonInner}>
          {isOpen ? (
            <Icon name="x" size={28} color="#FFFFFF" />
          ) : (
            <>
              <View style={styles.hamburgerLine} />
              <View style={[styles.hamburgerLine, { width: 20 }]} />
              <View style={[styles.hamburgerLine, { width: 16 }]} />
            </>
          )}
        </View>
      </TouchableOpacity>

      {/* Overlay */}
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: overlayOpacity,
            display: isOpen ? 'flex' : 'none',
          },
        ]}
      >
        <TouchableWithoutFeedback onPress={closeMenu}>
          <View style={styles.overlayTouchable} />
        </TouchableWithoutFeedback>
      </Animated.View>

      {/* Slide-out Menu */}
      <Animated.View
        style={[
          styles.menuContainer,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="light-content" backgroundColor="#0A0E1A" />
          
          {/* Header */}
          <View style={styles.menuHeader}>
            <View style={styles.menuHeaderContent}>
              <View style={styles.appIcon}>
                <Icon name="check-square" size={28} color="#6C63FF" />
              </View>
              <View>
                <Text style={styles.menuTitle}>TaskFlow</Text>
                <Text style={styles.menuSubtitle}>Organize your life</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Menu Items */}
          <View style={styles.menuItems}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  activeScreen === item.id && styles.menuItemActive,
                ]}
                onPress={() => navigateTo(item.screen)}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                    <Icon name={item.icon} size={22} color={item.color} />
                  </View>
                  <Text
                    style={[
                      styles.menuItemText,
                      activeScreen === item.id && styles.menuItemTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </View>
                {activeScreen === item.id && (
                  <View style={styles.activeIndicator} />
                )}
                <Icon
                  name="chevron-right"
                  size={20}
                  color={activeScreen === item.id ? '#6C63FF' : '#2D3436'}
                />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.divider} />
        </SafeAreaView>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  // Menu Button
  menuButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 999,
  },
  menuButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1A2332',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  hamburgerLine: {
    height: 2,
    width: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
    marginVertical: 2.5,
  },

  // Overlay
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    zIndex: 998,
  },
  overlayTouchable: {
    flex: 1,
  },

  // Menu
  menuContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: width * 0.8,
    height: height,
    backgroundColor: '#0b1220',
    zIndex: 999,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },

  // Menu Header
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 30,
    paddingTop: 40,
    paddingBottom: 16,
  },
  menuHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(106, 99, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginVertical: 12,
  },

  menuItems: {
    flex: 1,
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  menuItemActive: {
    backgroundColor: 'rgba(106, 99, 255, 0.08)',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuItemText: {
    fontSize: 16,
    color: '#ADB5BD',
    fontWeight: '500',
  },
  menuItemTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  activeIndicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
    backgroundColor: '#6C63FF',
    position: 'absolute',
    left: 0,
  },

});

export default NavBar;