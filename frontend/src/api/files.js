// src/api/files.js
import api from "./api";

/**
 * DICOM 파일 폴더 업로드 (POST /api/files/upload)
 * @param {FileList} files
 * @returns Promise<{ saved: string[] }>
 */
export function uploadFiles(files) {
  const formData = new FormData();
  Array.from(files).forEach(file => formData.append("files", file));
  return api
    .post(`/api/files/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    })
    .then(res => res.data);
}

/**
 * 지정된 폴더(상대경로)의 파일/디렉터리 목록 조회 (GET /api/files?=folder)
 * @param {string} folder
 * @returns Promise<Array<{ name: string, type: "file" | "directory" }>>
 */
export function listFiles(folder = "") {
  const encoded = encodeURIComponent(folder);
  return api
    .get(`/api/files?folder=${encoded}`)
    .then(res => res.data);
}
