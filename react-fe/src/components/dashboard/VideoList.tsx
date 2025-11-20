"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  CheckCircle,
  XCircle,
  Upload,
  MoreVertical,
  Download,
  Trash2,
  Video as VideoIcon,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getVideosWithStatus } from "@/api/video";

// ------------------ Constants ------------------
const CLOUDFRONT_URL = "https://d1u60itm1v20y5.cloudfront.net";
const ITEMS_PER_PAGE = 12;

// ------------------ Types ------------------

type VideoFilter = "all" | "uploaded" | "processing" | "completed" | "failed";

interface VideoApiData {
  id: string;
  originalFileName: string;
  thumbnailUrl: string | null;
  status: string;
  createdAt: string;
  size: number;
  duration: number;
  s3InputKey: string;
}

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  status: "uploaded" | "processing" | "completed" | "failed";
  uploadDate: string;
  size: string;
  duration: string;
  videoUrl: string;
}

// Backend expects uppercase statuses for filtering
const mapRecord: Record<Exclude<VideoFilter, "all">, string> = {
  uploaded: "UPLOADED",
  processing: "PROCESSING",
  completed: "COMPLETED",
  failed: "FAILED",
};

// ------------------ Helpers ------------------

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const formatDuration = (seconds: number) => {
  if (!seconds) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// ------------------ Component ------------------

export default function VideoList() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<VideoFilter>("all");
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // Fetch videos when filter changes
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        // Reset visible count when filter changes
        setVisibleCount(ITEMS_PER_PAGE);

        const res = await getVideosWithStatus(
          filter === "all" ? "" : mapRecord[filter]
        );

        console.log("Fetched data from API:", res);

        let fetchedVideos: VideoApiData[] = [];

        // Normalize possible backend formats
        if (Array.isArray(res)) {
          fetchedVideos = res;
        } else if (res?.data && Array.isArray(res.data)) {
          fetchedVideos = res.data;
        } else if (res?.videos && Array.isArray(res.videos)) {
          fetchedVideos = res.videos;
        } else {
          console.warn("Unexpected response structure:", res);
        }

        // Map API data to UI model
        const normalized: Video[] = fetchedVideos.map((v) => ({
          id: v.id,
          title: v.originalFileName,
          thumbnail: v.thumbnailUrl ? `${CLOUDFRONT_URL}/${v.thumbnailUrl}` : "",
          status: (v.status?.toLowerCase() || "uploaded") as Video["status"],
          uploadDate: formatDate(v.createdAt),
          size: formatFileSize(v.size),
          duration: formatDuration(v.duration),
          videoUrl: v.s3InputKey, // Using input key as placeholder for now
        }));

        setVideos(normalized);
      } catch (error) {
        console.error("Failed to fetch videos:", error);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [filter]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

  const handleVideoClick = (video: Video) => {
    if (video.status === "completed") {
      navigate(`/player?url=${encodeURIComponent(video.videoUrl)}&title=${encodeURIComponent(video.title)}&poster=${encodeURIComponent(video.thumbnail)}`);
    }
  };

  // ------------------ Status badge ------------------

  const getStatusBadge = (status: Video["status"]) => {
    const statusConfig: Record<
      Video["status"],
      {
        icon: React.ElementType;
        label: string;
        variant: "default" | "secondary" | "destructive" | "outline";
        className?: string;
      }
    > = {
      uploaded: { icon: Upload, label: "Uploaded", variant: "secondary", className: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20" },
      processing: { icon: Clock, label: "Processing", variant: "outline", className: "text-yellow-500 border-yellow-500/50" },
      completed: { icon: CheckCircle, label: "Ready", variant: "default", className: "bg-green-500 hover:bg-green-600" },
      failed: { icon: XCircle, label: "Failed", variant: "destructive", className: "" },
    };

    const config = statusConfig[status] ?? statusConfig.uploaded;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={`gap-1 text-xs px-2 py-0.5 ${config.className}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  // ------------------ Filters UI ------------------

  const filters = [
    { value: "all", label: "All", icon: VideoIcon },
    { value: "uploaded", label: "Uploaded", icon: Upload },
    { value: "processing", label: "Processing", icon: Clock },
    { value: "completed", label: "Ready", icon: CheckCircle },
    { value: "failed", label: "Failed", icon: XCircle },
  ];

  // ------------------ Render ------------------

  const visibleVideos = videos.slice(0, visibleCount);
  const hasMore = visibleCount < videos.length;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="z-20 bg-background/50 backdrop-blur-xl border-b shadow-sm rounded-t-xl mb-6">
        <div className="px-4 py-4 sm:px-6">
          <div className="overflow-x-auto -mx-4 px-4">
            <div className="flex gap-2 pb-1 min-w-max">
              {filters.map((f) => {
                const Icon = f.icon;
                const isActive = filter === f.value;
                return (
                  <button
                    key={f.value}
                    onClick={() => setFilter(f.value as VideoFilter)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${isActive
                      ? "bg-primary text-primary-foreground shadow-md scale-105"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent hover:border-border/50"
                      }`}
                  >
                    <Icon className="h-4 w-4" />
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-8 sm:px-6 max-w-[2000px] mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 text-muted-foreground">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p>Loading your library...</p>
          </div>
        ) : videos.length === 0 ? (
          <Card className="text-center border-dashed border-2 bg-muted/5">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold">No videos found</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                {filter === "all"
                  ? "Upload your first video to get started with your content journey."
                  : `No videos found with status "${filter}".`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {visibleVideos.map((video) => (
                <Card key={video.id} className="group overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg bg-card/50 backdrop-blur-sm">
                  {/* Thumbnail */}
                  <div
                    className={`aspect-video relative bg-muted overflow-hidden ${video.status === "completed" ? "cursor-pointer" : ""}`}
                    onClick={() => handleVideoClick(video)}
                  >
                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "";
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted/50">
                        <VideoIcon className="h-10 w-10 text-muted-foreground/50" />
                      </div>
                    )}

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Play Icon Overlay for Completed Videos */}
                    {video.status === "completed" && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                        <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                          <VideoIcon className="h-6 w-6 text-white fill-white" />
                        </div>
                      </div>
                    )}

                    {video.status === "processing" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                      </div>
                    )}

                    <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md text-white text-[10px] font-medium px-1.5 py-0.5 rounded-md shadow-sm">
                      {video.duration}
                    </div>
                  </div>

                  {/* Info */}
                  <CardContent className="p-3 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <h3
                        className={`font-medium text-sm leading-tight line-clamp-1 group-hover:text-primary transition-colors ${video.status === "completed" ? "cursor-pointer" : ""}`}
                        title={video.title}
                        onClick={() => handleVideoClick(video)}
                      >
                        {video.title}
                      </h3>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-6 w-6 -mr-2 -mt-1 text-muted-foreground hover:text-foreground">
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem className="cursor-pointer">
                            <Download className="h-4 w-4 mr-2" /> Download
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive cursor-pointer focus:text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{video.size}</span>
                      <span>{video.uploadDate}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="mt-10 flex justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleLoadMore}
                  className="min-w-[200px] bg-card/50 backdrop-blur-sm hover:bg-accent/50"
                >
                  Load More Videos
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
