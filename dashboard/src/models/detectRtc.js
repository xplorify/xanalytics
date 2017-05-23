export default class DetectRtcModel {
  constructor(data) {
    let self = this;
    self.hasWebcam = data.hasWebcam ? data.hasWebcam : false;
    self.hasMicrophone = data.hasMicrophone ? data.hasMicrophone : null;
    self.hasSpeakers = data.hasSpeakers ? data.hasSpeakers : null;
    self.isScreenCapturingSupported = data.isScreenCapturingSupported ? data.isScreenCapturingSupported : false;
    self.isSctpDataChannelsSupported = data.isSctpDataChannelsSupported ? data.isSctpDataChannelsSupported : false;
    self.isRtpDataChannelsSupported = data.isRtpDataChannelsSupported ? data.isRtpDataChannelsSupported : false;
    self.isAudioContextSupported = data.isAudioContextSupported ? data.isAudioContextSupported : false;
    self.isWebRTCSupported = data.isWebRTCSupported ? data.isWebRTCSupported : false;
    self.isDesktopCapturingSupported = data.isDesktopCapturingSupported ? data.isDesktopCapturingSupported : false;
    self.isMobileDevice = data.isMobileDevice ? data.isMobileDevice : false;
    self.isWebSocketsSupported = data.isWebSocketsSupported ? data.isWebSocketsSupported : false;
    self.isWebSocketsBlocked = data.isWebSocketsBlocked ? data.isWebSocketsBlocked : false;
    self.isWebsiteHasMicrophonePermissions = data.isWebsiteHasMicrophonePermissions ? data.isWebsiteHasMicrophonePermissions : false;
    self.isWebsiteHasWebcamPermissions = data.isWebsiteHasWebcamPermissions ? data.isWebsiteHasWebcamPermissions : false;
    self.osName = data.osName ? data.osName : false;
    self.osVersion = data.osVersion ? data.osVersion : false;
    self.browser = data.browser ? data.browser : null;
    self.isCanvasSupportsStreamCapturing = data.isCanvasSupportsStreamCapturing ? data.isCanvasSupportsStreamCapturing : false;
    self.isVideoSupportsStreamCapturing = data.isVideoSupportsStreamCapturing ? data.isVideoSupportsStreamCapturing : false;
    self.displayResolution = data.displayResolution ? data.displayResolution : '';
  }
}
