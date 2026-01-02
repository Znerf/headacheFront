import api from './api';

export interface HeadacheRecord {
  _id: string;
  date: string;
  hadHeadache: boolean;
  headacheStartTime?: string;
  headacheEndTime?: string;
  wentOutsideYesterday: boolean;
  drankWaterYesterday: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HeadacheRecordsResponse {
  data: HeadacheRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const headacheService = {
  async createRecord(
    date: string,
    hadHeadache: boolean,
    headacheStartTime: string | undefined,
    headacheEndTime: string | undefined,
    wentOutsideYesterday: boolean,
    drankWaterYesterday: boolean,
    notes?: string,
  ): Promise<HeadacheRecord> {
    const response = await api.post('/headache', {
      date,
      hadHeadache,
      headacheStartTime,
      headacheEndTime,
      wentOutsideYesterday,
      drankWaterYesterday,
      notes,
    });
    return response.data;
  },

  async getRecords(limit = 10, page = 1): Promise<HeadacheRecordsResponse> {
    const response = await api.get(`/headache?limit=${limit}&page=${page}`);
    return response.data;
  },

  async getRecordByDate(date: string): Promise<HeadacheRecord | null> {
    const response = await api.get(`/headache/by-date?date=${date}`);
    return response.data;
  },

  async updateRecord(
    id: string,
    hadHeadache: boolean,
    headacheStartTime: string | undefined,
    headacheEndTime: string | undefined,
    wentOutsideYesterday: boolean,
    drankWaterYesterday: boolean,
    notes?: string,
  ): Promise<HeadacheRecord> {
    const response = await api.put(`/headache/${id}`, {
      hadHeadache,
      headacheStartTime,
      headacheEndTime,
      wentOutsideYesterday,
      drankWaterYesterday,
      notes,
    });
    return response.data;
  },

  async deleteRecord(id: string): Promise<void> {
    await api.delete(`/headache/${id}`);
  },
};
