import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { memo } from "react";


interface VideoGridProps {
  videos: any;
  isMobile: boolean;
  clickedVideos: Record<string, boolean>;
  videoLoaded: Record<string, boolean>;
  setClickedVideos: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setVideoLoaded: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  handleTimeUpdate: (e: React.SyntheticEvent<HTMLVideoElement>) => void;
  getLimitedVideoUrl: (url: string) => string;
}

export const VideoGrid = memo(({ 
  videos, 
  isMobile, 
  clickedVideos, 
  videoLoaded, 
  setClickedVideos, 
  setVideoLoaded, 
  handleTimeUpdate, 
  getLimitedVideoUrl 
}: VideoGridProps) => {
  return (
    <section className="video-section" id="videos">
      <div className="flex flex-col mb-12 reveal">
        <span className="text-white/40 font-bold uppercase tracking-[0.3em] text-[10px] md:text-[12px] mb-2">Os Originais</span>
        <p className="text-red-500 font-serif italic text-lg md:text-xl">A hora da gravata nunca foi tão divertida</p>
      </div>
      <div className="video-section-header reveal">
        
          <h2>{videos.heading}</h2>
        
      </div>
      <div className="video-grid scene-3d">
        {(videos.items ?? []).map((v: any, i: number) => {
          const videoId = `video-${i}`;
          const videoTitle = `Vídeo ${v.title || 'Animação'} - La Gravata de Papel | Entretenimento para Casamentos`;
          const isAgitandoFesta = v.title === "Agitando a festa";
          const shouldWaitClick = isMobile && isAgitandoFesta && !clickedVideos[videoId];

          return (
            <div 
              className={cn(`video-card tilt-3d scroll-3d${v.tall ? " tall" : ""}`, (isMobile && v.title !== "Chove dinheiro" && v.show_mobile === false) ? "hidden" : (!isMobile && v.show_mobile === false ? "hidden md:block" : ""))} 
              key={i}
              onClick={() => {
                if (shouldWaitClick) {
                  setClickedVideos(prev => ({ ...prev, [videoId]: true }));
                }
              }}
            >
              <div className="relative w-full h-full">
                
                  <div className="w-full h-full">
                    {v.src ? (
                      <>
                        {shouldWaitClick && !videoLoaded[videoId] ? (
                          <div 
                            className="absolute inset-0 flex items-center justify-center bg-black/40 z-20 cursor-pointer group"
                            onClick={(e) => {
                              e.stopPropagation();
                              setClickedVideos(prev => ({ ...prev, [videoId]: true }));
                            }}
                          >
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 shadow-2xl transform transition-transform group-active:scale-90">
                              {clickedVideos[videoId] ? (
                                <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Play className="w-10 h-10 text-white fill-white ml-1" />
                              )}
                            </div>
                            {v.poster && <img src={v.poster} alt={v.title} className="absolute inset-0 w-full h-full object-cover -z-10" />}
                          </div>
                        ) : null}
                        <video 
                          id={videoId}
                          title={videoTitle}
                          onTimeUpdate={handleTimeUpdate}
                          poster={v.poster} 
                          autoPlay={!shouldWaitClick}
                          muted 
                          loop 
                          playsInline 
                          webkit-playsinline="true"
                          preload={(isMobile && isAgitandoFesta) ? "auto" : (isMobile ? "none" : "auto")}
                          className={cn(
                            "will-change-transform video-optimized",
                            shouldWaitClick && !videoLoaded[videoId] ? "opacity-0" : "opacity-100"
                          )}
                          style={{ height: '100%', width: '100%', objectFit: 'cover', backfaceVisibility: 'hidden', transform: 'translate3d(0,0,0)', transition: 'opacity 0.3s' }}
                          onLoadedData={() => {
                            if (isAgitandoFesta) setVideoLoaded(prev => ({ ...prev, [videoId]: true }));
                          }}
                          onLoadedMetadata={(e) => {
                            e.currentTarget.muted = true;
                          }}
                        >
                          <source src={getLimitedVideoUrl(v.src)} type="video/mp4" />
                        </video>
                      </>
                    ) : (
                      <>
                        {v.poster && <img src={v.poster} alt={v.title} />}
                        <div className="video-card-placeholder">
                          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                          <span>Vídeo em breve</span>
                        </div>
                      </>
                    )}
                  </div>
                
              </div>
              <div className="video-card-overlay">
                
                  <h3>{v.title}</h3>
                
                
                  <span>{v.tag}</span>
                
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
});

VideoGrid.displayName = "VideoGrid";
