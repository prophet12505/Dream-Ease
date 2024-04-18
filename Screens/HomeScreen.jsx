import { StyleSheet, View, Button, Text, TouchableOpacity} from 'react-native';
import React from 'react'

import { useState,useEffect } from 'react';
import * as FileSystem from 'expo-file-system';

import { useRef } from 'react';
import AudioPlayer from '../components/AudioPlayer';
// todo:add whitenoise list
const requireAll = (requireContext) => {
  return requireContext.keys().map((key) => {
    const filename = key.split('/').pop();
    return {
      filename: filename,
      sound: requireContext(key),
    };
  });
};
const HomeScreen = () => {
  const [hypnoFiles, setHypnoFiles] = useState([]);
  const [whiteNoiseFiles, setWhiteNoiseFiles] = useState([]);
  const audioPlayerRef = useRef();

  useEffect(() => {
    // Load hypno files
    loadAudioFiles('hypno', setHypnoFiles);

    // Load whitenoise files from assets
    const whitenoiseContext = require.context('../assets/whitenoise', false, /\.mp3$/);
    const whitenoiseFiles = requireAll(whitenoiseContext);
    setWhiteNoiseFiles(whitenoiseFiles);

    return () => {
      if (audioPlayerRef.current.sound) {
        audioPlayerRef.current.sound.unloadAsync();
      }
    };
  }, []);

  async function playSound(filename, folder) {
    audioPlayerRef.current.playSound(filename, folder);
  }

  async function loadAudioFiles(folder, setFiles) {
    try {
      const directory = `${FileSystem.documentDirectory}${folder}/`;
      const files = await FileSystem.readDirectoryAsync(directory);
      const audioFiles = files.filter(file => file.endsWith('.wav'));
      setFiles(audioFiles);
    } catch (error) {
      console.error(`Failed to load ${folder} audio files`, error);
    }
  }

  return (
    <View style={styles.container}>
    <Text style={styles.header}>Your Hypnosis list:</Text>
    <View style={styles.audioList}>
      {hypnoFiles.map((filename, index) => (
        <TouchableOpacity
          key={index}
          style={styles.audioItem}
          onPress={() => playSound(filename, 'hypno')}
        >
          <Text style={styles.audioText}>{filename}</Text>
        </TouchableOpacity>
      ))}
    </View>
    <Text style={styles.header}>Your White Noise list:</Text>
    <View style={styles.audioList}>
      {whiteNoiseFiles.map((file, index) => (
        <TouchableOpacity
          key={index}
          style={styles.audioItem}
          onPress={() => playSound(file.filename, 'whitenoise')}
        >
          <Text style={styles.audioText}>{file.filename}</Text>
        </TouchableOpacity>
      ))}
    </View>
    <AudioPlayer ref={audioPlayerRef} />
  </View>
  );
}

export default HomeScreen;

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
  audioList: {
    width: '100%',
  },
  audioItem: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginBottom: 5,
    paddingVertical: 15,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
  audioText: {
    fontSize: 16,
  },
});