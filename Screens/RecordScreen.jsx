import { StyleSheet, Text, View,Button } from 'react-native'
import React from 'react'
import { Audio } from 'expo-av';
import { useState,useEffect } from 'react';
import * as FileSystem from 'expo-file-system';

const RecordScreen = () => {
  // Example of recording audio
  //note: usestate should be inside production code
  const [recording, setRecording] = useState();
  const [permissionResponse, requestPermission] = Audio.usePermissions();
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
      const { recording } = await Audio.Recording.createAsync( Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    console.log('Stopping recording..');
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync(
      {
        allowsRecordingIOS: false,
      }
    );
    const uri = recording.getURI();
    console.log('Recording stopped and stored at', uri);
    try {
      const hypnoDirectory = `${FileSystem.documentDirectory}hypno/`;
      await FileSystem.makeDirectoryAsync(hypnoDirectory, { intermediates: true });
      const filename = 'recorded_audio2.wav';
      const newPath = `${hypnoDirectory}${filename}`;
      await FileSystem.moveAsync({
        from: uri,
        to: newPath,
      });
      console.log('Recording moved to', newPath);
    } catch (error) {
      console.error('Failed to move recording', error);
    }
  }

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home Screen</Text>
        <Button
        onPress={recording ? stopRecording : startRecording}
        title={recording ? "Stop" : "Record My Voice"}
        ></Button>
    </View>
  )
}

export default RecordScreen

const styles = StyleSheet.create({})