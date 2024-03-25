import { StyleSheet, View, Button, Text, TouchableOpacity} from 'react-native';
import React from 'react'

import { useState,useEffect } from 'react';
import * as FileSystem from 'expo-file-system';

import { useRef } from 'react';
import AudioPlayer from '../components/AudioPlayer';
const HomeScreen = () => {
  const [audioFiles, setAudioFiles] = useState([]);
  const audioPlayerRef=useRef();
  //initialize the 
  //to be revised
  useEffect(() => {
    loadAudioFiles();
    //resolve sound
    return () => {
      if (audioPlayerRef.current.sound) {
        audioPlayerRef.current.sound.unloadAsync();
      }
    };
  }, []);
  async function playSound(filename) {
    audioPlayerRef.current.playSound(filename);
  }

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
  //playSound is local method to this homescreen
  
  

 
 
  
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Hypnosis list:</Text>
      <View style={styles.audioList}>
      {audioFiles.map((filename, index) => (

        <TouchableOpacity
        key={index}
        style={styles.audioItem}
        onPress={() => playSound(filename)}
      >
        <Text style={styles.audioText}>{filename}</Text>
      </TouchableOpacity>
      ))}
      </View>
      { (

<AudioPlayer ref={audioPlayerRef}/>
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
});