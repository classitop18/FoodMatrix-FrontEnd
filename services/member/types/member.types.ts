export interface Member {
  id: string;
  name: string;
  age?: number | null;
  sex?: string;
  role?: string;
  userId?: string | null;
  accountId: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetMembersParams {
  accountId: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  includeHealthProfile?: boolean;
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
