// How directly a face looks at the camera, from the 5 detection landmarks (right eye, left eye,
// nose tip, right mouth corner, left mouth corner). Ported from security-server's
// FaceQualityService so both projects rate a pose the same way. Roll (head tilt) is ignored:
// alignment rotates it away before embedding.

// Yaw: nose offset from the eye midpoint along the eye line, as a fraction of eye distance.
const YAW_MAX_RATIO = 0.35;
// Pitch: (eyes -> nose) / (eyes -> mouth) perpendicular to the eye line. 0.49 is the ratio in
// SFace's own frontal alignment target.
const PITCH_FRONTAL_RATIO = 0.49;
const PITCH_MAX_DEVIATION = 0.2;

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);

/** 0 to 100: 100 is looking straight at the camera, 0 is turned (or tilted up/down) too far. */
export function faceFrontalScore(landmarks: [number, number][]): number {
  const [rightEye, leftEye, nose, rightMouth, leftMouth] = landmarks;
  const eyeDx = leftEye[0] - rightEye[0];
  const eyeDy = leftEye[1] - rightEye[1];
  const eyeDistance = Math.hypot(eyeDx, eyeDy);
  if (eyeDistance < 1e-6) return 0;

  // Unit vectors along and perpendicular to the eye line, so the measures are roll-invariant.
  const ux = eyeDx / eyeDistance;
  const uy = eyeDy / eyeDistance;
  const eyeMid = [(rightEye[0] + leftEye[0]) / 2, (rightEye[1] + leftEye[1]) / 2];
  const mouthMid = [(rightMouth[0] + leftMouth[0]) / 2, (rightMouth[1] + leftMouth[1]) / 2];
  const along = (p: number[]) => (p[0] - eyeMid[0]) * ux + (p[1] - eyeMid[1]) * uy;
  const across = (p: number[]) => -(p[0] - eyeMid[0]) * uy + (p[1] - eyeMid[1]) * ux;

  const yaw = clamp01(1 - Math.abs(along(nose) / eyeDistance) / YAW_MAX_RATIO);
  const mouthDepth = across(mouthMid);
  const pitch =
    mouthDepth <= 0
      ? 0
      : clamp01(
          1 - Math.abs(across(nose) / mouthDepth - PITCH_FRONTAL_RATIO) / PITCH_MAX_DEVIATION
        );
  return Math.round(Math.min(yaw, pitch) * 100);
}
