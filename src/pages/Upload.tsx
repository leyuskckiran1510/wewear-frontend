import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload as UploadIcon, Link as LinkIcon, X, ArrowRight, ArrowLeft, Camera } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { createPost, createPostWithMultipleFiles } from '../services/postService';
import "@/styles/Upload.css";

interface UploadedFile {
  file: File;
  preview: string;
  type: 'image' | 'video';
  themes: string[];
}


const CameraPreview = ({ onClose, onCapture, onRecord, isRecording, stopRecording, recordingTime }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    const startCamera = useCallback(async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: true });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Camera error:", err);
            toast.error("Could not access camera. Please check permissions.");
            onClose();
        }
    }, [onClose]);

    useEffect(() => {
        startCamera();
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [startCamera]);

    const handleCapture = () => {
        if (videoRef.current) onCapture(videoRef.current);
    };

    const handleRecord = () => {
        if(videoRef.current) onRecord(videoRef.current);
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="camera-preview">
            <video ref={videoRef} autoPlay playsInline muted className="camera-video" />
            <button onClick={onClose} className="camera-close-btn"><X size={24} /></button>
            {isRecording && (
                <div className="camera-timer">
                    <div className="timer-pulse"></div>
                    {formatTime(recordingTime)}
                </div>
            )}
            <div className="camera-controls">
                <button onClick={handleCapture} disabled={isRecording} className="capture-btn"><Camera size={28} /></button>
                <button onClick={isRecording ? stopRecording : handleRecord} className={`record-btn ${isRecording ? 'recording' : ''}`}>
                    <div className="record-btn-inner"></div>
                </button>
            </div>
        </motion.div>
    );
};


