import React, { useState, useRef, useEffect } from 'react';
import { Upload as UploadIcon, Image, Video, Link, X, ArrowRight, ArrowLeft, Camera, VideoIcon, Square, Circle } from 'lucide-react';
import { createPost, createPostWithMultipleFiles } from '@/services/postService';

interface UploadedFile {
  file: File;
  preview: string;
  type: 'image' | 'video';
}

const Upload: React.FC = () => {
  const [step, setStep] = useState<'media' | 'details'>('media');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [caption, setCaption] = useState('');
  const [themes, setThemes] = useState<string[]>([]);
  const [currentTheme, setCurrentTheme] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Camera/Video states
  const [showCamera, setShowCamera] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [stream]);

  // Update recording time
  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      setRecordingTime(0);
    }

    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [isRecording]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setStream(mediaStream);
      setShowCamera(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
    setIsRecording(false);
    setRecordingTime(0);
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
            const preview = canvas.toDataURL('image/jpeg');
            
            const newFile: UploadedFile = {
              file,
              preview,
              type: 'image'
            };
            
            setUploadedFiles(prev => [...prev, newFile]);
            stopCamera();
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  const startRecording = () => {
    if (stream) {
      recordedChunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9' // Use a widely supported format
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const file = new File([blob], `video-${Date.now()}.webm`, { type: 'video/webm' });
        const preview = URL.createObjectURL(blob);
        
        const newFile: UploadedFile = {
          file,
          preview,
          type: 'video'
        };
        
        setUploadedFiles(prev => [...prev, newFile]);
        stopCamera();
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newFile: UploadedFile = {
          file,
          preview: e.target?.result as string,
          type: file.type.startsWith('image/') ? 'image' : 'video'
        };
        setUploadedFiles(prev => [...prev, newFile]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addTheme = () => {
    if (currentTheme.trim() && !themes.includes(currentTheme.trim())) {
      setThemes(prev => [...prev, currentTheme.trim()]);
      setCurrentTheme('');
    }
  };

  const removeTheme = (themeToRemove: string) => {
    setThemes(prev => prev.filter(theme => theme !== themeToRemove));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (uploadedFiles.length > 1) {
        // Multiple files - create multiple posts
        await createPostWithMultipleFiles(
          caption,
          themes,
          uploadedFiles.map(f => f.file),
          mediaUrl || undefined
        );
      } else if (uploadedFiles.length === 1) {
        // Single file
        await createPost({
          caption,
          themes,
          media_file: uploadedFiles[0].file,
          media_url: mediaUrl || null
        });
      } else if (mediaUrl) {
        // URL only
        await createPost({
          caption,
          themes,
          media_url: mediaUrl
        });
      }
      
      // Reset form after successful submission
      setUploadedFiles([]);
      setCaption('');
      setThemes([]);
      setMediaUrl('');
      setStep('media');
      
      // TODO: Show success message or redirect to feed
      alert('Post published successfully!');
    } catch (error) {
      console.error('Error submitting post:', error);
      alert('Error publishing post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedToDetails = uploadedFiles.length > 0 || mediaUrl.trim() !== '';

  if (step === 'details') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setStep('media')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Post Details</h1>
          <div className="w-16"></div>
        </div>

        {/* Media Preview */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Selected Media</h3>
          {uploadedFiles.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="relative rounded-lg overflow-hidden">
                  {file.type === 'image' ? (
                    <img 
                      src={file.preview} 
                      alt={`Upload ${index + 1}`}
                      className="w-full h-32 object-cover"
                    />
                  ) : (
                    <video 
                      src={file.preview}
                      className="w-full h-32 object-cover"
                      controls
                    />
                  )}
                </div>
              ))}
            </div>
          )}
          {mediaUrl && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <Link size={16} className="inline mr-2" />
                {mediaUrl}
              </p>
            </div>
          )}
        </div>

        {/* Caption */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Caption
          </label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption for your post..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={4}
          />
        </div>

        {/* Themes */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Themes
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={currentTheme}
              onChange={(e) => setCurrentTheme(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTheme()}
              placeholder="Add a theme..."
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={addTheme}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {themes.map((theme) => (
              <span
                key={theme}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {theme}
                <button
                  onClick={() => removeTheme(theme)}
                  className="hover:text-blue-600"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Media URL (optional)
          </label>
          <input
            type="url"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="https://example.com/media"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isSubmitting ? 'Publishing...' : 'Publish Post'}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Upload Media</h1>
      
      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Camera</h3>
              <button
                onClick={stopCamera}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-64 bg-black rounded-lg object-cover"
              />
              
              {isRecording && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  {formatTime(recordingTime)}
                </div>
              )}
            </div>
            
            <div className="flex justify-center gap-4 mt-4">
              {!isRecording ? (
                <>
                  <button
                    onClick={capturePhoto}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    <Camera size={20} />
                    Take Photo
                  </button>
                  <button
                    onClick={startRecording}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    <Circle size={20} />
                    Record Video
                  </button>
                </>
              ) : (
                <button
                  onClick={stopRecording}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  <Square size={20} />
                  Stop Recording
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {/* File Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-4">
          <div className="flex justify-center">
            <UploadIcon size={48} className="text-gray-400" />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-700">
              Drop your files here, or click to browse
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Supports images and videos
            </p>
          </div>
        </div>
      </div>

      {/* Upload Options */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 py-4 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Image size={24} />
          <span className="text-sm">Photos</span>
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 py-4 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Video size={24} />
          <span className="text-sm">Videos</span>
        </button>
        <button
          onClick={startCamera}
          className="flex flex-col items-center justify-center gap-2 py-4 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Camera size={24} />
          <span className="text-sm">Camera</span>
        </button>
        <button
          onClick={startCamera}
          className="flex flex-col items-center justify-center gap-2 py-4 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <VideoIcon size={24} />
          <span className="text-sm">Record</span>
        </button>
      </div>

      {/* URL Input */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Or add media URL
        </label>
        <input
          type="url"
          value={mediaUrl}
          onChange={(e) => setMediaUrl(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Uploaded Files Preview */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Uploaded Files</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="relative group rounded-lg overflow-hidden">
                {file.type === 'image' ? (
                  <img 
                    src={file.preview} 
                    alt={`Upload ${index + 1}`}
                    className="w-full h-32 object-cover"
                  />
                ) : (
                  <video 
                    src={file.preview}
                    className="w-full h-32 object-cover"
                    controls
                  />
                )}
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Button */}
      {canProceedToDetails && (
        <div className="mt-8">
          <button
            onClick={() => setStep('details')}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
          >
            Next: Add Details
            <ArrowRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Upload;