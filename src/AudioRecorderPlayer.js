import {
  DeviceEventEmitter,
  EmitterSubscription,
  NativeEventEmitter,
  NativeModules,
  Platform,
} from 'react-native';
  
const { RNAudioRecorderPlayer } = NativeModules;

export const AudioSourceAndroidType = Object.freeze({
  "DEFAULT": 0,
  "MIC": 1,
  "VOICE_UPLINK": 2,
  "VOICE_DOWNLINK": 3,
  "VOICE_CALL": 4,
  "CAMCORDER": 5,
  "VOICE_RECOGNITION": 6,
  "VOICE_COMMUNICATION": 7,
  "REMOTE_SUBMIX": 8,
  "UNPROCESSED": 9,
  "RADIO_TUNER": 1998,
  "HOTWORD": 1999
});

export const OutputFormatAndroidType = Object.freeze({
  "DEFAULT": 0,
  "THREE_GPP": 1,
  "MPEG_4": 2,
  "AMR_NB": 3,
  "AMR_WB": 4,
  "AAC_ADIF": 5,
  "AAC_ADTS": 6,
  "OUTPUT_FORMAT_RTP_AVP": 7,
  "MPEG_2_TS": 8,
  "WEBM": 9
});

export const AudioEncoderAndroidType = Object.freeze({
  "DEFAULT": 0,
  "AMR_NB": 1,
  "AMR_WB": 2,
  "AAC": 3,
  "HE_AAC": 4,
  "AAC_ELD": 5,
  "VORBIS": 6
});

type AVEncodingType =
  | AVEncodingOption.lpcm
  | AVEncodingOption.ima4
  | AVEncodingOption.aac
  | AVEncodingOption.MAC3
  | AVEncodingOption.MAC6
  | AVEncodingOption.ulaw
  | AVEncodingOption.alaw
  | AVEncodingOption.mp1
  | AVEncodingOption.mp2
  | AVEncodingOption.alac
  | AVEncodingOption.amr
  | AVEncodingOption.flac
  | AVEncodingOption.opus;

export const AVEncodingOption = Object.freeze({
  "lpcm": 'lpcm',
  "ima4": 'ima4',
  "aac": 'aac',
  "MAC3": 'MAC3',
  "MAC6": 'MAC6',
  "ulaw": 'ulaw',
  "alaw": 'alaw',
  "mp1": 'mp1',
  "mp2": 'mp2',
  "alac": 'alac',
  "amr": 'amr',
  "flac": 'flac',
  "opus": 'opus'
});
  
export const AVEncoderAudioQualityIOSType = Object.freeze({
  "min": 0,
  "low": 32,
  "medium": 64,
  "high": 96,
  "max": 127
});

export interface AudioSet {
    AVSampleRateKeyIOS?: number;
    AVFormatIDKeyIOS?: AVEncodingType;
    AVNumberOfChannelsKeyIOS?: number;
    AVEncoderAudioQualityKeyIOS?: AVEncoderAudioQualityIOSType;
    AudioSourceAndroid?: AudioSourceAndroidType;
    OutputFormatAndroid?: OutputFormatAndroidType;
    AudioEncoderAndroid?: AudioEncoderAndroidType;
  }
  
const pad = (num: number) => {
  return ('0' + num).slice(-2);
};

class AudioRecorderPlayer {
    private _isRecording: boolean;
    private _isPlaying: boolean;
    private _hasPaused: boolean;
    private _recorderSubscription: EmitterSubscription;
    private _playerSubscription: EmitterSubscription;
    private _recordInterval: number;
  
    mmss = (secs: number): string => {
      let minutes = Math.floor(secs / 60);
      secs = secs % 60;
      minutes = minutes % 60;
      // minutes = ('0' + minutes).slice(-2);
      // secs = ('0' + secs).slice(-2);
      return pad(minutes) + ':' + pad(secs);
    };
  
    mmssss = (milisecs: number): string => {
      const secs = Math.floor(milisecs / 1000);
      const minutes = Math.floor(secs / 60);
      const seconds = secs % 60;
      const miliseconds = Math.floor((milisecs % 1000) / 10);
      return pad(minutes) + ':' + pad(seconds) + ':' + pad(miliseconds);
    };
  