const Upload: React.FC = () => {
  const [step, setStep] = useState<'media' | 'details'>('media');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [caption, setCaption] = useState('');
  const [themes, setThemes] = useState<string[]>([]);
  const [currentTheme, setCurrentTheme] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } else if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      setRecordingTime(0);
    }
    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    };
  }, [isRecording]);

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => file.type.startsWith('image/') || file.type.startsWith('video/'));
    if (validFiles.length === 0) {
        toast.error("Unsupported file type.");
        return;
    }
    const newFiles: UploadedFile[] = validFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        type: file.type.startsWith('image/') ? 'image' : 'video',
        themes: [...themes],
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => handleFiles(Array.from(e.target.files || []));
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleFiles(Array.from(e.dataTransfer.files));
  };

  const removeFile = (index: number) => setUploadedFiles(prev => prev.filter((_, i) => i !== index));

  const capturePhoto = (videoElement: HTMLVideoElement) => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      canvas.getContext('2d')?.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
          const newFile: UploadedFile = { file, preview: URL.createObjectURL(blob), type: 'image', themes: [...themes] };
          setUploadedFiles(prev => [...prev, newFile]);
          setShowCamera(false);
          toast.success("Photo captured!");
        }
      }, 'image/jpeg');
    }
  };

  const startRecording = (videoElement: HTMLVideoElement) => {
      if (videoElement.srcObject instanceof MediaStream) {
        const stream = videoElement.srcObject;
        recordedChunksRef.current = [];
        const mimeType = ['video/webm;codecs=vp9,opus', 'video/webm', 'video/mp4'].find(type => MediaRecorder.isTypeSupported(type));
        if (!mimeType) {
            toast.error("Video recording is not supported on your browser.");
            return;
        }
        mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) recordedChunksRef.current.push(event.data);
        };
        mediaRecorderRef.current.onstop = () => {
            const blob = new Blob(recordedChunksRef.current, { type: mimeType });
            const file = new File([blob], `video-${Date.now()}.${mimeType.split('/')[1].split(';')[0]}`, { type: mimeType });
            const newFile: UploadedFile = { file, preview: URL.createObjectURL(blob), type: 'video', themes: [...themes] };
            setUploadedFiles(prev => [...prev, newFile]);
            setShowCamera(false);
            toast.success("Video recorded!");
        };
        mediaRecorderRef.current.start();
        setIsRecording(true);
      } else {
        toast.error("Could not start recording. No video stream found.");
      }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const addTheme = () => {
    if (currentTheme.trim() && !themes.includes(currentTheme.trim())) {
      setThemes(prev => [...prev, currentTheme.trim()]);
      setCurrentTheme('');
    }
  };

  const removeTheme = (themeToRemove: string) => setThemes(prev => prev.filter(theme => theme !== themeToRemove));

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    const toastId = toast.loading('Publishing post...');

    try {
      let result;
      if (uploadedFiles.length > 1) {
        result = await createPostWithMultipleFiles(
          caption,
          themes,
          uploadedFiles.map(f => f.file),
          mediaUrl || undefined
        );
      } else if (uploadedFiles.length === 1) {
        result = await createPost({
          caption,
          themes,
          media_file: uploadedFiles[0].file,
          media_url: mediaUrl || null
        });
      } else if (mediaUrl) {
        result = await createPost({ caption, themes, media_url: mediaUrl });
      } else {
        throw new Error("No media provided.");
      }

      if (result) {
        toast.success('Post published successfully!', { id: toastId });
        setUploadedFiles([]);
        setCaption('');
        setThemes([]);
        setMediaUrl('');
        setStep('media');
      } else {
        throw new Error("Failed to publish post. Please try again.");
      }
    } catch (error: any) {
      console.error('Error submitting post:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'An unknown error occurred.';
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedToDetails = uploadedFiles.length > 0 || mediaUrl.trim() !== '';

  const pageVariants = {
    initial: { opacity: 0, x: 50 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -50 },
  };

  const pageTransition = { type: "tween" as const, duration: 0.4 };

  return (
    <div className="upload-container">
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <AnimatePresence>
        {showCamera && (
          <CameraPreview
            onClose={() => setShowCamera(false)}
            onCapture={capturePhoto}
            onRecord={startRecording}
            isRecording={isRecording}
            stopRecording={stopRecording}
            recordingTime={recordingTime}
          />
        )}
      </AnimatePresence>

      <div className="container">
        <AnimatePresence mode="wait">
          {step === 'media' && (
            <motion.div key="media" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
              <h1>Upload Content</h1>
              <p className="subtitle">Share your moments with the world</p>
              <div className="drop-zone" onClick={() => fileInputRef.current?.click()} onDragEnter={e => e.preventDefault()} onDragOver={e => e.preventDefault()} onDrop={handleDrop}>
                <input ref={fileInputRef} type="file" multiple accept="image/*,video/*" onChange={handleFileSelect} className="hidden-input" />
                <div className="drop-zone-icon"><UploadIcon size={48} /></div>
                <p className="drop-zone-text-main">Drop files here or click to browse</p>
                <p className="drop-zone-text-sub">Supports Images and Videos</p>
              </div>
              <div className="center-flex">
                <button onClick={() => setShowCamera(true)} className="btn"><Camera size={20}/>Open Camera</button>
              </div>
              {uploadedFiles.length > 0 && (
                <div className="preview-section">
                  <h3 className="preview-title">Preview</h3>
                  <div className="preview-grid">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="preview-item">
                        {file.type === 'image' ? <img src={file.preview} alt={`preview ${index}`}/> : <video src={file.preview} loop muted autoPlay playsInline/>}
                        <div className="preview-item-overlay">
                          <button onClick={() => removeFile(index)} className="btn-delete"><X size={18} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {canProceedToDetails && (
                <div className="center-flex" style={{marginTop: '2rem'}}>
                  <button onClick={() => setStep('details')} className="btn btn-next">Next <ArrowRight size={22} /></button>
                </div>
              )}
            </motion.div>
          )}
          {step === 'details' && (
            <motion.div key="details" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} className="details-grid">
                <div className="details-preview">
                    {uploadedFiles.length > 0 && (
                        <>
                        {uploadedFiles[0].type === 'image' ? <img src={uploadedFiles[0].preview} alt="preview" /> : <video src={uploadedFiles[0].preview} controls autoPlay loop playsInline/>}
                        </>
                    )}
                     {mediaUrl && !uploadedFiles.length && <div style={{display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'#4b5563'}}><LinkIcon size={64}/></div>}
                </div>
                <div className="details-form">
                    <button onClick={() => setStep('media')} className="btn-back"><ArrowLeft size={20} /> Back</button>
                    <div className="form-group">
                        <label>Caption</label>
                        <textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Describe your post..." className="form-textarea" rows={4}/>
                    </div>
                    <div className="form-group">
                        <label>Themes</label>
                        <div className="theme-input-group">
                            <input type="text" value={currentTheme} onChange={(e) => setCurrentTheme(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addTheme()} placeholder="Add themes..." className="form-input"/>
                            <button onClick={addTheme}>Add</button>
                        </div>
                        <div className="theme-tags">
                            {themes.map((theme) => (
                            <span key={theme} className="theme-tag">{theme}<button onClick={() => removeTheme(theme)}><X size={14} /></button></span>
                            ))}
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Media URL (Optional)</label>
                        <input type="url" value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} placeholder="https://example.com/media" className="form-input"/>
                    </div>
                    <button onClick={handleSubmit} disabled={isSubmitting} className="btn btn-next">
                        {isSubmitting ? 'Publishing...' : 'Publish Post'}
                    </button>
                </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Upload;
