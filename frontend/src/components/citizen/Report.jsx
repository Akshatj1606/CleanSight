import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  MapPin, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  Navigation,
  Clock,
  Zap,
  X,
  Image as ImageIcon,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { reportService } from "@/lib/localDatabase.js";

const Report = () => {
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [detectionResult, setDetectionResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    severity: "medium",
    address: "",
    landmark: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      loadRecentReports();
    }
  }, [user]);

  const loadRecentReports = async () => {
    if (!user) {
      console.log('No user found, skipping recent reports load'); // Debug log
      return;
    }
    
    try {
      const reports = await reportService.getReportsByUser(user.id);
      setRecentReports(reports.slice(0, 5)); // Show last 5 reports
    } catch (error) {
      console.error('Error loading recent reports:', error);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    console.log('File selected:', file); // Debug log
    
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload a valid image file');
        return;
      }
      
      console.log('File validation passed, setting file...'); // Debug log
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log('File read successfully'); // Debug log
        setSelectedImage(e.target?.result);
        analyzeImageWithYOLO(file);
      };
      reader.onerror = () => {
        console.error('Error reading file');
        alert('Error reading file');
        setSelectedFile(null);
        setSelectedImage(null);
      };
      reader.readAsDataURL(file);
    } else {
      console.log('No file selected'); // Debug log
    }
  };

  const analyzeImageWithYOLO = async (file) => {
    setIsAnalyzing(true);
    setDetectionResult(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      console.log('🤖 Sending image to YOLO API...', file.name);
      
      // Use environment variable for API URL, fallback to localhost for development
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${apiUrl}/predict`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('🔍 YOLO Analysis Result:', result);
      
      if (result.success) {
        let detectionMessage = "";
        let category = "other";
        
        if (result.garbage_detected) {
          detectionMessage = `Garbage detected with ${(result.confidence * 100).toFixed(1)}% confidence`;
          category = "mixed";
          
          // Set appropriate category based on confidence level
          if (result.confidence > 0.8) {
            category = "high-confidence";
          } else if (result.confidence > 0.6) {
            category = "medium-confidence";  
          } else {
            category = "low-confidence";
          }
        } else {
          detectionMessage = "No garbage detected in this image";
          category = "clean";
        }
        
        setDetectionResult({
          category: category,
          result: detectionMessage,
          confidence: result.confidence,
          garbageDetected: result.garbage_detected,
          annotatedImage: result.annotated_image
        });
        
        setFormData(prev => ({
          ...prev,
          category: category
        }));
        
        // If no garbage detected with high confidence, show warning
        if (!result.garbage_detected && result.confidence < 0.3) {
          setTimeout(() => {
            alert('⚠️ AI Analysis: No garbage detected in this image.\n\nFor accurate reporting:\n• Ensure the image clearly shows garbage/waste\n• Take photo in good lighting\n• Focus on the waste items\n\nYou can still submit this report if you believe there is an issue.');
          }, 500);
        }
        
      } else {
        throw new Error(result.error || 'Analysis failed');
      }
      
    } catch (error) {
      console.error('YOLO Analysis Error:', error);
      
      // Fallback to indicate analysis failed
      setDetectionResult({
        category: "analysis-failed",
        result: "AI analysis unavailable - please describe the waste manually",
        confidence: 0,
        garbageDetected: false,
        error: true
      });
      
      // Show user-friendly error message
      alert('🤖 AI Analysis Temporarily Unavailable\n\nThe image analysis service is currently unavailable. You can still submit your report by providing a detailed description of the waste.');
      
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Function to get address from coordinates using reverse geocoding
  const getAddressFromCoordinates = async (lat, lng) => {
    try {
      // Using OpenStreetMap Nominatim API for reverse geocoding (free)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        return data.display_name;
      }
      
      // Fallback to coordinates if API fails
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  };

  const getCurrentLocation = () => {
    console.log('getCurrentLocation called'); // Debug log
    
    if (navigator.geolocation) {
      console.log('Geolocation is supported'); // Debug log
      
      // Show loading state
      setFormData(prev => ({
        ...prev,
        address: "Getting location..."
      }));
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          console.log('Position obtained:', position.coords); // Debug log
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });
          
          try {
            // Get human-readable address from coordinates
            const address = await getAddressFromCoordinates(latitude, longitude);
            console.log('Address obtained:', address); // Debug log
            setFormData(prev => ({
              ...prev,
              address: address
            }));
          } catch (error) {
            console.error('Error getting address:', error);
            setFormData(prev => ({
              ...prev,
              address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            }));
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          let errorMessage = "Unable to get your location. ";
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += "Please allow location access and try again.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage += "Location request timed out.";
              break;
            default:
              errorMessage += "Please enter address manually.";
              break;
          }
          alert(errorMessage);
          setFormData(prev => ({
            ...prev,
            address: ""
          }));
        },
        { 
          enableHighAccuracy: true, 
          timeout: 15000, 
          maximumAge: 60000 
        }
      );
    } else {
      console.log('Geolocation is not supported'); // Debug log
      alert("Geolocation is not supported by this browser. Please enter address manually.");
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      alert('Please provide a title for the report.');
      return;
    }
    if (!formData.address.trim() && !currentLocation) {
      alert('Please specify the location or use GPS.');
      return;
    }
    
    // Check if AI detected no garbage with high confidence
    if (detectionResult && !detectionResult.garbageDetected && detectionResult.confidence > 0.7 && !detectionResult.error) {
      const userConfirm = window.confirm(
        '🤖 AI Analysis Notice\n\n' +
        'Our AI system indicates this image may not contain visible garbage.\n\n' +
        'Confidence: No garbage detected (' + (detectionResult.confidence * 100).toFixed(1) + '% certain)\n\n' +
        'Would you like to proceed anyway?\n\n' +
        '• Click OK to submit the report\n' +
        '• Click Cancel to review/retake the photo'
      );
      
      if (!userConfirm) {
        return;
      }
    }
    
    setIsSubmitting(true);
    
    try {
      const reportData = {
        title: formData.title,
        description: formData.description,
        severity: formData.severity,
        address: formData.address,
        landmark: formData.landmark,
        latitude: currentLocation?.latitude || 28.4595, // Default to Gurugram
        longitude: currentLocation?.longitude || 77.0466,
        aiAnalysis: detectionResult ? {
          garbageDetected: detectionResult.garbageDetected,
          confidence: detectionResult.confidence,
          category: detectionResult.category
        } : null
      };

      console.log('🏢 Creating report with citizen zone:', user?.zone); // Debug log
      const result = await reportService.createReport(reportData, selectedFile);
      
      // Show enhanced success message with AI results
      let aiMessage = '';
      if (detectionResult && !detectionResult.error) {
        aiMessage = `\n🤖 AI Analysis: ${detectionResult.garbageDetected ? 'Garbage detected' : 'No garbage detected'} (${(detectionResult.confidence * 100).toFixed(1)}% confidence)`;
      }
      
      // Show enhanced success message with zone information
      const zoneText = user?.zone?.split(' - ')[1] || user?.zone || 'your area';
      alert(`Report submitted successfully! 🎉\n\nDetails:\n• Title: ${formData.title}\n• Location: ${formData.address}\n• Severity: ${formData.severity}\n• Your Zone: ${zoneText}\n• Status: Pending Assignment${aiMessage}\n\n✅ Task automatically created for collection kiosks in ${zoneText}!\n\nYou'll receive points once the cleanup is completed.`);
      
      // Log for cross-portal synchronization debugging
      console.log('📝 Report created successfully:', result);
      console.log('🔄 Automatic task creation should be triggered for zone:', user?.zone);
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        severity: "medium",
        address: "",
        landmark: "",
      });
      setSelectedImage(null);
      setSelectedFile(null);
      setDetectionResult(null);
      setCurrentLocation(null);
      
      // Reload recent reports
      await loadRecentReports();
      
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReport = async (reportId, reportTitle) => {
    if (!user) {
      alert('You must be logged in to delete reports.');
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete the report "${reportTitle}"?\n\nThis action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      await reportService.deleteReport(reportId, user.id);
      alert('Report deleted successfully!');
      
      // Reload recent reports to reflect the deletion
      await loadRecentReports();
    } catch (error) {
      console.error('Error deleting report:', error);
      alert(`Failed to delete report: ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Report Garbage
        </h1>
        <p className="text-lg text-muted-foreground">
          Help keep our community clean by reporting garbage locations
        </p>
        {user?.zone && (
          <div className="mt-4">
            <Badge variant="outline" className="bg-eco/10 text-eco border-eco">
              📍 Your Zone: {user.zone}
            </Badge>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Upload Section */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-eco" />
              Upload Photo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div 
              className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-eco transition-colors cursor-pointer"
              onClick={() => document.getElementById('image-upload')?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add('border-eco');
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('border-eco');
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('border-eco');
                const files = e.dataTransfer.files;
                if (files && files[0]) {
                  handleImageUpload({ target: { files } });
                }
              }}
            >
              {selectedImage ? (
                <div className="space-y-4">
                  <img 
                    src={detectionResult?.annotatedImage ? `data:image/png;base64,${detectionResult.annotatedImage}` : selectedImage} 
                    alt="Uploaded garbage" 
                    className="max-w-full h-48 object-cover rounded-lg mx-auto"
                  />
                  {detectionResult?.annotatedImage && (
                    <p className="text-xs text-muted-foreground text-center">
                      🤖 AI-annotated image with detected objects highlighted
                    </p>
                  )}
                  {isAnalyzing && (
                    <div className="flex items-center justify-center gap-2 text-eco">
                      <Zap className="h-4 w-4 animate-pulse" />
                      <span>AI analyzing image...</span>
                    </div>
                  )}
                  {detectionResult && (
                    <div className="space-y-2">
                      <Badge 
                        variant="outline" 
                        className={
                          detectionResult.error ? "bg-destructive/10 text-destructive border-destructive" :
                          detectionResult.garbageDetected ? "bg-success/10 text-success border-success" :
                          "bg-warning/10 text-warning border-warning"
                        }
                      >
                        {detectionResult.error ? (
                          <AlertCircle className="h-4 w-4 mr-2" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        {detectionResult.result}
                      </Badge>
                      {detectionResult.confidence !== undefined && !detectionResult.error && (
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground">
                            Confidence: {(detectionResult.confidence * 100).toFixed(1)}%
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className={`h-2 rounded-full ${
                                detectionResult.confidence > 0.7 ? 'bg-green-500' :
                                detectionResult.confidence > 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${detectionResult.confidence * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Drag & drop an image or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supports JPG, PNG, WebP (max 10MB)
                    </p>
                  </div>
                </div>
              )}
              
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => document.getElementById('image-upload')?.click()}
                  type="button"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  {selectedImage ? "Change Photo" : "Select Photo"}
                </Button>
              </div>
            </div>

            <Button 
              variant="eco" 
              className="w-full"
              onClick={() => {
                console.log('Use Current Location button clicked'); // Debug log
                getCurrentLocation();
              }}
            >
              <Navigation className="h-4 w-4 mr-2" />
              Use Current Location
            </Button>
          </CardContent>
        </Card>

        {/* Report Details */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Report Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Report Title</Label>
              <Input 
                id="title" 
                placeholder="Brief title for this report"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input 
                id="location" 
                placeholder="Enter address or use GPS"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({...prev, address: e.target.value}))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="landmark">Nearby Landmark (Optional)</Label>
              <Input 
                id="landmark" 
                placeholder="e.g., Near City Mall, Opposite School..."
                value={formData.landmark}
                onChange={(e) => setFormData(prev => ({...prev, landmark: e.target.value}))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea 
                id="description" 
                placeholder="Describe the garbage type and quantity..."
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
              />
            </div>

            <div className="space-y-2">
              <Label>Severity Level</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Select priority level for this waste report
              </p>
              <div className="flex gap-2">
                <Button 
                  variant={formData.severity === "low" ? "default" : "outline"} 
                  size="sm" 
                  className="flex-1 flex-col h-auto py-3"
                  onClick={() => setFormData(prev => ({...prev, severity: "low"}))}
                >
                  <Clock className="h-4 w-4 mb-1" />
                  <span>Low</span>
                </Button>
                <Button 
                  variant={formData.severity === "medium" ? "warning" : "outline"} 
                  size="sm" 
                  className="flex-1 flex-col h-auto py-3"
                  onClick={() => setFormData(prev => ({...prev, severity: "medium"}))}
                >
                  <AlertCircle className="h-4 w-4 mb-1" />
                  <span>Medium</span>
                </Button>
                <Button 
                  variant={formData.severity === "high" ? "destructive" : "outline"} 
                  size="sm" 
                  className="flex-1 flex-col h-auto py-3"
                  onClick={() => setFormData(prev => ({...prev, severity: "high"}))}
                >
                  <AlertCircle className="h-4 w-4 mb-1" />
                  <span>High</span>
                </Button>
                <Button 
                  variant={formData.severity === "critical" ? "destructive" : "outline"} 
                  size="sm" 
                  className="flex-1 flex-col h-auto py-3"
                  onClick={() => setFormData(prev => ({...prev, severity: "critical"}))}
                >
                  <AlertCircle className="h-4 w-4 mb-1" />
                  <span>Critical</span>
                </Button>
              </div>
            </div>

            <Button 
              variant="hero" 
              className="w-full" 
              size="lg"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Earn <span className="font-semibold bg-gradient-to-r from-eco to-primary bg-clip-text text-transparent">Reward Points</span> based on waste quantity collected
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports */}
      <Card className="mt-8 shadow-card">
        <CardHeader>
          <CardTitle>Your Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentReports.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No reports submitted yet. Submit your first report above!
              </p>
            ) : (
              recentReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border border-border rounded-lg group hover:border-eco/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-eco/10 rounded-lg flex items-center justify-center">
                      {report.image_url ? (
                        <img 
                          src={report.image_url} 
                          alt="Report" 
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      ) : (
                        <Camera className="h-6 w-6 text-eco" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{report.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(report.created_at).toLocaleDateString()} • {report.address}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" size="sm">
                          {report.category}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          size="sm"
                          className={
                            report.severity === 'critical' ? 'border-destructive text-destructive' :
                            report.severity === 'high' ? 'border-destructive text-destructive' :
                            report.severity === 'medium' ? 'border-warning text-warning' :
                            'border-muted text-muted-foreground'
                          }
                        >
                          {report.severity}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant="outline" 
                      className={
                        report.status === 'completed' ? 'bg-success/10 text-success border-success' :
                        report.status === 'in_progress' ? 'bg-warning/10 text-warning border-warning' :
                        report.status === 'assigned' ? 'bg-primary/10 text-primary border-primary' :
                        'bg-muted/10 text-muted-foreground border-muted'
                      }
                    >
                      {report.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                    <span className="text-sm font-medium">
                      {report.status === 'completed' ? (
                        <span className="text-success">+50 pts</span>
                      ) : (
                        <span className="text-muted-foreground">Pending</span>
                      )}
                    </span>
                    
                    {/* Delete button - only show for pending reports */}
                    {report.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteReport(report.id, report.title)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity border-destructive/20 hover:border-destructive hover:bg-destructive/5 hover:text-destructive"
                        title="Delete this report"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Report;