    /**
     * set listerner from native module for recorder.
     * @returns {callBack(e: any)}
     */
    addRecordBackListener = (e): void => {
      if (Platform.OS === 'android') {
        this._recorderSubscription = DeviceEventEmitter.addListener(
          'rn-recordback',
          e,
        );
      } else {
        const myModuleEvt = new NativeEventEmitter(RNAudioRecorderPlayer);
        this._recorderSubscription = myModuleEvt.addListener('rn-recordback', e);
      }
    };
  
    /**
     * remove listener for recorder.
     * @returns {void}
     */
    removeRecordBackListener = (): void => {
      if (this._recorderSubscription) {
        this._recorderSubscription.remove();
        this._recorderSubscription = null;
      }
    };
  
    /**
     * set listener from native module for player.
     * @returns {callBack(e: Event)}
     */
    addPlayBackListener = (e): void => {
      if (Platform.OS === 'android') {
        this._playerSubscription = DeviceEventEmitter.addListener(
          'rn-playback',
          e,
        );
      } else {
        const myModuleEvt = new NativeEventEmitter(RNAudioRecorderPlayer);
        this._playerSubscription = myModuleEvt.addListener('rn-playback', e);
      }
    };
  
    /**
     * remove listener for player.
     * @returns {void}
     */
    removePlayBackListener = (): void => {
      if (this._playerSubscription) {
        this._playerSubscription.remove();
        this._playerSubscription = null;
      }
    };
  
    /**
     * start recording with param.
     * @param {string} uri audio uri.
     * @returns {Promise<string>}
     */
    startRecorder = async (
      uri?: string,
      audioSets?: AudioSet,
    ): Promise<string> => {
      if (!uri) {
        uri = 'DEFAULT';
      }
  
      if (!this._isRecording) {
        this._isRecording = true;
        return RNAudioRecorderPlayer.startRecorder(uri, audioSets);
      }
      return 'Already recording';
    };
  
    /**
     * stop recording.
     * @returns {Promise<string>}
     */
    stopRecorder = async (): Promise<string> => {
      if (this._isRecording) {
        this._isRecording = false;
        return RNAudioRecorderPlayer.stopRecorder();
      }
      return 'Already stopped';
    };
  
    /**
     * resume playing.
     * @returns {Promise<string>}
     */
    resumePlayer = async (): Promise<string> => {
      if (!this._isPlaying) return 'No audio playing';
      if (this._hasPaused) {
        this._hasPaused = false;
        return RNAudioRecorderPlayer.resumePlayer();
      }
      return 'Already playing';
    };
  
    /**
     * start playing with param.
     * @param {string} uri audio uri.
     * @returns {Promise<string>}
     */
    startPlayer = async (uri: string): Promise<string> => {
      if (!uri) {
        uri = 'DEFAULT';
      }
      if (!this._isPlaying || this._hasPaused) {
        this._isPlaying = true;
        this._hasPaused = false;
        return RNAudioRecorderPlayer.startPlayer(uri);
      }
    };
  
    /**
     * stop playing.
     * @returns {Promise<string>}
     */
    stopPlayer = async (): Promise<string> => {
      if (this._isPlaying) {
        this._isPlaying = false;
        this._hasPaused = false;
        return RNAudioRecorderPlayer.stopPlayer();
      }
      return 'Already stopped playing';
    };
  
    /**
     * pause playing.
     * @returns {Promise<string>}
     */
    pausePlayer = async (): Promise<string> => {
      if (!this._isPlaying) return 'No audio playing';
      if (!this._hasPaused) {
        this._hasPaused = true;
        return RNAudioRecorderPlayer.pausePlayer();
      }
    };
  
    /**
     * seek to.
     * @param {number} time position seek to in second.
     * @returns {Promise<string>}
     */
    seekToPlayer = async (time: number): Promise<string> => {
      if (Platform.OS === 'ios') {
        time = time / 1000;
      }
      return RNAudioRecorderPlayer.seekToPlayer(time);
    };
  
    /**
     * set volume.
     * @param {number} setVolume set volume.
     * @returns {Promise<string>}
     */
    setVolume = async (volume: number): Promise<string> => {
      if (volume < 0 || volume > 1) {
        throw new Error('Value of volume should be between 0.0 to 1.0');
      }
      return RNAudioRecorderPlayer.setVolume(volume);
    };
  
    /**
     * set subscription duration.
     * @param {number} sec subscription callback duration in seconds.
     * @returns {Promise<string>}
     */
    setSubscriptionDuration = async (sec: number): Promise<string> => {
      return RNAudioRecorderPlayer.setSubscriptionDuration(sec);
    };
  }
  
  export default AudioRecorderPlayer;