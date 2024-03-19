import { StyleSheet, View, Button, Text, TouchableOpacity} from 'react-native';
import React from 'react'
import { Audio } from 'expo-av';
import { useState,useEffect } from 'react';
import * as FileSystem from 'expo-file-system';
import Slider from '@react-native-community/slider';
const HomeScreen = () => {
  const [audioFiles, setAudioFiles] = useState([]);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [loop, setLoop] = useState(false);

  useEffect(() => {
    loadAudioFiles();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  async function loadAudioFiles() {
    try {
      const directory = `${FileSystem.documentDirectory}hypno/`;
      const files = await FileSystem.readDirectoryAsync(directory);
      const audioFiles = files.filter(file => file.endsWith('.wav'));
      setAudioFiles(audioFiles);
    } catch (error) {
      console.error('Failed to load audio files', error);
    }
  }

  async function playSound(filename) {
    try {
      // Unload the current sound if it exists and is playing
      if (sound && isPlaying) {
        // await sound.stopAsync();
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

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Hypnosis list:</Text>
      <View style={styles.audioList}>
      {audioFiles.map((filename, index) => (
        // <Button
        //   key={index}
        //   title={filename}
        //   onPress={() => playSound(filename)}
        // />
        <TouchableOpacity
        key={index}
        style={styles.audioItem}
        onPress={() => playSound(filename)}
      >
        <Text style={styles.audioText}>{filename}</Text>
      </TouchableOpacity>
      ))}
      </View>
      {sound && (
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
      )}
    </View>
  );
}

export default HomeScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    marginBottom: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
  audioPlayer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f0f0f0',
    padding: 10,
  },
  audioList: {
    width: '80%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
  },
  audioItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  slider: {
    width: '100%',
    marginBottom: 10,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  volumeSlider: {
    width: '70%',
  },
});