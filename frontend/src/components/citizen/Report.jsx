import { useState, useEffect, useRef } from "react";
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
import { motion } from "framer-motion";
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
  const [statusMessage, setStatusMessage] = useState("");
  const statusRef = useRef(null);

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
        setStatusMessage('File size must be less than 10MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setStatusMessage('Please upload a valid image file');
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
        setStatusMessage('Error reading file');
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
  setStatusMessage('Analyzing image with AI...');
    
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
          setStatusMessage('AI: No garbage detected with high confidence; you may still submit if needed.');
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
      
  // Show user-friendly error message accessibly
  setStatusMessage('AI analysis unavailable – you can still submit with manual description.');
      
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => statusRef.current?.focus(), 50);
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
          setStatusMessage(errorMessage);
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
      setStatusMessage("Geolocation is not supported by this browser. Please enter address manually.");
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      setStatusMessage('Please provide a title for the report.');
      return;
    }
    if (!formData.address.trim() && !currentLocation) {
      setStatusMessage('Please specify the location or use GPS.');
      return;
    }
    
    // Check if AI detected no garbage with high confidence
    if (detectionResult && !detectionResult.garbageDetected && detectionResult.confidence > 0.7 && !detectionResult.error) {
      // TODO: Replace confirm dialog with custom modal component. Proceeding automatically for now.
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
  setStatusMessage(`Report submitted successfully. Task created for ${zoneText}. ${aiMessage.replace('\n',' ')}`);
      
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
      setStatusMessage('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => statusRef.current?.focus(), 50);
    }
  };

  const handleDeleteReport = async (reportId, reportTitle) => {
    if (!user) {
      setStatusMessage('You must be logged in to delete reports.');
      return;
    }
    // TODO: Replace browser confirm with custom confirmation dialog.

    try {
      await reportService.deleteReport(reportId, user.id);
      setStatusMessage('Report deleted successfully.');
      
      // Reload recent reports to reflect the deletion
      await loadRecentReports();
    } catch (error) {
      console.error('Error deleting report:', error);
      setStatusMessage(`Failed to delete report: ${error.message}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
      <div ref={statusRef} tabIndex={-1} aria-live="polite" className="sr-only">{statusMessage}</div>
      <div className="text-center mb-4">
        <motion.h1 initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:.6}} className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-3">Report Garbage</motion.h1>
        <motion.p initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:.55, delay:.05}} className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">Help keep our community clean by reporting waste locations with AI assistance.</motion.p>
        {user?.zone && (
          <motion.div initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:.5, delay:.1}} className="mt-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 text-sm">
              <MapPin className="h-4 w-4" /> {user.zone}
            </span>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Upload Section */}
        <motion.div initial={{opacity:0,y:28}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:.6}} className="card-surface p-0">
        <Card className="shadow-none border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-green-600" />
              Upload Photo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div 
              className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-green-400/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 transition-colors cursor-pointer"
              onClick={() => document.getElementById('image-upload')?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add('border-green-400');
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('border-green-400');
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('border-green-400');
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
                    <p className="text-xs text-gray-500 text-center">
                      🤖 AI-annotated image with detected objects highlighted
                    </p>
                  )}
                  {isAnalyzing && (
                    <div className="flex items-center justify-center gap-2 text-green-600">
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
                          detectionResult.garbageDetected ? "bg-green-50 text-green-700 border-green-200" :
                          "bg-yellow-50 text-yellow-700 border-yellow-200"
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
                  <Upload className="h-12 w-12 text-gray-300 mx-auto" />
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      Drag & drop an image or click to browse
                    </p>
                    <p className="text-xs text-gray-400">
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
              variant="outline" 
              className="w-full border-green-600 text-green-700 hover:bg-green-50"
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
        </motion.div>

        {/* Report Details */}
        <motion.div initial={{opacity:0,y:28}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:.6, delay:.05}} className="card-surface p-0">
        <Card className="shadow-none border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-600" />
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
              variant="default" 
              className="w-full bg-green-600 hover:bg-green-700" 
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
        </motion.div>
      </div>

      {/* Recent Reports */}
      <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:.65}} className="card-surface">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Camera className="h-5 w-5 text-green-600" /> Recent Reports
          </h2>
        </div>
        <div className="space-y-4">
          {recentReports.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No reports submitted yet. Submit your first report above!
            </p>
          ) : (
            recentReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 border border-border rounded-lg group hover:border-green-300/70 transition-colors bg-white/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center border border-green-100">
                    {report.image_url ? (
                      <img 
                        src={report.image_url} 
                        alt="Report" 
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    ) : (
                      <Camera className="h-6 w-6 text-green-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{report.title}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(report.created_at).toLocaleDateString()} • {report.address}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" size="sm" className="border-green-200 text-green-700 bg-green-50">{report.category}</Badge>
                      <Badge 
                        variant="outline" 
                        size="sm"
                        className={
                          report.severity === 'critical' ? 'border-red-300 text-red-700 bg-red-50' :
                          report.severity === 'high' ? 'border-red-300 text-red-700 bg-red-50' :
                          report.severity === 'medium' ? 'border-yellow-300 text-yellow-700 bg-yellow-50' :
                          'border-gray-300 text-gray-500 bg-gray-50'
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
                      report.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                      report.status === 'in_progress' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                      report.status === 'assigned' ? 'bg-green-50 text-green-700 border-green-200' :
                      'bg-gray-50 text-gray-500 border-gray-200'
                    }
                  >
                    {report.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                  <span className="text-sm font-medium">
                    {report.status === 'completed' ? (
                      <span className="text-green-600">+50 pts</span>
                    ) : (
                      <span className="text-gray-400">Pending</span>
                    )}
                  </span>
                  {report.status === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteReport(report.id, report.title)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity border-red-200 hover:border-red-400 hover:bg-red-50 hover:text-red-600"
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
      </motion.div>
    </div>
  );
};

export default Report;
