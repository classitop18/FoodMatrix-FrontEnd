export interface Member {
  id: string;
  name: string;
  age?: number | null;
  sex?: string;
  role?: string;
  userId?: string | null;
  accountId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetMembersParams {
  accountId: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateMemberPayload {
  accountId: string;
  name: string;
  age?: number | null;
  sex?: string;
  role?: string;
  userId?: string | null;
}

export interface UpdateMemberPayload {
  name?: string;
  age?: number | null;
  sex?: string;
  role?: string;
}
