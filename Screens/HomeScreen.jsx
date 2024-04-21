
import React from "react";

import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, Image, StyleSheet } from 'react-native';
// import { FileSystem } from 'expo';
import * as FileSystem from 'expo-file-system';
import { useRef } from "react";
import AudioPlayer from "../components/AudioPlayer";
const coverImageMapping = {
  // Add mappings for each whitenoise file
  '001': require('../assets/whitenoise_cover/001.jpg'),
  '002': require('../assets/whitenoise_cover/002.jpg'),
  '003': require('../assets/whitenoise_cover/003.jpg'),
  '004': require('../assets/whitenoise_cover/004.jpg'),
  // ... add more mappings as needed
};
const requireAll = (requireContext) => {
  return requireContext.keys().map((key) => {
    const filename = key.split("/").pop();
    return {
      filename: filename,
      sound: requireContext(key),
      cover: coverImageMapping[filename.replace('.mp3', '')],
    };
  });
};

const HomeScreen = () => {
  const [hypnoFiles, setHypnoFiles] = useState([]);
  const [whiteNoiseFiles, setWhiteNoiseFiles] = useState([]);
  const audioPlayerRef = useRef();

  useEffect(() => {
    // Load hypno files
    loadAudioFiles("hypno", setHypnoFiles);

    // Load whitenoise files from assets
    const whitenoiseContext = require.context(
      "../assets/whitenoise",
      false,
      /\.mp3$/
    );
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
      const audioFiles = files.filter((file) => file.endsWith(".wav"));
      setFiles(audioFiles);
    } catch (error) {
      console.error(`Failed to load ${folder} audio files`, error);
    }
  }

  const renderWhiteNoiseItem = ({ item }) => (
    <TouchableOpacity
    style={styles.card}
    onPress={() => playSound(item.filename, "whitenoise")}
  >
    <Image
      source={item.cover}
      style={styles.cover}
    />
    <Text style={styles.title}>{item.filename.replace('.mp3', '')}</Text>
  </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Hypnosis list:</Text>
      <View style={styles.audioList}>
        {hypnoFiles.map((filename, index) => (
          <TouchableOpacity
            key={index}
            style={styles.audioItem}
            onPress={() => playSound(filename, "hypno")}
          >
            <Text style={styles.audioText}>{filename}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.header}>Your White Noise list:</Text>
      <FlatList
        data={whiteNoiseFiles}
        renderItem={renderWhiteNoiseItem}
        keyExtractor={(item) => item.filename}
        contentContainerStyle={styles.audioList}
      />
      <AudioPlayer ref={audioPlayerRef} />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    marginBottom: 10,
    fontSize: 18,
    fontWeight: "bold",
  },
  audioList: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  audioItem: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    marginBottom: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  card: {
    marginBottom: 20,
    // width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cover: {
    width: 150,
    height: 250, // Increased height
    resizeMode: 'cover',
    borderRadius: 10,
    marginBottom: 15, // Added margin to separate from the title
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  audioText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default HomeScreen;