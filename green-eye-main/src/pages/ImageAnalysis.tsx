import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ImageUpload } from "@/components/features/ImageUpload";

const ImageAnalysis = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Hyperspectral Image Analysis</h1>
          <p className="text-muted-foreground">
            Upload and analyze satellite imagery to extract vegetation indices and detect anomalies.
          </p>
        </div>
        
        <ImageUpload />
      </div>
    </DashboardLayout>
  );
};

export default ImageAnalysis;