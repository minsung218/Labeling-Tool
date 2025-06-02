// src/api/dicom.js
/**
 * DICOM 스트리밍용 URL 생성
 * @param {string} relPath - 저장된 상대 경로
 * @returns string
 */
export function getDicomUrl(relPath) {
  return `${process.env.REACT_APP_API_URL}/api/dicom/?file=${encodeURIComponent(relPath)}`;
}