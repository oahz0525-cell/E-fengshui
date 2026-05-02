/** 粗略中国大陆范围，境外跳过高德（避免无效请求） */
export function isRoughlyMainlandChina(lat: number, lng: number): boolean {
  return lng >= 73 && lng <= 136 && lat >= 17 && lat <= 54;
}
