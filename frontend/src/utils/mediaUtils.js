// Detects whether a video URL is a YouTube/Vimeo page link (which can't be
// played by a plain <video> tag) and converts it into an embeddable iframe URL.
// Returns null if the URL doesn't match a known platform, meaning it should
// be treated as a direct video file instead.
export function getVideoEmbedUrl(url) {
    if (!url) return null;

    // YouTube: watch?v=, youtu.be/, /embed/, /shorts/
    const ytMatch = url.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (ytMatch) {
        return `https://www.youtube.com/embed/${ytMatch[1]}`;
    }

    // Vimeo: vimeo.com/12345 or player.vimeo.com/video/12345
    const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vimeoMatch) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    return null;
}