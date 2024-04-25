import { StyleSheet, Text, View, Button, TouchableOpacity, TextInput } from 'react-native'
import React from 'react'
import { Audio } from 'expo-av';
import { useState,useEffect } from 'react';
import * as FileSystem from 'expo-file-system';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useRef } from 'react';
import AudioPlayer from '../components/AudioPlayer';
// does not have dependency on homescreen 
const RecordScreen = () => {
  const [recording, setRecording] = useState();
  const [savedRecordingURI, setSavedRecordingURI] = useState(null);
  const [filename, setFilename] = useState('recorded_audio');
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const navigation = useNavigation(); // <-- Initialize navigation hook
  const [sound, setSound] = useState();
  async function startRecording() {
    try {
      if (permissionResponse.status !== 'granted') {
        console.log('Requesting permission..');
        await requestPermission();
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }
  //play Recording doesn't exist yet


  async function stopRecording() {
    console.log('Stopping recording..');
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    const uri = recording.getURI();
    console.log('Recording stopped and stored at', uri);
    setSavedRecordingURI(uri);
  }

  async function saveRecording() {
    if (!savedRecordingURI) {
      console.warn('No recording to save');
      return;
    }
    try {
      const hypnoDirectory = `${FileSystem.documentDirectory}hypno/`;
      await FileSystem.makeDirectoryAsync(hypnoDirectory, { intermediates: true });
      const newPath = `${hypnoDirectory}${filename}.wav`;
      await FileSystem.moveAsync({
        from: savedRecordingURI,
        to: newPath,
      });
      console.log('Recording saved at', newPath);
    } catch (error) {
      console.error('Failed to save recording', error);
    }
  }

  async function playSound() {
    const { sound } = await Audio.Sound.createAsync({ uri: savedRecordingURI });
    setSound(sound);
    await sound.playAsync();
  }
  async function navigateToSelectCoverNoise() {
    navigation.navigate('SelectCoverNoiseScreen'); // <-- Navigate to new screen
  }
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text>Record Screen</Text><TextInput
        style={styles.input}
        placeholder="Enter filename"
        value={filename}
        onChangeText={setFilename}
      /><Button
        onPress={recording ? stopRecording : startRecording}
        title={recording ? "Stop" : "Record My Voice"}
      />{savedRecordingURI && <Button onPress={saveRecording} title="Save Recording" />}{savedRecordingURI && <Button onPress={playSound} title="Play Recording" />}{savedRecordingURI && <Button onPress={navigateToSelectCoverNoise} title="Next Step" />}<AudioPlayer /></View>
  );
};

const styles = StyleSheet.create({
  input: {
    height: 40,
    width: 200,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});

export default RecordScreen;