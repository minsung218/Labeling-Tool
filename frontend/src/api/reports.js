// src/api/reports.js
import api from "./api";

/**
 * SOP Instance UID로 소견서 조회
 * GET /api/reports/{sop_instance}
 */
export function fetchReport(sopInstance) {
  const s = encodeURIComponent(sopInstance);
  return api
    .get(`/api/reports/${s}`)
    .then(res => res.data);
}

/**
 * SOP Instance UID로 소견서 생성·업데이트
 * POST /api/reports/{sop_instance}
 */
export function saveReport(sopInstance, content) {
  const s = encodeURIComponent(sopInstance);
  return api
    .post(`/api/reports/${s}`, { content })
    .then(res => res.data);
}