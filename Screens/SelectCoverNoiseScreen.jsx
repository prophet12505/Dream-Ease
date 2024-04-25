import React, { useEffect } from 'react'
import { StyleSheet, Text, View, Button, TouchableOpacity, TextInput, FlatList, Image } from 'react-native';
import {useState,useRef} from 'react';
import AudioPlayer from '../components/AudioPlayer';
import { useNavigation } from '@react-navigation/native';
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
const SelectCoverNoiseScreen = () => {
  const [whiteNoiseFiles, setWhiteNoiseFiles] = useState([]);
  const audioPlayerRef = useRef();
  const navigation = useNavigation();
  const goToNextScreen = () => {
    navigation.navigate("SuccessfulForgingHypnoScreen");
  }
  useEffect(() => {
    // Load whitenoise files from assets
    const whitenoiseContext = require.context(
      "../assets/whitenoise",
      false,
      /\.mp3$/
    );
    const whitenoiseFiles = requireAll(whitenoiseContext);
    setWhiteNoiseFiles(whitenoiseFiles);
  },[])
  const renderWhiteNoiseItem = ({ item }) => (
    <TouchableOpacity
    style={styles.card}
    onPress={goToNextScreen}
  >
    <Image
      source={item.cover}
      style={styles.cover}
    />
    <Text style={styles.title}>{item.filename.replace('.mp3', '')}</Text>
  </TouchableOpacity>
  );


  return (
    <View><Text style={styles.header}>Select your cover whitenoise:</Text><FlatList
      data={whiteNoiseFiles}
      renderItem={renderWhiteNoiseItem}
      keyExtractor={(item) => item.filename}
      contentContainerStyle={styles.audioList}
    /><AudioPlayer ref={audioPlayerRef} /></View>
  )
}

export default SelectCoverNoiseScreen;
const styles = StyleSheet.create({
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