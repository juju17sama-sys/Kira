"""
Animate a static image into a 5-second video with a Ken Burns cinematic effect.
Zoom slowly from wide to close on the central characters, with subtle parallax.
"""

import numpy as np
from PIL import Image
from moviepy.video.VideoClip import VideoClip
import os

INPUT_PATH = "/root/.claude/uploads/27d3d8f4-8980-4def-a438-2f78f46db57f/e7e2a98c-1000026157.png"
OUTPUT_PATH = "/home/user/Kira/animated_compat.mp4"
DURATION = 5.0
FPS = 30


def make_ken_burns_frame(img_array, t):
    """
    Creates a Ken Burns effect frame at time t.
    - Starts wide (1.0x zoom), ends close (1.35x zoom)
    - Slowly pans upward to reveal the giant deity figure
    - Slight brightness enhancement for cinematic look
    """
    h, w = img_array.shape[:2]

    # Ease-in-out cubic for smooth motion
    progress = t / DURATION
    ease = progress * progress * (3 - 2 * progress)

    # Zoom: 1.0 → 1.35
    zoom = 1.0 + ease * 0.35

    # Crop size
    crop_w = int(w / zoom)
    crop_h = int(h / zoom)

    # Pan: start centered on trio (lower-center), end slightly higher (reveal deity)
    cx_start = w * 0.50
    cy_start = h * 0.62
    cx_end = w * 0.50
    cy_end = h * 0.45

    cx = cx_start + (cx_end - cx_start) * ease
    cy = cy_start + (cy_end - cy_start) * ease

    # Clamp crop to image bounds
    x1 = int(max(0, cx - crop_w / 2))
    y1 = int(max(0, cy - crop_h / 2))
    x2 = min(w, x1 + crop_w)
    y2 = min(h, y1 + crop_h)

    # Adjust if clamped
    if x2 - x1 < crop_w:
        x1 = max(0, x2 - crop_w)
    if y2 - y1 < crop_h:
        y1 = max(0, y2 - crop_h)

    cropped = img_array[y1:y2, x1:x2]

    # Resize back to original dimensions
    frame_pil = Image.fromarray(cropped)
    frame_pil = frame_pil.resize((w, h), Image.LANCZOS)

    # Subtle cinematic grade: slight warm golden tint to enhance the fantasy atmosphere
    frame_arr = np.array(frame_pil, dtype=np.float32)
    frame_arr[:, :, 0] = np.clip(frame_arr[:, :, 0] * 1.04, 0, 255)   # boost red slightly
    frame_arr[:, :, 1] = np.clip(frame_arr[:, :, 1] * 1.02, 0, 255)   # boost green slightly
    frame_arr[:, :, 2] = np.clip(frame_arr[:, :, 2] * 0.97, 0, 255)   # reduce blue slightly

    # Fade in from black over first 0.5s, fade out to black over last 0.5s
    fade_duration = 0.5
    if t < fade_duration:
        alpha = t / fade_duration
        frame_arr = frame_arr * alpha
    elif t > DURATION - fade_duration:
        alpha = (DURATION - t) / fade_duration
        frame_arr = frame_arr * alpha

    return frame_arr.astype(np.uint8)


def main():
    print("Loading image...")
    img = Image.open(INPUT_PATH).convert("RGB")
    # yuv420p requires even dimensions
    w = img.width if img.width % 2 == 0 else img.width - 1
    h = img.height if img.height % 2 == 0 else img.height - 1
    img = img.resize((w, h), Image.LANCZOS)
    img_array = np.array(img)
    print(f"Image size: {w}x{h}")

    print("Creating animation...")
    clip = VideoClip(
        lambda t: make_ken_burns_frame(img_array, t),
        duration=DURATION
    )

    print("Rendering video...")
    clip.write_videofile(
        OUTPUT_PATH,
        fps=FPS,
        codec="libx264",
        audio=False,
        logger="bar",
        ffmpeg_params=["-pix_fmt", "yuv420p", "-movflags", "+faststart", "-crf", "20"]
    )

    size_mb = os.path.getsize(OUTPUT_PATH) / 1024 / 1024
    print(f"\nDone! Video saved to: {OUTPUT_PATH}")
    print(f"File size: {size_mb:.1f} MB")


if __name__ == "__main__":
    main()
