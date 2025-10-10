import React, { useEffect, useState } from "react";
import {
  View,
  Image,
  StyleSheet,
  PanResponder,
  Animated,
  Text,
  Alert,
  ActivityIndicator,
} from "react-native";
import { getSliderCaptcha, verifySliderCaptcha } from "../services/api";

export default function SliderCaptcha({ onSuccess }) {
  const [captcha, setCaptcha] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pan] = useState(new Animated.Value(0));

  const sliderTrackWidth = 300;
  const thumbWidth = 50;

  const fetchCaptcha = async () => {
    setLoading(true);
    try {
      const data = await getSliderCaptcha();
      setCaptcha(data);
      pan.setValue(0);
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to load CAPTCHA");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      let newX = gestureState.dx;
      if (newX < 0) newX = 0;
      if (newX > sliderTrackWidth - thumbWidth)
        newX = sliderTrackWidth - thumbWidth;
      pan.setValue(newX);
    },
    onPanResponderRelease: async () => {
      const position = pan.__getValue();
      try {
        await verifySliderCaptcha({
          token: captcha.token,
          position,
          tolerance: 5,
        });
        Alert.alert("✅ Success", "CAPTCHA verified!");
        onSuccess && onSuccess();
      } catch (err) {
        Alert.alert("❌ Failed", err.message || "Incorrect slider position");
        fetchCaptcha();
      }
    },
  });

  if (loading || !captcha) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#1B1462" />
      </View>
    );
  }

  const cutoutAnim = pan.interpolate({
    inputRange: [0, sliderTrackWidth - thumbWidth],
    outputRange: [0, sliderTrackWidth - thumbWidth],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.container}>
      <Text style={[styles.formTitle, { fontFamily: "Poppins_600SemiBold" }]}>
        Slide the puzzle to verify
      </Text>

      {/* ===== CAPTCHA ===== */}
      <View style={styles.puzzleContainer}>
        <Image
          source={{ uri: captcha.puzzle_url }}
          style={{
            width: sliderTrackWidth,
            height: captcha.slider_width,
            borderRadius: 8,
          }}
        />

        {/* cutout hint */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: captcha.cutout_x,
            width: thumbWidth,
            height: captcha.slider_width,
            backgroundColor: "rgba(255,255,255,0.3)",
            borderWidth: 1,
            borderColor: "#fff",
            borderRadius: 5,
          }}
        />
      </View>

      {/* ===== Slider ===== */}
      <View style={[styles.sliderTrack, { width: sliderTrackWidth }]}>
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.sliderThumb,
            { transform: [{ translateX: pan }] },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    alignItems: "center",
    paddingVertical: 20,
  },
  formTitle: {
    fontSize: 16,
    marginBottom: 10,
  },
  puzzleContainer: {
    position: "relative",
    marginBottom: 20,
  },
  sliderTrack: {
    height: 40,
    backgroundColor: "#eee",
    borderRadius: 20,
    justifyContent: "center",
    overflow: "hidden",
  },
  sliderThumb: {
    width: 50,
    height: 40,
    backgroundColor: "#1B1462",
    borderRadius: 20,
    position: "absolute",
    left: 0,
  },
});
