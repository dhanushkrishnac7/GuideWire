import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

interface SwipeToAcceptProps {
  onAccept: () => void;
}

export default function SwipeToAccept({ onAccept }: SwipeToAcceptProps) {
  const [accepted, setAccepted] = useState(false);
  // Give some padding based on typical device dimensions
  const trackWidth = Dimensions.get('window').width - theme.spacing.m * 6;
  const thumbWidth = 56;
  const maxTravel = trackWidth - thumbWidth;

  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !accepted,
      onMoveShouldSetPanResponder: () => !accepted,
      onPanResponderMove: (_, gestureState) => {
        let newX = gestureState.dx;
        if (newX < 0) newX = 0;
        if (newX > maxTravel) newX = maxTravel;
        pan.setValue({ x: newX, y: 0 });
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > maxTravel * 0.75) {
          Animated.spring(pan, {
            toValue: { x: maxTravel, y: 0 },
            useNativeDriver: false,
          }).start(() => {
            setAccepted(true);
            onAccept();
          });
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <View style={[styles.track, accepted && styles.trackAccepted]}>
        <Text style={[styles.trackText, accepted && styles.trackTextAccepted]}>
          {accepted ? 'Terms Accepted' : 'Swipe to Accept Terms'}
        </Text>
        <Animated.View
          style={[
            styles.thumb,
            { transform: [{ translateX: pan.x }] },
            accepted && styles.thumbAccepted
          ]}
          {...panResponder.panHandlers}
        >
          <Ionicons name={accepted ? "checkmark" : "chevron-forward"} size={24} color={accepted ? "#FFF" : theme.colors.primary} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.m,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: theme.spacing.m,
  },
  track: {
    width: '100%',
    height: 64,
    backgroundColor: '#EAE6FF',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden'
  },
  trackAccepted: {
    backgroundColor: theme.colors.successGreen,
  },
  trackText: {
    ...theme.typography.subtitle,
    color: theme.colors.primary,
    marginLeft: 32,
  },
  trackTextAccepted: {
    color: '#FFF',
    marginLeft: 0,
  },
  thumb: {
    position: 'absolute',
    left: 4,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbAccepted: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    shadowOpacity: 0,
    elevation: 0,
  }
});
