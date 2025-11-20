import { useNavigate, useSearchParams } from "react-router-dom";
import { VideoPlayer } from "@/components/Video/VideoPlayer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function VideoPlayerPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const videoUrl = searchParams.get("url") || "";
  const title = searchParams.get("title") || "Video Player";
  const poster = searchParams.get("poster") || "";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Videos
          </Button>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardContent className="p-0">
                <VideoPlayer
                  src={videoUrl}
                  poster={poster}
                  className="aspect-video w-full"
                />
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-2">About this video</h3>
                  <p className="text-muted-foreground text-sm">
                    This video is streaming using HLS (HTTP Live Streaming) with adaptive bitrate streaming.
                    The player automatically adjusts quality based on your network conditions for optimal viewing experience.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Video Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Format</span>
                    <span className="font-medium">HLS (.m3u8)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Streaming</span>
                    <span className="font-medium">Adaptive Bitrate</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CDN</span>
                    <span className="font-medium">CloudFront</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Playback Features</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Adaptive quality switching</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Manual quality selection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Fullscreen support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Volume controls</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Skip forward/backward</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Progress bar with buffering</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
