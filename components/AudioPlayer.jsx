import { StyleSheet, View, Button,TouchableOpacity,Text } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';
import React from "react";
import { useState, useEffect } from "react";
import { forwardRef } from "react";
import Slider from "@react-native-community/slider";
import { useImperativeHandle } from "react";
import * as FileSystem from "expo-file-system";
import { Audio } from "expo-av";
//bug: after changing volume to 0 and start a new one, the volume is not aligned
//bug: multiple sound plays clash with each other
const AudioPlayer = forwardRef((props, ref) => {
  const [sounds, setSounds] = useState([]);
  const [currentSoundIndex, setCurrentSoundIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [loop, setLoop] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying) {
        if (sounds[currentSoundIndex]) {
          sounds[currentSoundIndex].getStatusAsync().then((status) => {
            setPositionMillis(status.positionMillis);
            setDurationMillis(status.durationMillis);
            setIsPlaying(status.isPlaying);
          });
        }
      }
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying, sounds, currentSoundIndex]);

  async function playSound(filename, folder = 'hypno') {
    try {
      if (isPlaying && sounds[currentSoundIndex]) {
        await sounds[currentSoundIndex].unloadAsync();
        setSounds([]);
        setCurrentSoundIndex(null);
      }
  
      let source;
      if (folder === 'hypno') {
        const directory = `${FileSystem.documentDirectory}${folder}/`;
        const uri = `${directory}${filename}`;
        source = { uri };
      } else if (folder === 'whitenoise') {
        const whitenoiseFiles = {
          '001.mp3': require('../assets/whitenoise/001.mp3'),
          '002.mp3': require('../assets/whitenoise/002.mp3'),
          '003.mp3': require('../assets/whitenoise/003.mp3'),
          '004.mp3': require('../assets/whitenoise/004.mp3'),
        };

        if (whitenoiseFiles[filename]) {
          source = whitenoiseFiles[filename];
        } else {
          console.error(`File ${filename} not found in whitenoise directory`);
          return;
        }
      }

      const { sound } = await Audio.Sound.createAsync(
        source,
        onPlaybackStatusUpdate
      );
      sound.setIsLoopingAsync(loop); // Set looping when sound is created
      setSounds([sound]);
      setCurrentSoundIndex(0);
      setIsPlaying(true);
      await sound.playAsync();
    } catch (error) {
      console.error('Failed to play sound', error);
    }
  }

  async function pauseOrResume() {
    if (sounds[currentSoundIndex]) {
      if (isPlaying) {
        await sounds[currentSoundIndex].pauseAsync();
      } else {
        if (positionMillis >= durationMillis) {
          await sounds[currentSoundIndex].setPositionAsync(0);
        }
        await sounds[currentSoundIndex].playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  }

  async function seekAudio(position) {
    if (sounds[currentSoundIndex]) {
      await sounds[currentSoundIndex].setPositionAsync(position);
      setPositionMillis(position);
    }
  }

  async function setLooping(looping) {
    if (sounds[currentSoundIndex]) {
      await sounds[currentSoundIndex].setIsLoopingAsync(looping);
      setLoop(looping);
    }
  }

  async function setAudioVolume(vol) {
    if (sounds[currentSoundIndex]) {
      await sounds[currentSoundIndex].setVolumeAsync(vol);
      setVolume(vol);
    }
  }

  function onPlaybackStatusUpdate(status) {
    if (status.isLoaded) {
      setPositionMillis(status.positionMillis);
      setDurationMillis(status.durationMillis);
      setIsPlaying(status.isPlaying);
      if (status.didJustFinish && loop) { // Check loop status here
        setPositionMillis(0);
        sounds[currentSoundIndex].playAsync(); // Restart sound if looping is enabled
      } else if (status.didJustFinish) {
        setPositionMillis(0);
        setIsPlaying(false);
      }
    }
  }

  useImperativeHandle(ref, () => ({
    playSound,
    pauseOrResume,
    seekAudio,
    setLooping,
    setAudioVolume,
    isPlaying,
    positionMillis,
    durationMillis,
    volume,
    loop,
  }));

  useEffect(() => {
    return () => {
      sounds.forEach(async (sound) => {
        await sound.unloadAsync();
      });
    };
  }, [sounds]);

  return (
    <View style={styles.audioPlayer}>
      {/* <Button title={isPlaying ? 'Pause' : 'Play'} onPress={pauseOrResume} /> */}
      <TouchableOpacity onPress={pauseOrResume} style={styles.playButton}>
        <Text>
          <Icon name={isPlaying ? 'pause' : 'play'} size={30} color="#ffffff" />
        </Text>
      </TouchableOpacity>
      <Slider
        style={styles.slider}
        value={positionMillis}
        maximumValue={durationMillis}
        onSlidingComplete={seekAudio}
        minimumTrackTintColor="#1E90FF"
        maximumTrackTintColor="#000000"
        thumbTintColor="#1E90FF"
      />
      <View style={styles.controls}>
        <Button
          title={loop ? 'Loop On' : 'Loop Off'}
          onPress={() => setLooping(!loop)}
        />
        <Slider
          style={styles.volumeSlider}
          value={volume}
          minimumValue={0}
          maximumValue={1}
          onSlidingComplete={setAudioVolume}
          minimumTrackTintColor="#1E90FF"
          maximumTrackTintColor="#000000"
          thumbTintColor="#1E90FF"
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  audioPlayer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f0f0f0',
    padding: 10,
    // display: 'flex',
    // flexDirection: 'row',
    // alignItems: 'center',
    // justifyContent: 'space-between',
  },
  playButton: {
    width: 50,
    padding: 10,
    borderRadius: 50,
    backgroundColor: '#1E90FF',
  },
  slider: {
    width: '100%',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  volumeSlider: {
    width: '70%',
  },
});

export default AudioPlayer;