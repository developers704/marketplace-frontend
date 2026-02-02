/**
 * Video Quality Management
 * Handles quality selection and adaptive bitrate streaming
 */

export interface QualityLevel {
  label: string;
  value: string;
  height: number;
  bitrate?: number;
}

export const QUALITY_LEVELS: QualityLevel[] = [
  { label: 'Auto', value: 'auto', height: 0 },
  { label: '1080p', value: '1080', height: 1080 },
  { label: '720p', value: '720', height: 720 },
  { label: '480p', value: '480', height: 480 },
  { label: '360p', value: '360', height: 360 },
  { label: '240p', value: '240', height: 240 },
];

/**
 * Detect network speed and recommend quality
 */
export async function detectNetworkSpeed(): Promise<number> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const testImage = new Image();
    const testUrl = `https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png?t=${Date.now()}`;
    
    testImage.onload = () => {
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000; // seconds
      // Approximate size: ~8KB
      const speed = (8 * 8) / duration; // kbps
      resolve(speed);
    };

    testImage.onerror = () => {
      // Fallback to medium speed
      resolve(2000); // 2 Mbps
    };

    testImage.src = testUrl;
  });
}

/**
 * Get recommended quality based on network speed
 */
export function getRecommendedQuality(speedKbps: number): string {
  if (speedKbps > 5000) return '1080';
  if (speedKbps > 2500) return '720';
  if (speedKbps > 1500) return '480';
  if (speedKbps > 800) return '360';
  return '240';
}

/**
 * Get quality level by value
 */
export function getQualityLevel(value: string): QualityLevel | undefined {
  return QUALITY_LEVELS.find((level) => level.value === value);
}

