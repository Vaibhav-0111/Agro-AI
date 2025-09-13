import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Camera, Upload, X, Eye, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UploadedImage {
  id: string;
  name: string;
  size: number;
  url: string;
  timestamp: Date;
  analysis?: {
    ndvi: number;
    health: 'healthy' | 'warning' | 'critical';
    anomalies: number;
  };
}

export const ImageUpload = () => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          
          // Process files
          acceptedFiles.forEach(file => {
            const newImage: UploadedImage = {
              id: Math.random().toString(36).substr(2, 9),
              name: file.name,
              size: file.size,
              url: URL.createObjectURL(file),
              timestamp: new Date(),
              analysis: {
                ndvi: Math.random() * 0.4 + 0.6, // Random NDVI between 0.6-1.0
                health: Math.random() > 0.7 ? 'healthy' : Math.random() > 0.3 ? 'warning' : 'critical',
                anomalies: Math.floor(Math.random() * 5)
              }
            };
            setUploadedImages(prev => [newImage, ...prev]);
          });
          
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.tiff', '.tif']
    },
    multiple: true
  });

  const removeImage = (id: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id));
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'bg-[hsl(var(--agro-success))]';
      case 'warning': return 'bg-[hsl(var(--agro-warning))]';
      case 'critical': return 'bg-[hsl(var(--agro-danger))]';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Hyperspectral Image Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 ${
              isDragActive 
                ? 'border-primary bg-primary/5 scale-[1.02]' 
                : 'border-muted-foreground/25 hover:border-primary hover:bg-muted/50'
            }`}
          >
            <input {...getInputProps()} />
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: isDragActive ? 1.1 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            </motion.div>
            <p className="text-lg font-medium mb-2">
              {isDragActive ? 'Drop images here...' : 'Upload Satellite Images'}
            </p>
            <p className="text-muted-foreground mb-4">
              Drag & drop or click to select TIFF, JPEG, or PNG files
            </p>
            <Button variant="outline" disabled={uploading}>
              Select Files
            </Button>
          </div>

          <AnimatePresence>
            {uploading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Processing images...</span>
                  <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      <AnimatePresence>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {uploadedImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              layout
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-48 object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
                    onClick={() => removeImage(image.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  {image.analysis && (
                    <div className="absolute bottom-2 left-2">
                      <Badge className={`${getHealthColor(image.analysis.health)} text-white`}>
                        {image.analysis.health.toUpperCase()}
                      </Badge>
                    </div>
                  )}
                </div>
                
                <CardContent className="p-4">
                  <h4 className="font-medium truncate mb-2">{image.name}</h4>
                  <div className="text-sm text-muted-foreground space-y-1 mb-3">
                    <p>Size: {(image.size / 1024 / 1024).toFixed(2)} MB</p>
                    <p>Uploaded: {image.timestamp.toLocaleTimeString()}</p>
                  </div>
                  
                  {image.analysis && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="space-y-2 mb-4"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm">NDVI Index:</span>
                        <span className="font-medium">{image.analysis.ndvi.toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Anomalies:</span>
                        <Badge variant="outline">{image.analysis.anomalies}</Badge>
                      </div>
                    </motion.div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Download className="h-3 w-3 mr-1" />
                      Export
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
};