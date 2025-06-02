// src/api/labels.js
import api from "./api";

/**
 * 특정 파일에 대한 라벨 목록 조회 (GET /api/labels?=filename&sop_instance)
 */
export function listLabels(filename, sop_instance) {
  const f = encodeURIComponent(filename);
  const s = encodeURIComponent(sop_instance);
  return api
    .get(`/api/labels/?filename=${f}&sop_instance=${s}`)
    .then(res => res.data);
}

/**
 * 새 라벨 생성 (POST /api/labels)
 */
export function createLabel({ filename, sop_instance, label, x, y, width, height }) {
  return api
    .post("/api/labels/", { filename, sop_instance, label, x, y, width, height })
    .then(res => res.data);
}

/**
 * 라벨 정보 일부 수정
 */
export function updateLabel(id, data) {
  return api.patch(`/api/labels/${id}`, data).then(res => res.data);
}

/**
 * 라벨 삭제
 */
export function deleteLabel(id) {
  return api.delete(`/api/labels/${id}`);
}
