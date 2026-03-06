import { Phone, PhoneOff, Video, Mic, MicOff, Video as VideoIcon, VideoOff } from "lucide-react";

export default function CallModal({ 
  call, 
  onAccept, 
  onReject, 
  onEnd, 
  isMuted, 
  isVideoOff, 
  onToggleMute, 
  onToggleVideo 
}) {
  if (!call) return null;

  const isIncoming = call.isIncoming;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Caller info */}
        <div className="text-center mb-8">
          {call.caller_avatar ? (
            <img 
              src={call.caller_avatar} 
              alt={call.caller_name}
              className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
              {call.caller_name?.charAt(0)?.toUpperCase()}
            </div>
          )}
          <h2 className="text-2xl font-bold text-gray-900">{call.caller_name || 'Unknown'}</h2>
          <p className="text-gray-500 mt-1">
            {call.status === 'calling' ? 'Calling...' : call.status === 'connected' ? 'Connected' : 'Incoming call...'}
          </p>
          {call.type && (
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
              call.type === 'video' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
            }`}>
              {call.type === 'video' ? 'Video Call' : 'Audio Call'}
            </span>
          )}
        </div>

        {/* Video preview for outgoing video calls */}
        {call.type === 'video' && call.status !== 'incoming' && (
          <div className="mb-6">
            <video 
              ref={call.localVideoRef}
              autoPlay 
              playsInline 
              muted
              className={`w-full rounded-xl bg-gray-900 ${isVideoOff ? 'hidden' : ''}`}
            />
            {isVideoOff && (
              <div className="w-full h-48 bg-gray-800 rounded-xl flex items-center justify-center">
                <VideoOff size={48} className="text-gray-600" />
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-4">
          {isIncoming ? (
            <>
              <button
                onClick={onReject}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg"
                title="Reject"
              >
                <PhoneOff size={24} />
              </button>
              <button
                onClick={onAccept}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors shadow-lg"
                title="Accept"
              >
                {call.type === 'video' ? <Video size={24} /> : <Phone size={24} />}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onToggleMute}
                className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors shadow-lg ${
                  isMuted ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              {call.type === 'video' && (
                <button
                  onClick={onToggleVideo}
                  className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors shadow-lg ${
                    isVideoOff ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={isVideoOff ? 'Turn on video' : 'Turn off video'}
                >
                  {isVideoOff ? <VideoOff size={20} /> : <VideoIcon size={20} />}
                </button>
              )}
              <button
                onClick={onEnd}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg"
                title="End call"
              >
                <PhoneOff size={24} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
