import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';


const BottomTabBar = ({ state, descriptors, navigation }) => {
  const getTabEmoji = (routeName) => {
    switch (routeName) {
      case 'Home':
        return '🏠';
      case 'Favorites':
        return '⭐';
      case 'Tinder':
        return '➕';
      case 'Folder':
        return '📁';
      case 'NewPlace':
        return '🚩';
      case 'Profile':
        return '👤';
      default:
        return '❓';
    }
  };

  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel || route.name;
        const isFocused = state.index === index;
        const tabEmoji = getTabEmoji(route.name);

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabButton}
          >
            <View style={[styles.iconContainer, isFocused && styles.activeIconContainer]}>
              <Text style={{ fontSize: 24, color: isFocused ? '#000' : '#999' }}>
                {tabEmoji}
              </Text>
            </View>
            {/* Faint circle indicator */}
            {isFocused && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    paddingBottom: 25, // Extra padding for safe area
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    position: 'relative',
  },
  iconContainer: {
    padding: 8,
    borderRadius: 20,
  },
  activeIconContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -5,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#000',
    opacity: 0.3,
  },
});

export default BottomTabBar;