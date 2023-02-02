import React, { useState, useEffect, useRef } from "react";
import Paho from "paho-mqtt";
import {
  StyleSheet,
  Text,
  View,
  Platform,
  Animated,
  Button,
} from "react-native";
import { LightSensor } from "expo-sensors";
import ShadowView from "./ShadowView";
// Initialise une nouvelle connexion de client Paho
const clientID = "clientID-" + parseInt(Math.random() * 100);

// Initialise une nouvelle connexion de client Paho
const client = new Paho.Client("test.mosquitto.org", 8080, clientID);

export default function App() {
  const [{ illuminance }, setData] = useState({ illuminance: 0 });
  const [oldIlluminance, setOldIlluminance] = useState(0);
  const [btn, setBtn] = useState("");
  const [subscription, setSubscription] = useState(null);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const onSuccess = () => {
    console.log("connected");
    setSubscription(
      LightSensor.addListener((ill) => {
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start();
        setOldIlluminance(illuminance);
        setData({ illuminance: ill.illuminance });
        let message = new Paho.Message(ill.illuminance.toString());
        message.destinationName = "Luminosite1998";
        client.send(message);
      })
    );
  };
  useEffect(() => {
    _toggle();
    return () => {
      _unsubscribe();
    };
  }, []);

  const _toggle = () => {
    if (subscription) {
      _unsubscribe();
    } else {
      _subscribe();
    }
  };

  const _subscribe = () => {
    client.connect({
      onSuccess: onSuccess,
    });
    setBtn("Enabled");
  };

  const _unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
    client.disconnect();
    setBtn("Disabled");
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.whiteText}>Brightness Level:</Text>
        <Button onPress={_toggle} title={btn} />
      </View>
      <Animated.View
        style={{
          position: "relative",
          transform: [
            {
              scale: scaleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [oldIlluminance / 30, illuminance / 30],
              }),
            },
          ],
        }}
      >
        <View
          style={{
            width: 100,
            height: 100,
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#FFDE00",
            borderRadius: 100,
          }}
        >
          <View
            style={{
              width: 120,
              height: 120,
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#FFDE0080",
              borderRadius: 60,
            }}
          >
            <View
              style={{
                width: 140,
                height: 140,
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#FFDE0040",
                borderRadius: 100,
              }}
            >
              <View
                style={{
                  width: 160,
                  height: 160,
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#FFDE0020",
                  borderRadius: 100,
                }}
              >
                <View
                  style={{
                    width: 180,
                    height: 180,
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#FFDE0010",
                    borderRadius: 100,
                  }}
                >
                  <View
                    style={{
                      width: 180,
                      height: 180,
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "#FFDE0010",
                      borderRadius: 100,
                    }}
                  >
                    <View
                      style={{
                        width: 200,
                        height: 2000,
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "#FFDE0000",
                        borderRadius: 100,
                      }}
                    ></View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>
      <Text style={styles.whiteText}>
        {Platform.OS === "android"
          ? `${illuminance} lx`
          : `Only available on Android`}
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "space-evenly",
    backgroundColor: "black",
    minHeight: "100%",
  },
  whiteText: {
    color: "white",
  },
});
