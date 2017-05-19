export default class DetectRtcModel {
    constructor(data) {
        var self = this;
        this.hasWebcam = data.hasWebcam ? data.hasWebcam : false;
        this.hasMicrophone = data.hasMicrophone ? data.hasMicrophone : null;
        this.hasSpeakers = data.hasSpeakers ? data.hasSpeakers : null;
        this.isScreenCapturingSupported = data.isScreenCapturingSupported ? data.isScreenCapturingSupported : false;
        this.isSctpDataChannelsSupported = data.isSctpDataChannelsSupported ? data.isSctpDataChannelsSupported : false;
        this.isRtpDataChannelsSupported = data.isRtpDataChannelsSupported ? data.isRtpDataChannelsSupported : false;
        this.isAudioContextSupported = data.isAudioContextSupported ? data.isAudioContextSupported : false;
        this.isWebRTCSupported = data.isWebRTCSupported ? data.isWebRTCSupported : false;
        this.isDesktopCapturingSupported = data.isDesktopCapturingSupported ? data.isDesktopCapturingSupported : false;
        this.isMobileDevice = data.isMobileDevice ? data.isMobileDevice : false;
        this.isWebSocketsSupported = data.isWebSocketsSupported ? data.isWebSocketsSupported : false;
        this.isWebSocketsBlocked = data.isWebSocketsBlocked ? data.isWebSocketsBlocked : false;
        this.isWebsiteHasMicrophonePermissions = data.isWebsiteHasMicrophonePermissions ? data.isWebsiteHasMicrophonePermissions : false;
        this.isWebsiteHasWebcamPermissions = data.isWebsiteHasWebcamPermissions ? data.isWebsiteHasWebcamPermissions : false;
        this.osName = data.osName ? data.osName : false;
        this.osVersion = data.osVersion ? data.osVersion : false;
        this.browser = data.browser ? data.browser : null;
        this.isCanvasSupportsStreamCapturing = data.isCanvasSupportsStreamCapturing ? data.isCanvasSupportsStreamCapturing : false;
        this.isVideoSupportsStreamCapturing = data.isVideoSupportsStreamCapturing ? data.isVideoSupportsStreamCapturing : false;
        this.displayResolution = data.displayResolution ? data.displayResolution : "";
    }
}