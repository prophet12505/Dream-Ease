import { StyleSheet, View, Button} from 'react-native';
import React from 'react'
import { useState,useEffect } from 'react';
import { forwardRef } from 'react';
import Slider from '@react-native-community/slider';
import { useImperativeHandle } from 'react';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
//bug: multiple sound plays clash with each other
const AudioPlayer = forwardRef((props, ref) => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [loop, setLoop] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (sound && isPlaying) {
        sound.getStatusAsync().then(status => {
          setPositionMillis(status.positionMillis);
          setDurationMillis(status.durationMillis);
          setIsPlaying(status.isPlaying);
        });
      }
    }, 100);
    return () => clearInterval(interval);
  }, [sound, isPlaying]);
  
  async function playSound(filename) {
    try {
      if (sound && isPlaying) {
        await sound.unloadAsync();
        setSound(null);
      }
      const uri = `${FileSystem.documentDirectory}hypno/${filename}`;
      const { sound } = await Audio.Sound.createAsync({ uri }, onPlaybackStatusUpdate);
      setSound(sound);
      setIsPlaying(true);
      await sound.playAsync();
    } catch (error) {
      console.error('Failed to play sound', error);
    }
  }

  async function pauseOrResume() {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        if (positionMillis >= durationMillis) {
          await sound.setPositionAsync(0);
        }
        await sound.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  }

  async function seekAudio(position) {
    if (sound) {
      await sound.setPositionAsync(position);
    }
  }

  async function setLooping(looping) {
    if (sound) {
      await sound.setIsLoopingAsync(looping);
      setLoop(looping);
    }
  }

  async function setAudioVolume(vol) {
    if (sound) {
      await sound.setVolumeAsync(vol);
      setVolume(vol);
    }
  }

  function onPlaybackStatusUpdate(status) {
    if (status.isLoaded) {
      setPositionMillis(status.positionMillis);
      setDurationMillis(status.durationMillis);
      setIsPlaying(status.isPlaying);
      if (status.didJustFinish) {
        setPositionMillis(0);
        setIsPlaying(false);
      }
    }
  }

  // Expose methods and state to parent component
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

  return (
     <View style={styles.audioPlayer}>
          <Button title={isPlaying ? 'Pause' : 'Play'} onPress={pauseOrResume} />
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
            <Button title={loop ? "Loop On" : "Loop Off"} onPress={() => setLooping(!loop)} />
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
  )
});
const styles = StyleSheet.create({
  audioPlayer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f0f0f0',
    padding: 10,
  },
});
export default AudioPlayer